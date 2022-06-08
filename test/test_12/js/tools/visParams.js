const visParamsElement = document.querySelector('#visParams')

function initVisParamsEvents(element = visParamsElement) {
	initTool(element);

	addOnChangeFunctionOnSlider(
		element.querySelector('#globalOpacity'),
		val=>{ document.querySelector('#block3d').style.setProperty('--globalLayerOpacity',val) },
		parseFloat
	)

	element.querySelector('#toolPartAdd').addEventListener('click', ()=>{
		const lastChild = element.querySelector('#toolPartsBlock').lastChild
		console.log(lastChild)
		if (lastChild) {
			element.querySelector('#toolPartsBlock').appendChild(
				createVisParamsPart(
					getOneVisParams(lastChild),
					lastChild.querySelector('.visParamsMin').min,
					lastChild.querySelector('.visParamsMin').max
				)
			)
		} else {
			element.querySelector('#toolPartsBlock').appendChild(
				createVisParamsPart(
					{min: 1000, max: window.zone3Dparams.max, gradient: true, rgba0: [0, 0, 0, 0], rgba1: [255, 255, 255, 255]},
					window.zone3Dparams.min,
					window.zone3Dparams.max
				)
			)
		}
	})

	element.querySelector('#toolPartRender').addEventListener('click', ()=>{
		updateZone3DbyChangingVisParams()
	})
}

function createElement(elName,params) {
	let el = document.createElement(elName);
	for (let name in params) {
		el[name] = params[name]
	}
	return el
}

function addEventsOnElement(el,events) {
	for (let event in events) {
		el.addListener(event,events[event])
	}
	return el
}

function appendChildren(el,children) {
	for (let child of children) {
		el.appendChild(child)
	}
	return el
}

function createSlider(textName,className,min,max,value) {
	let slider = createElement('div',{className: "slider"})
	slider.appendChild(createElement('input',{className: className,type:"range",min: min ,max: max ,value: value ,step:"1"}))
	slider.appendChild(createElement('div',{textContent: textName}))
	slider.appendChild(createElement('input',{className: className,type:"number",min: min ,max: max ,value: value ,step:"1"}))

	calcOneSliderEvents(slider)

	return slider
}

function createVisParamsPart(a,min,max) {
	let diapazone = appendChildren(createElement('div',{className: 'toolPart'}),[
		appendChildren(createElement('div',{className: 'toolPartHead'}),[
			createElement('div',{textContent: 'diapzone'}),
			createElement('div',{className: 'hideToolPart noselect',textContent: '▲'}),
			createElement('div',{className: 'removeToolPart noselect',textContent: '🗙'})
		]),
		createElement('div',{className: 'toolPartShowGradient'}),
		appendChildren(createElement('div',{className: 'toolPartBody'}),[
			createSlider('min:','visParamsMin',min,max,a.min),
			createSlider('max:','visParamsMax',min,max,a.max),
			createElement('div',{className: 'toolPartTextLine',textContent: 'Color:'}),
			appendChildren(createElement('div',{className: 'toolPartCheckboxLine'}),[
				createElement('div',{textContent: 'Gradient:'}),
				appendChildren(createElement('div',{}),[
					createElement('input',{className:'visParamsGradient',type:'checkbox',checked: a.gradient})
				])
			]),
			appendChildren(createElement('div',{className: 'colLineInput'}),[
				createElement('input',{className: 'visParamsR0',type: 'number',min: 0 ,max: 255 ,value: a.rgba0[0] ,step:"1"}),
				createElement('div',{textContent: '-> R ->'}),
				createElement('input',{className: 'visParamsR1',type: 'number',min: 0 ,max: 255 ,value: a.rgba1[0] ,step:"1"}),
			]),
			appendChildren(createElement('div',{className: 'colLineInput'}),[
				createElement('input',{className: 'visParamsG0',type: 'number',min: 0 ,max: 255 ,value: a.rgba0[1] ,step:"1"}),
				createElement('div',{textContent: '-> G ->'}),
				createElement('input',{className: 'visParamsG1',type: 'number',min: 0 ,max: 255 ,value: a.rgba1[1] ,step:"1"}),
			]),
			appendChildren(createElement('div',{className: 'colLineInput'}),[
				createElement('input',{className: 'visParamsB0',type: 'number',min: 0 ,max: 255 ,value: a.rgba0[2] ,step:"1"}),
				createElement('div',{textContent: '-> B ->'}),
				createElement('input',{className: 'visParamsB1',type: 'number',min: 0 ,max: 255 ,value: a.rgba1[2] ,step:"1"}),
			]),
			appendChildren(createElement('div',{className: 'colLineInput'}),[
				createElement('input',{className: 'visParamsA0',type: 'number',min: 0 ,max: 255 ,value: a.rgba0[3] ,step:"1"}),
				createElement('div',{textContent: '-> A ->'}),
				createElement('input',{className: 'visParamsA1',type: 'number',min: 0 ,max: 255 ,value: a.rgba1[3] ,step:"1"}),
			]),
			createElement('div',{className: 'toolPartShowGradient'})
		])
	])

	diapazone.querySelector(".hideToolPart").addEventListener('click', c=>{
		hideElement(
			c.target,
			diapazone.querySelector(".toolPartBody")
		)
	})

	diapazone.querySelector(".removeToolPart").addEventListener('click', ()=>{
		diapazone.remove()
	})

	diapazone.querySelectorAll(".colLineInput > input[type=number]").forEach(el=>{
		el.addEventListener('keyup',kp=>{
			kp.target.value = Math.min(Math.max( parseInt(kp.target.value) ,parseInt(kp.target.min)),parseInt(kp.target.max))
			const rgba0 = ['R','G','B','A'].map(a=>parseInt(diapazone.querySelector(`.visParams${a}0[type=number]`).value));
			const rgba1 = ['R','G','B','A'].map(a=>parseInt(diapazone.querySelector(`.visParams${a}1[type=number]`).value));
			if (diapazone.querySelector(".toolPartCheckboxLine > div > input[type=checkbox]").checked) {
				diapazone.querySelectorAll(".toolPartShowGradient").forEach(sg=>{
					sg.style.background = `linear-gradient(to right, rgba(${rgba0[0]},${rgba0[1]},${rgba0[2]},${rgba0[3]/255}), rgba(${rgba1[0]},${rgba1[1]},${rgba1[2]},${rgba1[3]/255}))`;
				})
			} else {
				diapazone.querySelectorAll(".toolPartShowGradient").forEach(sg=>{
					sg.style.background = `rgba(${rgba0[0]},${rgba0[1]},${rgba0[2]},${rgba0[3]/255})`;
				})
			}
		})
	})

	const calcGradientPartLine = c=>{
		const rgba0 = ['R','G','B','A'].map(a=>parseInt(diapazone.querySelector(`.visParams${a}0[type=number]`).value));
		const rgba1 = ['R','G','B','A'].map(a=>parseInt(diapazone.querySelector(`.visParams${a}1[type=number]`).value));
		if (c.target.checked) {
			diapazone.querySelectorAll(".toolPartShowGradient").forEach(sg=>{
				sg.style.background = `linear-gradient(to right, rgba(${rgba0[0]},${rgba0[1]},${rgba0[2]},${rgba0[3]/255}), rgba(${rgba1[0]},${rgba1[1]},${rgba1[2]},${rgba1[3]/255}))`;
			})
		} else {
			diapazone.querySelectorAll(".toolPartShowGradient").forEach(sg=>{
				sg.style.background = `rgba(${rgba0[0]},${rgba0[1]},${rgba0[2]},${rgba0[3]/255})`;
			})
		}
	}

	calcGradientPartLine( {target: diapazone.querySelector(".toolPartCheckboxLine > div > input[type=checkbox]")} )
	diapazone.querySelector(".toolPartCheckboxLine > div > input[type=checkbox]").addEventListener('click',calcGradientPartLine)

	return diapazone
}

