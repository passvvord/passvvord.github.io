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
camera.up.set(0,0,1);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.setPixelRatio(window.devicePixelRatio);
const canvas = document.body.appendChild( renderer.domElement )

const controls = new OrbitControls( camera, renderer.domElement );
// controls.target.set(0.5,0.5,0.5)
// controls.update();

const scene = new THREE.Scene();


// const funcShader1 = `
// 	float pow2(float a) { return a*a; }
// 	float pow3(float a) { return a*a*a; }
// 	float pow4(float a) { return pow2(pow2(a)); }

// 	bool func(vec3 v) {
// 		return 0.5*(pow4(v.x) + pow4(v.y) + pow4(v.z)) - 8.*(pow2(v.x) + pow2(v.y) + pow2(v.z)) + 60. < 0.;
// 	}

// 	vec3 gradFunc(vec3 v) {
// 		return vec3(
// 			 (2.0*pow2(v.x)-16.0)*v.x
// 			,(2.0*pow2(v.y)-16.0)*v.y
// 			,(2.0*pow2(v.z)-16.0)*v.z
// 		);
// 	}`

// const box = new SurfaceByFunction(
// 	funcShader1, camera, new THREE.Vector3(-5,-5,-5), new THREE.Vector3(5,5,5)
// )
// box.material.uniforms.u_fillType.value = 2
// addBoundingBox(box)


// const box1 = new SurfaceByFunction(`
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
// 	,camera
// 	,new THREE.Vector3(-4.5,-4.5,-4.5), new THREE.Vector3(4.5,4.5,4.5)
// )
// addBoundingBox(box1)
// box1.material.uniforms.u_fillType.value = 2


const shaderByArr = (a='1,1,1, 1,1,1, 1,1,1,  0,0,0, 0,1,0, 0,0,0,  0,0,0, 0,1,0, 0,0,0')=>`
	const int pxAround[27] = int[27](${a});

	float pow2(float a) { return a*a; }
	float pow3(float a) { return a*a*a; }
	float pow4(float a) { return pow2(pow2(a)); }

	vec3 pow2(vec3 a) { return a*a; }
	vec3 pow3(vec3 a) { return a*a*a; }
	vec3 pow4(vec3 a) { return pow2(pow2(a)); }
	float multxyz(vec3 a) { return a.x*a.y*a.z; }

	// ------------------------------------- pow2
	vec3 f0dxyz(vec3 xyz, float w) {
		// expanded: 16x^4 - 8x^2 + 1
		return all(lessThanEqual(abs(xyz),vec3(w/2.0))) ? pow2( 4.0*pow2(xyz/w) - 1.0 ) : vec3(0.0);
	}

	vec3 f1dxyz(vec3 xyz, float w) {
		// expanded: 64x^3 - 16x
		// return (4.0*pow2(xyz/w) - 1.0)*16.0*xyz/w;
		return all(lessThanEqual(abs(xyz),vec3(w/2.0))) ? (4.0*pow2(xyz/w) - 1.0)*16.0*xyz/w : vec3(0.0);
	}

	// ------------------------------------- pow4
	// vec3 f0dxyz(vec3 xyz, float w) {
	// 	// (4x^2 - 1)^4 = 256x^8 - 256x^6 + 96x^4 + 1
	// 	return all(lessThanEqual(abs(xyz),vec3(w/2.0))) ? pow4(4.0*pow2(xyz/w) - 1.0) : vec3(0.0);
	// }

	// vec3 f1dxyz(vec3 xyz, float w) {
	// 	// (4x^2 - 1)^4 d/dx = 32x(4x^2 - 1)^3
	// 	// expanded: 2048x^7 - 1536x^5 + 384x^3 - 32x
	// 	return all(lessThanEqual(abs(xyz),vec3(w/2.0))) ? pow3(4.0*pow2(xyz/w) - 1.0)*32.0*xyz/w : vec3(0.0);
	// }

	bool func(vec3 v) {
		const float w = 2.0;
		const int wi = 1; // int(ceil(w/2));

		float count[2] = float[2](0. ,0. );

		const int delta = 2*wi+1;
		for (int z = -wi; z <= wi; z++) {
			for (int y = -wi; y <= wi; y++) {
				for (int x = -wi; x <= wi; x++) {
					int pos = ((z+wi)*delta + y+wi)*delta + x+wi;
					
					count[ pxAround[ pos ] ] += multxyz( f0dxyz( v - ( vec3(0.0) + vec3(ivec3(x,y,z)) ), w ) );
					
				}
			}			
		}
		//multxyz( f0dxyz( v - ( vec3(0.0) + vec3(ivec3(0,0,0)) ), w ) ) + multxyz( f0dxyz( v - ( vec3(0.0) + vec3(ivec3(0,-1,0)) ), w ) ) > 0.01;
		return count[1] - count[0] >= 0.0;
	}

	vec3 gradFunc(vec3 v) {
		const float w = 2.0;
		const int wi = 1; //int(ceil(w));

		vec3 count[2] = vec3[2](vec3(0.0),vec3(0.0));

		const int delta = 2*wi+1;
		for (int z = -wi; z <= wi; z++) {
			for (int y = -wi; y <= wi; y++) {
				for (int x = -wi; x <= wi; x++) {
					int pos = ((z+wi)*delta + y+wi)*delta + x+wi;

					vec3 f0 = f0dxyz( v - ( vec3(0.0) + vec3(ivec3(x,y,z)) ), w );
					vec3 f1 = f1dxyz( v - ( vec3(0.0) + vec3(ivec3(x,y,z)) ), w );
					
					count[ pxAround[ pos ] ] += vec3(
						 f1.x*f0.y*f0.z
						,f0.x*f1.y*f0.z
						,f0.x*f0.y*f1.z
					);
					
				}
			}			
		}

		return -(count[1]-count[0]);//count[1];//;
	}
	`

