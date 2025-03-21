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

const gl = canvas.getContext('webgl2')

const controls = new OrbitControls( camera, renderer.domElement );
// controls.target.set(0.5,0.5,0.5)
// controls.update();

const scene = new THREE.Scene();


renderer.setClearColor(0xff_ff_ff, 1)

// function windowResize() {

// 	const width = window.innerWidth;
// 	const height = window.innerHeight;

// 	if (camera instanceof THREE.PerspectiveCamera) {
// 		camera.aspect = width / height;
// 		camera.updateProjectionMatrix();		
// 	} else if (camera instanceof THREE.OrthographicCamera) {
// 		camera.left = - width / 2;
// 		camera.right = width / 2;
// 		camera.top = height / 2;
// 		camera.bottom = - height / 2;
// 		camera.updateProjectionMatrix();		
// 	}

// 	renderer.setSize( window.innerWidth, window.innerHeight );
// }

// window.addEventListener('resize', windowResize);

			




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


const shaderByArr = (a='1,1,1, 1,1,1, 1,1,1,  0,0,0, 0,1,0, 0,0,0,  0,0,0, 0,1,0, 0,0,0', funcType = 'pow2_2')=>`

	uniform float u_w;
	uniform float u_0modif;
	uniform float u_1modif;

	const int pxAround[27] = int[27](${a});

	float pow2(float a) { return a*a; }
	float pow3(float a) { return a*a*a; }
	float pow4(float a) { return pow2(pow2(a)); }
	float pow8(float a) { return pow2(pow2(pow2(a))); }

	vec3 pow2(vec3 a) { return a*a; }
	vec3 pow3(vec3 a) { return a*a*a; }
	vec3 pow4(vec3 a) { return pow2(pow2(a)); }
	float multxyz(vec3 a) { return a.x*a.y*a.z; }

	vec3 powV3(vec3 a, float b) {return vec3(pow(a.x,b), pow(a.y,b), pow(a.z,b)); }


	//uniform sampler3D u_tex;

	// int getPx(int x, int y, int z, int delta, int move) {
	// 	if (x >= -1 && x <= 1 && y >= -1 && y <= 1 && z >= -1 && z <= 1) {      //pos >= 0 && pos < 27) {
	// 		int pos = ((z*delta + y)*delta + x) + move;
	// 		return pxAround[pos];
	// 	} else {
	// 		return 0;
	// 	}
	// }

	// must be fixed!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	int getPx(int x, int y, int z, int delta, int move) {
		int pos = ((z*delta + y)*delta + x) + move;
		if (pos >= 0 && pos < 27) {
			return pxAround[pos];
		} else {
			return 0;
		}
	}

	// bool inBounds(in vec3 xyz, in float w_2) {
	// 	return abs(xyz.x) <= w_2 && abs(xyz.y) <= w_2 && abs(xyz.z) <= w_2;
	// }

	bool inBounds(in vec3 xyz, in float w_2) {
		return all(lessThanEqual(abs(xyz),vec3(w_2)));
	}
	
	${(ft=>{
		if (ft === 'pow2_2') {
			return `
				// ------------------------------------- pow2
				vec3 f0dxyz(in vec3 xyz, in float w_2, in float w_2_4) {
					// (1.0 - 4.0/w^2*(xyz)^2)^2
					return inBounds(xyz, w_2) ? pow2( 1.0 - pow2(xyz/w_2) ) : vec3(0.0);
				}

				// vec3 f1dxyz(in vec3 xyz, in float w_2, in float w_s2, in float w_16_4) {
				// 	// (1.0 - 4.0*pow2(xyz/w))^2 d/dx = -(w^2 - 4*xyz^2)*xyz*16/w^4;
				// 	return inBounds(xyz, w_2) ? -(w_s2 - 4.0*pow2(xyz))*w_16_4*xyz : vec3(0.0);
				// }

				vec3 f1dxyz(in vec3 xyz, in float r) {
					// d/dx((1 - (x/r)^2)^2) = (4 x (x^2 - r^2))/r^4
					return inBounds(xyz, r) ? 4.0*xyz*(powV3(xyz, 2.0)-pow(r, 2.0))/pow(r, 4.0) : vec3(0.0);
				}
			`
		} else if (ft === 'pow2_4') {
			return `
				// ------------------------------------- pow4
				vec3 f0dxyz(in vec3 xyz, in float w_2, in float w_2_4) {
					// (4x^2 - 1)^4 = 256x^8 - 256x^6 + 96x^4 + 1
					return inBounds(xyz, w_2) ? pow4(1.0 - pow2(xyz/w_2)) : vec3(0.0);
				}

				// vec3 f1dxyz(in vec3 xyz, in float w_2, in float w_2_4, in float w_32) {
				// 	// (4x^2 - 1)^4 d/dx = 32x(4x^2 - 1)^3
				// 	// expanded: 2048x^7 - 1536x^5 + 384x^3 - 32x
				// 	return inBounds(xyz, w_2) ? pow3(w_2_4*pow2(xyz) - 1.0)*w_32*xyz : vec3(0.0);
				// }

				vec3 f1dxyz(in vec3 xyz, in float w_2, in float w_s2, in float w_32_8) {
					// (1-4(x/w)^2)^4 d/dx = (w^2 - 4x^2)^3*x*32/w^8
					return inBounds(xyz, w_2) ? -pow3(w_s2 - 4.0*pow2(xyz))*xyz*w_32_8 : vec3(0.0);
				}
			`
		} else if (ft === 'powa_b') {
			return `
				uniform float u_a;
				uniform float u_b;

				vec3 f0dxyz(in vec3 xyz, in float w_2) {
					return inBounds(xyz, w_2) ? powV3(1.0 - powV3(abs(xyz)/w_2, u_a), u_b) : vec3(0.0);
				}

				vec3 f1dxyz(in vec3 xyz, in float w_2) {
					// -((a b (x/w)^a (1 - (x/w)^a)^(-1 + b))/x)
					// float temp = pow(1.0/w_2, u_a);
					// return inBounds(xyz, w_2) ? -u_a*u_b*temp*powV3( abs(xyz), u_a-1.0 )*powV3( 1.0 - temp*powV3( abs(xyz), u_a ), u_b - 1.0 ) : vec3(0.0);
					return inBounds(xyz, w_2) ? -u_a*u_b*powV3( abs(xyz), u_a-1.0 )*powV3( pow( w_2, u_a ) - powV3( abs(xyz), u_a ), u_b - 1.0 )/pow( w_2, u_a*u_b ) : vec3(0.0);
				}
			`
		}
	})(funcType)}

	bool func(vec3 v) {
		float w = u_w;
		float w_2 = w/2.;          // w/2
		float w_2_4 = 4.0/pow2(w); // 4.0/w^2
		// float w_16 = 16.0/w;    // 16/w

		int wi = int(ceil(w_2-0.5));       // ceil( w )
		int delta = 2*1+1; // 2*wi+1
		int move = ((1)*delta + 1)*delta + 1;		

		float count[2] = float[2](0. ,0. );

		for (int z = -wi; z <= wi; z++) {
			for (int y = -wi; y <= wi; y++) {
				for (int x = -wi; x <= wi; x++) {
					//int pos = ((z+wi)*delta + y+wi)*delta + x+wi;
					// int pos = ((z*delta + y)*delta + x) + move;

					//count[ pxAround[ pos ] ] += multxyz( f0dxyz( v - ( vec3(0.0) + vec3(ivec3(x,y,z)) ), w ) );

					${(ft=>{
						if (ft === 'pow2_2') {
							return `
								vec3 f0 = f0dxyz( v - vec3(ivec3(x,y,z)), w_2, w_2_4 );
							`
						} else if (ft === 'pow2_4') {
							return `
								vec3 f0 = f0dxyz( v - vec3(ivec3(x,y,z)), w_2, w_2_4 );
							`
						} else if (ft === 'powa_b') {
							return `
								vec3 f0 = f0dxyz( v - vec3(ivec3(x,y,z)), w_2 );
							`
						}
					})(funcType)}

					count[ getPx(x,y,z,delta,move) ] += multxyz( f0 );
				}
			}			
		}
		
		// return count[1] >= u_1modif;
		return count[1]*u_1modif >= count[0]*u_0modif ;
	}

	vec3 gradFunc(vec3 v) {
		float w = u_w;
		float w_2 = w/2.;            // w/2
		float w_2_4 = 4.0/pow2(w);   // 4.0/w^2
		float w_16 = 16.0/w;         // 16/w
		float w_32_8 = 32.0/pow8(w); // 32/w^8
		float w_16_4 = 16.0/pow4(w); // 16/w^4
		float w_s2 = pow2(w);

		int wi = int(ceil(w_2-0.5));              // ceil( w )
		int delta = 2*1+1;
		int move = ((1)*delta + 1)*delta + 1;	

		vec3 count[2] = vec3[2](vec3(0.0),vec3(0.0));

		for (int z = -wi; z <= wi; z++) {
			for (int y = -wi; y <= wi; y++) {
				for (int x = -wi; x <= wi; x++) {
					//int pos = ((z+wi)*delta + y+wi)*delta + x+wi;
					//int pos = ((z*delta + y)*delta + x) + move;

					${(ft=>{
						if (ft === 'pow2_2') {
							return `
								vec3 f0 = f0dxyz( v - vec3(ivec3(x,y,z)), w_2, w_2_4 );
							`
						} else if (ft === 'pow2_4') {
							return `
								vec3 f0 = f0dxyz( v - vec3(ivec3(x,y,z)), w_2, w_2_4 );
							`
						} else if (ft === 'powa_b') {
							return `
								vec3 f0 = f0dxyz( v - vec3(ivec3(x,y,z)), w_2 );
							`
						}
					})(funcType)}

					${(ft=>{
						if (ft === 'pow2_2') {
							return `
								//vec3 f1 = f1dxyz( v - vec3(ivec3(x,y,z)), w_2, w_s2, w_16_4 );
								vec3 f1 = f1dxyz( v - vec3(ivec3(x,y,z)), w_2 );
							`
						} else if (ft === 'pow2_4') {
							return `
								vec3 f1 = f1dxyz( v - vec3(ivec3(x,y,z)), w_2, w_s2, w_32_8 );
							`
						} else if (ft === 'powa_b') {
							return `
								vec3 f1 = f1dxyz( v - vec3(ivec3(x,y,z)), w_2);
							`
						}
					})(funcType)}

					count[ getPx(x,y,z,delta,move) ] += vec3(
						 f1.x*f0.y*f0.z
						,f0.x*f1.y*f0.z
						,f0.x*f0.y*f1.z
					);
					
				}
			}			
		}

		return -(count[1]*u_1modif-count[0]*u_0modif);//count[1];//;
	}
	`

