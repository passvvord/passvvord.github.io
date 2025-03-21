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


const perspectiveCamera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 100 );

const camera = new THREE.OrthographicCamera( ...Object.values( getParamsToOrtoGraficCamera(perspectiveCamera,2) ) )
camera.near = -4


// const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.01, 100 );
camera.position.set(0,-2,0)
camera.up.set(0,0,-1)

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );

// renderer.setSize( 1920/2, 1080/2 );

const canvas = document.body.appendChild( renderer.domElement )

const controls = new OrbitControls( camera, renderer.domElement );

const scene = new THREE.Scene();

// let mesh = new THREE.Mesh();
// scene.add(mesh);

// scene.add(
// 	new THREE.AxesHelper( 5 )
// )


function getGeom(R = 1, N = 64) {
	const geometry = new THREE.BufferGeometry()
	geometry.setAttribute('position', new THREE.Float32BufferAttribute( N*3 ,3 ))

	const pos = geometry.attributes.position.array;

	for (let i = 0; i < pos.length; ) {
		const angle = Math.floor(i/3)/N*2*Math.PI;

		pos[i++] = R*Math.cos(angle);
		pos[i++] = R*Math.sin(angle);
		pos[i++] = 0;
	}

	return geometry;
}

const circle = new THREE.LineLoop(
		getGeom(1)
		,new THREE.LineBasicMaterial({color: 0xff_ff_00 })
	)

scene.add( circle )



let controlsArray = [] // need to make only one controls active at the same time
controlsArray.push(controls)

const controlDots = new Array(2).fill().map(_=>new THREE.Object3D())
// controlDots[0].position.set(0,0,0)
// controlDots[1].position.copy(camera.position)


function getEulerRotation(from, to) {
	// from instanceof THREE.Vector3
	// to instanceof THREE.Vector3

	const quat = new THREE.Quaternion().setFromUnitVectors(from.normalize(), to.normalize())
	const euler = new THREE.Euler().setFromQuaternion(quat)
	//console.log(euler.toArray());
	return euler;
}

function transMat(angle, R = 0.5, cdots = controlDots) {
	const flatPos = new THREE.Vector3(
		 R*Math.cos(angle)
		,R*Math.sin(angle)
		,0
	).applyQuaternion(
		new THREE.Quaternion().setFromUnitVectors(
			 new THREE.Vector3(0,0,1)
			,cdots[0].position.clone().sub( cdots[1].position.clone() ).normalize()
		)
	).add(
		cdots[1].position
	);

	// const rotation0 = getEulerRotation(
	// 	new THREE.Vector3(0,0,1)
	// 	,cdots[0].position.clone().sub( cdots[1].position.clone() )
	// )

	return new THREE.Matrix4().compose(
		 flatPos
		,new THREE.Quaternion().setFromUnitVectors(
			 new THREE.Vector3(0,0,-1)
			,cdots[0].position.clone().sub(flatPos.clone()).normalize()
		)
		,new THREE.Vector3(1,1,1)
	)
}

for ( mesh of controlDots ) {

	mesh.transformControls = new TransformControls( camera, renderer.domElement )
	controlsArray.push(mesh.transformControls)

	mesh.transformControls.addEventListener( 'dragging-changed', event=>{
		controlsArray.forEach(control=>{
			if (control != event.target) {
				control.enabled = !event.value;
			}
		})
	});

	mesh.transformControls.addEventListener('change', _=>{
		// console.log('chenge evt')

		circle.rotation.copy( getEulerRotation(
			 new THREE.Vector3(0,0,1)
			,controlDots[0].position.clone().sub( controlDots[1].position.clone() )
		) )

		circle.position.copy( controlDots[1].position )

	})

	// mesh.transformControls.addEventListener('mouseUp', _=>{
	// 	line3DbyBoxes(boxedLine ,dots[1].position, dots[0].position)
	// })

	mesh.transformControls.attach( mesh )
	mesh.transformControlsHelper = mesh.transformControls.getHelper()

	const box = new THREE.Mesh(
		 new THREE.BoxGeometry(1, 1, 1)
		,new THREE.MeshBasicMaterial({color: 0xff_00_ff})
	)
	addBoundingBox( box )

	mesh.add( box )
	scene.add( mesh , mesh.transformControlsHelper)
}