function setVisParams(A,min,max,element = visParamsElement) {
	const tempElement = element.querySelector('#toolPartsBlock')

	// tempElement.innerHTML = ''
	while (tempElement.firstChild) {tempElement.firstChild.remove()}

	for (let params of A) {
		tempElement.appendChild(createVisParamsPart(params,min,max))
	}
}

function getOneVisParams(el) {
	return {
		"min": parseInt(el.querySelector(".visParamsMin[type=number]").value),
		"max": parseInt(el.querySelector(".visParamsMax[type=number]").value),
		"gradient": el.querySelector(".visParamsGradient[type=checkbox]").checked,
		"rgba0": ['R','G','B','A'].map(a=>parseInt(el.querySelector(`.visParams${a}0[type=number]`).value)),
		"rgba1": ['R','G','B','A'].map(a=>parseInt(el.querySelector(`.visParams${a}1[type=number]`).value))
	}
}

function getVisParams() {
	let visParams = []
	document.querySelectorAll("#visParams .toolPartBody").forEach(el=>{
		visParams.push(getOneVisParams(el))
	})
	return visParams
}

function getColArrayFromParams(visParams) {//,imgmin,imgmax) {
	let res = new Uint8Array(256*4);

	const imgmin = (visParams.length>1?visParams.reduce((a,b)=>(b.min<a.min?b:a)):visParams[0]).min;
	const imgmax = (visParams.length>1?visParams.reduce((a,b)=>(b.max>a.max?b:a)):visParams[0]).max;

	console.log(imgmin,imgmax)

	for (let i = 0; i < visParams.length; i++) {
		const start = Math.round((visParams[i]["min"]-imgmin)/(imgmax-imgmin)*255);
		const end = Math.round((visParams[i]["max"]-imgmin)/(imgmax-imgmin)*255);
		for (let j = start; j <= end; j+=1) {
			if (visParams[i]["gradient"]) {
				for (let col = 0; col < 4; col+=1) {
					res[j*4+col] = Math.round( ((j-start)/(end-start))*(visParams[i]["rgba1"][col]-visParams[i]["rgba0"][col])+visParams[i]["rgba0"][col]);
				}
			} else {
				for (let col = 0; col < 4; col+=1) {
					res[j*4+col] = visParams[i]["rgba0"][col];
				}
			}
		}
	}

	document.getElementById('Gradientline').getContext("2d").putImageData(new ImageData(new Uint8ClampedArray(res),256,1), 0, 0)
	document.getElementById('fillMinMax').textContent = `fillmin: ${imgmin}, fillmax: ${imgmax}`;

	return {'colArray':res,'min':imgmin,'max':imgmax}
}
