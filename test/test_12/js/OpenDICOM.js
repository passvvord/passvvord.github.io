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
		document.body.className = '';
		window.fullscreen = false;
	} else {
		openFullscreen();
		document.body.className = 'fullscreen3dzone';
		window.fullscreen = true;
	}
})

document.querySelector('#box3d').addEventListener('dblclick', c=>{

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

const gpu = new GPU();

// const posX = gpu.createKernel(function(x,z,y,X,Z,Y) {return x+y*X+(Z-1-z)*X*Y})
// const posY = gpu.createKernel(function(y,x,z,Y,X,Z) {return x+(Y-1-y)*X+z*X*Y})
// const posZ = gpu.createKernel(function(z,x,y,Z,X,Y) {return x+y*X+z*X*Y      })





// const calcXLayer = gpu.createKernel(function(data,x,X,Z,Y,min,delta,colArray) {
// 	const colIndex = Math.round( (data[x+(Y-1-this.thread.y)*X+(Z-1-this.thread.x)*X*Y]-min)/delta*255 )
// 	this.color(colArray[colIndex*4],colArray[colIndex*4+1],colArray[colIndex*4+2],colArray[colIndex*4+3])
// }, { output: [Z,Y], graphical: true })

// const calcYLayer = gpu.createKernel(function(data,y,Y,X,Z,min,delta,colArray) {
// 	const colIndex = Math.round( (data[this.thread.x+(Y-1-y)*X+(Y-1-this.thread.y)*X*Y]-min)/delta*255 )
// 	this.color(colArray[colIndex*4],colArray[colIndex*4+1],colArray[colIndex*4+2],colArray[colIndex*4+3])
// }, { output: [X,Z], graphical: true })

// const calcZLayer = gpu.createKernel(function(data,z,Z,X,Y,min,delta,colArray) {
// 	const colIndex = Math.round( (data[this.thread.x+(Y-1-this.thread.y)*X+z*X*Y]-min)/delta*255 )
// 	this.color(colArray[colIndex*4],colArray[colIndex*4+1],colArray[colIndex*4+2],colArray[colIndex*4+3])
// }, { output: [X,Y], graphical: true })

// kernel.destroy()

function upgradeLayer(Block3D,data,axName,A,B,C,min,delta,ColArray,ago=1) {
	let posf;
	if (axName === 'X') {
		posf = (x,z,y,X,Z,Y)=>(x+y*X+(Z-1-z)*X*Y);
	} else if (axName === 'Y') {
		posf = (y,x,z,Y,X,Z)=>(x+(Y-1-y)*X+z*X*Y);
	} else if (axName === 'Z') {
		posf = (z,x,y,Z,X,Y)=>(x+y*X+z*X*Y);
	}
	
	for (let a = 0; a < A; a+=ago) {
		let pixels = new Uint8Array(B*C*4);
		for (let c = 0; c < C; c++) {
			for (let b = 0; b < B; b++) {
				const temp = Math.round( (data[posf(a,b,c,A,B,C)]-min)/delta*255 )
				for (let col = 0; col < 4; col+=1) {
					pixels[(c*B+b)*4+col] = ColArray[temp*4+col];
				}
			}
		}
		document.getElementById(axName+a).getContext("2d").putImageData(new ImageData(new Uint8ClampedArray(pixels.buffer),B,C), 0, 0);
	}
}



// function upgradeLayer4(Block3D,data,X,Y,Z,min,delta,ColArray) {
// 	const temp_data = data.map(a=>(a-min)/delta*255);

// 	// for (let z = 0; z < Z; z+=1) {
// 	// 	// let pixelsX = new Uint8Array(Y*Z*4);
// 	// 	// let pixelsY = new Uint8Array(Z*X*4);
// 	// 	let pixelsZ = new Uint8Array(Y*X*4);
// 	// 	for (let y = 0; y < Y; y+=1) {
// 	// 		for (let x = 0; x < X; x+=1) {

// 	// 			// const tempX = (y*Z+z)*4;
// 	// 			// const tempY = (z*X+x)*4;
// 	// 			const tempZ = (y*X+x)*4;

// 	// 			// const temp1X = temp_data[(X-1-x)*Z*Y+y*Z+z]*4;
// 	// 			// const temp1Y = temp_data[y*X*Z+(Z-1-z)*X+x]*4;
// 	// 			const temp1Z = temp_data[z*X*Y+y*X+x]*4;

// 	// 			for (let col = 0; col < 4; col+=1) {
// 	// 				// pixelsX[tempX+col] = ColArray[temp1X+col];
// 	// 				// pixelsY[tempY+col] = ColArray[temp1Y+col];
// 	// 				pixelsZ[tempZ+col] = ColArray[temp1Z+col];
// 	// 				// pixelsX[tempZ+col] = ColArray[temp_data[x][z][y]*4+col];
// 	// 				// pixelsY[tempZ+col] = ColArray[temp_data[y][x][z]*4+col];
// 	// 				// pixelsZ[tempZ+col] = ColArray[temp_data[z][y][x]*4+col];
// 	// 			}
// 	// 		}
// 	// 	}
// 	// 	// document.getElementById('X'+z).getContext("2d").putImageData(new ImageData(new Uint8ClampedArray(pixelsX.buffer),Z,Y), 0, 0);
// 	// 	// document.getElementById('Y'+z).getContext("2d").putImageData(new ImageData(new Uint8ClampedArray(pixelsY.buffer),X,Z), 0, 0);
// 	// 	document.getElementById('Z'+z).getContext("2d").putImageData(new ImageData(new Uint8ClampedArray(pixelsZ.buffer),X,Y), 0, 0);
// 	// }


// 	for (let z = 0; z < Z; z+=1) {
// 		let pixelsZ = new Uint8Array(Y*X*4);
// 		for (let y = 0; y < Y; y+=1) {
// 			for (let x = 0; x < X; x+=1) {
// 				const tempZ = (y*X+x)*4;
// 				const temp1Z = temp_data[z*X*Y+y*X+x]*4;
// 				for (let col = 0; col < 4; col+=1) {
// 					pixelsZ[tempZ+col] = ColArray[temp1Z+col];
// 				}
// 			}
// 		}
// 		document.getElementById('Z'+z).getContext("2d").putImageData(new ImageData(new Uint8ClampedArray(pixelsZ.buffer),X,Y), 0, 0);
// 	}

// 	for (let x = 0; x < X; x+=1) {
// 		let pixelsX = new Uint8Array(Y*Z*4);
// 		for (let y = 0; y < Y; y+=1) {
// 			for (let z = 0; z < Z; z+=1) {
// 				const tempX = (y*Z+z)*4;
// 				const temp1X = temp_data[(X-1-x)*Z*Y+y*Z+z]*4;
// 				for (let col = 0; col < 4; col+=1) {
// 					pixelsZ[tempX+col] = ColArray[temp1X+col];
// 				}
// 			}
// 		}
// 		document.getElementById('X'+z).getContext("2d").putImageData(new ImageData(new Uint8ClampedArray(pixelsZ.buffer),Z,Y), 0, 0);
// 	}

// 	for (let y = 0; y < Y; y+=1) {
// 		let pixelsY = new Uint8Array(Z*X*4);
// 		for (let z = 0; z < Z; z+=1) {
// 			for (let x = 0; x < X; x+=1) {
// 				const tempY = (z*X+x)*4;
// 				const temp1Y = temp_data[y*X*Z+(Z-1-z)*X+x]*4;
// 				for (let col = 0; col < 4; col+=1) {
// 					pixelsY[tempY+col] = ColArray[temp1Y+col];
// 				}
// 			}
// 		}
// 		document.getElementById('Y'+z).getContext("2d").putImageData(new ImageData(new Uint8ClampedArray(pixelsY.buffer),X,Z), 0, 0);
// 	}
// }

// function upgradeLayer2(Block3D,data,axName,A,B,C,min,delta,ColArray,ago=1) {
// 	if (axName === 'X') {
// 		const calcXLayer = gpu.createKernel(function(data,x,X,Z,Y,min,delta,colArray) {
// 			const colIndex = Math.round( (data[Math.round(x+(Y-1-this.thread.y)*X+(Z-1-this.thread.x)*X*Y)]-min)/delta*255 )
// 			this.color(colArray[colIndex*4]/255,colArray[colIndex*4+1]/255,colArray[colIndex*4+2]/255,colArray[colIndex*4+3]/255)
// 		}, { output: [B,C], graphical: true })

// 		for (let a = 0; a < A; a+=ago) {
// 			calcXLayer(data,a,A,B,C,min,delta,ColArray);
// 			document.getElementById(axName+a).getContext("2d").putImageData(new ImageData(calcXLayer.getPixels(),B,C), 0, 0);
// 		}
// 		calcXLayer.destroy();
// 	} else if (axName === 'Y') {
// 		const calcYLayer = gpu.createKernel(function(data,y,Y,X,Z,min,delta,colArray) {
// 			const colIndex = Math.round( (data[Math.round(this.thread.x+(Y-1-y)*X+(Y-1-this.thread.y)*X*Y)]-min)/delta*255 )
// 			this.color(colArray[colIndex*4]/255,colArray[colIndex*4+1]/255,colArray[colIndex*4+2]/255,colArray[colIndex*4+3]/255)
// 		}, { output: [B,C], graphical: true })

// 		for (let a = 0; a < A; a+=ago) {
// 			calcYLayer(data,a,A,B,C,min,delta,ColArray);
// 			document.getElementById(axName+a).getContext("2d").putImageData(new ImageData(calcYLayer.getPixels(),B,C), 0, 0);
// 		}
// 		calcYLayer.destroy();
// 	} else if (axName === 'Z') {
// 		const calcZLayer = gpu.createKernel(function(data,z,Z,X,Y,min,delta,colArray) {
// 			const colIndex = Math.round( (data[Math.round(this.thread.x+(Y-1-this.thread.y)*X+z*X*Y)]-min)/delta*255 )
// 			this.color(colArray[colIndex*4]/255,colArray[colIndex*4+1]/255,colArray[colIndex*4+2]/255,colArray[colIndex*4+3]/255)
// 		}, { output: [B,C], graphical: true })

// 		for (let a = 0; a < A; a+=ago) {
// 			calcZLayer(data,a,A,B,C,min,delta,ColArray);
// 			document.getElementById(axName+a).getContext("2d").putImageData(new ImageData(calcZLayer.getPixels(),B,C), 0, 0);
// 		}
// 		calcZLayer.destroy();
// 	}
// }

// function upgradeLayer3(Block3D,data,axName,A,B,C,min,delta,ColArray,ago=1) {
// 	if (axName === 'X') {
// 		// const calcXLayer = gpu.createKernel(function(data,x,X,Z,Y,min,delta,colArray) {
// 		// 	const colIndex = Math.round( (data[Math.round(x+(Y-1-this.thread.y)*X+(Z-1-this.thread.x)*X*Y)]-min)/delta*255 )
// 		// 	this.color(colArray[colIndex*4]/255,colArray[colIndex*4+1]/255,colArray[colIndex*4+2]/255,colArray[colIndex*4+3]/255)
// 		// }, { output: [B,C], graphical: true })

// 		// for (let a = 0; a < A; a+=ago) {
// 		// 	calcXLayer(data,a,A,B,C,min,delta,ColArray);
// 		// 	document.getElementById(axName+a).getContext("2d").putImageData(new ImageData(calcXLayer.getPixels(),B,C), 0, 0);
// 		// }
// 		// calcXLayer.destroy();
// 	} else if (axName === 'Y') {
// 		// const calcYLayer = gpu.createKernel(function(data,y,Y,X,Z,min,delta,colArray) {
// 		// 	const colIndex = Math.round( (data[Math.round(this.thread.x+(Y-1-y)*X+(Y-1-this.thread.y)*X*Y)]-min)/delta*255 )
// 		// 	this.color(colArray[colIndex*4]/255,colArray[colIndex*4+1]/255,colArray[colIndex*4+2]/255,colArray[colIndex*4+3]/255)
// 		// }, { output: [B,C], graphical: true })

// 		// for (let a = 0; a < A; a+=ago) {
// 		// 	calcYLayer(data,a,A,B,C,min,delta,ColArray);
// 		// 	document.getElementById(axName+a).getContext("2d").putImageData(new ImageData(calcYLayer.getPixels(),B,C), 0, 0);
// 		// }
// 		// calcYLayer.destroy();
// 	} else if (axName === 'Z') {
// 		const calcZLayers = gpu.createKernel(function(data,Z,X,Y,min,delta,colArray) {

// 			// const colIndex = Math.round( (data[Math.floor(this.thread.y/4)+Math.floor(this.thread.y/4/X)*X+this.thread.x*X*Y]-min)/delta*255 )
						
// 			// const col = this.thread.y%4
// 			// const b = Math.floor(this.thread.y/4)
// 			// const c = Math.floor(this.thread.y/4/X)
			
// 			// const a = this.thread.x

// 			return colArray[Math.round( (data[Math.floor(this.thread.y/4)+Math.floor(this.thread.y/4/X)*X+this.thread.x*X*Y]-min)/delta*255 )*4 + this.thread.y%4]

// 		}, { output: [A,B*C*4] })

// 		calcZLayers(data,A,B,C,min,delta,ColArray).forEach((a,i)=>{
// 			console.log(i,a);
// 			document.getElementById(axName+a).getContext("2d").putImageData(new ImageData(new Uint8ClampedArray((new Uint8Array(a)).buffer),B,C), 0, 0);
// 		})

// 		calcZLayers.destroy();
// 	}
// }


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
	switch (math.multiply(rotateMatrix,[0,0,1]).map(a=>Math.abs(a)).reduce((a,c,i,A)=>(c>A[a]?i:a),0)) {
		case 0: document.getElementById('zone3d').setAttribute('style','--lX: auto;'); break;
		case 1: document.getElementById('zone3d').setAttribute('style','--lY: auto;'); break;
		case 2: document.getElementById('zone3d').setAttribute('style','--lZ: auto;'); break;
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

document.getElementById('zone3d').oncontextmenu = ()=>false;

document.getElementById('zone3d').addEventListener('mousemove',mm=>{
	if (Math.abs(mm.movementX)+Math.abs(mm.movementY) > 0) { // sometimes can be 0 mmX and 0 mmY
		if (mm.buttons === 1) { //LMB only
			const matrix = getNewMatrixAfterAnyRotate(
				get3DMatrixTransform(document.getElementById('block3d')),
				mm.movementX,
				mm.movementY,
				(mx,my)=>(Math.sqrt(mx*mx+my*my)/180)*math.pi
			);
			setLayersVisibilityByRotateMatrix(getRotationMatrixFromAllMatrix(matrix));
			document.querySelector('#zone3d > #block3d').style.transform = getMatrixFromArray(matrix);
			document.querySelector('#box3d').style.transform = getMatrixFromArray(noZoomMatrix(matrix));
		} else if (mm.buttons === 2) { //RMB only
			const matrix = getNewMatrixAfterOzRotate(
				get3DMatrixTransform(document.getElementById('block3d')),
				(mm.movementX/180)*math.pi*0.5
			);
			document.querySelector('#zone3d > #block3d').style.transform = getMatrixFromArray(matrix);
			document.querySelector('#box3d').style.transform = getMatrixFromArray(noZoomMatrix(matrix));
		}
	}
})

document.getElementById('zone3d').addEventListener('wheel',w=>{
	const matrix = getNewMatrixAfterZoom(
		get3DMatrixTransform(document.getElementById('block3d'))
		,1+w.deltaY/2000
	);
	document.querySelector('#zone3d > #block3d').style.transform = getMatrixFromArray(matrix);
	document.querySelector('#box3d').style.transform = getMatrixFromArray(noZoomMatrix(matrix));
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

		const matrix = getNewMatrixAfterAnyRotate(
			get3DMatrixTransform(document.getElementById('block3d')),
			tm.touches[0].screenX-window.oldTouches[0].screenX,
			tm.touches[0].screenY-window.oldTouches[0].screenY,
			(mx,my)=>(Math.sqrt(mx*mx+my*my)/180)*math.pi
		);
		setLayersVisibilityByRotateMatrix(getRotationMatrixFromAllMatrix(matrix));
		document.querySelector('#zone3d > #block3d').style.transform = getMatrixFromArray(matrix);
		document.querySelector('#box3d').style.transform = getMatrixFromArray(noZoomMatrix(matrix));

	} else if (Object.keys(tm.touches).length === 2 && Object.keys(window.oldTouches).length === 2) {

		const newDeltaVector = [tm.touches[0].screenX-tm.touches[1].screenX,tm.touches[0].screenY-tm.touches[1].screenY];
		const oldDeltaVector = [window.oldTouches[0].screenX-window.oldTouches[1].screenX,window.oldTouches[0].screenY-window.oldTouches[1].screenY];

		let matrix = getNewMatrixAfterZoom(
			get3DMatrixTransform(document.getElementById('block3d'))
			,1-1*(vec2DLen(newDeltaVector)-vec2DLen(oldDeltaVector))/500
		);
		matrix = getNewMatrixAfterOzRotate(
			matrix,
			2*vec2DsignBeetwen(oldDeltaVector,newDeltaVector)*vec2DangleBeetwen(oldDeltaVector,newDeltaVector)
		);
		document.querySelector('#zone3d > #block3d').style.transform = getMatrixFromArray(matrix);
		document.querySelector('#box3d').style.transform = getMatrixFromArray(noZoomMatrix(matrix));

	}
	window.oldTouches = tm.touches;
})

// hideElement(document.getElementById("fileInfo").querySelectorAll(".hideTool")[0])
// hideElement(document.getElementById("visParams").querySelectorAll(".hideTool")[0])
// hideElement(document.getElementById("histogram").querySelectorAll(".hideTool")[0])
// hideElement(document.getElementById("choseZone").querySelectorAll(".hideTool")[0])
// hideElement(document.getElementById("settings").querySelectorAll(".hideTool")[0])

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
		
		let temp = Date.now()

		upgradeLayer(canvBlock,window.image['pixels'],'X',X,Z,Y,ColArray['min'],ColArray['max']-ColArray['min'],ColArray['colArray'])
		upgradeLayer(canvBlock,window.image['pixels'],'Y',Y,X,Z,ColArray['min'],ColArray['max']-ColArray['min'],ColArray['colArray'])
		upgradeLayer(canvBlock,window.image['pixels'],'Z',Z,X,Y,ColArray['min'],ColArray['max']-ColArray['min'],ColArray['colArray'])
		// console.log('XYZ rendered, need time:')
		console.log('XYZ rendered, need time:',Date.now()-temp)

		initChoseZone(ChoseZoneElement,X,Y,Z)
		setChoseZone(ChoseZoneElement,{
			visible: false, X0: 0, X1: X, Y0: 0, Y1: Y, Z0: 0, Z1: Z,
		})

		setLayersVisibilityByRotateMatrix([[1,0,0],[0,1,0],[0,0,1]]);

		remove_preloader()

	})
});