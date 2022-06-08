function consoleOut(...a) {
	console.log(...a)
	
	document.querySelector('#console').innerHTML += a+'<br>'
}

document.documentElement.style.setProperty('--vw', document.documentElement.clientWidth/100 + 'px');
document.documentElement.style.setProperty('--vh', document.documentElement.clientHeight/100 + 'px');

initOpenFile()
initFileInfo()

initChoseZoneEvents()
initVisParamsEvents()
initHideLayersEvents()
initShowContoursEvents()

initZone3Devents()