// const box2 = new SurfaceByFunction(
// 	shaderByArr('1,1,1, 1,1,1, 1,1,1,  0,0,0, 0,1,0, 0,0,0,  0,0,0, 0,1,0, 0,0,0')
// 	,camera, new THREE.Vector3(-0.5,-0.5,-0.5), new THREE.Vector3(0.5,0.5,0.5)
// )
// box2.material.uniforms.u_fillType.value = 2
// addBoundingBox(box2)
// box2.position.set(0,0,0)

// const pixels = Uint8Array.of(
// 	0,0,0,0,0,
// 	0,0,0,0,0,
// 	0,0,0,0,0,
// 	0,0,0,0,0,
// 	0,0,0,0,0,

// 	0,0,0,0,0,
// 	0,1,1,1,0,
// 	0,1,1,1,0,
// 	0,1,1,1,0,
// 	0,0,0,0,0,

// 	0,0,0,0,0,
// 	0,0,1,0,0,
// 	0,0,1,1,0,
// 	0,0,0,0,0,
// 	0,0,0,0,0,

// 	0,0,0,0,0,
// 	0,0,0,0,0,
// 	0,0,1,0,0,
// 	0,0,1,0,0,
// 	0,0,0,0,0,

// 	0,0,0,0,0,
// 	0,0,0,0,0,
// 	0,0,0,0,0,
// 	0,0,0,0,0,
// 	0,0,0,0,0,
// )

