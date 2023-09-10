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

document.querySelector('#animate #AutoSpin').addEventListener('click',()=>{
	const Block3D = Zone3Delement.querySelector('#block3d');
	const Box3D = document.querySelector('#box3d');

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

	const roundM2D = (A,n=4)=>A.map(a=>a.map(aa=>Math.round(aa*10**n)/10**n));
	const rMZa_90 = roundM2D( math.rotationMatrix(-math.pi / 2, [0, 0, 1]) )
	const getRotationMatrixFromAllMatrix = (A)=>[[A[0],A[1],A[2]],[A[4],A[5],A[6]],[A[8],A[9],A[10]]];
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

	const getMatrixFromArray = (A)=>`matrix3d(${A.join(',')})`;

	function noZoomMatrix(A) {
		A[12] = 0
		A[13] = 0
		A[14] = 0
		A[15] = 1;
		return A;
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

document.documentElement.style.setProperty('--vw', document.documentElement.clientWidth/100 + 'px');
document.documentElement.style.setProperty('--vh', document.documentElement.clientHeight/100 + 'px');

const gpu = new GPU.GPU();

initOpenFile()
initFileInfo()

initChoseZoneEvents()
initVisParamsEvents()
initHideLayersEvents()
initShowContoursEvents()

initZone3Devents()