// const box2 = new SurfaceByFunction(
// 	shaderByArr('1,1,1, 1,1,1, 1,1,1,  0,0,0, 0,1,0, 0,0,0,  0,0,0, 0,1,0, 0,0,0')
// 	,camera, new THREE.Vector3(-0.5,-0.5,-0.5), new THREE.Vector3(0.5,0.5,0.5)
// )
// box2.material.uniforms.u_fillType.value = 2
// addBoundingBox(box2)
// box2.position.set(0,0,0)



const pixels = Uint8Array.of(
	0,0,0,0,0,
	0,0,0,0,0,
	0,0,0,0,0,
	0,0,0,0,0,
	0,0,0,0,0,

	0,0,0,0,0,
	0,1,1,1,0,
	0,1,1,1,0,
	0,1,1,1,0,
	0,0,0,0,0,

	0,0,0,0,0,
	0,0,1,0,0,
	0,0,1,1,0,
	0,0,0,0,0,
	0,0,0,0,0,

	0,0,0,0,0,
	0,0,0,0,0,
	0,0,1,0,0,
	0,0,1,0,0,
	0,0,0,0,0,

	0,0,0,0,0,
	0,0,0,0,0,
	0,0,0,0,0,
	0,0,0,0,0,
	0,0,0,0,0,
)

function pxByPos(x,y,z) {
	const pxPart = new Uint8Array(27)

	for (let zi = -1; zi <=1; zi++) {
		for (let yi = -1; yi <=1; yi++) {
			for (let xi = -1; xi <=1; xi++) {
				const globalPos = ((zi+z+2)*5 + yi+y+2)*5 + xi+x+2;
				const localPos = ((zi+1)*3 + yi+1)*3 + xi+1;

				// console.log(globalPos, '->' ,localPos)

				pxPart[localPos] = pixels[globalPos];
			}
		}
	}

	return pxPart;
}



const meshes = []// = new Array(27);

