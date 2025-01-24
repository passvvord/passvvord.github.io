// const getEmptyImportMapObject = ()=>( {imports:{}} )
// const    emptyImportMapStr = JSON.stringify( getEmptyImportMapObject() )

function addImportMapByText(text = '{"imports":{}}') {
	const importmap = document.head.appendChild(document.createElement('script'))
	importmap.type = 'importmap'
	importmap.innerHTML = text
	return importmap
}

// function addImportMapBySrc(...src) {
// 	if (src instanceof Array && src?.length > 0) {
// 		return new Promise(resolve=>{
// 			Promise.all(src.map(s=>fetch(s)
// 				.then(r=>r.json())
// 				.catch(e=>{
// 					console.warn(`NOT VALID JSON, ${s}\nignored, details\n${e}`)
// 					return {}
// 				})
// 			)).then(r=>{
// 				const importmap = r.reduce((ac,a)=>{
// 					if ( a?.imports ) { Object.assign(ac.imports, a.imports) }
// 					return ac
// 				}, {imports:{}} )
// 				resolve( addImportMapByText( JSON.stringify(importmap) ) )
// 			})
// 		})
// 	} else {
// 		return new Promise(resolve=>{
// 			console.warn(`expected (src0, src1 ...) as arguments but given 0 src\nignored, created new empty importmap`)
// 			resolve( addImportMapByText() )
// 		})
// 	}
// }

function addImportMap(...srcOrObj) {
	if (srcOrObj instanceof Array && srcOrObj?.length > 0) {
		return new Promise(resolve=>{
			Promise.all(srcOrObj.filter(s=>typeof s === 'string').map(s=>fetch(s)
				.then(r=>{
					console.log(`loaded importmap ${s}`)
					return r.json()
				})
				.catch(e=>{
					console.warn(`NOT VALID JSON, ${s}\nignored, details\n${e}`)
					return {}
				})
			)).then(r=>{
				const importMapAsObj = srcOrObj.filter(s=>s instanceof Object).map(a=>{
					console.log(`added importmap ${a}`)
					return {imports: a}
				})
				const importmap = r.concat(importMapAsObj).reduce((ac,a)=>{
					if ( a?.imports ) { Object.assign(ac.imports, a.imports) }
					return ac
				}, {imports:{}} )
				resolve( addImportMapByText( JSON.stringify(importmap,'','\t') ) )
			})
		})
	} else {
		return new Promise(resolve=>{
			console.warn(`expected (src0, src1 ...) as arguments but given 0 src\nignored, created new empty importmap`)
			resolve( addImportMapByText() )
		})
	}
}

function extendImportMap(addImportsObj, importmapElement) {
	if ( !(importmapElement instanceof HTMLScriptElement) ) {
		console.warn(`importmapElement in function extendImportMap is not instance of HTMLScriptElement\nignored, created new empty importmap`)
		importmapElement = addImportMapByText()
	}
	if ( !(addImportsObj instanceof Object) ) {
		console.warn(`addImportsObj in function extendImportMap is not instance of Object\nignored, replaced with empty object`)
		addImportsObj = {}
	}
	const imports = JSON.parse(importmapElement.innerHTML)
	Object.assign(imports.imports, addImportsObj)
	importmapElement.innerHTML = JSON.stringify(imports,'','\t')
	return importmapElement
}

function loadScript(name, defer = false, async = false) {
	const script = document.createElement('script')
	script.defer = defer
	script.async = async
	script.src = name
	document.head.appendChild(script)
}

function loadScriptWhenThisDOMloaded(name) {
	if (document.readyState == 'loading') {
		document.addEventListener('DOMContentLoaded', ()=>{
			loadScript(name)
		})
	} else { // document.readyState == 'interactive' || document.readyState == 'complete'
		loadScript(name)
	}
}

