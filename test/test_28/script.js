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

// const camera = new THREE.OrthographicCamera( ...Object.values( getParamsToOrtoGraficCamera(perspectiveCamera,5) ) )
// camera.near = 0

camera = perspectiveCamera
camera.position.set(0.5,0.5,-5)

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
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

		u_camPos: { get value() { return camera.position; } },

		u_windowSpaceZcenter: {	get value() {
				return box.geometry.boundingSphere.center.clone()
					.applyMatrix4( box.modelViewMatrix )
					.applyMatrix4( camera.projectionMatrix )
					.z*0.5+0.5
		} },
		u_windowSpaceZnear: { get value() {
			return box.geometry.boundingSphere.center.clone()
					.applyMatrix4( box.modelViewMatrix )
					.applyMatrix4( camera.projectionMatrix )
					.z*0.5+0.5
					-box.geometry.boundingSphere.radius/(camera.far - camera.near)
		} },
		u_windowSpaceZfar: { get value() {
			return box.geometry.boundingSphere.center.clone()
					.applyMatrix4( box.modelViewMatrix )
					.applyMatrix4( camera.projectionMatrix )
					.z*0.5+0.5
					+box.geometry.boundingSphere.radius/(camera.far - camera.near)
		} },

		u_Ni: {value: 24},
		u_Nj: {value: 10},
		u_fillType: {value: 0},

		u_projectionMatrix: { get value() {return camera.projectionMatrix} },
		u_modelViewMatrix: { get value() {return box.modelViewMatrix} },
		u_modelMatrixWorld: { get value() {return box.matrixWorld} },

		u_step: {value: 40},
		u_limit: {value: 0.1},
	},
	vertexShader:`
		uniform vec3 u_camPos;

		varying vec3 vPosition;
		//varying vec3 vNormal;
		varying vec3 vDirection;

		uniform mat4 u_modelMatrixWorld;

		void main() {
			vPosition = position;
			//vNormal = normal;
			//vDirection = normalize( u_modelMatrixWorld * vec4(position, 1.0) );

			vDirection = normalize( (u_modelMatrixWorld * vec4(position, 1.0)).xyz - u_camPos );
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}`,
	fragmentShader:`
		varying vec3 vPosition;
		//varying vec3 vNormal;
		varying vec3 vDirection;

		//uniform vec3 u_lookVec;
		uniform float u_val;

		uniform int u_Ni;
		uniform int u_Nj;
		uniform int u_fillType;

		uniform mat4 u_projectionMatrix;
		uniform mat4 u_modelViewMatrix;

		uniform float u_windowSpaceZnear;
		uniform float u_windowSpaceZfar;

		uniform float u_step;
		uniform float u_limit;

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

		// vec3 pow2(vec3 a) { return a*a; }
		vec3 pow2(vec3 a) { return a*a; }           // faster than pow(float, float)
		vec3 pow3(vec3 a) { return a*a*a; }         // faster than pow(float, float)
		vec3 pow4(vec3 a) { return pow2(pow2(a)); } // faster than pow(float, float)
		float multxyz(vec3 a) { return a.x*a.y*a.z; }

		// vec3 pow2_4(vec3) { return (0.48274*abs(vec3) + 0.52165)*pow2(vec3); } // works good only from -1 to 1 but still faster than pow()

		// float f0dx(float x) {
		// 	// expanded: 16x^4 - 8x^2 + 1
		// 	return pow2( 4.0*pow2(x) - 1.0 );
		// }

		// float f1dx(float x) {
		// 	// expanded: 64x^3 - 16x
		// 	return (4.0*pow2(x) - 1.0)*16.0*x;
		// }

		// vec3 f0dxyz(vec3 xyz) {
		// 	// expanded: 16x^4 - 8x^2 + 1
		// 	return pow2( 4.0*pow2(xyz) - 1.0 );
		// }

		// vec3 f1dxyz(vec3 xyz) {
		// 	// expanded: 64x^3 - 16x
		// 	return (4.0*pow2(xyz) - 1.0)*16.0*xyz;
		// }

		vec3 f0dxyz(vec3 xyz) {
			// (4x^2 - 1)^4 = 256x^8 - 256x^6 + 96x^4 + 1
			return pow4(4.0*pow2(xyz) - 1.0);
		}

		vec3 f1dxyz(vec3 xyz) {
			// (4x^2 - 1)^4 d/dx = 32x(4x^2 - 1)^3
			// expanded: 2048x^7 - 1536x^5 + 384x^3 - 32x
			return pow3(4.0*pow2(xyz) - 1.0)*32.0*xyz;
		}

		vec3 getNormal(vec3 xyz) {
			vec3 f0 = f0dxyz(xyz);
			vec3 f1 = f1dxyz(xyz);

			return -normalize(vec3(
				 f1.x*f0.y*f0.z
				,f0.x*f1.y*f0.z
				,f0.x*f0.y*f1.z
			));
		}

		float fff(vec3 a, vec3 b, float t) {
			// line:
			// vec3(x,y,z) = a*t + b 
			// crosses surface:
			// (4*vec3(x,y,z)^2 - 1)^2 = constant
			return multxyz( pow4(4.0 * pow2(a * t + b) - 1.0) );
		}


		vec3 linesByStepsAndLimit(vec3 value ,float steps, float limit) {
			return vec3(
				 mod(value.x + limit/(2.0*steps), 1.0/steps)*steps < limit ? 1.0 : 0.0
				,mod(value.y + limit/(2.0*steps), 1.0/steps)*steps < limit ? 1.0 : 0.0
				,mod(value.z + limit/(2.0*steps), 1.0/steps)*steps < limit ? 1.0 : 0.0
			);
		}

		vec3 gradientBySteps(vec3 value ,float steps) {
			return vec3(
				 mod(value, 1.0/steps)*steps
				// ,mod(value, 1.0/steps)*steps
				// ,mod(value, 1.0/steps)*steps
			);
		}


		// float fdxfdyfdz

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
				if ( all(greaterThanEqual(pos,vec3(-precisionFix))) && all(lessThanEqual(pos,vec3(1.0+precisionFix))) && tval > precisionFix ) { // > 0 but i am afraid about precision
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

					vec4 preClipSpace = u_projectionMatrix * u_modelViewMatrix * vec4( curentPos, 1.0 );
					vec3 clipSpace = preClipSpace.xyz / preClipSpace.w;
					float windowSpaseZ = clipSpace.z*0.5 + 0.5;
					gl_FragDepth = windowSpaseZ;

					float steps = u_step; // 40.0
					float limit = u_limit; // 0.1

					if (u_fillType == 0) {
						return vec4( vec2( distToPos/sqrt(3.0) ), 0.1, 1.0 );
					} else if (u_fillType == 1) {
						return vec4( vec2( mod(distToPos, sqrt(3.0)/steps ) )*steps, 0.1, 1.0 );						
					} else if (u_fillType == 2) {
						return HrVtoRGBA(distToPos/sqrt(3.0)*2.0*PI, 1.0);
					} else if (u_fillType == 3) {
						return HrVtoRGBA(distToPos/sqrt(3.0)*2.0*PI, mod(distToPos, sqrt(3.0)/steps)*steps);
					} else if (u_fillType == 4) {
						return vec4(
							linesByStepsAndLimit(curentPos, steps, limit)
							,1.0
						);
					} else if (u_fillType == 5) {
						return vec4(
							gradientBySteps(curentPos, steps)
							,1.0
						);
					} else if (u_fillType == 6) {
						return vec4(
							getNormal(curentPos - vec3(0.5))*0.5 + 0.5
							,1.0
						);
					} else if (u_fillType == 7) {
						return vec4(
							linesByStepsAndLimit( getNormal(curentPos - vec3(0.5))*0.5 + 0.5, steps, limit)
							,1.0
						);
					} else if (u_fillType == 8) {
						return vec4(
							gradientBySteps( getNormal(curentPos - vec3(0.5))*0.5 + 0.5, steps)
							,1.0
						);
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

			vec3 u_lookVec = vDirection;

			vec4 color = vec4(1.0);

			color = getColor(vPosition, u_lookVec, u_val);



			// vec4 preClipSpace = u_projectionMatrix * u_modelViewMatrix * vec4( vPosition, 1.0 );
			// vec3 clipSpace = preClipSpace.xyz / preClipSpace.w;
			// float windowSpaseZ = clipSpace.z*0.5 + 0.5; 
			// gl_FragDepth = windowSpaseZ; // == gl_FragCoord.z;


			// color = vec4(
			// 	 abs(gl_FragCoord.z - ehhhPos.z)
			// 	,abs(gl_FragCoord.z - ehhhPos.z/ehhhPos.w)
			// 	,0.0
			// 	,1.0
			// );

			

			gl_FragColor = color;
		}`
});

