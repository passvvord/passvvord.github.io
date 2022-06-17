const histogramElement = document.querySelector('#histogram')

function initHistogram(min,max,n=50,element = histogramElement) {
	initTool(element);

	element.querySelectorAll('.histMin').forEach(a=>{ a.min = min; a.max = max; a.value = min;})
	element.querySelectorAll('.histMax').forEach(a=>{ a.min = min; a.max = max; a.value = max;})
	element.querySelectorAll('.histCount').forEach(a=>{ a.value = 50; })

	element.querySelectorAll('.slider').forEach(s=>{
		addOnChangeFunctionOnSlider(
			s,
			(val)=>{getInputAndUpgradeHistogram()}
		)			
	})

	// element.querySelector("#sameWidth").addEventListener('click',()=>{
	// 	getInputAndUpgradeHistogram()
	// })
}

function getInputAndUpgradeHistogram(element = histogramElement) {
	const inp = element.querySelectorAll('input[type=number]');
	window.hist.update(
		parseInt(inp[2].value),
		parseInt(inp[0].value),
		parseInt(inp[1].value)
		// ,element.querySelector("#sameWidth").checked
	)
}





