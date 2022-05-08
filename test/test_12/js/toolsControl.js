document.querySelectorAll(".hideTool").forEach(el=>{
	el.addEventListener('click', c=>{
		let toolBody = el.parentNode.parentNode.getElementsByClassName("toolBody")[0]
		if (toolBody.style.display === "") {
			toolBody.style.display = "none";
			el.textContent = "▼";
		} else if (toolBody.style.display === "none")  {
			toolBody.style.display = "";
			el.textContent = "▲";
		} else {
			console.log('Error toolBody.style.display value')
		}
	})
})