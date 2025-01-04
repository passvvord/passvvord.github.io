// autoupdate self positions each time anything try to read position
function getLine(from,to,color=0xff_00_00) {

	const lineGeometry = new THREE.BufferGeometry();
	lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute( 6, 3 ) );
	Object.defineProperty(lineGeometry.attributes.position, 'array', {
		get() {
			const delta = new THREE.Vector3().subVectors(to, from).normalize().multiplyScalar(10)
			return Float32Array.of(
				 ...from.clone().sub( delta )
				,...to  .clone().add( delta )
			)
		}
	})

	return new THREE.Line(lineGeometry, new THREE.LineBasicMaterial( { color: color } ) )
}

function getLineGrid(steps = new THREE.Vector3(10,10,10), min = new THREE.Vector3(0,0,0), max = new THREE.Vector3(1,1,1), colors = [0xff_00_00, 0x00_ff_00, 0x00_00_ff]) {
	const group = new THREE.Object3D()

	const xlines = new THREE.BufferGeometry();
	xlines.setAttribute('position', new THREE.Float32BufferAttribute( steps.z*steps.y*3, 3 ) );

	

	for (let xyz = 0; xyz < 3; xyz++) {
		const thisSteps = steps.clone()
		thisSteps[ 'xyz'[xyz] ] = 1;

		const stepVal = new THREE.Vector3().subVectors(max,min).divide(thisSteps)

		thisSteps.addScalar(1) //.round()

		const linesGeom = new THREE.BufferGeometry();
		linesGeom.setAttribute('position', new THREE.Float32BufferAttribute( (thisSteps.x+1)*(thisSteps.y+1)*(thisSteps.z+1)*3, 3 ) );

		const posArr = linesGeom.attributes.position.array
		const imax = 'xyz'[(xyz+2)%3]
		const jmax = 'xyz'[(xyz+1)%3]
		const kmax = 'xyz'[ xyz     ]
		let pos = 0;
		for (let i = 0; i < thisSteps[imax]; i++) {

			const ival = i*stepVal[imax] + min[imax]
			for (let j = 0; j < thisSteps[jmax]; j++) {

				const jval = j*stepVal[jmax] + min[jmax]
				for (let k = 0; k < thisSteps[kmax]; k++) {
					// const pos = ((i*thisSteps[jmax] + j)*thisSteps[kmax] + k)*3
					const kval = k*stepVal[kmax] + min[kmax]

					posArr[pos +  xyz     ] = kval
					posArr[pos + (xyz+1)%3] = jval
					posArr[pos + (xyz+2)%3] = ival

					pos+=3
				}	
			}
		}
		// linesGeom.attributes.position.needsUpdate = true


		group.add(new THREE.LineSegments(
			 linesGeom
			,new THREE.LineBasicMaterial( { color: colors[xyz] } )
		))
	}


	return group
}


function simplifyedLineFuncYbyX(ax,ay,bx,by) {
	const tg = (by-ay)/(bx-ax)
	const move = ay-ax*tg

	switch (Math.sign(move)) {
		case -1: return eval(`a=>${tg}*a${move}`)
		case  0: return eval(`a=>${tg}*a`)
		case  1: return eval(`a=>${tg}*a+${move}`)
		default: console.error('error'); break;
	}
}


