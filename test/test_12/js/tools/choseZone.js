const ChoseZoneElement = document.getElementById('choseZone')

function initChoseZone(ChoseZoneElement,Xsize,Ysize,Zsize) {
	ChoseZoneElement.querySelectorAll('.choseZoneX0, .choseZoneX1').forEach(a=>{ a.min = 0; a.max = Xsize; })
	ChoseZoneElement.querySelectorAll('.choseZoneY0, .choseZoneY1').forEach(a=>{ a.min = 0; a.max = Ysize; })
	ChoseZoneElement.querySelectorAll('.choseZoneZ0, .choseZoneZ1').forEach(a=>{ a.min = 0; a.max = Zsize; })

	document.getElementById('cutZone').style.setProperty('--Xsize' ,`${Xsize}px` )
	document.getElementById('cutZone').style.setProperty('--Ysize' ,`${Ysize}px` )
	document.getElementById('cutZone').style.setProperty('--Zsize' ,`${Zsize}px` )

	const names = ['X0','X1','Y0','Y1','Z0','Z1'];

	names.forEach(a=>{
		ChoseZoneElement.querySelector(`.choseZone${a}[type=range]`).addEventListener('mousemove',mm=>{
			if (mm.buttons === 1) {
				document.getElementById('cutZone').style.setProperty(`--cut${a}`,`${mm.target.value}px`);
			}
		})
		ChoseZoneElement.querySelector(`.choseZone${a}[type=range]`).addEventListener('touchmove',tm=>{
			document.getElementById('cutZone').style.setProperty(`--cut${a}`,`${tm.target.value}px`);
		})
		ChoseZoneElement.querySelector(`.choseZone${a}[type=number]`).addEventListener('keyup',kp=>{
			document.getElementById('cutZone').style.setProperty(`--cut${a}`,`${kp.target.value}px`);
		})
	})

	ChoseZoneElement.querySelector('#showZoneCutter').addEventListener('click',c=>{
		if (c.target.checked){
			document.getElementById('cutZone').style.display = '';
		} else {
			document.getElementById('cutZone').style.display = 'none';
		}
	})
}

/*
in: {
	X0: uint ,X1: uint ,Y0: uint ,Y1: uint ,Z0: uint ,Z1: uint ,visible: bool
}
*/
function setChoseZone(ChoseZoneElement,params) {
	const names = ['X0','X1','Y0','Y1','Z0','Z1'];
	names.forEach(a=>{
		ChoseZoneElement.querySelectorAll(`.choseZone${a}`).forEach(b=>{
			const temp = Math.min(Math.max( params[a] ,parseInt(b.min)),parseInt(b.max))
			b.value = temp;
			document.getElementById('cutZone').style.setProperty(`--cut${a}`,`${temp}px`);
		})
	})

	ChoseZoneElement.querySelector('#showZoneCutter').checked = params['visible']

	if (params['visible']){
		document.getElementById('cutZone').style.display = '';
	} else {
		document.getElementById('cutZone').style.display = 'none';
	}
}

function getChoseZone(ChoseZoneElement) {
	let res = {
		'visible': ChoseZoneElement.querySelector('#showZoneCutter').checked
	}

	const names = ['X0','X1','Y0','Y1','Z0','Z1'];
	names.forEach(a=>{
		const el = ChoseZoneElement.querySelector(`.choseZone${a}[type=number]`)
		res[a] = Math.min(Math.max( parseInt(el.value) ,parseInt(el.min)),parseInt(el.max))
	})

	return res
}