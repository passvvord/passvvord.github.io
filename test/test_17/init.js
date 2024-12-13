console.log('start code')
function bytesToStr(bytesArray,toStr=10,sep='\t') {
	const blueText   = '\x1b[38;2;153;128;255m'
	const purpleText = '\x1b[38;2;92;213;251m'
	const defaultColors = '\x1b[0m'

	let info = ''
	let prevCol = ''
	for (let i=0; i<bytesArray.length; i++) {
		let curentCol = bytesArray[i]>=32 && bytesArray[i]<=126 ? blueText : purpleText
		if (curentCol === prevCol) {
			curentCol = ''
		} else {
			prevCol = curentCol
		}
		if (bytesArray[i]>=32 && bytesArray[i]<=126) { //is in ASCII: ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'
			info+=curentCol+String.fromCodePoint(bytesArray[i])+sep
		} else {
			info+=curentCol+bytesArray[i].toString(toStr)+sep
		}
	}
	return info	
}


async function checkFile(file,toStr=10,sep='\t') {
	const buffer = await file.arrayBuffer()
	const bytesArray = new Uint8Array(buffer)

	

	console.log(bytesToStr(bytesArray,toStr,sep))


}


document.querySelector('#pngFile').addEventListener('change',async c=>{
	window.FILES = c.target.files

	for (let i=0; i<window.FILES.length; i++) {
		checkFile(window.FILES[i])

	}
	

	// console.log(new TextDecoder().decode(new Uint8Array(await window.FILES[0].arrayBuffer())))
})


class CRC {

}


// note: `buffer` arg can be an ArrayBuffer or a Uint8Array
async function bufferToBase64(buffer) {
  // use a FileReader to generate a base64 data URI:
  const base64url = await new Promise(r => {
    const reader = new FileReader()
    reader.onload = () => r(reader.result)
    reader.readAsDataURL(new Blob([buffer]))
  });
  // remove the `data:...;base64,` part from the start
  return base64url.slice(base64url.indexOf(',') + 1);
}




function performanceTest(func,paramsOrFunc,Ntimes = 1000) {
	let timeSum = 0;
	if (paramsOrFunc instanceof (async ()=>{}).constructor) {
		//...
	} else if (paramsOrFunc instanceof Function) {
		for (let i=0; i<Ntimes; i++) {
			const params = paramsOrFunc()
			const start = performance.now();
			func(...params)
			timeSum+=performance.now()-start
		}
	} else {
		const params = paramsOrFunc
		const start = performance.now();
		for (let i=0; i<Ntimes; i++) {
			func(params)
		}
		timeSum=performance.now()-start
	}
	return timeSum
}

// performanceTest((...a)=>Base64.Uint8ToBase64(...a), ()=>[new Uint8Array(10000).map(a=>Math.random()*256)], 10000) // 3361
// performanceTest((...a)=>Base64.Uint8ToBase64v1(...a), ()=>[new Uint8Array(10000).map(a=>Math.random()*256)], 10000) // 2550
// performanceTest((...a)=>Base64.Uint8ToBase64v2(...a), ()=>[new Uint8Array(10000).map(a=>Math.random()*256)], 10000) // 2940


const verList = ['v1','v2','v3']

for (v of verList) {
	const temp = new Array(10).fill().map((a,i)=>Base64['Uint8ToBase64'+v](new TextEncoder().encode('light work.'.slice(0,11-i)))).join('\n')
	consolelog(v+'\n'+temp)
}

for (v of verList) {
	const temp = new Array(5).fill().map((a,i)=>Base64['Uint8ToBase64'+v](new TextEncoder().encode('light work.'.slice(0,11-i)))).join('\n')
	if (temp === 'bGlnaHQgd29yay4=\nbGlnaHQgd29yaw==\nbGlnaHQgd29y\nbGlnaHQgd28=\nbGlnaHQgdw==') {
		consolelog(v,'is ok')
	} else {
		consolelog(v,temp)
	}
}

let randData = new Uint8Array(100*1024**2).map(a=>Math.floor(Math.random()*256))

for (v of verList) {
	const delta = performanceTest(a=>Base64['Uint8ToBase64'+v](a), randData, 1)
	consolelog(v,delta.toFixed(2),'ms,', (100/(delta/1000)).toFixed(2), 'MiB/s' )
}
// consolelog('func',performanceTest(Uint8ToBase64func, ()=>[randData], 5),'ms')
// consolelog('func1',performanceTest(Uint8ToBase64func, ()=>[randData], 5),'ms')



// document.querySelector('code#console').innerText.split('\n').filter(a=>!a.includes('is ok') && a.includes(',')).map(a=>parseInt(a.split(',')[1])).reduce((ac,a,i)=>{ac[i%3]+=a; return ac},[0,0,0])


// window.png = new PNG().build(await (await fetch('testdata/testpng.png')).arrayBuffer())


const testPngBase46 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAABABAMAAAAg+GJMAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJUExUReiqLyOnzQAAAMftescAAAAJcEhZcwAADsIAAA7CARUoSoAAAAKPSURBVFjD5VdbbsMwDDNyA+cENu9/yEmk5Fe3odg+inVtA1SxzMgyKTklPzU+P7VfCwA03ei6AdDhRk+HsP2G/b1kY9jNPcz31oSrXQSEfdcJHK6Bx/E7AS6sT0yAmgDYAXz0AMAWgVwmgI1/ClAnQDsANKFGRJg5EEBEVOcSDwA+YjpgJFlPHEsc/tiTmEkaT8iITgDU+twu5BL6FwDJg9zna9gjxJiw78oEeD2VXwzwHmvf9/cW60txQrfCKpG2efi4U8BtMuaBYZBQqQi7nJ/u4f/dg/S5DYB2eaQoCIDu9PPL+egepCOlr5g5HgB4iMBmrRHUjKgogrtvESw5GAD3AaAJLlwtMQBUiQyvL6pzBxwAdq0ReDlNe0niAtAPALu3AoyIDgAt6ZldyCU0AswcNCYC5IHvsV9eJfzintuafdxLRdr/ug6cnz+9lOD4HRRN3UcdkCpdA84Wo7TvfdqsE9TwzkAyLhgINterka/28zH/ui2Ghq4RALLNASsANAE7AGWeuhbHIwLMCNjeDbXqRoR8yR4AQNlUxtrHHBAQl0+AZE3NosiOHMxa10NlaKOQMGeKaNSFtVJtAKH7TKLfYEDrAxTAXPK3AHY9sQuLzu2XNk8L/rP/V9hZF7JOiAfvoIVfArzB2nUaBHXu+1tV91kHkDYw6gBVmjZrR4hC/DJAZ5zPWRjI9h4MBFurbAlP3XIDoBC/AFBvRtd7RpyJ2e/HGTh7pYco3fsJQuMBcGMpJIwYnMC6UNUb1WpD99B4YU56nB9QRiVa+/2oRAogunOOCxBYSpleZFQ45hHG11yG7gdgAvQFAFEITp3zLQSZ1Jn1x104+n3qHAiAsDXeNh7EOfHPa+F3AKV8AIcc1yCsUq+BAAAAAElFTkSuQmCC'

window.png = new PNG().fromURL('testdata/testpng.png')


// let vector1 = new v2()

// let vector2 = new Vector3()

// let matrix1 = new m3()
// let matrix2 = new m4()

// let light1 = new SpotLight()
// let obj = new Object3D()

// let vector3 = new THREE.Vector4()