// generates a lot of objects and polygons, recomended only for testing something
function line3DbyBoxes(
	 object3d
	,from
	,to
	,stepCount = new THREE.Vector3(20,20,20)
	// ,min = new THREE.Vector3(0,0,0)
	// ,max = new THREE.Vector3(1,1,1)
	,color = 0xff_ff_00
) {	
	

	if (object3d.children.length > 0) {
		object3d.children.forEach(mesh=>{
			mesh.geometry.dispose()
			mesh.material.dispose()

			delete mesh
		})
	}

	object3d.clear()

	const group = object3d//new THREE.Object3D()

	const maxComponentI = [...new THREE.Vector3().subVectors(to, from).multiply(stepCount)].reduce((ac,a,i,A)=>Math.abs(a)>Math.abs(A[ac])?i:ac,0) //'xyz'[maxComponentI]

	const c0 =  maxComponentI;
	const c1 = (maxComponentI+1)%3;
	const c2 = (maxComponentI+2)%3;

	const c0l = 'xyz'[c0];
	const c1l = 'xyz'[c1];
	const c2l = 'xyz'[c2];

	const c1byc0 = simplifyedLineFuncYbyX(from[c0l],from[c1l],to[c0l],to[c1l])
	const c2byc0 = simplifyedLineFuncYbyX(from[c0l],from[c2l],to[c0l],to[c2l])
		

	console.log( `${c0l}: ${c1l} ${c2l}` )
	// console.log(`${c1l} = f1(${c0l}) = f1(a) =`,c1byc0)
	// console.log(`${c2l} = f2(${c0l}) = f2(a) =`,c2byc0)



	// let c0v = 1
	
	

	function addBox(pos,size,color) {
		// const box = new THREE.Mesh(
		// 	 new THREE.BoxGeometry(...size)
		// 	,new THREE.MeshBasicMaterial({color: 0x00_00_00})
		// )
		// box.position.set(...size.clone().multiplyScalar(0.5).add(pos))

		// box.geometry.computeBoundingBox()
		// box.add( new THREE.Box3Helper( box.geometry.boundingBox, 0x20_20_20 ) )

		// box.position.set(...pos)
		// group.add(box)

		// console.log(pos, pos.clone().add(size))

		const box = new THREE.Box3Helper( new THREE.Box3(
			 pos.clone()//size.clone().multiplyScalar(-0.5).add(pos)
			,pos.clone().add(size)//size.clone().multiplyScalar(0.5).add(pos)
		), color )

		group.add(box)
	}
	
	const step = new THREE.Vector3(1,1,1).divide(stepCount)

	const fromC0 = Math.floor(from[c0l]*stepCount[c0l])
	const toC0 = Math.floor(to[c0l]*stepCount[c0l])
	const directionC0 = Math.sign(to[c0l] - from[c0l])

	console.log( `${c0l}: ${c1l} ${c2l}`, directionC0)
	
	// const oldpos = new THREE.Vector3()
	const pos = new THREE.Vector3()

	pos[c0l] = fromC0/stepCount[c0l]
	pos[c1l] = Math.floor( c1byc0( pos[c0l] )*stepCount[c1l] )/stepCount[c1l]
	pos[c2l] = Math.floor( c2byc0( pos[c0l] )*stepCount[c2l] )/stepCount[c2l]

	addBox(pos, step, 0xff_ff_ff)

	// console.log(fromC0, directionC0, (toC0-fromC0)*directionC0, directionC0)
	for (let i = fromC0+directionC0; i*directionC0 <= toC0*directionC0; i+=directionC0 ) {

		// pos[c0l] = 


		const newPosC0l = i/stepCount[c0l]

		const newPosC1lraw = c1byc0( newPosC0l )*stepCount[c1l]
		const newPosC1l_ = Math.floor( newPosC1lraw )/stepCount[c1l]

		const newPosC2lraw = c2byc0( newPosC0l )*stepCount[c2l]
		const newPosC2l_ = Math.floor( newPosC2lraw )/stepCount[c2l]

		if ( newPosC1lraw - newPosC1l > 0) {
			if (newPosC2lraw - newPosC2l > 0) {

			} else {
				
			}
		} else {
			if (newPosC2lraw - newPosC2l > 0) {

			} else {
				
			}
		}


		// if (directionC0 == 1) {
		// 	if (pos[c1l] != newPosC1l) {
		// 		pos[c1l] = newPosC1l
		// 		addBox(pos, step, 0x00_ff_00)
		// 	} 
		// 	if (pos[c2l] != newPosC2l) {
		// 		pos[c2l] = newPosC2l
		// 		addBox(pos, step, 0x00_00_ff)
		// 	}

		// } else {
		// 	if (pos[c1l] != newPosC1l) {
		// 		pos[c0l] = newPosC0l
		// 		addBox(pos, step, 0xff_00_ff)
		// 	}
		// 	if (pos[c2l] != newPosC2l) {
		// 		pos[c1l] = newPosC1l
		// 		addBox(pos, step, 0xff_ff_00)
		// 	}
		// }


		pos[c0l] = newPosC0l
		pos[c1l] = newPosC1l
		pos[c2l] = newPosC2l

		addBox(pos, step, 0x60_60_60)
		// console.log(...pos)
	}


	return group



}


const testPreset = [
	{
		 camera: [0.9958310061721231, -0.005798770592238078, 0.0910328589347583, 0.7622718576462858, 0, 0.9979773241781934, 0.06357090864643096, 0.5599102106352195, -0.09121736208758181, -0.06330588192065145, 0.9938167628733334, 2.9033758195221013, 0, 0, 0, 1]
		,targetDistance: 1.0266841665589708
		,dots: [[0.9986940151234525, 0.7384064613193234, 1.579303298927157], [0.46497686766975826, 0.3099763289744724, 2.114240314703029]]
	},{
		"camera":[0.09608929579729364,0.36321955631598424,-0.926735345793393,-0.20394686270292528,5.551115123125783e-17,0.9310435470764238,0.3649080890407211,1.3877604675210282,0.9953727177460614,-0.03506376130665908,0.08946331879518797,2.1009258174530814,0,0,0,1],
		"targetDistance":1.3268408625780752,
		"dots":[[1.1585300400749519,1.1071454294897785,2.3832147135150943],[0.6332081069984112,0.7239721691123184,1.1839470949713076]]
	}
]