for (let zi = -1; zi <=1; zi++) {
	for (let yi = -1; yi <=1; yi++) {
		for (let xi = -1; xi <=1; xi++) {
			const arr = pxByPos(xi,yi,zi).join(',')

			const mesh = new SurfaceByFunction(
				shaderByArr(arr)
				,camera, new THREE.Vector3(-0.5,-0.5,-0.5), new THREE.Vector3(0.5,0.5,0.5)
			)
			mesh.material.uniforms.u_fillType.value = 1
			// addBoundingBox(mesh)
			mesh.position.set(xi,yi,zi)



			meshes.push(mesh)
			scene.add(mesh)
		}
	}
}



// const mm = new THREE.Mesh(
// 	 new THREE.BoxGeometry(10,10,10)
// 	,new THREE.MeshBasicMaterial( { color: 0x10_10_00 } )
// )
// addWireFrame(mm)

// scene.add( mm )


// let controlsArray = [] // need to make only one controls active at the same time
// controlsArray.push(controls)

// for (mesh of [box, box1, box2]) {
// 	mesh.transformControls = new TransformControls( camera, renderer.domElement )
// 	controlsArray.push(mesh.transformControls)

// 	mesh.transformControls.addEventListener( 'dragging-changed', event=>{
// 		controlsArray.forEach(control=>{
// 			if (control != event.target) {
// 				control.enabled = !event.value;
// 			}
// 		})
// 	});

// 	mesh.transformControls.attach( mesh )
// 	scene.add( mesh.transformControls.getHelper() )
// }


// box.visible = false
scene.add(
	//  box
	// ,box1
	// box2
	// ,
	new THREE.AxesHelper( 15 )
)

function animate() {
	requestAnimationFrame( animate );
	// controls.update();

	renderer.render( scene, camera );
};
animate();


//gui start ------------------------------------------------------------------------
const gui = new GUI()

// guiHelpers.attachUniformValueToProps(gui, 'u_Ni', box2.material.uniforms.u_Ni, [1, 200, 1])

gui.add({
	get 'u_Ni'() {return meshes[0].material.uniforms.u_Ni.value},
	set 'u_Ni'(v) {      meshes.forEach(m=>{ m.material.uniforms.u_Ni.value = v }) }	
},      'u_Ni',1, 500, 1)

gui.add({
	get 'u_Nj'() {return meshes[0].material.uniforms.u_Nj.value},
	set 'u_Nj'(v) {      meshes.forEach(m=>{ m.material.uniforms.u_Nj.value = v }) }	
},      'u_Nj',1, 20, 1)

// guiHelpers.attachUniformValueToProps(gui, 'u_Nj', box2.material.uniforms.u_Nj, [0, 50 , 1])


gui.add({
	get 'u_step'() {return meshes[0].material.uniforms.u_step.value},
	set 'u_step'(v) {      meshes.forEach(m=>{ m.material.uniforms.u_step.value = v }) }	
},      'u_step',1, 100, 0.1)

gui.add({
	get 'u_limit'() {return meshes[0].material.uniforms.u_limit.value},
	set 'u_limit'(v) {      meshes.forEach(m=>{ m.material.uniforms.u_limit.value = v }) }	
},      'u_limit',0, 1, 0.001)

// guiHelpers.attachUniformValueToProps(gui, 'u_step' , box2.material.uniforms.u_step , [1, 100, 0.1])
// guiHelpers.attachUniformValueToProps(gui, 'u_limit', box2.material.uniforms.u_limit, [0, 1, 0.001])

gui.add({
	get 'u_fillType'() {return meshes[0].material.uniforms.u_fillType.value},
	set 'u_fillType'(v) {      meshes.forEach(m=>{ m.material.uniforms.u_fillType.value = v }) }	
},      'u_fillType',0, 5, 1)

// guiHelpers.attachUniformValueToProps(gui, 'u_fillType', box2.material.uniforms.u_fillType, [0, 8, 1])

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