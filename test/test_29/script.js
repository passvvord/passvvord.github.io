// const testFunctionGLSLready = '0.5*(pow(x,4.) + pow(y,4.) + pow(z,4.)) - 8.(pow(x,2.) + pow(y,2.) + pow(z,2.)) + 60. = 0'

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

const perspectiveCamera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const camera = new THREE.OrthographicCamera( ...Object.values( getParamsToOrtoGraficCamera(perspectiveCamera,15) ) )
camera.near = -1000
camera.position.set(0,0,-15)

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
const canvas = document.body.appendChild( renderer.domElement )

const controls = new OrbitControls( camera, renderer.domElement );
// controls.target.set(0.5,0.5,0.5)
// controls.update();

const scene = new THREE.Scene();

const renderByFunc = new THREE.ShaderMaterial({
	uniforms: {
		// u_val: {value: 0.5},
		// u_lookVec: { get value() {return new THREE.Vector3().subVectors( box.position, camera.position ).normalize()} },
		u_lookVec: { get value() {
			return new THREE.Vector3(0,0,-1).applyMatrix4(new THREE.Matrix4().extractRotation(camera.matrix))
		} },

		// u_windowSpaceZcenter: {	get value() {
		// 		return box.geometry.boundingSphere.center.clone()
		// 			.applyMatrix4( box.modelViewMatrix )
		// 			.applyMatrix4( camera.projectionMatrix )
		// 			.z*0.5+0.5
		// } },
		// u_windowSpaceZnear: { get value() {
		// 	return box.geometry.boundingSphere.center.clone()
		// 			.applyMatrix4( box.modelViewMatrix )
		// 			.applyMatrix4( camera.projectionMatrix )
		// 			.z*0.5+0.5
		// 			-box.geometry.boundingSphere.radius/(camera.far - camera.near)
		// } },
		// u_windowSpaceZfar: { get value() {
		// 	return box.geometry.boundingSphere.center.clone()
		// 			.applyMatrix4( box.modelViewMatrix )
		// 			.applyMatrix4( camera.projectionMatrix )
		// 			.z*0.5+0.5
		// 			+box.geometry.boundingSphere.radius/(camera.far - camera.near)
		// } },

		u_Ni: {value: 100},
		u_Nj: {value: 10},
		u_fillType: {value: 4},

		u_projectionMatrix: { get value() {return camera.projectionMatrix} },
		u_modelViewMatrix: { get value() {return box.modelViewMatrix} },

		u_step: {value: 5},
		u_limit: {value: 0.1},

		u_min: { get value() {return box.geometry.boundingBox.min} },
		u_max: { get value() {return box.geometry.boundingBox.max} },
	},
	vertexShader:`
		varying vec3 vPosition;
		// varying vec3 vNormal;

		void main() {
			vPosition = position;
			// vNormal = normal;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}`,
	fragmentShader:`
		varying vec3 vPosition;
		// varying vec3 vNormal;

		uniform vec3 u_lookVec;
		// uniform float u_val;

		uniform int u_Ni;
		uniform int u_Nj;
		uniform int u_fillType;

		uniform mat4 u_projectionMatrix;
		uniform mat4 u_modelViewMatrix;

		// uniform float u_windowSpaceZnear;
		// uniform float u_windowSpaceZfar;

		uniform float u_step;
		uniform float u_limit;

		uniform vec3 u_min;
		uniform vec3 u_max;

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

		


		vec3 pow2(vec3 a) { return a*a; }           // faster than pow(float, float)
		vec3 pow3(vec3 a) { return a*a*a; }         // faster than pow(float, float)
		vec3 pow4(vec3 a) { return pow2(pow2(a)); } // faster than pow(float, float)
		float multxyz(vec3 a) { return a.x*a.y*a.z; }

		vec3 pow2_4(vec3 a) { return (0.48274*abs(a) + 0.52165)*pow2(a); } // works good only from -1 to 1 but still faster than pow()

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

		vec3 linesByStepsAndLimit(vec3 value ,vec3 steps, vec3 limit) {
			return vec3( lessThan( mod(value + limit/(2.0*steps), 1.0/steps)*steps , limit ) );
		}

		vec3 gradientBySteps(vec3 value ,float steps) {
			return mod(value, 1.0/steps)*steps;
		}

		vec3 gradientBySteps(vec3 value ,vec3 steps) {
			return mod(value, 1.0/steps)*steps;
		}


		// float fdxfdyfdz

		bool inBounds(vec3 pos, vec3 min, vec3 max) {
			return pos.x >= min.x && pos.y >= min.y && pos.z >= min.z && pos.x <= max.x && pos.y <= max.y && pos.z <= max.z;
		}

		// bool inBoundsv1(vec3 pos) {
		// 	return all(greaterThanEqual(pos,u_min)) && all(lessThanEqual(pos,u_max));
		// }

		float pow2(float a) { return a*a; }
		float pow3(float a) { return a*a*a; }
		float pow4(float a) { return pow2(pow2(a)); }

		bool func(vec3 v) {
			return 0.5*(pow4(v.x) + pow4(v.y) + pow4(v.z)) - 8.*(pow2(v.x) + pow2(v.y) + pow2(v.z)) + 60. < 0.;
		}

		vec3 gradFunc(vec3 v) {
			return vec3(
				 (2.0*pow2(v.x)-16.0)*v.x
				,(2.0*pow2(v.y)-16.0)*v.y
				,(2.0*pow2(v.z)-16.0)*v.z
			);
		}

		// bool func(vec3 v) {
		// 	return cos(v.x)*cos(v.y)*cos(v.z) > 0.5;
		// }

		// //grad(cos(x) cos(y) cos(z)) = (-cos(y) cos(z) sin(x), -cos(x) cos(z) sin(y), -cos(x) cos(y) sin(z))
		// vec3 gradFunc(vec3 v) {
		// 	return vec3(
		// 		 -cos(v.y)*cos(v.z)*sin(v.x)
		// 		,-cos(v.x)*cos(v.z)*sin(v.y)
		// 		,-cos(v.x)*cos(v.y)*sin(v.z)
		// 	);
		// }

		float windowSpaseZByPos(vec3 position) {
			vec4 preClipSpace = u_projectionMatrix * u_modelViewMatrix * vec4(position, 1.0);
			vec3 clipSpace = preClipSpace.xyz / preClipSpace.w;
			float windowSpaseZ = clipSpace.z*0.5 + 0.5;
			//gl_FragDepth = windowSpaseZ;

			return windowSpaseZ;
		}



		vec3 adjustByFunc(in vec3 from, in vec3 to, in int iteratoins) {
			// expected: func(from) == false && func(to) == true

			vec3 valToTest;

			for (int i = 0; i < iteratoins; i++) {
				valToTest = (from + to)/2.0;

				if ( func( valToTest ) ) {
					to = valToTest;
				} else {
					from = valToTest;
				}
			}

			return valToTest; // (from + to)/2.0			
		}

		void pushRay(in vec3 position, in vec3 direction, in vec3 min, in vec3 max, in int Ni, in int Nii, out vec3 endPosition, out vec3 normal) {

			vec3 goBy = length(max - min)*normalize(direction);

			float Ni_f = float(Ni);

			vec3 lastPosition = position;

			for (int i = 0; i <= Ni; i++) {
				vec3 currentPosition = float(i)/Ni_f*goBy + position;

				if ( !inBounds(currentPosition, min, max) ) {
					//!inBounds(currentPosition, min-precisionFix, max+precisionFix)
					discard;
				}

				if ( func(currentPosition) ) {

					if (Nii > 0) {
						endPosition = adjustByFunc(lastPosition, currentPosition, Nii);
					} else {
						endPosition = currentPosition;
					}

					normal = normalize(gradFunc(endPosition));

					gl_FragDepth = windowSpaseZByPos(endPosition);

					return;

				}

				lastPosition = currentPosition;
			}

			//discard;
		}

		vec4 colorByFillType(vec3 pos, vec3 normal, int fill, float steps, float limit) {

			if (fill == 0) {
				return vec4(
					linesByStepsAndLimit(pos, steps, limit)
					,1.0
				);
			} else if (fill == 1) {
				return vec4(
					gradientBySteps(pos, steps)
					,1.0
				);
			} else if (fill == 2) {
				return vec4(
					normal*0.5 + 0.5
					,1.0
				);
			} else if (fill == 3) {
				return vec4(
					linesByStepsAndLimit(normal*0.5 + 0.5, 20.0, limit)
					,1.0
				);
			} else if (fill == 4) {
				return vec4(
					gradientBySteps(normal*0.5 + 0.5, 20.0)
					,1.0
				);
			} else {
				return vec4(1.0, 0.0, 0.0, 1.0);
			}
		}


		void main() {
			vec4 color = vec4(1.0);

			vec3 endPos = vec3(2.5);
			vec3 normal = vec3(1.0, 0.0, 0.0);

			pushRay(vPosition, u_lookVec, u_min, u_max, u_Ni, u_Nj, endPos, normal);

			color = colorByFillType(endPos, normal, u_fillType, u_step, u_limit);

			gl_FragColor = color;
		}`
});

