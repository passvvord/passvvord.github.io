function consoleOut(...a) {
	console.log(...a)
	
	document.querySelector('#console').innerHTML += a+'<br>'
}

window.tempan = null
function animateSlider(min,max,func,speed = 2,call = 20) {
	if (window.tempan) {
		clearInterval(window.tempan)
	}
	if (func) {
		window.tempan = setInterval(() => {
			func( Math.round(min + (Math.cos( (Date.now()*Math.PI)/(speed*2000) )+1)/2*(max-min)) )
			// setHideLayers({Z0: Math.round(0 + (Math.cos( (Date.now()*Math.PI)/(window.animSpeed*2000) )+1)/2*(205-0)) })
		}, call);		
	}
}
// window.tempan = animateSlider(-999,3000,(val)=>{ document.querySelectorAll('#histogram .histMin').forEach(el=>{el.value = val; getInputAndUpgradeHistogram()}) },5)


window.AutoSpinSetInterval = null;

const get3DmatrixFrom2D = (A)=>[A[0],A[1],0,0 ,A[2],A[3],0,0 ,0,0,1,0 ,A[4],A[5],0,1]

function get3DMatrixTransform(el) {
	const tempStringMatrix = getComputedStyle(el)['transform']
	if (tempStringMatrix.includes('3d')) {
		//              'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)' -> [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
		return tempStringMatrix.slice(9,-1).split(',').map(a=>parseFloat(a));
	} else if (tempStringMatrix != 'none') {
		//              'matrix(1, 0, 0, 1, 0, 0)' -> [1, 0, 0, 1, 0, 0]
		return get3DmatrixFrom2D(tempStringMatrix.slice(7,-1).split(',').map(a=>parseFloat(a))); 
	} else {
		return [1,0,0,0 ,0,1,0,0 ,0,0,1,0 ,0,0,0,1]
	}	
}

const getMatrixFromArray = (A)=>`matrix3d(${A.join(',')})`;

const getRotationMatrixFromAllMatrix = (A)=>[[A[0],A[1],A[2]],[A[4],A[5],A[6]],[A[8],A[9],A[10]]];

function setLayersVisibilityByRotateMatrix(rotateMatrix) {
	// console.log(`[[${roundM2D(rotateMatrix).join('],[')}]]*[[0],[0],[1]] = [[${math.multiply(roundM2D(rotateMatrix),[0,0,1]).join('],[')}]]`)
	const currZoneIs = document.querySelectorAll('.currentLayersIs')
	// console.log( math.multiply(rotateMatrix,[0,0,-1]).map(a=>Math.abs(a)),math.multiply(rotateMatrix,[0,0,-1]).map(a=>Math.sign(a)) )
	// console.log( math.multiply(rotateMatrix,[0,0,1] ).map(a=>Math.abs(a)),math.multiply(rotateMatrix,[0,0,1] ).map(a=>Math.sign(a)) )
	const tempVec = math.multiply(rotateMatrix,[0,0,1]).map(a=>Math.abs(a))

	const surf = ['sagittal','frontal','axial']
	surf.forEach((sur,i)=>{
		document.querySelector(`#curSurface > #${sur}`).textContent = `${(2*Math.asin(tempVec[i])/Math.PI*100).toFixed(0).padStart(3)}% ${sur.padStart(8)}`
	})

	switch (tempVec.reduce((a,c,i,A)=>(c>A[a]?i:a),0)) {
		case 0: document.getElementById('zone3d').setAttribute('style','--lX: auto;'); currZoneIs.forEach(el=>{el.textContent = 'X layers'}); break;
		case 1: document.getElementById('zone3d').setAttribute('style','--lY: auto;'); currZoneIs.forEach(el=>{el.textContent = 'Y layers'}); break;
		case 2: document.getElementById('zone3d').setAttribute('style','--lZ: auto;'); currZoneIs.forEach(el=>{el.textContent = 'Z layers'}); break;
	}
}

function noZoomMatrix(A) {
	A[12] = 0
	A[13] = 0
	A[14] = 0
	A[15] = 1;
	return A;
}

