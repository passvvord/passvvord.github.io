function openFullscreen() {
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
  } else if (document.documentElement.webkitRequestFullscreen) { /* Safari */
    document.documentElement.webkitRequestFullscreen();
  } else if (document.documentElement.msRequestFullscreen) { /* IE11 */
    document.documentElement.msRequestFullscreen();
  }
}

function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) { /* Safari */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { /* IE11 */
    document.msExitFullscreen();
  }
}

window.fullscreen = false;
document.querySelector('#box3d').addEventListener('click', c=>{
	if (window.fullscreen) {
		closeFullscreen();
		window.fullscreen = false;
	} else {
		openFullscreen();
		window.fullscreen = true;
	}
})

function initLayer(Block3D,data,axName,layerTransform,A,B,C,ago=1) {
	for (let a = 0; a < A; a+=ago) {
		let canv = document.createElement('canvas');
		canv.id = axName+a;
		canv.className = axName+'layer';
		canv.width = B;
		canv.height = C;
		canv.style.transform = layerTransform(A,a);
		Block3D.appendChild(canv);
	}
}

function upgradeLayer(Block3D,data,axName,A,B,C,min,delta,ColArray,ago=1) {
	let posf;
	if (axName === 'X') {
		posf = (x,z,y,X,Z,Y)=>(x+y*X+(Z-z)*X*Y);
	} else if (axName === 'Y') {
		posf = (y,x,z,Y,X,Z)=>(x+(Y-y)*X+z*X*Y);
	} else if (axName === 'Z') {
		posf = (z,x,y,Z,X,Y)=>(x+y*X+z*X*Y);
	}
	
	for (let a = 0; a < A; a+=ago) {
		let ctx = document.getElementById(axName+a).getContext("2d");
		let pixels = new Uint8ClampedArray(B*C*4);
		for (let c = 0; c < C; c++) {
			for (let b = 0; b < B; b++) {
				const temp = Math.round( (data[posf(a,b,c,A,B,C)]-min)/delta*255 )
				for (let col = 0; col < 4; col+=1) {
					pixels[(c*B+b)*4+col] = ColArray[temp*4+col];
				}
			}
		}
		ctx.putImageData(new ImageData(pixels,B,C), 0, 0);
	}
}

// document.querySelector('#zone3d').addEventListener('mousemove',mm=>{
// 	if (mm.buttons === 1 && Math.sqrt(mm.movementX*mm.movementX+mm.movementY*mm.movementY) > 0.1) {
// 		// console.log(mm.movementX,mm.movementY)
// 		const matrix = getMatrix(document.querySelector('#zone3d > #block3d'),mm.movementX,mm.movementY)
// 		document.querySelector('#zone3d > #block3d').style.transform = matrix;
// 		document.querySelector('#box3d').style.transform = matrix;
// 	}
// })

const roundM2D = (A,n=4)=>A.map(a=>a.map(aa=>Math.round(aa*10**n)/10**n));
const rMZa_90 = roundM2D( math.rotationMatrix(-math.pi / 2, [0, 0, 1]) )
const getRotationMatrixFromAllMatrix = (A)=>[[A[0],A[1],A[2]],[A[4],A[5],A[6]],[A[8],A[9],A[10]]];
// const setNewRotationToOldMatrix = (N,O)=>`matrix3d(${N[0][0]},${N[0][1]},${N[0][2]},${O[3]},${N[1][0]},${N[1][1]},${N[1][2]},${O[7]},${N[2][0]},${N[2][1]},${N[2][2]},${O[11]},${O[12]},${O[13]},${O[14]},${O[15]})`;
const setNewRotationToOldMatrix = (N,O)=>[N[0][0],N[0][1],N[0][2],O[3],N[1][0],N[1][1],N[1][2],O[7],N[2][0],N[2][1],N[2][2],O[11],O[12],O[13],O[14],O[15]];
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

function getNewMatrixAfterOzRotate(matrix,angle) {
	// const currentMatrix = get3DMatrixTransform(boxEl);
	return setNewRotationToOldMatrix(
		math.multiply(
			getRotationMatrixFromAllMatrix(matrix), 
			math.rotationMatrix(
				angle,
				[0,0,1]
			)
		),
		matrix
	);
}