const pixels = Uint8Array.of(
	0,0,0,0,0,
	0,0,0,0,0,
	0,0,0,0,0,
	0,0,0,0,0,
	0,0,0,0,0,

	0,0,0,0,0,
	0,1,1,1,0,
	0,1,0,1,0,
	0,1,0,0,0,
	0,0,0,0,0,

	0,0,0,0,0,
	0,0,0,0,0,
	0,0,0,1,0,
	0,0,0,0,0,
	0,0,0,0,0,

	0,0,0,0,0,
	0,0,0,0,0,
	0,0,1,1,0,
	0,0,0,0,0,
	0,0,0,0,0,

	0,0,0,0,0,
	0,0,0,0,0,
	0,0,0,0,0,
	0,0,0,0,0,
	0,0,0,0,0,
)


// const tex = gl.createTexture();
// gl.bindTexture(gl.TEXTURE_3D, tex);
// gl.texImage3D(
// 	gl.TEXTURE_3D,                              //gl.TEXTURE_2D,
// 	0,               // mip level
// 	gl.R8UI,         // internal format
// 	5,              // width
// 	5,              // height
// 	5,               // depth
// 	0,               // border
// 	gl.RED_INTEGER,  // source format
//     gl.UNSIGNED_BYTE         	//gl.SHORT,        // source type
// 	pixels                                     //new Int16Array([ 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000 ])
// );
// // can't filter integer textures
// gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
// gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  



