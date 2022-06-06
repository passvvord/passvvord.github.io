// const asyncOut = new Promise((resolve, reject) => {
//   setTimeout(() => {
//     resolve('foo');
//   }, 300);
// });

async function consoleOut(...a) {
	console.log(...a)
	
	document.querySelector('#console').innerHTML += a+'<br>'
}

// function hideElement(hideButton,elementToHide) {
// 	if (elementToHide.style.display === "") {
// 		elementToHide.style.display = "none";
// 		hideButton.textContent = "▼";
// 	} else if (elementToHide.style.display === "none")  {
// 		elementToHide.style.display = "";
// 		hideButton.textContent = "▲";
// 	} else {
// 		consoleOut(`problems with reading {}.style.display proerty of ${elementToHide} current value is ${elementToHide.style.display}`)
// 	}
// }

document.documentElement.style.setProperty('--vw', document.documentElement.clientWidth/100 + 'px');
document.documentElement.style.setProperty('--vh', document.documentElement.clientHeight/100 + 'px');

initOpenFile()
initFileInfo()

initZone3Devents()