const box1 = new THREE.Mesh(
	 new THREE.BoxGeometry(0.05, 0.05, 0.05)
	,new THREE.MeshBasicMaterial({color: 0xff_00_00})
)
addBoundingBox( box1 )
box1.add(
	new THREE.AxesHelper( 0.2, 0.2, 0.2 )
)

scene.add(box1)

// box1.visible = false




let timePerOneLoop = 10; // seconds 
let radius = 0.2;

let CameraInLoop = false;
let hideInteractive = false;



function startStopLoop() {
	CameraInLoop = !CameraInLoop;
	hidden = !CameraInLoop;

	box1.visible = hidden;

	controlDots[1].visible = hidden;

	controlDots[0].transformControls.enabled = hidden;
	controlDots[1].transformControls.enabled = hidden;

	controlDots[0].transformControlsHelper.visible = hidden;
	controlDots[1].transformControlsHelper.visible = hidden;

	circle.visible = hidden;

	//controlsArray.forEach(control=>{ control.enabled = hidden; })
	//controls.enabled = true;

	camera.updateProjectionMatrix()
}

canvas.addEventListener('dblclick', (event) => { startStopLoop() })

function hideShowCube() {
	controlDots[0].visible = !controlDots[0].visible
}

function animate() {
	requestAnimationFrame( animate );
	controls.update();


	// box1.matrix.copy( transMat( Date.now()/1000/timePerOneLoop*2*Math.PI ) )

	// mat.decompose(
	// 	 box1.position
	// 	,box1.quaternion
	// 	,box1.scale
	// )

	// mat.decompose(
	// 	 camera.position
	// 	,camera.quaternion
	// 	,camera.scale
	// )
	const mat = transMat( Date.now()/1000/timePerOneLoop*2*Math.PI, radius )

	if ( CameraInLoop === true ) {
		camera.position.setFromMatrixPosition(mat)
		camera.lookAt(controlDots[0].position)		
	} else {
		box1.position.setFromMatrixPosition(mat)
		box1.lookAt(controlDots[0].position)			
	}



	renderer.render( scene, camera );
};

const basePath = '../../dicomData/DATA1/' 
const testDataPath = {
	'Uint16 3D': 'BODYAKA_D_YU.dcm',
	'Uint16 3D _1': 'GAVRYUK_N_I.dcm',
	'Uint16 3D _2': 'LEBEDINETS_V_D.dcm',
	//'Uint16 3D _3': 'TARANUSHENKO_E_V.dcm',
	'Uint16 3D big': 'ANISHCHENKO_O_V.dcm',
	'Uint16 3D big _2': 'KOZELETSKIY_A_I.dcm',
	'Int16 2D': '02/IMG00115.DCM',
}

const wiewPos = {
	'Uint16 3D': [[-0.01839603169031942,-0.2855575519410848,0.1977631555469378], [0.055872342221624835,-0.9224803119466042,0.08333938804922345]],
	'Uint16 3D _1': 'GAVRYUK_N_I.dcm',
	'Uint16 3D _2': [[-0.0535733589076286, -0.1099743518290068, -0.10020389621876555], [0.5535387540750832, 0.23549158179538043, -0.24131443549542497]],
	'Uint16 3D big': 'ANISHCHENKO_O_V.dcm',
	'Int16 2D': '02/IMG00115.DCM',
}



let currentData;

if (/localhost:|[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}:/.test(window.location.origin)) {
	currentData = (
			basePath + testDataPath['Uint16 3D']
			// basePath + testDataPath['Uint16 3D big']
			// basePath + testDataPath['Uint16 3D big _2']
			// basePath + testDataPath['Uint16 3D _1']
			// basePath + testDataPath['Uint16 3D _2']
			//// basePath + testDataPath['Uint16 3D _3']
			// basePath + testDataPath['Int16 2D']

			// '../../dicomData/DATA2/HAIDA_A_YE/images/HAIDA_A_YE.dcm'
	)	
} else {
	currentData = '../test_12/testData/%D1%84%D1%80%D0%B0%D0%B3%D0%BC%D0%B5%D0%BD%D1%82%20%D1%89%D0%B5%D0%BB%D0%B5%D0%BF%D0%B8.dcm'
}





// if ( window.location.search?.length > 1 ) {
// 	const url =  window.location.search.slice(1)
// 	console.log('found url for data: ', url)
// 	currentData = url
// }