const funcShader1 = `
	float pow2(float a) { return a*a; }
	float pow3(float a) { return a*a*a; }
	float pow4(float a) { return pow2(pow2(a)); }

	bool func(vec3 v) {
		return 0.5*(pow4(v.x) + pow4(v.y) + pow4(v.z)) - 8.*(pow2(v.x) + pow2(v.y) + pow2(v.z)) + 60. < 0.;
	}

	vec3 gradFunc(vec3 v) {
		return vec3(
			 (2.0*pow2(v.x)-16.0)*v.x
			,(2.0*pow2(v.y)-16.0)*v.y
			,(2.0*pow2(v.z)-16.0)*v.z
		);
	}`

const box = new SurfaceByFunction(
	funcShader1, camera, new THREE.Vector3(-5,-5,-5), new THREE.Vector3(5,5,5)
)
box.material.uniforms.u_fillType.value = 2
addBoundingBox(box)


// const box1 = new THREE.Mesh(
// 	 new THREE.BoxGeometry(4.5*2,4.5*2,4.5*2)
// 	//,renderByFunc
// )
// box1.material = SurfaceByFunction.getMaterial(`
// 	const float PI = 3.141592653589793;
// 	const float scale = PI*1.0;

// 	bool func(vec3 v) {
// 		return cos(scale*v.x)*cos(scale*v.y)*cos(scale*v.z) > 0.5;
// 	}

