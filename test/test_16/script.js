function recursiveElement(n=1,name='div') {
	if (n>1) {
		const el = document.createElement(name)
		el.appendChild(recursiveElement(n-1,name))
		return el
	} else {
		return document.createElement(name)
	}
}

document.querySelector('div.sec').appendChild(recursiveElement(8,'div'))
document.querySelector('div.min').appendChild(recursiveElement(6,'div'))
document.querySelector('div.hour').appendChild(recursiveElement(3,'div'))

const intervalID = setInterval(()=>{
	['Seconds','Minutes','Hours','Milliseconds'].forEach(p=>{
		document.documentElement.style.setProperty(`--${p.toLowerCase()}`, new Date()['get'+p]() );
		document.documentElement.style.setProperty(`--${p.toLowerCase()}-str`, `'${new Date()['get'+p]()}'` );
	})
}, 1000/60)