const getMatrixFromArray = (A)=>`matrix3d(${A.join(',')})`;

function getNewMatrixAfterZoom(matrix,zoom,zoomMin=0.2,zoomMax=6) {
	// let currentMatrix = get3DMatrixTransform(boxEl);
	matrix[15]=Math.max(Math.min(matrix[15]*zoom,1/zoomMin),1/zoomMax);
	return matrix;
}

document.getElementById('zone3d').oncontextmenu = ()=>false;

document.getElementById('zone3d').addEventListener('mousemove',mm=>{
	if (Math.abs(mm.movementX)+Math.abs(mm.movementY) > 0) { // sometimes can be 0 mmX and 0 mmY
		if (mm.buttons === 1) { //LMB only
			const matrix = getMatrixFromArray(getNewMatrixAfterAnyRotate(
				get3DMatrixTransform(document.getElementById('block3d')),
				mm.movementX,
				mm.movementY,
				(mx,my)=>(Math.sqrt(mx*mx+my*my)/180)*math.pi
			));
			document.querySelector('#zone3d > #block3d').style.transform = matrix;
			document.querySelector('#box3d').style.transform = matrix;
		} else if (mm.buttons === 2) { //RMB only
			const matrix = getMatrixFromArray(getNewMatrixAfterOzRotate(
				get3DMatrixTransform(document.getElementById('block3d')),
				(mm.movementX/180)*math.pi*0.5
			));
			document.querySelector('#zone3d > #block3d').style.transform = matrix;
			document.querySelector('#box3d').style.transform = matrix;
		}
	}
})

document.getElementById('zone3d').addEventListener('wheel',w=>{
	const matrix = getMatrixFromArray(getNewMatrixAfterZoom(
		get3DMatrixTransform(document.getElementById('block3d'))
		,1+w.deltaY/2000
	));
	document.querySelector('#zone3d > #block3d').style.transform = matrix;
	document.querySelector('#box3d').style.transform = matrix;
})

document.getElementById('zone3d').addEventListener('touchstart',ts=>{
	window.oldTouches = ts.touches;
	// console.log(tm.touches)
})

const vec2DLen = (A)=>Math.sqrt(A[0]*A[0]+A[1]*A[1]);
const vec2DscaMult = (A,B)=>A[0]*B[0]+A[1]*B[1];
const vec2DsignBeetwen = (O,N)=>Math.sign(O[0])*Math.sign(O[1]/O[0]*N[0]-N[1]); // діапазон 180 за годинниковою стрілкою відноасно O це + інше -
const vec2DangleBeetwen = (A,B)=>Math.acos(vec2DscaMult(A,B)/(vec2DLen(A)*vec2DLen(B)));

document.getElementById('zone3d').addEventListener('touchmove',tm=>{
	if (Object.keys(tm.touches).length === 1 && Object.keys(window.oldTouches).length === 1) {

		const matrix = getMatrixFromArray(getNewMatrixAfterAnyRotate(
			get3DMatrixTransform(document.getElementById('block3d')),
			tm.touches[0].screenX-window.oldTouches[0].screenX,
			tm.touches[0].screenY-window.oldTouches[0].screenY,
			(mx,my)=>(Math.sqrt(mx*mx+my*my)/180)*math.pi
		));
		document.querySelector('#zone3d > #block3d').style.transform = matrix;
		document.querySelector('#box3d').style.transform = matrix;

	} else if (Object.keys(tm.touches).length === 2 && Object.keys(window.oldTouches).length === 2) {

		const newDeltaVector = [tm.touches[0].screenX-tm.touches[1].screenX,tm.touches[0].screenY-tm.touches[1].screenY];
		const oldDeltaVector = [window.oldTouches[0].screenX-window.oldTouches[1].screenX,window.oldTouches[0].screenY-window.oldTouches[1].screenY];

		let matrix = getNewMatrixAfterZoom(
			get3DMatrixTransform(document.getElementById('block3d'))
			,1-1*(vec2DLen(newDeltaVector)-vec2DLen(oldDeltaVector))/500
		);
		matrix = getMatrixFromArray(getNewMatrixAfterOzRotate(
			matrix,
			2*vec2DsignBeetwen(oldDeltaVector,newDeltaVector)*vec2DangleBeetwen(oldDeltaVector,newDeltaVector)
		));
		document.querySelector('#zone3d > #block3d').style.transform = matrix;
		document.querySelector('#box3d').style.transform = matrix;

	}
	window.oldTouches = tm.touches;
})

