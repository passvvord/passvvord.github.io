const fileInfoElement = document.querySelector('#fileInfo')

function initFileInfo(element = fileInfoElement) {
	initTool(element,true,false);
}

function updateFileInfo(data,element = fileInfoElement) {
	element.querySelector('.toolBody').innerHTML = Object.keys(data).map(a=>`${a}: ${data[a]}`).join('<br>')
}