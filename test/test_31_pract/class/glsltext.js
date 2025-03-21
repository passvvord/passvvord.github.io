class glsltext {

	static asFloat(num) {
		const str = String(num)
		return (str.includes('.') ? str : str+'.')
	}

	static asFloatPlus(num) {
		let str = this.asFloat(num)
		str = (str.includes('-') ? str : '+'+str)
		return str
	}	

	static asInt(num) {
		return (num).toFixed(0)
	}

	static asIntPlus(num) {
		let str = this.asInt(num)
		str = (str.includes('-') ? str : '+'+str)
		return str
	}

}

export {glsltext}