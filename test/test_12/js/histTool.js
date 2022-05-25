const histTool = document.getElementById('histogram')

function getInputAndUpgradeHistogram() {
	const inp = document.querySelectorAll('#histogram input[type=number]');
	window.hist.update(
		parseInt(inp[2].value),
		parseInt(inp[0].value),
		parseInt(inp[1].value)
	)
}

histTool.querySelectorAll(".slider > input[type=range]").forEach(el=>{
	['mousemove','touchmove'].forEach(event=>{
		el.addEventListener(event,mm=>{
			if (mm.buttons === 1 || event === 'touchmove') {
				getInputAndUpgradeHistogram()
			}
		})
	})
});

histTool.querySelectorAll(".slider > input[type=number]").forEach(el=>{
	el.addEventListener('keyup',kp=>{
		if      (parseInt(el.value) > parseInt(el.max) ) { el.value = el.max; } 
		else if (parseInt(el.value) < parseInt(el.min) ) { el.value = el.min; }
		getInputAndUpgradeHistogram()
	})
});