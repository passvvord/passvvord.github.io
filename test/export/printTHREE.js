// tested with THREE version == 0.170.0

function generateTHREEMatStr(W,H,sep=' ',left='⎡⎢⎣',right='⎤⎥⎦') {
	let res = '`'
	for (let w=0; w<W; w++) {
		const lrpos = Math.floor((w-1)/(W-2)+1)
		res+=(w!=0?'\n':'')+left[lrpos]
		for (let h=0; h<H; h++) {
			const index = h*W+w
			res+='${f(m['+index+'])}'+sep
		}
		res+=right[lrpos]
	}
	return res+'`';
}

function initTHREEprintMethods(params = {}) {
	const defaultParams = {
		leftTable : '⎡⎢⎣', //'┌│└',
		rightTable: '⎤⎥⎦', //'┐│┘',
		separator: ' ',
	}
	params = Object.assign(defaultParams, params)	

	function modifyToStringMethod(obj, func) {
		if (obj instanceof Object) {
			obj.prototype.toString = func;
		} else {
			console.warn(`${obj} is not instance of Object and it's .toString() method can't be modified`)
		}
	}

	modifyToStringMethod(THREE.Matrix4, new Function('f = v=>v.toFixed(4).padStart(10)',`
		const m = this.elements;
		return ${ generateTHREEMatStr(4, 4, params.separator, params.leftTable, params.rightTable) };
	`))

	modifyToStringMethod(THREE.Matrix3, new Function('f = v=>v.toFixed(4).padStart(10)',`
		const m = this.elements;
		return ${ generateTHREEMatStr(3, 3, params.separator, params.leftTable, params.rightTable) };
	`))

}

export { initTHREEprintMethods }