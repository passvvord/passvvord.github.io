function addBoundingBox(...meshes) {
	for ( mesh of meshes ) {
		if ( !(mesh?.geometry === undefined) ) {
			if ( !(mesh?.geometry?.boundingBox instanceof THREE.Box3) ) {
				mesh.geometry.computeBoundingBox()
			}
			mesh.add( new THREE.Box3Helper( mesh.geometry.boundingBox, 0x20_20_20 ) )		
		}
	}	
}

function getParamsToOrtoGraficCamera(perspectiveCamera, distance) {
	const size = perspectiveCamera.getViewSize(distance, new THREE.Vector2())
	return {
		left: -size.x/2,
		right: size.x/2,
		top: size.y/2,
		bottom: -size.y/2,
		near: perspectiveCamera.near,
		far: perspectiveCamera.far,
	}
	//new THREE.OrthographicCamera( left : Number, right : Number, top : Number, bottom : Number, near : Number, far : Number )
}


const perspectiveCamera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10 );

const camera = new THREE.OrthographicCamera( ...Object.values( getParamsToOrtoGraficCamera(perspectiveCamera,5) ) )
camera.near = 0
camera.position.set(0.5,0.5,-5)

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
const canvas = document.body.appendChild( renderer.domElement )

const controls = new OrbitControls( camera, renderer.domElement );
controls.target.set(0.5,0.5,0.5)
controls.update();

const scene = new THREE.Scene();

const oneVoxelShaderTest = new THREE.ShaderMaterial({
	uniforms: {
		u_val: {value: 0.5},
		// u_lookVec: { get value() {return new THREE.Vector3().subVectors( box.position, camera.position ).normalize()} },
		u_lookVec: { get value() {
			return new THREE.Vector3(0,0,-1).applyMatrix4(new THREE.Matrix4().extractRotation(camera.matrix))
		} },

		u_Ni: {value: 24},
		u_Nj: {value: 10},
		u_fillType: {value: 0},

		u_projectionMatrix: { get value() {return camera.projectionMatrix} },
		u_modelViewMatrix: { get value() {return box.modelViewMatrix} },
	},
	vertexShader:`
		varying vec3 vPosition;
		varying vec3 vNormal;

		void main() {
			vPosition = position;
			vNormal = normal;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}`,
	fragmentShader:`
		varying vec3 vPosition;
		varying vec3 vNormal;

		uniform vec3 u_lookVec;
		uniform float u_val;

		uniform int u_Ni;
		uniform int u_Nj;
		uniform int u_fillType;

		uniform mat4 u_projectionMatrix;
		uniform mat4 u_modelViewMatrix;

		const float precisionFix = 0.00001;


		float distanceFromDotToSurface(vec3 A, vec3 B, vec3 C) {
			// distance:
			// from surface: A.x*(x-B.x)+A.y*(y-B.y)+A.z*(z-B.z) = 0 OR dot(A, vec3(x,y,z) - B) = 0
			// to dot: C

			return abs(dot(A, B-C))/length(A);
		} 

		float tValWhereLineCrossSurface(vec3 A, vec3 B, vec3 C, vec3 D) {
			// surface: dot(A, vec3(x,y,z) - B) = 0 (OR A.x*(x-B.x)+A.y*(y-B.y)+A.z*(z-B.z) = 0)
			// line: vec3(x,y,z) = C*t + D

			return dot(A, B-D)/dot(A,C);
		}


		int imod(int x, int y) { return x - y*(x/y); }

		// float RGBtoGray(vec4 C) { return 0.299*C.r + 0.587*C.g + 0.114*C.b; }

		const float PI = 3.1415926535897932384626433832795;

		vec4 HrVtoRGBA(float H, float V) { // H: angle in radians
			H = mod(H,2.0*PI);
			return vec4(
				 min(  max(     abs(H-    PI    )*3.0/PI-1.0 , 0.0 ) , 1.0  )*V
				,min(  max( 2.0-abs(H-2.0*PI/3.0)*3.0/PI     , 0.0 ) , 1.0  )*V
				,min(  max( 2.0-abs(H-4.0*PI/3.0)*3.0/PI     , 0.0 ) , 1.0  )*V
				,1.0
			);
		}

		vec3 pow2(vec3 a) { return a*a; }
		float multxyz(vec3 a) { return a.x*a.y*a.z; }

		float fff(vec3 a, vec3 b, float t) {
			return multxyz( pow2(4.0 * pow2(a * t + b) - 1.0) );
		}

		vec4 getColor(vec3 position, vec3 direction, float value) {
			// position always >= vec3(0.0) and <= vec3(1.0)

			// float distToPos = distanceFromDotToSurface( direction, normalize(direction)*(-sqrt(3.0)/2.0) + vec3(0.5) , position);
			// return vec4( vec3( 1.0 - distToPos/sqrt(3.0) ), 1.0 );
			// return HrVtoRGBA(distToPos/sqrt(3.0)*2.0*PI, 0.9);

			vec3 tvals[2] = vec3[2]( -position/direction, (1.0-position)/direction );

			float tfrom = 0.0;
			float tto = 0.0;

			for (int i = 0; i < tvals.length()*3; i++) {
				float tval = tvals[ i/3 ][ imod(i,3) ];

				vec3 pos = direction*tval + position;
				if ( all(greaterThanEqual(pos,vec3(-precisionFix))) && all(lessThanEqual(pos,vec3(1.0+precisionFix))) && tval > 0.0 ) { // > 0 but i am afraid about precision
					tto = tval;
					// break;
				}					

			}

			
			int N = u_Ni; //24
			float fN = float(N);
			for (int i = 0; i <= N; i++) {
				float t = float(i)/fN*tto;

				if ( fff( direction, position - 0.5, t ) > value ) {

					if (u_Nj > 0) {
						float tStart = float(i-1)/fN*tto;
						float tEnd = t;

						for (int j = 0; j < u_Nj; j++) {
							t = (tStart + tEnd)/2.0;

							if ( fff( direction, position - 0.5, t ) > value ) {
								tEnd = t;
							} else {
								tStart = t;
							}
						}

						t = (tStart + tEnd)/2.0;						
					}

					vec3 curentPos = direction*t + position;
					vec3 surfPos = normalize(direction)*(-sqrt(3.0)/2.0) + vec3(0.5);
					float distToPos = distanceFromDotToSurface(direction, surfPos, curentPos);

					// gl_FragDepth = (u_projectionMatrix * u_modelViewMatrix * vec4( curentPos, 1.0 )).z*10.0;

					if (u_fillType == 0) {
						return vec4( vec2( distToPos/sqrt(3.0) ), 0.1, 1.0 );
					} else if (u_fillType == 1) {
						float steps = 40.0;
						return vec4( vec2( mod(distToPos, sqrt(3.0)/steps ) )*steps, 0.1, 1.0 );						
					} else if (u_fillType == 2) {
						return HrVtoRGBA(distToPos/sqrt(3.0)*2.0*PI, 1.0);
					} else if (u_fillType == 3) {
						float steps = 40.0;
						return HrVtoRGBA(distToPos/sqrt(3.0)*2.0*PI, mod(distToPos, sqrt(3.0)/steps)*steps);
					} else if (u_fillType == 4) {
						float steps = 40.0;
						float limit = 0.1;

						return vec4(
							 mod(curentPos.x, 1.0/steps)*steps < limit ? 1.0 : 0.0
							,mod(curentPos.y, 1.0/steps)*steps < limit ? 1.0 : 0.0
							,mod(curentPos.z, 1.0/steps)*steps < limit ? 1.0 : 0.0
							,1.0
						);


						// vec3 findMaxComp = abs(curentPos - 0.5);
						// if (findMaxComp.x > findMaxComp.y && findMaxComp.x > findMaxComp.z) { // x max
						// 	return vec4( mod(curentPos.xyz, 1.0/steps)*steps, 1.0);
						// } else if (findMaxComp.y > findMaxComp.x && findMaxComp.y > findMaxComp.z) { // y max
						// 	return vec4( vec3( mod(curentPos.y, 1.0/steps)*steps ), 1.0);
						// } else { // z max
						// 	return vec4( vec3( mod(curentPos.z, 1.0/steps)*steps ), 1.0);
						// }

					}

				}
			}

			discard;
			// return vec4(0.0);





			// if (tto <= sqrt(3.0)+precisionFix && tto >= 0.0-precisionFix) {
			// 	// return vec3( vec2( tto/sqrt(3.0) ), 0.1 );
			// 	return vec3( vec2( mod(tto, sqrt(3.0)/10.0 ) )*10.0, 0.1 );
			// } else if ( tto == 100.0) {
			// 	return vec3(1.0, 0.0, 0.0);
			// } else {
			// 	return vec3(0.0, 0.0, 1.0);
			// }

			


		}

		void main() {

			vec4 color = vec4(1.0);

			// color = getColor(vPosition, u_lookVec, u_val);

			color = vec4(
				 gl_FragCoord.z
				,mod(gl_FragCoord.z*10.0, 1.0) < 0.1 ? 1.0 : 0.0
				,0.0 //mod(gl_FragCoord.z, 1.0/100.0)*100.0
				,1.0
			);


			gl_FragDepth = (u_projectionMatrix * u_modelViewMatrix * vec4( vPosition, 1.0 )).z*5.0 + 5.0;
			gl_FragColor = color;
		}`
});

