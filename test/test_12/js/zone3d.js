window.zone3Ddata = null;
window.zone3Dparams = {
	X: 0, Y: 0, Z: 0, 
	min: -1000, max: 1000, 
	VisParams: null, 
	ChoseZoneParams: null
}

const Zone3Delement = document.querySelector('#zone3d');
const Block3Delement = Zone3Delement.querySelector('#block3d');
const Box3Delement = document.querySelector('#box3d');
const CutBlockelement = document.querySelector('#cutZone');

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
window.fullscreenZone3D = false;

function initZone3Devents(Zone3D = Zone3Delement,Block3D = Block3Delement,Box3D = Box3Delement) {
	Box3D.addEventListener('click', c=>{
		if (window.fullscreen && window.fullscreenZone3D) {
			closeFullscreen();
			document.body.className = '';
			window.fullscreen = false;
			window.fullscreenZone3D = false;
		} else if (window.fullscreen && !window.fullscreenZone3D) {
			document.body.className = 'fullscreen3dzone';
			window.fullscreenZone3D = true;
		} else if (!window.fullscreen && !window.fullscreenZone3D){
			openFullscreen();
			window.fullscreen = true;
		}
	})

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

	function noZoomMatrix(A) {
		A[12] = 0
		A[13] = 0
		A[14] = 0
		A[15] = 1;
		return A;
	}

	function getNewMatrixAfterZoom(matrix,zoom,zoomMin=0.5,zoomMax=10) {
		// let currentMatrix = get3DMatrixTransform(boxEl);
		matrix[15]=Math.max(Math.min(matrix[15]*zoom,1/zoomMin),1/zoomMax);
		return matrix;
	}

	Zone3D.oncontextmenu = ()=>false;

	Zone3D.addEventListener('mousemove',mm=>{
		if (Math.abs(mm.movementX)+Math.abs(mm.movementY) > 0) { // sometimes can be 0 mmX and 0 mmY
			if (mm.buttons === 1) { //LMB only
				const matrix = getNewMatrixAfterAnyRotate(
					get3DMatrixTransform(Block3D),
					mm.movementX,
					mm.movementY,
					(mx,my)=>(Math.sqrt(mx*mx+my*my)/180)*math.pi
				);
				setLayersVisibilityByRotateMatrix(getRotationMatrixFromAllMatrix(matrix));
				Block3D.style.transform = getMatrixFromArray(matrix);
				Box3D.style.transform = getMatrixFromArray(noZoomMatrix(matrix));
			} else if (mm.buttons === 2) { //RMB only
				const matrix = getNewMatrixAfterOzRotate(
					get3DMatrixTransform(Block3D),
					(mm.movementX/180)*math.pi*0.5
				);
				Block3D.style.transform = getMatrixFromArray(matrix);
				Box3D.style.transform = getMatrixFromArray(noZoomMatrix(matrix));
			}
		}
	})

	Zone3D.addEventListener('wheel',w=>{
		const matrix = getNewMatrixAfterZoom(
			get3DMatrixTransform(Block3D)
			,1+w.deltaY/2000
		);
		Block3D.style.transform = getMatrixFromArray(matrix);
		Box3D.style.transform = getMatrixFromArray(noZoomMatrix(matrix));
	})

	Zone3D.addEventListener('touchstart',ts=>{
		window.oldTouches = ts.touches;
		// console.log(tm.touches)
	})

	const vec2DLen = (A)=>Math.sqrt(A[0]*A[0]+A[1]*A[1]);
	const vec2DscaMult = (A,B)=>A[0]*B[0]+A[1]*B[1];
	const vec2DsignBeetwen = (O,N)=>Math.sign(O[0])*Math.sign(O[1]/O[0]*N[0]-N[1]); // діапазон 180 за годинниковою стрілкою відноасно O це + інше -
	const vec2DangleBeetwen = (A,B)=>Math.acos(vec2DscaMult(A,B)/(vec2DLen(A)*vec2DLen(B)));

	Zone3D.addEventListener('touchmove',tm=>{
		if (Object.keys(tm.touches).length === 1 && Object.keys(window.oldTouches).length === 1) {

			const matrix = getNewMatrixAfterAnyRotate(
				get3DMatrixTransform(Block3D),
				tm.touches[0].screenX-window.oldTouches[0].screenX,
				tm.touches[0].screenY-window.oldTouches[0].screenY,
				(mx,my)=>(Math.sqrt(mx*mx+my*my)/180)*math.pi
			);
			setLayersVisibilityByRotateMatrix(getRotationMatrixFromAllMatrix(matrix));
			Block3D.style.transform = getMatrixFromArray(matrix);
			Box3D.style.transform = getMatrixFromArray(noZoomMatrix(matrix));

		} else if (Object.keys(tm.touches).length === 2 && Object.keys(window.oldTouches).length === 2) {

			const newDeltaVector = [tm.touches[0].screenX-tm.touches[1].screenX,tm.touches[0].screenY-tm.touches[1].screenY];
			const oldDeltaVector = [window.oldTouches[0].screenX-window.oldTouches[1].screenX,window.oldTouches[0].screenY-window.oldTouches[1].screenY];

			let matrix = getNewMatrixAfterZoom(
				get3DMatrixTransform(Block3D)
				,1-1*(vec2DLen(newDeltaVector)-vec2DLen(oldDeltaVector))/500
			);
			matrix = getNewMatrixAfterOzRotate(
				matrix,
				2*vec2DsignBeetwen(oldDeltaVector,newDeltaVector)*vec2DangleBeetwen(oldDeltaVector,newDeltaVector)
			);
			Block3D.style.transform = getMatrixFromArray(matrix);
			Box3D.style.transform = getMatrixFromArray(noZoomMatrix(matrix));

		}
		window.oldTouches = tm.touches;
	})
}