function useTestPreset(i,presets = testPreset) {
	const matrix = new THREE.Matrix4(...testPreset[i].camera)
	matrix.decompose( camera.position, camera.quaternion, camera.scale )
	controls.target = new THREE.Vector3(0,0,-testPreset[i].targetDistance).applyMatrix4(matrix)	
	dots[0].position.set(...testPreset[i].dots[0])
	dots[1].position.set(...testPreset[i].dots[1])
}

function getCurentPreset() {
	return {
		 camera: camera.matrix.clone().transpose().elements
		,targetDistance: camera.position.distanceTo( controls.target )
		,dots: dots.map(a=>[...a.position])
	}
}
//console.log( JSON.stringify(getCurentPreset()).replaceAll(/(?<=(?:\{|,))(?=")|(?=})/g, '\n\t') )

const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.01, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
const canvas = document.body.appendChild( renderer.domElement )

const controls = new OrbitControls( camera, renderer.domElement );

const dots = new Array(2).fill().map(a=>new THREE.Object3D())

useTestPreset(1)

// function setCam(matrix, camera, controls, distanceToTarget = 10) {
// 	matrix.decompose( camera.position, camera.quaternion, camera.scale )
// 	controls.target = new THREE.Vector3(0,0,-distanceToTarget).applyMatrix4(matrix)
// }

// function setThisCam(matrix) {
// 	setCam(matrix, camera, controls, 2)
// }

// function saveCam(camera, str = true) {
// 	if (str === true) {
// 		return `new THREE.Matrix4(${camera.matrix.clone().transpose().elements.join(', ')})`
// 	} else {
// 		return camera.matrix.clone()
// 	}
// }

// setThisCam(new THREE.Matrix4(-0.240655532591459, 0.26875381158895234, -0.9326608726592595, -0.4957141889167924, 0, 0.9609011931745283, 0.27689148949682046, 0.9721476956234324, 0.970610588564292, 0.0666354688748997, -0.2312461884111845, 1.4157772640732529, 0, 0, 0, 1))


const scene = new THREE.Scene();

const box = new THREE.Mesh(
	 new THREE.BoxGeometry(1, 1, 1)
	,new THREE.MeshBasicMaterial({color: 0x80_00_00})
)


// transform.attach( box );

const box1 = new THREE.Mesh(
	 new THREE.BoxGeometry(1, 1, 1)
	,new THREE.MeshBasicMaterial({color: 0x80_80_00})
)
// transform.attach( box1 );

let controlsArray = [] // need to make only one controls active at the same time
controlsArray.push(controls)





// 

let boxedLine = new THREE.Object3D()
line3DbyBoxes(boxedLine ,dots[1].position, dots[0].position)
scene.add( boxedLine )

for ( mesh of dots ) {
	if ( !(mesh?.geometry === undefined) ) {
		if ( !(mesh?.geometry?.boundingBox instanceof THREE.Box3) ) {
			mesh.geometry.computeBoundingBox()
		}
		mesh.add( new THREE.Box3Helper( mesh.geometry.boundingBox, 0x20_20_20 ) )		
	}


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
		line3DbyBoxes(boxedLine ,dots[1].position, dots[0].position)
	})

	// mesh.transformControls.addEventListener('mouseUp', _=>{
	// 	line3DbyBoxes(boxedLine ,dots[1].position, dots[0].position)
	// })

	mesh.transformControls.attach( mesh )

	scene.add( mesh, mesh.transformControls.getHelper() )
}

const line = getLine(dots[0].position, dots[1].position, 0xff_ff_ff)

scene.add(
	 // box
	// ,box1
	 // new THREE.Box3Helper( new THREE.Box3( new THREE.Vector3(0,0,0), new THREE.Vector3(1,1,1) ), 0xff_ff_00 )
	 new THREE.AxesHelper( 5 )
	,line
	// ,transform.getHelper()
)

scene.add(
	getLineGrid( new THREE.Vector3(20,20,20), new THREE.Vector3(0,0,0), new THREE.Vector3(5,5,5), new Array(3).fill(0x20_20_20) )
)

function animate() {
	requestAnimationFrame( animate );
	// controls.update();
	line.geometry.attributes.position.needsUpdate = true

	// line3DbyBoxes(boxedLine ,dots[1].position, dots[0].position)

	renderer.render( scene, camera );
};
animate();