// hideElement(document.getElementById("fileInfo").querySelectorAll(".hideTool")[0])
// hideElement(document.getElementById("visParams").querySelectorAll(".hideTool")[0])
// hideElement(document.getElementById("histogram").querySelectorAll(".hideTool")[0])
hideElement(document.getElementById("choseZone").querySelectorAll(".hideTool")[0])
hideElement(document.getElementById("settings").querySelectorAll(".hideTool")[0])

window.image = {}

document.getElementById('oneDicomFile').addEventListener('change', c => {
	draw_preloader()

    c.target.files[0].arrayBuffer().then(f=>{
    	let image = daikon.Series.parseImage(new DataView(f))
		window.image['pixels'] = new Int16Array(image.getInterpretedData())
		console.log('image opened')

		const X = image.getCols();
		const Y = image.getRows();
		const Z = Math.floor(window.image['pixels'].length/X/Y);
		const min = window.image['pixels'].reduce((a,b)=>(b<a?b:a));
		const max = window.image['pixels'].reduce((a,b)=>(b>a?b:a));
		console.log('max min calced')

		window.image['X'] = X;
		window.image['Y'] = Y;
		window.image['Z'] = Z;
		window.image['min'] = min;
		window.image['max'] = max;

		window.hist = new HistForBigIntData(
			document.getElementById("histCanv")
			,window.image['pixels']
			,window.image['min']
			,window.image['max']
			,10
		)
		console.log('histo calced')

		document.querySelectorAll(".slider > .imageMax").forEach(el=>{
			el.min = min;
			el.max = max;
			el.value = max;
		})

		document.querySelectorAll(".slider > .imageMin").forEach(el=>{
			el.min = min;
			el.max = max;
			el.value = min;
		})

		// console.log(getVisParams(),window.image['min'],window.image['max'])
		const ColArray = getColArrayFromParams(getVisParams(),window.image['min'],window.image['max']);
		console.log('ColArray calced')

		const FileInfo = {
			"xSize": `X: ${X} px`,
			"ySize": `Y: ${Y} px`,
			"zSize": `Z: ${Z} px`,
			"minDensity": `min density: ${min}`,
			"maxDensity": `max density: ${max}`,
			"usedMemoryMiB": `RAM used for image: ${Math.round(1000*window.image['pixels'].length*2/1024/1024)/1000} MiB`,
		}

		for (let i in FileInfo) { document.getElementById(i).textContent = FileInfo[i]; }

		let canvBlock = document.getElementById("block3d");
		canvBlock.style.width = `${X}px`;
		canvBlock.style.height = `${Y}px`;
				
		initLayer(canvBlock,window.image['pixels'],'X',(A,a)=>`rotateY(-90deg) translateZ(${Math.floor(A/2-a)}px)`,X,Z,Y)
		initLayer(canvBlock,window.image['pixels'],'Y',(A,a)=>`rotateX(-90deg) translateZ(${Math.floor(A/2-a)}px)`,Y,X,Z)
		initLayer(canvBlock,window.image['pixels'],'Z',(A,a)=>`translateZ(${Math.floor(A/2-a)}px)`                ,Z,X,Y)
		console.log('layers inited')
		
		upgradeLayer(canvBlock,window.image['pixels'],'X',X,Y,Z,min,max-min,ColArray)
		upgradeLayer(canvBlock,window.image['pixels'],'Y',Y,Z,X,min,max-min,ColArray)
		upgradeLayer(canvBlock,window.image['pixels'],'Z',Z,X,Y,min,max-min,ColArray)
		console.log('layers rendered')

		remove_preloader()

	})
});