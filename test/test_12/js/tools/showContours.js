const showContoursElement = document.querySelector('#showContours')

window.currentZoneIsConturelines = false;
window.TempImage = null; //тут буде зображення коли відображено контур
window.TempImageZoneParams = null;

function initShowContours(min,max,element = showContoursElement) {
	element.querySelectorAll('#allowInMin > input').forEach(a=>{ a.min = min; a.max = max; a.value = min;})
	element.querySelectorAll('#allowInMax > input').forEach(a=>{ a.min = min; a.max = max; a.value = max;})
}

function initShowContoursEvents(element = showContoursElement) {
	initTool(element);
	
	element.querySelector('#showConturesButton').addEventListener('click', ()=>{
		const tempParams = getShowContours();
		let currentZone3Ddata = null;
		let czp = null;

		if ( !window.currentZoneIsConturelines ) {
			window.currentZoneIsConturelines = true;

			currentZone3Ddata = getCutedZone3DdataByChoseZoneParams(window.zone3Ddata,window.zone3Dparams.ChoseZoneParams);
			czp = window.zone3Dparams.ChoseZoneParams;

			window.TempImage = window.zone3Ddata;
			window.TempImageZoneParams = window.zone3Dparams;
		} else {
			currentZone3Ddata = getCutedZone3DdataByChoseZoneParams(window.TempImage,window.TempImageZoneParams.ChoseZoneParams);
			czp = window.TempImageZoneParams.ChoseZoneParams;
		}

		const tempDate = Date.now()

		const calc = gpu.createKernel(function(data,X,Y,Z,M,ml,min,max) {
			var x = 0;
			var y = 0;
			var z = 0;
			var temp = Math.round(ml/2)
			if (data[this.thread.z+temp][this.thread.y+temp][this.thread.x+temp] > max || data[this.thread.z+temp][this.thread.y+temp][this.thread.x+temp] < min) {return 0}
			for (var i = 0; i < ml; i++) {
				for (var j = 0; j < ml; j++) {
					for (var k = 0; k < ml; k++) {
						x+=data[this.thread.z+k][this.thread.y+j][this.thread.x+i]*M[i];
						y+=data[this.thread.z+k][this.thread.x+j][this.thread.x+j]*M[i];
						z+=data[this.thread.z+i][this.thread.y+k][this.thread.x+j]*M[i];
					}	
				}
			}
			return Math.sqrt(x*x+y*y+z*z)	
		}, { output: [(czp.X1-czp.X0)-tempParams.detalised*2,(czp.Y1-czp.Y0)-tempParams.detalised*2,(czp.Z1-czp.Z0)-tempParams.detalised*2]})

		const analRes = calc(
			currentZone3Ddata,
			(czp.X1-czp.X0),
			(czp.Y1-czp.Y0),
			(czp.Z1-czp.Z0),
			tempParams.detArr,
			tempParams.detalised*2,
			tempParams.allowInMin,
			tempParams.allowInMax
		);
		calc.destroy()
		consoleOut(`calcContours need time: ${Date.now() - tempDate} ms`)
		const analMax = analRes.map(aaa=>aaa.map(aa=>aa.reduce((a,b)=>(b>a?b:a))).reduce((a,b)=>(b>a?b:a)) ).reduce((a,b)=>(b>a?b:a))

		calcBlock3D(
			analRes,
			{
				X: (czp.X1-czp.X0)-tempParams.detalised*2,
				Y: (czp.Y1-czp.Y0)-tempParams.detalised*2, 
				Z: (czp.Z1-czp.Z0)-tempParams.detalised*2, 
				min: 0, 
				max: Math.ceil(analMax), 
				VisParams: [
					{min: 0, max: Math.ceil(analMax), gradient: true, rgba0: [255, 255, 0, 0], rgba1: [255, 0, 0, 255]},
					// for mode one good is 200 - 6000 
					// {min: 600, max: Math.ceil(analMax), gradient: true, rgba0: [255, 255, 255, 255], rgba1: [0, 0, 20, 0]}
				],
				ChoseZoneParams: {
					visible: false, 
					X0: 0, X1: (czp.X1-czp.X0)-tempParams.detalised*2, 
					Y0: 0, Y1: (czp.Y1-czp.Y0)-tempParams.detalised*2, 
					Z0: 0, Z1: (czp.Z1-czp.Z0)-tempParams.detalised*2
				}
			}
		)
	})

	element.querySelector('#returnToImageButton').addEventListener('click', ()=>{
		if (window.currentZoneIsConturelines) {
			window.currentZoneIsConturelines = false;

			calcBlock3D(
				window.TempImage,
				window.TempImageZoneParams
			)

			window.TempImage = null;
			window.TempImageZoneParams = null;
		}
	})	
}

function getShowContours(element = showContoursElement) {
	res = {}

	const names = ['detalised','allowInMin','allowInMax']
	names.forEach(n=>{
		res[n] = parseInt( element.querySelector(`#${n} > input[type=number]`).value )
	})

	if (res['detalised'] > 4 || res['detalised'] < 1) {
		consoleOut(`wrong detalised lines value it must be >=1 and <=4\nyou give ${n}`)
		throw `wrong detalised lines value it must be >=1 and <=4\nyou give ${n}`;  
	}

	res['detArr'] = new Float32Array(res['detalised']*2)

	for (let i = 1; i <= res['detalised']; i++) {
		res['detArr'][res['detalised']-i] = -i;
		res['detArr'][res['detalised']-1+i] = i
	}

	return res
}

function setShowContours(params,element = showContoursElement) {
	res = {}

	const names = ['detalised','allowInMin','allowInMax']
	names.forEach(n=>{
		element.querySelector(`#${n} > input`).forEach(i=>{
			i.value = Math.min(Math.max( params[n] ,parseInt(i.min)),parseInt(i.max)) 
		})
	})
}