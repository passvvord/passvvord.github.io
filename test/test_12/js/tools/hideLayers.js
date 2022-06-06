const hideLayersElement = document.querySelector('#hideLayers')

function initHideLayers(Xsize,Ysize,Zsize,element = hideLayersElement) {
	initTool(element);

	element.querySelectorAll('.hideLayersX0, .hideLayersX1').forEach(a=>{ a.min = 0; a.max = Xsize; })
	element.querySelectorAll('.hideLayersY0, .hideLayersY1').forEach(a=>{ a.min = 0; a.max = Ysize; })
	element.querySelectorAll('.hideLayersZ0, .hideLayersZ1').forEach(a=>{ a.min = 0; a.max = Zsize; })

	const names = ['X0','X1','Y0','Y1','Z0','Z1'];

	names.forEach(a=>{
		// element.querySelector(`.hideLayers${a}[type=range]`).addEventListener('mousemove',mm=>{
		// 	if (mm.buttons === 1) {
		// 		renderHideLalers(a);
		// 	}
		// })
		// element.querySelector(`.hideLayers${a}[type=range]`).addEventListener('touchmove',tm=>{
		// 	renderHideLalers(a);
		// })
		// element.querySelector(`.hideLayers${a}[type=number]`).addEventListener('keyup',kp=>{
		// 	renderHideLalers(a);
		// })

		addOnChangeFunctionOnSlider(
			element.querySelector(`.hideLayers${a}`).parentElement,
			(val)=>{renderHideLalers(a)}
		)
	})
}

const renderHideLayersPart = (min,max,value,noneFunc,axName,el)=>{
	// console.log(el)
	for (let i = min; i < max; i++) {
		// console.log(`try to hide #${axName}${i}`)
		const temp = el.querySelector(`#${axName}${i}`)
		if (temp) {
			if (noneFunc(i,value)) {
				temp.style.setProperty('display','none')
		// console.log(`try to hide #${axName}${i}`)
				
			} else {
				temp.style.setProperty('display','')
			}
		}
	}
}

function renderHideLalers(whoIsChanged,elWithLayers = document.querySelector('#block3d')) {
	const currentHideLayers = getHideLayers();
	const currentZone = window.zone3Dparams.ChoseZoneParams;//{'X0':0,'X1':window.image['X'],'Y0':0,'Y1':window.image['Y'],'Z0':0,'Z1':window.image['Z']}//getZone3D();
	// console.log(currentHideLayers,currentZone,elWithLayers)
	switch (whoIsChanged) {
		case 'X0': renderHideLayersPart(currentZone['X0']      ,currentHideLayers['X1'],currentHideLayers['X0'],(i,val)=>i<val,'X',elWithLayers); break;
		case 'X1': renderHideLayersPart(currentHideLayers['X0'],currentZone['X1']      ,currentHideLayers['X1'],(i,val)=>i>val,'X',elWithLayers); break;
		case 'Y0': renderHideLayersPart(currentZone['Y0']      ,currentHideLayers['Y1'],currentHideLayers['Y0'],(i,val)=>i<val,'Y',elWithLayers); break;
		case 'Y1': renderHideLayersPart(currentHideLayers['Y0'],currentZone['Y1']      ,currentHideLayers['Y1'],(i,val)=>i>val,'Y',elWithLayers); break;
		case 'Z0': renderHideLayersPart(currentZone['Z0']      ,currentHideLayers['Z1'],currentHideLayers['Z0'],(i,val)=>i<val,'Z',elWithLayers); break;
		case 'Z1': renderHideLayersPart(currentHideLayers['Z0'],currentZone['Z1']      ,currentHideLayers['Z1'],(i,val)=>i>val,'Z',elWithLayers); break;
		default: throw `wrong whoIsChanged value\n you are trying to set ${whoIsChanged}\n but it must be one from ['X0','X1','Y0','Y1','Z0','Z1']`; break;
	}
}

function getHideLayers(element = hideLayersElement) {
	let res = {}

	const names = ['X0','X1','Y0','Y1','Z0','Z1'];
	names.forEach(a=>{
		const el = element.querySelector(`.hideLayers${a}[type=number]`)
		res[a] = Math.min(Math.max( parseInt(el.value) ,parseInt(el.min)),parseInt(el.max))
	})

	return res
}

function setHideLayers(params,element = hideLayersElement) {
	const names = ['X0','X1','Y0','Y1','Z0','Z1'];
	names.forEach(a=>{
		element.querySelectorAll(`.hideLayers${a}`).forEach(b=>{
			const temp = Math.min(Math.max( params[a] ,parseInt(b.min)),parseInt(b.max))
			b.value = temp;
		})
		renderHideLalers(a);
	})
}