// const texture = new THREE.Data3DTexture(pixels, 5, 5, 5, THREE.RedFormat);
// texture.needsUpdate = true;

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

let center;

const funcType = 'pow2_4'

console.time('init objects')

for (let zi = -1; zi <=1; zi++) {
	for (let yi = -1; yi <=1; yi++) {
		for (let xi = -1; xi <=1; xi++) {
			const arr = pxByPos(xi,yi,zi).join(',')

			const mesh = new SurfaceByFunction(
				shaderByArr(arr, funcType)
				,camera, new THREE.Vector3(-0.5,-0.5,-0.5), new THREE.Vector3(0.5,0.5,0.5),
				Object.assign({
						u_w: { value: 2.0 },
						u_0modif: {value: 1 },
						u_1modif: {value: 1 },
						// , u_tex: {value: texture}
					},
					(funcType === 'powa_b'?{
						u_a: {value: 2 },
						u_b: {value: 4 },					
					} : {})
				)
			)
			mesh.material.uniforms.u_fillType.value = 1
			addBoundingBox(mesh)
			// mesh.position.set(3*xi,3*yi,3*zi)

			mesh.setPosByD = function(d) {
				this.dScaleVal = d
				this.position.set(d*xi,d*yi,d*zi)
			}
			mesh.setPosByD(1)


			if (xi == 0 && yi == 0 && zi == 0) {
				center = mesh;
			}

			meshes.push(mesh)
			scene.add(mesh)
		}
	}
}

for (let mesh of meshes) {
	mesh.material.uniforms.u_windowSpaceZnear = { get value() {
		return center.geometry.boundingSphere.center.clone()
				.applyMatrix4( center.modelViewMatrix )
				.applyMatrix4( camera.projectionMatrix )
				.z*0.5+0.5
				-Math.sqrt(3*(1.5)**2)/(camera.far - camera.near) // center.geometry.boundingSphere.radius + 1
	} }

	mesh.material.uniforms.u_windowSpaceZdelta = { value: Math.sqrt(3*(1.5)**2)/(camera.far - camera.near)*2  }

	mesh.material.needsUpdate = true;
}

console.timeEnd('init objects')

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

const axHelper = new THREE.AxesHelper( 15 )
scene.add(axHelper)


console.time('first render when shaders must compile')
renderer.render( scene, camera );
console.timeEnd('first render when shaders must compile')

console.time('second render must be much faster')
renderer.render( scene, camera );
console.timeEnd('second render must be much faster')

function animate() {
	requestAnimationFrame( animate );
	controls.update();

	if ( controls.autoRotate ) {
		const uwMin = 1.01
		const uwMax = 3
		const seconds = Date.now()/1000;
		const periodsPerOneRotate = 2;
		const curentVal = (Math.cos( (seconds*periodsPerOneRotate*2*Math.PI)/(60/controls.autoRotateSpeed) )*0.5+0.5)*(uwMax - uwMin) + uwMin;
		funcParams.load({controllers: {u_w: curentVal}})
	}

	renderer.render( scene, camera );
};
animate();


//gui start ------------------------------------------------------------------------
const gui = new GUI()

