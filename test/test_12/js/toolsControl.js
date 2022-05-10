function hideElement(el,nameToHide = "toolBody",errorMessage = "ERROR WHILE TRYING TO HIDE ELEMENT") {
	let toolBody = el.parentNode.parentNode.getElementsByClassName(nameToHide)[0]
	if (toolBody.style.display === "") {
		toolBody.style.display = "none";
		el.textContent = "▼";
	} else if (toolBody.style.display === "none")  {
		toolBody.style.display = "";
		el.textContent = "▲";
	} else {
		console.log(errorMessage)
	}
}

document.querySelectorAll(".hideTool").forEach(el=>{
	el.addEventListener('click', ()=>{hideElement(el)})
})

document.querySelectorAll(".hideToolPart").forEach(el=>{
	el.addEventListener('click', ()=>{hideElement(el,"toolPartBody","wrong style (click on .hideToolPart)")})
})

document.querySelectorAll(".slider > input[type=range]").forEach(el=>{
	['mousemove','touchmove'].forEach(event=>{
		el.addEventListener(event,mm=>{
			if (mm.buttons === 1 || event === 'touchmove') {
				el.parentNode.querySelector("input[type=number]").value = el.value;
			}
		})
	})
});

document.querySelectorAll(".slider > input[type=number]").forEach(el=>{
	el.addEventListener('keyup',kp=>{
		if      (parseInt(el.value) > parseInt(el.max) ) { el.value = el.max; } 
		else if (parseInt(el.value) < parseInt(el.min) ) { el.value = el.min; }
		el.parentNode.querySelector("input[type=range]").value = el.value;
	})
});

document.querySelectorAll(".colLineInput > input[type=number]").forEach(el=>{
	el.addEventListener('keyup',kp=>{
		if      (parseInt(el.value) > parseInt(el.max) ) { el.value = el.max; } 
		else if (parseInt(el.value) < parseInt(el.min) ) { el.value = el.min; }
		const vals = document.querySelectorAll(".colLineInput > input[type=number]")
		if (el.parentNode.parentNode.querySelectorAll(".toolPartCheckboxLine > div > input[type=checkbox]")[0].checked) {
			el.parentNode.parentNode.querySelectorAll(".toolPartShowGradient")[0]
				.style.background = `linear-gradient(to right, rgba(${vals[0].value},${vals[2].value},${vals[4].value},${vals[6].value/255}), rgba(${vals[1].value},${vals[3].value},${vals[5].value},${vals[7].value/255}))`;
		} else {
			el.parentNode.parentNode.querySelectorAll(".toolPartShowGradient")[0]
				.style.background = `rgba(${vals[0].value},${vals[2].value},${vals[4].value},${vals[6].value/255})`;
		}
	})
});

document.querySelectorAll(".toolPartCheckboxLine > div > input[type=checkbox]").forEach(el=>{
	el.addEventListener('click',c=>{
		const vals = document.querySelectorAll(".colLineInput > input[type=number]")
		// console.log(c.target,c.target.checked,el.parentNode.parentNode.querySelectorAll(".toolPartShowGradient"))
		if (c.target.checked) {
			el.parentNode.parentNode.parentNode.querySelectorAll(".toolPartShowGradient")[0]
				.style.background = `linear-gradient(to right, rgba(${vals[0].value},${vals[2].value},${vals[4].value},${vals[6].value/255}), rgba(${vals[1].value},${vals[3].value},${vals[5].value},${vals[7].value/255}))`;
		} else {
			el.parentNode.parentNode.parentNode.querySelectorAll(".toolPartShowGradient")[0]
				.style.background = `rgba(${vals[0].value},${vals[2].value},${vals[4].value},${vals[6].value/255})`;
		}
	})
})

document.getElementById("toolPartAdd").addEventListener('click', c=>{
	let toolPartArr = c.target.parentNode.getElementsByClassName("toolPart");
	let new_el = toolPartArr[toolPartArr.length-1].cloneNode(true);
	new_el.querySelectorAll(".hideToolPart").forEach(el=>{
		el.addEventListener('click', ()=>{
			hideElement(el,"toolPartBody","wrong style (click on .hideToolPart)")
		})
	});
	document.getElementById("toolPartsBlock").appendChild(new_el);
})

function getVisParams() {
	let visParams = []
	document.querySelectorAll("#visParams .toolPartBody").forEach(el=>{
		visParams.push({
			"min": parseInt(el.querySelector(".visParamsMin[type=number]").value),
			"max": parseInt(el.querySelector(".visParamsMax[type=number]").value),
			"gradient": el.querySelector(".visParamsGradient[type=checkbox]").checked,
			"rgba0": ['R','G','B','A'].map(a=>parseInt(el.querySelector(`.visParams${a}0[type=number]`).value)),
			"rgba1": ['R','G','B','A'].map(a=>parseInt(el.querySelector(`.visParams${a}1[type=number]`).value))
		})
	})
	return visParams
}

function getColArrayFromParams(visParams,imgmin,imgmax) {
	let res = new Uint8Array(256*4)

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

	return res
}

document.querySelector("#toolPartRender").addEventListener('click', ()=>{
	draw_preloader()

	upgradeLayer(
		document.getElementById("block3d")
		,window.image['pixels']
		,'Z'
		,window.image['Z']
		,window.image['X']
		,window.image['Y']
		,window.image['min']
		,window.image['max']-window.image['min']
		,getColArrayFromParams(
			getVisParams()
			,window.image['min']
			,window.image['max']
		)
	)
	
	remove_preloader()
})