// 	vec3 gradFunc(vec3 v) {
// 		return -vec3(
// 			 -scale*cos(scale*v.y)*cos(scale*v.z)*sin(scale*v.x)
// 			,-scale*cos(scale*v.x)*cos(scale*v.z)*sin(scale*v.y)
// 			,-scale*cos(scale*v.x)*cos(scale*v.y)*sin(scale*v.z)
// 		);
// 	}
// 	`
// 	,box1, camera
// )
// addBoundingBox(box1)
// box1.material.uniforms.u_fillType.value = 2

const box2 = new SurfaceByFunction(
	funcShader1, camera, new THREE.Vector3(-5,-5,-5), new THREE.Vector3(5,5,5)
)
box2.material.uniforms.u_fillType.value = 2
addBoundingBox(box2)
box2.position.set(4,0,0)




const mm = new THREE.Mesh(
	 new THREE.BoxGeometry(10,10,10)
	,new THREE.MeshBasicMaterial( { color: 0xff_ff_00 } )
)
addWireFrame(mm)

scene.add( mm )


let controlsArray = [] // need to make only one controls active at the same time
controlsArray.push(controls)

for (mesh of [box, box2, mm]) {
	mesh.transformControls = new TransformControls( camera, renderer.domElement )
	controlsArray.push(mesh.transformControls)

	mesh.transformControls.addEventListener( 'dragging-changed', event=>{
		controlsArray.forEach(control=>{
			if (control != event.target) {
				control.enabled = !event.value;
			}
		})
	});

	mesh.transformControls.attach( mesh )
	scene.add( mesh.transformControls.getHelper() )
}


// box.visible = false
scene.add(
	 box
	// ,box1
	,box2
	,new THREE.AxesHelper( 15 )
)

function animate() {
	requestAnimationFrame( animate );
	// controls.update();

	renderer.render( scene, camera );
};
animate();


// gui start ------------------------------------------------------------------------
const gui = new GUI()

guiHelpers.attachUniformValueToProps(gui, 'u_Ni', box.material.uniforms.u_Ni, [1, 200, 1])
guiHelpers.attachUniformValueToProps(gui, 'u_Nj', box.material.uniforms.u_Nj, [0, 50 , 1])

guiHelpers.attachUniformValueToProps(gui, 'u_step' , box.material.uniforms.u_step , [1, 100, 0.1])
guiHelpers.attachUniformValueToProps(gui, 'u_limit', box.material.uniforms.u_limit, [0, 1, 0.001])

guiHelpers.attachUniformValueToProps(gui, 'u_fillType', box.material.uniforms.u_fillType, [0, 8, 1])

const controlsFolder = gui.addFolder('controls')

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