function createElement(elName,params) {
	let el = document.createElement(elName);
	for (let name in params) {
		el[name] = params[name]
	}
	return el
}

function initBlock3D(element = Block3Delement) {
	element.style.width = `${window.zone3Dparams.X}px`;
	element.style.height = `${window.zone3Dparams.Y}px`;
	const czp = window.zone3Dparams.ChoseZoneParams;

	const tempDate = Date.now()
	// consoleOut(`call initBlock3D(element: ${element})`)

	for (let x = czp.X0; x < czp.X1; x++) {
		let canv = createElement('canvas',{id: `X${x}`,className: 'Xlayer', width: czp.Z1-czp.Z0, height: czp.Y1-czp.Y0})
		canv.style.transform = `rotateY(-90deg) translateZ(${(czp.X1-czp.X0)/2-(x-czp.X0)}px) scaleX(-1)`
		element.appendChild(canv);
	}

	for (let y = czp.Y0; y < czp.Y1; y++) {
		let canv = createElement('canvas',{id: `Y${y}`,className: 'Ylayer', width: czp.X1-czp.X0, height: czp.Z1-czp.Z0})
		canv.style.transform = `rotateX( 90deg) translateZ(${(czp.Y1-czp.Y0)/2-(y-czp.Y0)}px) scaleY(-1)`
		element.appendChild(canv);
	}

	for (let z = czp.Z0; z < czp.Z1; z++) {
		let canv = createElement('canvas',{id: `Z${z}`,className: 'Zlayer', width: czp.X1-czp.X0, height: czp.Y1-czp.Y0})
		canv.style.transform = `translateZ(${(czp.Z1-czp.Z0)/2-(z-czp.Z0)}px)` 
		element.appendChild(canv);
	}

	consoleOut(`initBlock3D need time: ${Date.now() - tempDate} ms`)
}

function removeBlock3D(element = Block3Delement) {
	const tempDate = Date.now()
	// consoleOut(`call removeBlock3D(element: ${element})`)
	element.querySelectorAll('canvas').forEach(a=>a.remove())
	consoleOut(`removeBlock3D need time: ${Date.now() - tempDate} ms`)
}

