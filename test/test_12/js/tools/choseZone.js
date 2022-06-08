const choseZoneElement = document.querySelector('#choseZone')

function initChoseZone(Xsize,Ysize,Zsize,element=choseZoneElement) {

	element.querySelectorAll('.choseZoneX0, .choseZoneX1').forEach(a=>{ a.min = 0; a.max = Xsize; })
	element.querySelectorAll('.choseZoneY0, .choseZoneY1').forEach(a=>{ a.min = 0; a.max = Ysize; })
	element.querySelectorAll('.choseZoneZ0, .choseZoneZ1').forEach(a=>{ a.min = 0; a.max = Zsize; })

	document.getElementById('cutZone').style.setProperty('--Xsize' ,`${Xsize}px` )
	document.getElementById('cutZone').style.setProperty('--Ysize' ,`${Ysize}px` )
	document.getElementById('cutZone').style.setProperty('--Zsize' ,`${Zsize}px` )
	// document.getElementById('cutZone').style.display = 'none';
	// const czp = 
	// document.querySelector('#cutZone').style.transform = `translate3d(0px,0px,0px)`
}

function initChoseZoneEvents(element = choseZoneElement) {
	initTool(element);

	const names = ['X0','X1','Y0','Y1','Z0','Z1'];

	names.forEach(a=>{
		addOnChangeFunctionOnSlider(
			element.querySelector(`.choseZone${a}`).parentElement,
			val=>{document.getElementById('cutZone').style.setProperty(`--cut${a}`,`${val}px`)}
		)
		// element.querySelector(`.choseZone${a}[type=range]`).addEventListener('mousemove',mm=>{
		// 	if (mm.buttons === 1) {
		// 		document.getElementById('cutZone').style.setProperty(`--cut${a}`,`${mm.target.value}px`);
		// 	}
		// })
		// element.querySelector(`.choseZone${a}[type=range]`).addEventListener('touchmove',tm=>{
		// 	document.getElementById('cutZone').style.setProperty(`--cut${a}`,`${tm.target.value}px`);
		// })
		// element.querySelector(`.choseZone${a}[type=number]`).addEventListener('keyup',kp=>{
		// 	
		// })
	})

	element.querySelector('#showZoneCutter').addEventListener('click',c=>{
		if (c.target.checked){
			document.getElementById('cutZone').style.display = '';
			window.zone3Dparams.ChoseZoneParams.visible = true;
		} else {
			document.getElementById('cutZone').style.display = 'none';
			window.zone3Dparams.ChoseZoneParams.visible = false;
		}
	})

	element.querySelector('#cutZoneRenderButton').addEventListener('click',c=>{
		updateZone3DbyChangingChoseZoneParams()
	})	
}

function setChoseZone(params,element=choseZoneElement) {
	const names = ['X0','X1','Y0','Y1','Z0','Z1'];
	names.forEach(a=>{
		element.querySelectorAll(`.choseZone${a}`).forEach(b=>{
			const temp = Math.min(Math.max( params[a] ,parseInt(b.min)),parseInt(b.max))
			b.value = temp;
			document.getElementById('cutZone').style.setProperty(`--cut${a}`,`${temp}px`);
		})
	})

	element.querySelector('#showZoneCutter').checked = params['visible']

	if (params['visible']){
		document.getElementById('cutZone').style.display = '';
	} else {
		document.getElementById('cutZone').style.display = 'none';
	}
}

function getChoseZone(element=choseZoneElement) {
	let res = {
		'visible': element.querySelector('#showZoneCutter').checked
	}

	const names = ['X0','X1','Y0','Y1','Z0','Z1'];
	names.forEach(a=>{
		const el = element.querySelector(`.choseZone${a}[type=number]`)
		res[a] = Math.min(Math.max( parseInt(el.value) ,parseInt(el.min)),parseInt(el.max))
	})

	return res
}