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
				el.parentNode.querySelectorAll("input[type=number]")[0].value = el.value;
			}
		})
	})
});

document.querySelectorAll(".slider > input[type=number]").forEach(el=>{
	el.addEventListener('keyup',kp=>{
		if      (parseInt(el.value) > parseInt(el.max) ) { el.value = el.max; } 
		else if (parseInt(el.value) < parseInt(el.min) ) { el.value = el.min; }
		el.parentNode.querySelectorAll("input[type=range]")[0].value = el.value;
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






// let diapazone_settings = [
// 	{min: 200, max: 400, status: 'show'},
// 	{min: 200, max: 400, status: 'hide'},
// ]