//very stable but many calc and long
function updateBlock3D_CPU(element = Block3Delement) {
	const vpArrLen = 1000;
	const vpArrLenM1 = vpArrLen-1;
	const tempDate = Date.now()
	// consoleOut(`call updateBlock3D(element: ${element})`)
	// data3D,X,Y,Z,min,delta,ColArray,
	const params = getColArrayFromParams(window.zone3Dparams.VisParams)
	const ColArray = params.colArray;
	const czp = window.zone3Dparams.ChoseZoneParams;
	const min = params.min;
	const delta = params.max - params.min;

	if ( (czp.Y1-czp.Y0) < 1 || (czp.X1-czp.X0) < 1 || (czp.Z1-czp.Z0) < 1) {throw 'too small area to show'; return;}

	for (let x = czp.X0; x < czp.X1; x++) {
		let pixels = new Uint8Array((czp.Y1-czp.Y0)*(czp.Z1-czp.Z0)*4);
		for (let y = czp.Y0; y < czp.Y1; y++) {
			for (let z = czp.Z0; z < czp.Z1; z++) {
				const temp0 = Math.round( (window.zone3Ddata[z][y][x]-min)/delta*vpArrLenM1 )*4
				const temp1 = ((y-czp.Y0)*(czp.Z1-czp.Z0)+z-czp.Z0)*4
				for (let col = 0; col < 4; col+=1) {
					pixels[temp1+col] = ColArray[temp0+col];
				}
			}
		}
		const canv = element.querySelector('#X'+x).getContext("2d")
		canv.putImageData(new ImageData(new Uint8ClampedArray(pixels.buffer),(czp.Z1-czp.Z0),(czp.Y1-czp.Y0)), 0, 0);
		// canv.fillStyle = '#000'
		// canv.fillRect(0,0,30,12)
		// canv.fillStyle = '#fff';
		// canv.fontSize = "20px Arial";
		// canv.textBaseline = 'top';
		// canv.fillText(`X${x}`, 1, 1);
	}

	for (let y = czp.Y0; y < czp.Y1; y++) {
		let pixels = new Uint8Array((czp.X1-czp.X0)*(czp.Z1-czp.Z0)*4);
		for (let z = czp.Z0; z < czp.Z1; z++) {
			for (let x = czp.X0; x < czp.X1; x++) {
				const temp0 = Math.round( (window.zone3Ddata[z][y][x]-min)/delta*vpArrLenM1 )*4
				const temp1 = ((z-czp.Z0)*(czp.X1-czp.X0)+x-czp.X0)*4
				for (let col = 0; col < 4; col+=1) {
					pixels[temp1+col] = ColArray[temp0+col];
				}
			}
		}
		const canv = element.querySelector('#Y'+y).getContext("2d")
		canv.putImageData(new ImageData(new Uint8ClampedArray(pixels.buffer),(czp.X1-czp.X0),(czp.Z1-czp.Z0)), 0, 0);
		// canv.fillStyle = '#000'
		// canv.fillRect(0,0,30,12)
		// canv.fillStyle = '#fff';
		// canv.fontSize = "20px Arial";
		// canv.textBaseline = 'top';
		// canv.fillText(`Y${y}`, 1, 1);
	}

	for (let z = czp.Z0; z < czp.Z1; z++) {
		let pixels = new Uint8Array((czp.X1-czp.X0)*(czp.Y1-czp.Y0)*4);
		for (let y = czp.Y0; y < czp.Y1; y++) {
			for (let x = czp.X0; x < czp.X1; x++) {
				const temp0 = Math.round( (window.zone3Ddata[z][y][x]-min)/delta*vpArrLenM1 )*4
				const temp1 = ((y-czp.Y0)*(czp.X1-czp.X0)+x-czp.X0)*4
				for (let col = 0; col < 4; col+=1) {
					pixels[temp1+col] = ColArray[temp0+col];
				}
			}
		}
		const canv = element.querySelector('#Z'+z).getContext("2d")
		canv.putImageData(new ImageData(new Uint8ClampedArray(pixels.buffer),(czp.X1-czp.X0),(czp.Y1-czp.Y0)), 0, 0);
		// canv.fillStyle = '#000'
		// canv.fillRect(0,0,30,12)
		// canv.fillStyle = '#fff';
		// canv.fontSize = "20px Arial";
		// canv.textBaseline = 'top';
		// canv.fillText(`Z${z}`, 1, 1);
	}

	consoleOut(`updateBlock3D CPU need time: ${Date.now() - tempDate} ms`)
}

