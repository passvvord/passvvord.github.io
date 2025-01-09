// tested with THREE version == 0.170.0

function attachUniformValueToProps(addTo, name, linkToVal, params = [], props = undefined) {
	// linkToVal is material.uniforms.u_val NOT material.uniforms.u_val.value !!!
	if ( !(props instanceof Object) ) {
		props = {}
	}

	Object.defineProperty(props, name, {
		get() {return linkToVal.value},
		set(v) {      linkToVal.value = v}
	})

	addTo.add(props, name, ...params)
}

function addVisibilityChangerToGui(addTo, name, object3d, props = undefined) {
	if ( !(props instanceof Object) ) {
		props = {}
	}
	Object.defineProperty(props, name, {
		get() {return object3d.visible},
		set(v) {      object3d.visible = v}
	})

	addTo.add(props, name)
}

export { attachUniformValueToProps, addVisibilityChangerToGui }