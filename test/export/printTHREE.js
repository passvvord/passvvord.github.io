// tested with THREE version == 0.170.0

// sep=' ',left=['⎡','\n⎢','\n⎣'],right='⎤⎥⎦'
function generateTHREEMatStr(W,H,sep,left,right) {
	let res = '`'
	for (let w=0; w<W; w++) {
		const lrpos = Math.floor((w-1)/(W-2)+1)
		res += left[lrpos] //(w!=0?'\n':'')
		for (let h=0; h<H; h++) {
			const index = h*W+w
			res+='${f(m['+index+'])}'+( h+1 != H ? sep : '' )
		}
		res+=right[lrpos]
	}
	return (res+'`').replaceAll('\\', '\\\\');
}

function initTHREEprintMethods(params = {}) {
	const defaultParams = {
		leftTable : ['⎡','\n⎢','\n⎣'], //'⎡⎢⎣', //'┌│└', 
		rightTable: '⎤⎥⎦',                   //'┐│┘',
		separator: ' ',
	}
	params = Object.assign(defaultParams, params)

	function modifyMethod(obj, name, func) {
		if (obj instanceof Object) {
			obj.prototype[name] = func;
		} else {
			console.warn(`${obj} is not instance of Object and it's .toString() method can't be modified`)
		}
	}

	const latexParams = {
		left:  ['\\begin{bmatrix}\n    ', '    ', '    '],
		right: ['\\\\\n','\\\\\n','\n\\end{bmatrix}'],
		sep: ' & ',
		maxLen: '.reduce((ac,a)=>{const alen = String(a).length; return (alen > ac ? alen : ac) },0)'
	}

	modifyMethod(THREE.Matrix4, 'toString', new Function('f = v=>v.toFixed(4).padStart(10)',`
		const m = this.elements;
		return ${ generateTHREEMatStr(4, 4, params.separator, params.leftTable, params.rightTable) };
	`))

	modifyMethod(THREE.Matrix4, 'toLatex', new Function('f',`
		const m = this.elements;
		if (!f) {
			const maxLen = m${latexParams.maxLen};
			f = v=>String(v).padStart( maxLen );
		}
		return ${ generateTHREEMatStr(4, 4, latexParams.sep, latexParams.left, latexParams.right) };
	`))

	modifyMethod(THREE.Matrix3, 'toString', new Function('f = v=>v.toFixed(4).padStart(10)',`
		const m = this.elements;
		return ${ generateTHREEMatStr(3, 3, params.separator, params.leftTable, params.rightTable) };
	`))

}

export { initTHREEprintMethods }