// unstable, and have some problems, dont use
function updateBlock3D_GPU(element = Block3Delement) {
	// const czp = window.zone3Dparams.ChoseZoneParams;
	const newXsize = window.zone3Dparams.ChoseZoneParams.X1-window.zone3Dparams.ChoseZoneParams.X0;
	const newYsize = window.zone3Dparams.ChoseZoneParams.Y1-window.zone3Dparams.ChoseZoneParams.Y0;
	const newZsize = window.zone3Dparams.ChoseZoneParams.Z1-window.zone3Dparams.ChoseZoneParams.Z0;

	if ( (newYsize) < 1 || (newXsize) < 1 || (newZsize) < 1) {throw 'too small area to show'; return;}

	const tempDate = Date.now()

	const vpArrLen = 1000;
	const vpArrLenM1 = (vpArrLen-1);

	const params = getColArrayFromParams(window.zone3Dparams.VisParams)
	const ColArray = params.colArray;
	
	const min = params.min;
	const delta = params.max - params.min;

	const getColArrayIngexes = gpu.createKernel(function(data,min,delta,lenM1) {
		return  Math.round((data[this.thread.z][this.thread.y][this.thread.x]-min)/delta*lenM1)*4
	}, { output: [newXsize,newYsize,newZsize] })


	const ColArrayIngexes = getColArrayIngexes(
		getCutedZone3DdataByChoseZoneParams(window.zone3Ddata,window.zone3Dparams.ChoseZoneParams),
		min,delta,vpArrLenM1
	)

	// console.log(ColArrayIngexes,min,delta,vpArrLenM1)

	for (let x = 0; x < newXsize; x++) {
		let pixels = new Uint8Array(newYsize*newZsize*4);
		for (let y = 0; y < newYsize; y++) {
			for (let z = 0; z < newZsize; z++) {
				const temp1 = (y*newZsize+z)*4
				for (let col = 0; col < 4; col+=1) {
					pixels[temp1+col] = ColArray[ColArrayIngexes[z][y][x]+col];
				}
			}
		}
		element.querySelector(`#X${x+window.zone3Dparams.ChoseZoneParams.X0}`).getContext("2d").putImageData(new ImageData(new Uint8ClampedArray(pixels.buffer),newZsize,newYsize), 0, 0);
	}

	for (let y = 0; y < newZsize; y++) {
		let pixels = new Uint8Array(newXsize*newZsize*4);
		for (let z = 0; z < newZsize; z++) {
			for (let x = 0; x < newXsize; x++) {
				const temp1 = (z*newXsize+x)*4
				for (let col = 0; col < 4; col+=1) {
					pixels[temp1+col] = ColArray[ColArrayIngexes[z][y][x]+col];
				}
			}
		}
		element.querySelector(`#Y${y+window.zone3Dparams.ChoseZoneParams.Y0}`).getContext("2d").putImageData(new ImageData(new Uint8ClampedArray(pixels.buffer),newXsize,newZsize), 0, 0);

	}

	for (let z = 0; z < newZsize; z++) {
		let pixels = new Uint8Array(newXsize*newYsize*4);
		for (let y = 0; y < newYsize; y++) {
			for (let x = 0; x < newXsize; x++) {
				const temp1 = (y*newXsize+x)*4
				for (let col = 0; col < 4; col+=1) {
					pixels[temp1+col] = ColArray[ColArrayIngexes[z][y][x]+col];
				}
			}
		}
		element.querySelector(`#Z${z+window.zone3Dparams.ChoseZoneParams.Z0}`).getContext("2d").putImageData(new ImageData(new Uint8ClampedArray(pixels.buffer),newXsize,newYsize), 0, 0);
	}

	consoleOut(`updateBlock3D GPU need time: ${Date.now() - tempDate} ms`)
}