gui.add({
	get 'space between'()  { return meshes[0].dScaleVal},
	set 'space between'(v) {meshes.forEach(m=>{ m.setPosByD(v) }) }	
},      'space between',1, 3, 0.01)

const funcParams = gui.addFolder('function paremeters')

funcParams.add({
	get 'u_w'() {return meshes[0].material.uniforms.u_w.value},
	set 'u_w'(v) {      meshes.forEach(m=>{ m.material.uniforms.u_w.value = v }) }	
},      'u_w',1.01, 3, 0.01)

funcParams.add({
	get 'u_Ni'() {return meshes[0].material.uniforms.u_Ni.value},
	set 'u_Ni'(v) {      meshes.forEach(m=>{ m.material.uniforms.u_Ni.value = v }) }	
},      'u_Ni',1, 500, 1)

funcParams.add({
	get 'u_Nj'() {return meshes[0].material.uniforms.u_Nj.value},
	set 'u_Nj'(v) {      meshes.forEach(m=>{ m.material.uniforms.u_Nj.value = v }) }	
},      'u_Nj',1, 20, 1)


const shaderParams = gui.addFolder('shader paremeters')

shaderParams.add({
	get 'u_step'() {return meshes[0].material.uniforms.u_step.value},
	set 'u_step'(v) {      meshes.forEach(m=>{ m.material.uniforms.u_step.value = v }) }	
},      'u_step',1, 100, 0.1)

shaderParams.add({
	get 'u_0modif'() {return meshes[0].material.uniforms.u_0modif.value},
	set 'u_0modif'(v) {      meshes.forEach(m=>{ m.material.uniforms.u_0modif.value = v }) }	
},      'u_0modif',0, 2, 0.001)

shaderParams.add({
	get 'u_1modif'() {return meshes[0].material.uniforms.u_1modif.value},
	set 'u_1modif'(v) {      meshes.forEach(m=>{ m.material.uniforms.u_1modif.value = v }) }	
},      'u_1modif',0, 2, 0.001)

shaderParams.add({
	get 'u_limit'() {return meshes[0].material.uniforms.u_limit.value},
	set 'u_limit'(v) {      meshes.forEach(m=>{ m.material.uniforms.u_limit.value = v }) }	
},      'u_limit',0, 1, 0.001)

if (funcType === 'powa_b') {
	shaderParams.add({
		get 'u_a'()  {     return meshes[0].material.uniforms.u_a.value},
		set 'u_a'(v) {meshes.forEach(m=>{ m.material.uniforms.u_a.value = v }) }	
	},      'u_a',0, 10, 0.001)

	shaderParams.add({
		get 'u_b'()  {     return meshes[0].material.uniforms.u_b.value},
		set 'u_b'(v) {meshes.forEach(m=>{ m.material.uniforms.u_b.value = v }) }	
	},      'u_b',0, 10, 0.001)	
}

shaderParams.add({
	get 'u_fillType'() {return meshes[0].material.uniforms.u_fillType.value},
	set 'u_fillType'(v) {      meshes.forEach(m=>{ m.material.uniforms.u_fillType.value = v }) }	
},      'u_fillType',0, 12, 1)

shaderParams.add({
	get 'u_localZmin'()  {     return meshes[0].material.uniforms.u_localZmin.value        },
	set 'u_localZmin'(v) {meshes.forEach(m=>{ m.material.uniforms.u_localZmin.value = v }) }	
},      'u_localZmin',0, 1, 0.001)

shaderParams.add({
	get 'u_localZmax'()  {     return meshes[0].material.uniforms.u_localZmax.value        },
	set 'u_localZmax'(v) {meshes.forEach(m=>{ m.material.uniforms.u_localZmax.value = v }) }	
},      'u_localZmax',0, 1, 0.001)


const controlsFolder = gui.addFolder('controls')

controlsFolder.add({
	get 'on/off'() {return controls.enabled},
	set 'on/off'(v) {      controls.enabled = v}	
},      'on/off')

controlsFolder.add({
	get 'rotate'() {return controls.enableRotate},
	set 'rotate'(v) {      controls.enableRotate = v}	
},      'rotate')

controlsFolder.add({
	get 'display axes helper'() {return axHelper.visible},
	set 'display axes helper'(v) {      axHelper.visible = v}	
},      'display axes helper')


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