const box = new THREE.Mesh(
	 new THREE.BoxGeometry(1,1,1).translate(0.5,0.5,0.5)
	,oneVoxelShaderTest
)

const plane = new THREE.Mesh(
	new THREE.PlaneGeometry(1.2, 1.2, 5,5),
	new THREE.MeshBasicMaterial({color: 0x80_80_80, side: THREE.DoubleSide})
)
plane.position.set( 0.8, 0.8, 0.8 )
plane.lookAt( 1,1,1 )
addWireFrame(plane)

scene.add(plane)


const planeShader = new THREE.ShaderMaterial({
	uniforms: {
		u_check: {value: 0},
		u_projectionMatrix: { get value() {return camera.projectionMatrix} },
		u_modelViewMatrix: { get value() {return plane1.modelViewMatrix} },
	},
	vertexShader:`
		varying vec3 vPosition;

		void main() {
			vPosition = position;

			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}`,
	fragmentShader:`
		varying vec3 vPosition;

		uniform mat4 u_projectionMatrix;
		uniform mat4 u_modelViewMatrix;

		uniform float u_check;


		// float RGBtoGray(vec4 C) { return 0.299*C.r + 0.587*C.g + 0.114*C.b; }

		// const float PI = 3.1415926535897932384626433832795;

		// vec4 HrVtoRGBA(float H, float V) { // H: angle in radians
		// 	H = mod(H,2.0*PI);
		// 	return vec4(
		// 		 min(  max(     abs(H-    PI    )*3.0/PI-1.0 , 0.0 ) , 1.0  )*V
		// 		,min(  max( 2.0-abs(H-2.0*PI/3.0)*3.0/PI     , 0.0 ) , 1.0  )*V
		// 		,min(  max( 2.0-abs(H-4.0*PI/3.0)*3.0/PI     , 0.0 ) , 1.0  )*V
		// 		,1.0
		// 	);
		// }

		void main() {

			vec4 color = vec4(1.0);


			vec4 ehhhPos = u_projectionMatrix * u_modelViewMatrix * vec4( vPosition, 1.0 );
			vec3 NDCclipSpace = ehhhPos.xyz/ehhhPos.w;


			if ( all(greaterThanEqual(NDCclipSpace,vec3(-1.0))) && all(lessThanEqual(NDCclipSpace,vec3(1.0))) ) {
				color = vec4( NDCclipSpace*0.5 + 0.5 , 1.0);
			} else {
				color = vec4( 1.0, 0.0, 0.0, 1.0 );
			}


			if ( abs(gl_FragCoord.z - (NDCclipSpace.z*0.5 + 0.5)) < 0.01 ) {
				color = vec4( 1.0, 1.0, 0.0, 1.0 );
			}

			// color = vec4(
			// 	 abs(gl_FragCoord.z - ehhhPos.z)
			// 	,abs(gl_FragCoord.z - ehhhPos.z/ehhhPos.w)
			// 	,0.0
			// 	,1.0
			// );

			// gl_FragDepth = ehhhPos.z/ehhhPos.w;

			gl_FragColor = color;
		}`
});