// stable but i am not shure
function updateBlock3D_GPU_1(element = Block3Delement) {
	// const czp = window.zone3Dparams.ChoseZoneParams;
	const newXsize = window.zone3Dparams.ChoseZoneParams.X1-window.zone3Dparams.ChoseZoneParams.X0;
	const newYsize = window.zone3Dparams.ChoseZoneParams.Y1-window.zone3Dparams.ChoseZoneParams.Y0;
	const newZsize = window.zone3Dparams.ChoseZoneParams.Z1-window.zone3Dparams.ChoseZoneParams.Z0;
	const newXsizeM1 = newXsize-1;
	const newYsizeM1 = newYsize-1;
	const newZsizeM1 = newZsize-1;	

	if ( (newYsize) < 1 || (newXsize) < 1 || (newZsize) < 1) {throw 'too small area to show'; return;}

	const tempDate = Date.now()

	const vpArrLen = 1000;

	const vpArrLen4 = vpArrLen*4;
	
	const params = getColArrayFromParams(window.zone3Dparams.VisParams,true)
	const tempval = (vpArrLen-1)/(params.max - params.min);
	
	// const temp_zone = getCutedZone3DdataByChoseZoneParams(window.zone3Ddata,window.zone3Dparams.ChoseZoneParams)

	const czp = window.zone3Dparams.ChoseZoneParams;

	//--------------------------------------------------------------
	const tempTimeZstart = Date.now();
	const gpuZ = new GPU({
		context: createElement('canvas',{width: newXsize, height: newYsize}).getContext('webgl2', { premultipliedAlpha: false })
	});
	
	const renderZslice = gpuZ.createKernel(function(Zslice,ColArray,min,delta_lenM1,len_4,Ysize) {
		var temp = Math.round((Zslice[Ysize-this.thread.y][this.thread.x]-min)*delta_lenM1)*4
		if (temp >= 0 && temp <= len_4) {
			this.color(ColArray[temp], ColArray[temp+1], ColArray[temp+2], ColArray[temp+3]);
		} else {
			this.color(0,0,1,0);
		}
	},{output: [newXsize,newYsize], graphical: true })

	for (let z = 0; z < newZsize; z++) {
		renderZslice(
			window.zone3Ddata[z+czp.Z0].slice(czp.Y0,czp.Y1).map(b=>b.slice(czp.X0,czp.X1)),
			params.colArray, 
			params.min, 
			tempval,
			vpArrLen4,
			newYsizeM1
		)
		element
		.querySelector(`#Z${z+czp.Z0}`)
		.getContext("2d")
		.putImageData(new ImageData(renderZslice.getPixels() ,newXsize,newYsize), 0, 0);
	}
	//--------------------------------------------------------------
	const tempTimeXstart = Date.now();
	const gpuX = new GPU({
		context: createElement('canvas',{width: newZsize, height: newYsize}).getContext('webgl2', { premultipliedAlpha: false })
	});
	
	const renderXslice = gpuX.createKernel(function(Xslice,ColArray,min,delta_lenM1,len_4,Ysize) {
		var temp = Math.round((Xslice[this.thread.x][Ysize-this.thread.y]-min)*delta_lenM1)*4
		if (temp >= 0 && temp <= len_4) {
			this.color(ColArray[temp], ColArray[temp+1], ColArray[temp+2], ColArray[temp+3]);
		} else {
			this.color(0,1,0,0);
		}
		
	},{output: [newZsize,newYsize], graphical: true })

	for (let x = 0; x < newXsize; x++) {
		renderXslice(
			window.zone3Ddata.slice(czp.Z0,czp.Z1).map(a=>a.slice(czp.Y0,czp.Y1).map(b=>b[x+czp.X0])),
			params.colArray, 
			params.min, 
			tempval,
			vpArrLen4,
			newYsizeM1
		)
		element
		.querySelector(`#X${x+czp.X0}`)
		.getContext("2d")
		.putImageData(new ImageData(renderXslice.getPixels() ,newZsize,newYsize), 0, 0);
	}
	//--------------------------------------------------------------
	const tempTimeYstart = Date.now();
	const gpuY = new GPU({
		context: createElement('canvas',{width: newXsize, height: newZsize}).getContext('webgl2', { premultipliedAlpha: false })
	});
	
	const renderYslice = gpuY.createKernel(function(Yslice,ColArray,min,delta_lenM1,len_4,Zsize) {
		var temp = Math.round((Yslice[Zsize-this.thread.y][this.thread.x]-min)*delta_lenM1)*4
		if (temp >= 0 && temp <= len_4) {
			this.color(ColArray[temp], ColArray[temp+1], ColArray[temp+2], ColArray[temp+3]);
		} else {
			this.color(0,1,0,0);
		}
		
	},{output: [newXsize,newZsize], graphical: true })

	for (let y = 0; y < newYsize; y++) {
		renderYslice(
			window.zone3Ddata.slice(czp.Z0,czp.Z1).map(a=>a[y+czp.Y0].slice(czp.X0,czp.X1)),
			params.colArray, 
			params.min, 
			tempval,
			vpArrLen4,
			newZsizeM1
		)
		element
		.querySelector(`#Y${y+czp.Y0}`)
		.getContext("2d")
		.putImageData(new ImageData(renderYslice.getPixels() ,newXsize,newZsize), 0, 0);
	}


	consoleOut(`X: ${tempTimeYstart-tempTimeXstart}ms, Y: ${Date.now()-tempTimeYstart}ms, Z: ${tempTimeXstart-tempTimeZstart}ms,`)
	consoleOut(`updateBlock3D GPU need time: ${Date.now() - tempDate} ms`)
}