document.querySelector('#animate #AutoSpin').addEventListener('click',()=>{
	const Block3D = Zone3Delement.querySelector('#block3d');
	const Box3D = document.querySelector('#box3d');

	const roundM2D = (A,n=4)=>A.map(a=>a.map(aa=>Math.round(aa*10**n)/10**n));
	const rMZa_90 = roundM2D( math.rotationMatrix(-math.pi / 2, [0, 0, 1]) )
	
	const setNewRotationToOldMatrix = (N,O)=>[N[0][0],N[0][1],N[0][2],O[3],N[1][0],N[1][1],N[1][2],O[7],N[2][0],N[2][1],N[2][2],O[11],O[12],O[13],O[14],O[15]];

	function getNewMatrixAfterAnyRotate(matrix,mmx,mmy,angleF) {
		// const currentMatrix = get3DMatrixTransform(boxEl);
		return setNewRotationToOldMatrix(
			math.multiply(
				getRotationMatrixFromAllMatrix(matrix), 
				math.rotationMatrix(
					angleF(mmx,mmy),
					math.multiply(rMZa_90, [mmx,mmy,0])
				)
			),
			matrix
		);
	}

	if (window.AutoSpinSetInterval) {
		clearInterval(window.AutoSpinSetInterval)
	}
	window.AutoSpinSetInterval = setInterval(() => {
		const matrix = getNewMatrixAfterAnyRotate(
			get3DMatrixTransform(Block3D),
			2,
			0,
			(mx,my)=>0.002*math.pi
		);
		setLayersVisibilityByRotateMatrix(getRotationMatrixFromAllMatrix(matrix));
		Block3D.style.transform = getMatrixFromArray(matrix);
		Box3D.style.transform = getMatrixFromArray(noZoomMatrix(matrix));
		
	}, 20);
})

document.querySelector('#animate #DisableAutoSpin').addEventListener('click',()=>{
	clearInterval(window.AutoSpinSetInterval)
})

document.documentElement.style.setProperty('--vw', document.documentElement.clientWidth /100 + 'px');
document.documentElement.style.setProperty('--vh', document.documentElement.clientHeight/100 + 'px');

const gpu = new GPU.GPU();

initOpenFile()
initFileInfo()

initChoseZoneEvents()
initVisParamsEvents()
initHideLayersEvents()
initShowContoursEvents()

initZone3Devents()



function getHueVis(min,max) {
	const dens = new Array(5).fill().map((a,i,A)=>min+(max-min)*i/(A.length-1))
	// const col  = [
	// 	255,0  ,0  ,255,
	// 	255,255,0  ,255,
	// 	0  ,255,0  ,255,
	// 	0  ,255,255,255,
	// 	0  ,  0,255,255
	// ]
	const col  = [
		0  ,  0,255,255*0/4,
		0  ,255,255,255*1/4,
		0  ,255,0  ,255*2/4,
		255,255,0  ,255*3/4,
		255,0  ,0  ,255*4/4
	]
	return new Array(4).fill().map((a,i)=>{return {min: dens[i], max: dens[i+1], gradient: true, rgba0: col.slice(i*4,(i+1)*4), rgba1: col.slice((i+1)*4,(i+2)*4)} })

	// [
	// 	{min: 1/4, max: 7/7, gradient: true, rgba0: [255,0  ,0  ,255], rgba1: [255,255,0  ,255]},
	// 	{min: 2/4, max: 7/7, gradient: true, rgba0: [255,255,0  ,255], rgba1: [0  ,255,0  ,255]},
	// 	{min: 3/4, max: 7/7, gradient: true, rgba0: [0  ,255,0  ,255], rgba1: [0  ,255,255,255]},
	// 	{min: 2/4, max: 7/7, gradient: true, rgba0: [0  ,255,255,255], rgba1: [0  ,  0,255,255]}
	// ]	
}

function setMatrix(matrix) {
	setLayersVisibilityByRotateMatrix(getRotationMatrixFromAllMatrix(matrix));
	Zone3Delement.querySelector('#block3d').style.transform = getMatrixFromArray(matrix);
	document.querySelector('#box3d').style.transform = getMatrixFromArray(noZoomMatrix(matrix));	
}

function setVisPar(params) {
	setVisParams(
		params
		, window.zone3Dparams.min
		, window.zone3Dparams.max
	)
	updateZone3DbyChangingVisParams()
}

