document.querySelectorAll(".hideTool").forEach(el=>{
	el.addEventListener('click', c=>{
		let toolBody = el.parentNode.parentNode.getElementsByClassName("toolBody")[0]
		if (toolBody.style.display === "") {
			toolBody.style.display = "none";
			el.textContent = "▼";
		} else if (toolBody.style.display === "none")  {
			toolBody.style.display = "";
			el.textContent = "▲";
		} else {
			console.log('Error toolBody.style.display value')
		}
	})
})

document.querySelectorAll(".hideToolPart").forEach(el=>{
	el.addEventListener('click', c=>{
		let toolBody = el.parentNode.parentNode.getElementsByClassName("toolPartBody")[0]
		if (toolBody.style.display === "") {
			toolBody.style.display = "none";
			el.textContent = "▼";
		} else if (toolBody.style.display === "none")  {
			toolBody.style.display = "";
			el.textContent = "▲";
		} else {
			console.log('Error toolPartBody.style.display value')
		}
	})
})

document.getElementById("toolPartAdd").addEventListener('click', c=>{
	let toolBody = c.target.parentNode.getElementsByClassName("toolPartBody")[0]
})

// open file --------------------------------------

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

function upgradeLayer(Block3D,data,axName,A,B,C,min,delta,showMin,showMax,nc,ago=1) {
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
				const px = (c*B+b)*4;
				const temp = data[posf(a,b,c,A,B,C)]
				if (temp >= showMin && temp <= showMax) {
					// pixels[px+nc] = pixels[px+3] = Math.round( (temp-min)/delta*255 );
					pixels[px] = pixels[px+1] = pixels[px+2] = pixels[px+3] = Math.round( (temp-min)/delta*255 );
				}
			}
		}
		ctx.putImageData(new ImageData(pixels,B,C), 0, 0);
	}
}



document.getElementById('oneDicomFile').addEventListener('change', c => {
	draw_preloader()
    c.target.files[0].arrayBuffer().then(f=>{
    	let image = daikon.Series.parseImage(new DataView(f))
		// console.log(image.hasPixelData(),image)
		window.imagePx = new Int16Array(image.getInterpretedData())
		console.log(window.imagePx)

		const X = image.getCols();
		const Y = image.getRows();
		const Z = Math.floor(window.imagePx.length/X/Y);
		const min = window.imagePx.reduce((a,b)=>(b<a?b:a));
		const max = window.imagePx.reduce((a,b)=>(b>a?b:a));

		const FileInfo = {
			"xSize": `X: ${X} px`,
			"ySize": `Y: ${Y} px`,
			"zSize": `Z: ${Z} px`,
			"minDensity": `min density: ${min}`,
			"maxDensity": `max density: ${max}`,
			"usedMemoryMiB": `RAM used for image: ${Math.round(1000*window.imagePx.length*2/1024/1024)/1000} MiB`,
		}

		for (let i in FileInfo) {
			document.getElementById(i).textContent = FileInfo[i];
		}

		let canvBlock = document.getElementById("block3d");
		canvBlock.style.width = `${X}px`;
		canvBlock.style.height = `${Y}px`;

		let temp = Date.now()
		
		initLayer(canvBlock,window.imagePx,'Z',(A,a)=>`translateZ(${Math.floor(A/2-a)}px)`,Z,X,Y)
		upgradeLayer(canvBlock,window.imagePx,'Z',Z,X,Y,min,max-min,min,max,0)
		
		console.log('Z layers placed, time used:',Date.now()-temp)
		temp = Date.now()

		initLayer(canvBlock,window.imagePx,'X',(A,a)=>`rotateY(90deg) translateZ(${Math.floor(A/2-a)}px)`,X,Y,Z)
		upgradeLayer(canvBlock,window.imagePx,'X',X,Y,Z,min,max-min,min,max,1)

		console.log('X layers placed, time used:',Date.now()-temp)
		temp = Date.now()

		initLayer(canvBlock,window.imagePx,'Y',(A,a)=>`rotateX(-90deg) translateZ(${Math.floor(A/2-a)}px)`,Y,Z,X)
		upgradeLayer(canvBlock,window.imagePx,'Y',Y,Z,X,min,max-min,min,max,2)

		console.log('Y layers placed, time used:',Date.now()-temp)
		temp = Date.now()

		console.log('done')
		remove_preloader()

	})
});


let diapazone_settings = [
	{min: 200, max: 400, status: 'show'},
	{min: 200, max: 400, status: 'hide'},
]