const box = new THREE.Mesh(
	 new THREE.BoxGeometry(1,1,1).translate(0.5,0.5,0.5)
	,oneVoxelShaderTest
)

const plane = new THREE.Mesh(
	new THREE.PlaneGeometry(1,1),
	new THREE.MeshBasicMaterial({color: 0x80_80_80})
)
plane.position.set( 0.8, 0.8, 0.8 )
plane.lookAt( 1,1,1 )
scene.add(plane)

addBoundingBox(box)

scene.add(
	 box
	,new THREE.AxesHelper( 5 )
)
function animate() {
	requestAnimationFrame( animate );
	// controls.update();

	renderer.render( scene, camera );
};
animate();



// ------------------------------------------------------------------------
const gui = new GUI()

function attachUniformValueToProps(props, name, linkToVal) {
	// linkToVal is material.uniforms.u_val NOT material.uniforms.u_val.value !!!
	


}


const props = {
	get surfaseEqual() {return box.material.uniforms.u_val.value},
	set surfaseEqual(v) {      box.material.uniforms.u_val.value = v},

	get u_Ni() {return box.material.uniforms.u_Ni.value},
	set u_Ni(v) {      box.material.uniforms.u_Ni.value = v},

	get u_Nj() {return box.material.uniforms.u_Nj.value},
	set u_Nj(v) {      box.material.uniforms.u_Nj.value = v},

	get u_fillType() {return box.material.uniforms.u_fillType.value},
	set u_fillType(v) {      box.material.uniforms.u_fillType.value = v},
}


gui.add( props, 'surfaseEqual', 0, 1, 0.0001)
gui.add( props, 'u_Ni', 1, 200, 1)
gui.add( props, 'u_Nj', 0, 50, 1)
gui.add( props, 'u_fillType', 0, 4, 1)