function setGlobOp(val) {
	document.querySelectorAll('input.globalOpacity').forEach(inp=>{inp.value = val})
	document.querySelector('#block3d').style.setProperty('--globalLayerOpacity',val)
}
//getHueVis(400, 4143)


/*
get3DMatrixTransform(Zone3Delement.querySelector('#block3d'))

'{'+Object.entries(getChoseZone()).map(a=>`${a[0]}: ${a[1]}`).join(', ')+'}'

new Array( document.querySelector('input#manyDicomFiles').files.length ).fill().map((a,i)=>document.querySelector('input#manyDicomFiles').files[i].name).reduce((ac,a,i)=>ac&&(a==='1.2.840.113704.1.111.1624.16255657'+temp[i]+'.23'+(i+225)+'.dcm'),true)
*/

switch ( window.location.search.slice(1,2) ) {
	case '0':
		openOneFile( fetch('https://passvvord.github.io/test/test_12/testData/фрагмент щелепи.dcm').then(r=>r.arrayBuffer())
			,[
				{min: 300, max: 3000, gradient: true, rgba0: [0,0,40,0], rgba1: [255,255,255,255]},
				{min: 2300, max: 4143, gradient: true, rgba0: [255,255,0,255], rgba1: [255,0,0,255]},
			]
			,{visible: false, X0: 24, X1: 227, Y0: 28, Y1: 225, Z0: 0, Z1: 232}
			,()=>{
				if ( window.location.search.slice(2,3) === 'a' ) {
					setMatrix([0.314884, 0.0937909, 0.94448, 0, 0.949092, -0.0421687, -0.312235, 0, -0.0105255, -0.99469, 0.102304, 0, 0, 0, 0, 1])
					animateSlider(26,224,a=>{setHideLayers({X1: a})},8)
				} else {
					setGlobOp(0.2)
					setMatrix([ 0.877529, -0.151226, -0.455066, 0, -0.47939, -0.299983, -0.824755, 0, 0.0117847, -0.941882, 0.335733, 0, 0, 0, 0, 1])
				}
		})	
		break;
	case '1':
		openManyFiles( new Array(227).fill().map( (a,i)=>fetch('https://passvvord.github.io/test/test_12/testData/грудна клітина/I'+(i+1).toString().padStart(5,'0')).then(r=>r.arrayBuffer()) )
			,[
				{min: 100, max: 1000, gradient: true, rgba0: [0,0,0,0], rgba1: [255,255,255,255]},
				{min: 1000, max: 2440, gradient: false, rgba0: [255,255,255,255], rgba1: [255,255,255,255]},
				{min: -1000, max: -600, gradient: true, rgba0: [0,0,255,5], rgba1: [255,0,255,5]},
				{min: -600, max: -300, gradient: true, rgba0: [255,255,0,100], rgba1: [255,0,0,100]}
			]
			,{visible: false, X0: 14, X1: 469, Y0: window.location.search.slice(2,3) === 'a'? 100 : 258, Y1: 394, Z0: 0, Z1: 202}
			,()=>{
				if ( window.location.search.slice(2,3) === 'a' ) {
					setMatrix([0.982168, -0.0946957, -0.162377, 0, -0.181791, -0.258781, -0.948699, 0, -0.0478056, -0.961282, 0.271363, 0, 0, 0, 0, 1])
					animateSlider(100,357,a=>{setHideLayers({Y0: a})},10)
				} else {
					setMatrix([0.948241, -0.101548, -0.300886, 0, -0.316661, -0.373151, -0.872051, 0, 0.0237156, -0.922198, 0.386003, 0, 0, 0, 0, 1])
				}
		})
		break;
	case '2':
		const temp = [
			41,41,41,41,42,42,42,42,42,42,42,43,43,43,43,43,43,43,44,44,44,44,44,44,45,45,45,45,45,46,46,46,46,46,46,46,46,46,47,47,47,47,47,47,48,48,48,48,48,48,
			48,49,49,49,49,49,49,50,50,50,50,50,50,50,50,50,51,51,51,51,51,51,51,52,52,52,52,52,52,53,53,53,53,53,53,54,54,54,54,54,54,54,54,55,55,55,55,55,55,56,
			56,56,56,56,56,56,57,57,57,57,57,57,57,57,57,58,58,58,58,59,59,59,59,59,59,59,60,60,60,60,60,61,61,61,61,61,61,61,61,61,61,62,62,62,62,62,62,62,63,63,
			63,63,64,64,64,64,64,64,64,64,64,65,65,65,65,65,65,65,65,65,66,66,66,66,67,67,67,67,67,67,67,68,68,68,68,68,68,69,69,69,69,69,69,69,70,70,70,70,70,70,
			70,71,71,71,71,71,71,71,71,71,72,72,72,72,73,73,73,73,73,73,73,73,73,74,74,74,74,74,74,75,75,75,75,75,75,75,76,76,76,76,76,76,76,76,76,77,77,77,77,77,
			77,77,78,78,78,78,78,78,79,79,79,79,79,79,79,80,80,80,80,80,81,81,81,81,81,81,81,81,81,82,82,82,82,82,82,82,82,83,83,83,83,83,83,84,84,84,84,84,84,85,
			85,85,85,85,85,85,85,86,86,86,86,86,87,87,87,87,87,87,87,87,88,88,88,88,88,88,89,89,89,89,89,89,90,90,90,90,90,90,90,90,91,91,91,91,91,92,92,92,92,92,
			92,92,92,92,93,93,93,93,93,93,93,93,94,94,94,94,94,94,95,95,95,95,95,95,95,96,96,96,96,96,96,96,97,97,97,97,97,98,98,98,98,98,98,98,98,99,99,99,99,99
		]
		''
		openManyFiles( new Array(400).fill().map( (a,i)=>fetch('https://passvvord.github.io/test/test_12/testData/ноги/1.2.840.113704.1.111.1624.16255657'+temp[i]+'.23'+(i+225)+'.dcm').then(r=>r.arrayBuffer()) )
			,[
				{min: 100, max: 800, gradient: true, rgba0: [0,0,0,0], rgba1: [255,255,0,75]},
				{min: 800, max: 1765, gradient: true, rgba0: [255,255,0,75], rgba1: [255,0,0,255]}
			]
			,{visible: false, X0: 68, X1: 418, Y0: 89, Y1: 378, Z0: 0, Z1: 400}
			,()=>{
				// if ( window.location.search.slice(2,3) === 'a' ) {
				// 	setMatrix([0.982168, -0.0946957, -0.162377, 0, -0.181791, -0.258781, -0.948699, 0, -0.0478056, -0.961282, 0.271363, 0, 0, 0, 0, 1])
				// 	animateSlider(100,357,a=>{setHideLayers({Y0: a})},10)
				// } else {
					setMatrix([-0.736325, 0.199274, 0.646617, 0, -0.675993, -0.174474, -0.715972, 0, 0.0298512, 0.964277, -0.263167, 0, 0, 0, 0, 1])
				// }
		})
		break;
	// case '3':
	// 	openOneFile( fetch('https://passvvord.github.io/test/test_12/testData/голова.dcm').then(r=>r.arrayBuffer())
	// 		,[
	// 			{min: 640, max: 3095, gradient: true, rgba0: [0,0,0,0], rgba1: [255,255,255,255]}
	// 		]
	// 		,{visible: false, X0: 0, X1: 501, Y0: 7, Y1: 378, Z0: 0, Z1: 501}
	// 		,()=>{
	// 			if ( window.location.search.slice(2,3) === 'a' ) {
	// 				// setMatrix([0.314884, 0.0937909, 0.94448, 0, 0.949092, -0.0421687, -0.312235, 0, -0.0105255, -0.99469, 0.102304, 0, 0, 0, 0, 1])
	// 				// animateSlider(26,224,a=>{setHideLayers({X1: a})},8)
	// 			} else {
	// 				setMatrix([0.983252, -0.0654841, -0.170029, 0, -0.182129, -0.378692, -0.907429, 0, 0.0049785, -0.923203, 0.384271, 0, 0, 0, 0, 1])
	// 			}
	// 	})
	// 	break;
	default:
		consoleOut('default mode')
		break;
}