const presetList = [
	'preset0.json'
].map(urlpart=>'./presets/'+urlpart)

let precalcFilter = true;
let preset = false;

const autoloader = new AsyncIf(
	 'presetLoaded'
	// ,'guiReady'
	,'readyToUsePreset'
).addEvent(()=>{
	gui.load(preset)
})


if ( window.location.search?.length > 1 ) {
	const url = new URLSearchParams(window.location.search) //window.location.search.slice(1)

	precalcFilter = url.has('nf') ? false : precalcFilter;

	//preset = url.has('p') ? parseInt(url.get('p'))

	if ( url.has('p') ) {
		try {
			const presetUrl = presetList[parseInt(url.get('p'))]
			console.log('found url for preset: ', presetUrl)
			// 

			fetch(presetUrl)
				.then(r=>r.text())
				.then(t=>{
					preset = JSON.parse(t)
					autoloader.presetLoaded = true;
				})

		} catch (err) {
			const errMsg = 'wrong preset url number in search params\n'+err
			console.error(errMsg)
			alert(errMsg)
		}		
	} else {
		console.log('no preset, using default preset')
		fetch('./presets/default.json')
			.then(r=>r.text())
			.then(t=>{
				preset = JSON.parse(t)
				autoloader.presetLoaded = true;
			})		
	}

	// console.log('found url for data: ', url)
	// currentData = url
}




const dicom = DICOM = new DicomData();

console.time('full auto load time')
DICOM
	.fetchByUrl(
		currentData
	)
	.then(dicom=>{
		console.timeEnd('full auto load time')
		console.log('fetched', dicom)
		console.log(dicom.GLSLfuncRescaleRealToRaw)

		window.mesh = new VoxelObject(
			 dicom.GLSLfuncRescaleRealToRaw
			,dicom.get3DTHREEtexture()
			,dicom.rescaleRealToRaw(1000)//dicom.rawMin
			,dicom.rescaleRealToRaw(3000)//dicom.rawMax
			,dicom.rawMin
			,dicom.rawMax
			,camera
		);
		scene.add(mesh)
		
		if (precalcFilter) {
			dicom.calc3DIsotropicMagnituge16bit()

			window.mesh1 = new VoxelObject(
				`
					int readPxAsRawInt(vec4 pxVal) { return int(pxVal.g*255.)*256 + int(pxVal.r*255.); }
					int RescaleRealToRaw(float realVal) { return int( realVal ); }
				`
				,dicom.isotropicTex
				,0
				,2**16-1
				,dicom.isotropicMin
				,dicom.isotropicMax
				,camera
			);
			scene.add(mesh1);		
		}
		// else {
		// 	window.mesh1 = new THREE.Mesh(
		// 		 new THREE.BoxGeometry(1,1,1)
		// 		,new THREE.MeshBasicMaterial({color: 0xff_00_00})
		// 	)
		// }

		
		initGui()
		initMinMaxHU(dicom.realMin, dicom.realMax)
		if (precalcFilter) {
			initMinMaxFilter(dicom.isotropicMin, dicom.isotropicMax)
		}

		

		//addBoundingBox( mesh )

		//mesh.applyMatrix4(  new THREE.Matrix4().makeScale( ...new THREE.Vector3(-1,-1,1) ) )

		// mesh.material.uniforms.u_scaleVec.value.set(-1,-1,1)
		// mesh.material.uniforms.u_scaleMat.value.set(-1,-1,1)

		// const scaleM = new THREE.Matrix4(
		// 	-1, 0, 0, 1,
		// 	 0,-1, 0, 1,
		// 	 0, 0, 1, 0,
		// 	 0, 0, 0, 1
		// )

		// mesh.geometry.attributes.position01.applyMatrix4(scaleM)

		for (let i = 0; i < controlDots.length; i++) {
			controlDots[i].children[0].applyMatrix4(
				new THREE.Matrix4().makeScale( ...new THREE.Vector3(1,1,1).divide(dicom.sizemm) )
			)

			controlDots[i].position.set(...wiewPos['Uint16 3D _2'][i])
			controlDots[i].transformControls.dispatchEvent({ type: 'change' })
		}

		animate();
	})

// function openAnotherDicom(argument) {
// 	// body... 
// }

//gui start ------------------------------------------------------------------------
const gui = new GUI()

