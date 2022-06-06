
function calcOneSliderEvents(slider) {
	slider.querySelector("input[type=range]").addEventListener('mousemove',mm=>{
		if (mm.buttons === 1) {
			slider.querySelector("input[type=number]").value = mm.target.value;
		}
	})

	slider.querySelector("input[type=range]").addEventListener('touchmove',tm=>{
		slider.querySelector("input[type=number]").value = tm.target.value;
	})

	slider.querySelector("input[type=number]").addEventListener('keyup',kp=>{
		slider.querySelector("input[type=range]").value = Math.min(Math.max( parseFloat(kp.target.value) ,parseFloat(kp.target.min)),parseFloat(kp.target.max))
	})
}

function addOnChangeFunctionOnSlider(slider,func,parseFunc = parseInt) {
	slider.querySelector("input[type=range]").addEventListener('mousemove',mm=>{
		if (mm.buttons === 1) {
			func(parseFunc(mm.target.value));
		}
	})

	slider.querySelector("input[type=range]").addEventListener('touchmove',tm=>{
		func(parseFunc(tm.target.value));
	})

	slider.querySelector("input[type=number]").addEventListener('keyup',kp=>{
		 func( Math.min(Math.max( parseFunc(kp.target.value) ,parseFunc(kp.target.min)),parseFunc(kp.target.max)) )
	})		
}

function calcSliderEvents(element) {
	element.querySelectorAll(".slider").forEach(slider=>{
		calcOneSliderEvents(slider)
	})
}

function hideElement(hideButton,elementToHide) {
	if (elementToHide.style.display === "") {
		elementToHide.style.display = "none";
		hideButton.textContent = "▼";
	} else if (elementToHide.style.display === "none")  {
		elementToHide.style.display = "";
		hideButton.textContent = "▲";
	} else {
		consoleOut(`problems with reading {}.style.display proerty of ${elementToHide} current value is ${elementToHide.style.display}`)
	}
}

function initTool(element,mustHide = true,haveSliders = true) {
	if (mustHide === true) {
		element.querySelector(".hideTool").addEventListener('click', c=>{
			hideElement(
				c.target,
				element.querySelector(".toolBody")
			)			
		})		
	}

	if (haveSliders === true) {
		calcSliderEvents(element)
	}
}