const plane1 = new THREE.Mesh(
	new THREE.PlaneGeometry(2,20),
	planeShader
)
// plane1.position.set( 0.8, 0.8, 0.8 )
plane1.lookAt( 2,10,0 )
// scene.add(plane1)

addBoundingBox(box, 0x40_40_40)

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

// gui start ------------------------------------------------------------------------
const gui = new GUI()

guiHelpers.attachUniformValueToProps(gui, 'surfaseEqual', box.material.uniforms.u_val, [0, 1, 0.0001])

guiHelpers.attachUniformValueToProps(gui, 'u_Ni', box.material.uniforms.u_Ni, [1, 200, 1])
guiHelpers.attachUniformValueToProps(gui, 'u_Nj', box.material.uniforms.u_Nj, [0, 50 , 1])

guiHelpers.attachUniformValueToProps(gui, 'u_step' , box.material.uniforms.u_step , [1, 100, 0.1])
guiHelpers.attachUniformValueToProps(gui, 'u_limit', box.material.uniforms.u_limit, [0, 1, 0.001])

guiHelpers.attachUniformValueToProps(gui, 'u_fillType', box.material.uniforms.u_fillType, [0, 8, 1])

const planeFolder = gui.addFolder('plane to check gl_FragCoord.z')

guiHelpers.addVisibilityChangerToGui(planeFolder, 'show plane', plane)
planeFolder.add({
	get 'plane pos'() {return plane.position.x},
	set 'plane pos'(v) {      plane.position.set(v,v,v)}	
},      'plane pos', 0, 1, 0.001)

const controlsFolder = gui.addFolder('controls')

//controls.enabled
controlsFolder.add({
	get 'on/off'() {return controls.enabled},
	set 'on/off'(v) {      controls.enabled = v}	
},      'on/off')

controlsFolder.add({
	get 'rotate'() {return controls.enableRotate},
	set 'rotate'(v) {      controls.enableRotate = v}	
},      'rotate')

const copyUrlController = gui.add({
	'copy url on this state'() {
		try {
			navigator.clipboard.writeText(
				guiHelpers.getUrlByGuiCameraOrbitControls(gui, camera, controls)
			)
			copyUrlController.name('copied')
		} catch(e) {
			console.log(e);
			copyUrlController.name('error'+e)
		}

		if (this.interval != undefined) {
			clearTimeout(this.interval)
			this.interval = undefined;
		}
		this.interval = setTimeout(()=>{
			copyUrlController.name( copyUrlController.property );
			//delete this.interval;
			this.interval = undefined;
		}, 2000)
	}
},  'copy url on this state')

// gui end ------------------------------------------------------------------------

guiHelpers.setGuiCameraOrbitControlsBySearch(gui, camera, controls, window.location.search)


// OrbitControls.prototype.upVectorChanged = function() {
// 	this._quat = new THREE.Quaternion().setFromUnitVectors( this.object.up, new THREE.Vector3( 0, 1, 0 ) );
// 	this._quatInverse = this._quat.clone().invert();
// }
