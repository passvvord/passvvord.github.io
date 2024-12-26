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
	object3d.clear()

	if (object3d.children.length > 0) {

	}

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
		

	// console.log(`${c1l} = f1(${c0l}) = f1(a) =`,c1byc0)
	// console.log(`${c2l} = f2(${c0l}) = f2(a) =`,c2byc0)



	// let c0v = 1
	
	

	function addBox(pos,size,color) {
		// const box = new THREE.Mesh(
		// 	 new THREE.BoxGeometry(...size)
		// 	,new THREE.MeshBasicMaterial({color: color})
		// )
		// box.geometry.computeBoundingBox()
		// box.add( new THREE.Box3Helper( box.geometry.boundingBox, 0x20_20_20 ) )

		// box.position.set(...pos)
		// group.add(box)

		const box = new THREE.Box3Helper( new THREE.Box3(
			 size.clone().multiplyScalar(-0.5).add(pos)
			,size.clone().multiplyScalar(0.5).add(pos)
		), color )

		group.add(box)
	}
	
	const step = new THREE.Vector3(1,1,1).divide(stepCount)

	const fromC0 = Math.round(from[c0l]*stepCount[c0l])
	const toC0 = Math.round(to[c0l]*stepCount[c0l])
	const directionC0 = Math.sign(to[c0l] - from[c0l])
	
	const pos = new THREE.Vector3()
	// console.log(fromC0, directionC0, (toC0-fromC0)*directionC0, directionC0)
	for (let i = fromC0; i*directionC0 <= toC0*directionC0; i+=directionC0 ) {

		pos[c0l] = i/stepCount[c0l]
		pos[c1l] = Math.round( c1byc0(pos[c0l])*stepCount[c1l] )/stepCount[c1l]
		pos[c2l] = Math.round( c2byc0(pos[c0l])*stepCount[c2l] )/stepCount[c2l]

		// pos.divide(stepCount)

		addBox(pos, step, color)
		// console.log(...pos)
	}


	return group



}


const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.01, 1000 );
camera.position.set(0,0,6.5)

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
const canvas = document.body.appendChild( renderer.domElement )

const controls = new OrbitControls( camera, renderer.domElement );



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

const dots = new Array(2).fill().map(a=>new THREE.Object3D())
dots[0].position.set(0.5314499266522039, 0.565301110853526, 1.5)
dots[1].position.set(0.46497686766975826, 0.4862670411103879, 2.114240314703029)


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

	mesh.transformControls.addEventListener('mouseUp', _=>{
		line3DbyBoxes(boxedLine ,dots[1].position, dots[0].position)
	})

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

// scene.add(
// 	getLineGrid( new THREE.Vector3(10,10,10), new THREE.Vector3(0,0,0), new THREE.Vector3(1,1,1), new Array(3).fill(0x20_20_20) )
// )

function animate() {
	requestAnimationFrame( animate );
	// controls.update();
	line.geometry.attributes.position.needsUpdate = true

	// line3DbyBoxes(boxedLine ,dots[1].position, dots[0].position)

	renderer.render( scene, camera );
};
animate();