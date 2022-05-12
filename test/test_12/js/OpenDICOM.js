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
		posf = (x,y,z,X,Y,Z)=>((Z-z)+y*Z+x*Y*Z);
	} else if (axName === 'Y') {
		posf = (y,z,x,Y,X,Z)=>(x+(Z-z)*X+y*X*Z);
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

// hideElement(document.getElementById("fileInfo").querySelectorAll(".hideTool")[0])
// hideElement(document.getElementById("visParams").querySelectorAll(".hideTool")[0])
hideElement(document.getElementById("histogram").querySelectorAll(".hideTool")[0])
hideElement(document.getElementById("choseZone").querySelectorAll(".hideTool")[0])
hideElement(document.getElementById("settings").querySelectorAll(".hideTool")[0])

window.image = {}

document.getElementById('oneDicomFile').addEventListener('change', c => {
	draw_preloader()

    c.target.files[0].arrayBuffer().then(f=>{
    	let image = daikon.Series.parseImage(new DataView(f))
		window.image['pixels'] = new Int16Array(image.getInterpretedData())
		// console.log(window.image['pixels'])

		const X = image.getCols();
		const Y = image.getRows();
		const Z = Math.floor(window.image['pixels'].length/X/Y);
		const min = window.image['pixels'].reduce((a,b)=>(b<a?b:a));
		const max = window.image['pixels'].reduce((a,b)=>(b>a?b:a));

		window.image['X'] = X;
		window.image['Y'] = Y;
		window.image['Z'] = Z;
		window.image['min'] = min;
		window.image['max'] = max;

		document.querySelectorAll("#visParams .slider > input").forEach(el=>{
			el.min = min;
			el.max = max;
			if (el.className == 'visParamsMax') {
				el.value = max;
			} else {
				el.value = min;
			}
		})

		// console.log(getVisParams(),window.image['min'],window.image['max'])
		const ColArray = getColArrayFromParams(getVisParams(),window.image['min'],window.image['max']);
		// console.log(ColArray)

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
				
		initLayer(canvBlock,window.image['pixels'],'X',(A,a)=>`rotateY(90deg) translateZ(${Math.floor(A/2-a)}px)` ,X,Y,Z)
		initLayer(canvBlock,window.image['pixels'],'Y',(A,a)=>`rotateX(-90deg) translateZ(${Math.floor(A/2-a)}px)`,Y,Z,X)
		initLayer(canvBlock,window.image['pixels'],'Z',(A,a)=>`translateZ(${Math.floor(A/2-a)}px)`                ,Z,X,Y)
		
		upgradeLayer(canvBlock,window.image['pixels'],'X',X,Y,Z,min,max-min,ColArray)
		upgradeLayer(canvBlock,window.image['pixels'],'Y',Y,Z,X,min,max-min,ColArray)
		upgradeLayer(canvBlock,window.image['pixels'],'Z',Z,X,Y,min,max-min,ColArray)

		remove_preloader()

	})
});