let updateBlock3D = updateBlock3D_GPU_1;

function getCutedZone3DdataByChoseZoneParams(data,czp) {
	return data.slice(czp.Z0,czp.Z1).map(a=>a.slice(czp.Y0,czp.Y1).map(b=>b.slice(czp.X0,czp.X1)))
}

function updateZone3DbyChangingVisParams() {
	consoleOut('updateZone3DbyChangingVisParams')
	window.zone3Dparams.VisParams = getVisParams();
	updateBlock3D()
}

function updateZone3DbyChangingChoseZoneParams() {
	consoleOut('updateZone3DbyChangingChoseZoneParams')
	window.zone3Dparams.ChoseZoneParams = getChoseZone();
	removeBlock3D()
	initBlock3D()
	updateBlock3D()
	const czp = window.zone3Dparams.ChoseZoneParams;
	CutBlockelement.style.transform = `translate3d(${window.zone3Dparams.X/2-(czp.X1+czp.X0)/2}px,${window.zone3Dparams.Y/2-(czp.Y1+czp.Y0)/2}px,${(czp.Z1+czp.Z0)/2-window.zone3Dparams.Z/2}px)`
}

function calcBlock3D(data,params,element = Block3Delement) {
	window.zone3Ddata = data;
	window.zone3Dparams = params;

	initChoseZone(
		window.zone3Dparams.X,
		window.zone3Dparams.Y,
		window.zone3Dparams.Z
	)
	setChoseZone(window.zone3Dparams.ChoseZoneParams)
	const czp = window.zone3Dparams.ChoseZoneParams;
	CutBlockelement.style.transform = `translate3d(${window.zone3Dparams.X/2-(czp.X1+czp.X0)/2}px,${window.zone3Dparams.Y/2-(czp.Y1+czp.Y0)/2}px,${(czp.Z1+czp.Z0)/2-window.zone3Dparams.Z/2}px)`

	setVisParams(
		window.zone3Dparams.VisParams,
		window.zone3Dparams.min,
		window.zone3Dparams.max
	)

	initHideLayers(
		window.zone3Dparams.X,
		window.zone3Dparams.Y,
		window.zone3Dparams.Z
	);
	setHideLayers({
		X0: 0, X1: window.zone3Dparams.X, 
		Y0: 0, Y1: window.zone3Dparams.Y, 
		Z0: 0, Z1: window.zone3Dparams.Z
	})

	removeBlock3D(element);
	initBlock3D(element);
	updateBlock3D(element);
}