const meshesFolder = gui.addFolder('meshes')
const normalisationFolder = gui.addFolder('historgam normalisation')
const cutFolder = gui.addFolder('cut')

const filterFolder = gui.addFolder('edges detection')
let initMinMaxFilter;

const animationFolder = gui.addFolder('animation params')
const controlsFolder = gui.addFolder('controls')

controlsFolder.add({
	get 'on/off'() {return controls.enabled},
	set 'on/off'(v) {      controls.enabled = v}	
},      'on/off')

controlsFolder.add({
	get 'auto rotate'() {return controls.autoRotate},
	set 'auto rotate'(v) {      controls.autoRotate = v}
},      'auto rotate')

controlsFolder.add({
	get 'rotate speed'() {return controls.autoRotateSpeed},
	set 'rotate speed'(v) {      controls.autoRotateSpeed = v}
},      'rotate speed').min(1).max(30).step(0.1)

const cutBoxHelper = new THREE.Box3Helper( new THREE.Box3(
	// ,
	// mesh.material.uniforms.u_cutMax.value
), 0xff_00_00 )

// cutBoxHelper.add ( new THREE.AxesHelper( 0.5, 0.5, 0.5 ) )

scene.add( cutBoxHelper )

function initGui() {

	meshesFolder.add({
		get 'dicom'() {return mesh.visible},
		set 'dicom'(v) {      mesh.visible = v}	
	},      'dicom')

	if (precalcFilter) {
		meshesFolder.add({
			get 'filter'() {return mesh1.visible},
			set 'filter'(v) {      mesh1.visible = v}	
		},      'filter')
	}


	//cutBoxHelper.box.min = 

	Object.defineProperty(cutBoxHelper.box, 'min', {get() {
		return mesh.material.uniforms.u_cutMin.value.clone().subScalar(0.5)
	}})

	Object.defineProperty(cutBoxHelper.box, 'max', {get() {
		return mesh.material.uniforms.u_cutMax.value.clone().subScalar(0.5)
	}})

	// cutBoxHelper.box.max = mesh.material.uniforms.u_cutMax.value

	cutFolder.add({
		get 'enable cut'() {return mesh.material.uniforms.u_enableCut.value},
		set 'enable cut'(v) {
			mesh.material.uniforms.u_enableCut.value = v
			try { mesh1.material.uniforms.u_enableCut.value = v } catch {}
		}	
	},      'enable cut')

	cutFolder.add({
		get 'show cut box'() {return cutBoxHelper.visible},
		set 'show cut box'(v) {      cutBoxHelper.visible = v}	
	},      'show cut box')

	let cutVectorsControllers = []

	for (let ax of 'xyz') {
		for (let vec of ['u_cutMin', 'u_cutMax']) {
			const name = `cut ${vec.slice(5).toLowerCase()} ${ax}`;
			const obj = Object.defineProperty({}, name, {
				get( ) { return mesh.material.uniforms[vec].value[ax] },
				set(v) {        mesh.material.uniforms[vec].value[ax] = v
					     try { mesh1.material.uniforms[vec].value[ax] = v } catch {}
				}
			})
			cutVectorsControllers.push(
				cutFolder.add(obj, name, 0, 1, 1/1024)
			)	
		}
	}

	cutFolder.add({
		'selected tooth'() {
			mesh.material.uniforms.u_cutMin.value.set(0.3117, 0.1519, 0.4838)
			mesh.material.uniforms.u_cutMax.value.set(0.4827, 0.4961, 0.9140)
			try {
				mesh1.material.uniforms.u_cutMin.value.set(0.3117, 0.1519, 0.4838)
				mesh1.material.uniforms.u_cutMax.value.set(0.4827, 0.4961, 0.9140)				
			} catch {}
			cutVectorsControllers.forEach(controller=>{
				controller.updateDisplay()
			})			
		}
	},  'selected tooth')

	cutFolder.add({
		'reset'() {
			mesh.material.uniforms.u_cutMin.value.set(0,0,0)
			mesh.material.uniforms.u_cutMax.value.set(1,1,1)
			mesh1.material.uniforms.u_cutMin.value.set(0,0,0)
			mesh1.material.uniforms.u_cutMax.value.set(1,1,1)
			cutVectorsControllers.forEach(controller=>{
				controller.updateDisplay()
			})	
		}
	},  'reset')

	controlsFolder.add({
		'target to center of cuted'() {
			controls.target.copy(
				new THREE.Vector3().addVectors( cutBoxHelper.box.min, cutBoxHelper.box.max ).divideScalar(2)
			)		
		}
	},  'target to center of cuted')






	// normalisationFolder.add({
	// 	get 'peak_min color'() {return  },
	// 	set 'peak_min color'(v) {       }	
	// },      'peak_min color')

	// normalisationFolder.add({
	// 	get 'peak_max color'() {return  },
	// 	set 'peak_max color'(v) {       }	
	// },      'peak_max color')

	for (let name of [['min', 'u_blackColor'], ['max', 'u_whiteColor']]) {
		const obj = Object.defineProperty({
			colorObject: {
				set r(v) {        mesh.material.uniforms[name[1]].value.x = v },
				set g(v) {        mesh.material.uniforms[name[1]].value.y = v },
				set b(v) {        mesh.material.uniforms[name[1]].value.z = v },
				get r()  { return mesh.material.uniforms[name[1]].value.x     },
				get g()  { return mesh.material.uniforms[name[1]].value.y     },
				get b()  { return mesh.material.uniforms[name[1]].value.z     },
			}
		}, name[0]+' color', {
			get() { return this.colorObject }
		})
		normalisationFolder.addColor(obj, name[0]+' color')

		normalisationFolder.add(Object.defineProperty({}, name[0]+' alpha', {
			get() {return mesh.material.uniforms[name[1]].value.w },
			set(v) {      mesh.material.uniforms[name[1]].value.w = v}	
		}), name[0]+' alpha' ,0,1,0.0001)		
	}

	normalisationFolder.add({
		get 'return first'() {return mesh.material.uniforms.u_returnFirstInBounds.value },
		set 'return first'(v) {      mesh.material.uniforms.u_returnFirstInBounds.value = v }	
	},      'return first')

	const guiWinMin = normalisationFolder.add({
		get 'window min (HU)'() {return dicom.rescaleRawToReal(mesh.material.uniforms.u_blackColRawVal.value) },
		set 'window min (HU)'(v) {                             mesh.material.uniforms.u_blackColRawVal.value = dicom.rescaleRealToRaw(v) }	
	},      'window min (HU)')

	const guiWinMax = normalisationFolder.add({
		get 'window max (HU)'() {return dicom.rescaleRawToReal(mesh.material.uniforms.u_whiteColRawVal.value) },
		set 'window max (HU)'(v) {                             mesh.material.uniforms.u_whiteColRawVal.value = dicom.rescaleRealToRaw(v) }	
	},      'window max (HU)')

	const guiCutMin = normalisationFolder.add({
		get 'cut min (HU)'() {return dicom.rescaleRawToReal(mesh.material.uniforms.u_minCutRawVal.value) },
		set 'cut min (HU)'(v) {                             mesh.material.uniforms.u_minCutRawVal.value = dicom.rescaleRealToRaw(v) }	
	},      'cut min (HU)')

	const guiCutMax = normalisationFolder.add({
		get 'cut max (HU)'() {return dicom.rescaleRawToReal(mesh.material.uniforms.u_maxCutRawVal.value) },
		set 'cut max (HU)'(v) {                             mesh.material.uniforms.u_maxCutRawVal.value = dicom.rescaleRealToRaw(v) }	
	},      'cut max (HU)')

	// u_minCutRawVal
	// u_maxCutRawVal

	window.initMinMaxHU = function (realMin, realMax) {
		for (let guiPart of [guiWinMin, guiWinMax, guiCutMin, guiCutMax]) {
			guiPart.min(realMin).max(realMax).step(1).updateDisplay()
		}
		// guiWinMin
		// guiWinMax.min(realMin).max(realMax).step(1).updateDisplay()
	}


	// for (let name of ['u_blackColor', 'u_whiteColor']) {
	// 	filterFolder.addColor({
	// 		colorObject: {
	// 			set r(v) {        mesh1.material.uniforms[name].value.x = v },
	// 			set g(v) {        mesh1.material.uniforms[name].value.y = v },
	// 			set b(v) {        mesh1.material.uniforms[name].value.z = v },
	// 			get r()  { return mesh1.material.uniforms[name].value.x     },
	// 			get g()  { return mesh1.material.uniforms[name].value.y     },
	// 			get b()  { return mesh1.material.uniforms[name].value.z     },
	// 		},
	// 		get 'min color'() {
	// 			return this.colorObject
	// 		}
	// 	},      'min color')

	// 	filterFolder.add({
	// 		get 'min alpha'() {return mesh1.material.uniforms[name].value.w },
	// 		set 'min alpha'(v) {      mesh1.material.uniforms[name].value.w = v}	
	// 	},      'min alpha',0,1,0.0001)		
	// }

	if (precalcFilter) {

		for (let name of [['min', 'u_blackColor'], ['max', 'u_whiteColor']]) {
			const obj = Object.defineProperty({
				colorObject: {
					set r(v) {        mesh1.material.uniforms[name[1]].value.x = v },
					set g(v) {        mesh1.material.uniforms[name[1]].value.y = v },
					set b(v) {        mesh1.material.uniforms[name[1]].value.z = v },
					get r()  { return mesh1.material.uniforms[name[1]].value.x     },
					get g()  { return mesh1.material.uniforms[name[1]].value.y     },
					get b()  { return mesh1.material.uniforms[name[1]].value.z     },
				}
			}, name[0]+' color', {
				get() { return this.colorObject }
			})
			filterFolder.addColor(obj, name[0]+' color')

			filterFolder.add(Object.defineProperty({}, name[0]+' alpha', {
				get() {return mesh1.material.uniforms[name[1]].value.w },
				set(v) {      mesh1.material.uniforms[name[1]].value.w = v}	
			}), name[0]+' alpha' ,0,1,0.0001)		
		}

		filterFolder.add({
			get 'return first'() {return mesh1.material.uniforms.u_returnFirstInBounds.value },
			set 'return first'(v) {      mesh1.material.uniforms.u_returnFirstInBounds.value = v }	
		},      'return first')

		const guiFilterWinMin = filterFolder.add({
			get 'window min'() {return mesh1.material.uniforms.u_blackColRawVal.value },
			set 'window min'(v) {      mesh1.material.uniforms.u_blackColRawVal.value = v }	
		},      'window min')

		const guiFilterWinMax = filterFolder.add({
			get 'window max'() {return mesh1.material.uniforms.u_whiteColRawVal.value },
			set 'window max'(v) {      mesh1.material.uniforms.u_whiteColRawVal.value = v }	
		},      'window max')

		const guiFilterCutMin = filterFolder.add({
			get 'cut min'() {return mesh1.material.uniforms.u_minCutRawVal.value },
			set 'cut min'(v) {      mesh1.material.uniforms.u_minCutRawVal.value = v }	
		},      'cut min')

		const guiFilterCutMax = filterFolder.add({
			get 'cut max'() {return mesh1.material.uniforms.u_maxCutRawVal.value },
			set 'cut max'(v) {      mesh1.material.uniforms.u_maxCutRawVal.value = v }	
		},      'cut max')

		initMinMaxFilter = function (min, max) {
			for (let guiPart of [guiFilterWinMin, guiFilterWinMax, guiFilterCutMin, guiFilterCutMax]) {
				guiPart.min(min).max(max).step(1).updateDisplay()
			}
		}

	}
	


	animationFolder.add({
		get 'radius'() {return radius},
		set 'radius'(v) {
			radius = v;
			circle.scale.x = circle.scale.y = v;
		}	
	},      'radius').min(0).max(1).step(0.0001)

	animationFolder.add({
		get 'duration (s)'() {return timePerOneLoop},
		set 'duration (s)'(v) {      timePerOneLoop = v}	
	},      'duration (s)').min(0.01).max(25).step(0.01)

	animationFolder.add({
		'start/stop anim'() { startStopLoop() }
	},  'start/stop anim')


	box1.visible

	animationFolder.add({
		get 'hide interactive'() {return box1.visible},
		set 'hide interactive'(v) {
			box1.visible = v
			circle.visible = v;

			controlDots[0].visible = v;
			controlDots[1].visible = v;

			controlDots[0].transformControls.enabled = v;
			controlDots[1].transformControls.enabled = v;

			controlDots[0].transformControlsHelper.visible = v;
			controlDots[1].transformControlsHelper.visible = v;
		}	
	},      'hide interactive')

	animationFolder.add({
		get 'hide 1x1x1mm box'() {return controlDots[0].visible},
		set 'hide 1x1x1mm box'(v) {	controlDots[0].visible = v }	
	},      'hide 1x1x1mm box')





// controlsFolder.add({
// 	get 'display axes helper'() {return axHelper.visible},
// 	set 'display axes helper'(v) {      axHelper.visible = v}	
// },      'display axes helper')

	// console.log( JSON.stringify( gui.save(), '', '\t' ).replaceAll(`"`, `'`) )

/*
gui.load(

{
	'controllers': {},
	'folders': {
		'meshes': {
			'controllers': {
				'dicom': true,
				'filter': true
			},
			'folders': {}
		},
		'historgam normalisation': {
			'controllers': {
				'min color': '#070024',
				'min alpha': 0,
				'max color': '#ffffff',
				'max alpha': 1,
				'return first': false,
				'window min (HU)': 1264,
				'window max (HU)': 3000,
				'cut min (HU)': -1000,
				'cut max (HU)': 4143
			},
			'folders': {}
		},
		'cut': {
			'controllers': {
				'enable cut': true,
				'show cut box': true,
				'cut min x': 0.2314453125,
				'cut max x': 0.7412109375,
				'cut min y': 0.1328125,
				'cut max y': 0.5078125,
				'cut min z': 0.49609375,
				'cut max z': 0.9306640625
			},
			'folders': {}
		},
		'edges detection': {
			'controllers': {
				'min color': '#fbff00',
				'min alpha': 0,
				'max color': '#ff0000',
				'max alpha': 1,
				'return first': false,
				'window min': 40000,
				'window max': 54935,
				'cut min': 44644,
				'cut max': 59474
			},
			'folders': {}
		},
		'animation params': {
			'controllers': {
				'radius': 0.2,
				'duration (s)': 10,
				'hide interactive': false,
				'hide 1x1x1mm box': false
			},
			'folders': {}
		},
		'controls': {
			'controllers': {
				'on/off': true,
				'auto rotate': true
			},
			'folders': {}
		}
	}
}

// {
// 	'controllers': {},
// 	'folders': {
// 		'meshes': {
// 			'controllers': {
// 				'dicom': true,
// 				'filter': true
// 			},
// 			'folders': {}
// 		},
// 		'historgam normalisation': {
// 			'controllers': {
// 				'min color': '#070024',
// 				'min alpha': 0,
// 				'max color': '#ffffff',
// 				'max alpha': 1,
// 				'window min (HU)': 1133,
// 				'window max (HU)': 3000,
// 				'cut min (HU)': -1000,
// 				'cut max (HU)': 4143
// 			},
// 			'folders': {}
// 		},
// 		'cut': {
// 			'controllers': {
// 				'enable cut': true,
// 				'show cut box': true,
// 				'cut min x': 0.2314453125,
// 				'cut max x': 0.7412109375,
// 				'cut min y': 0.1328125,
// 				'cut max y': 0.5078125,
// 				'cut min z': 0.49609375,
// 				'cut max z': 0.9306640625
// 			},
// 			'folders': {}
// 		},
// 		'edges detection': {
// 			'controllers': {
// 				'min color': '#fbff00',
// 				'min alpha': 0,
// 				'max color': '#ff0000',
// 				'max alpha': 1,
// 				'window min': 36813,
// 				'window max': 65535,
// 				'cut min': 45585,
// 				'cut max': 59474
// 			},
// 			'folders': {}
// 		},
// 		'animation params': {
// 			'controllers': {
// 				'radius': 0.2,
// 				'duration (s)': 10,
// 				'hide interactive': false,
// 				'hide 1x1x1mm box': false
// 			},
// 			'folders': {}
// 		},
// 		'controls': {
// 			'controllers': {
// 				'on/off': true,
// 				'auto rotate': false
// 			},
// 			'folders': {}
// 		}
// 	}
// }

)
*/

autoloader.readyToUsePreset = true


}

// let mus = mesh.material.uniforms;








// guiHelpers.attachUniformValueToProps(gui, 'surfaseEqual', box.material.uniforms.u_val, [0, 1, 0.0001])
// const planeFolder = gui.addFolder('plane to check gl_FragCoord.z')

// guiHelpers.addVisibilityChangerToGui(planeFolder, 'show plane', plane)


// gui end ------------------------------------------------------------------------




