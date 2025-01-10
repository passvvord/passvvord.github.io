// tested with THREE version == 0.170.0
// require THREE and Byte64 (custom class, https://passvvord.github.io/test/export/Base64.js)

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

function THREEmatrix4toByte64(matrix) {
	return Base64.Uint8ToBase64(new Uint8Array( new Float32Array( matrix.clone().transpose().elements ).buffer ))
}

// function THREEmatrix4toByte64safe(matrix) {
// 	if (matrix instanceof THREE.Matrix4) {
// 		return THREEmatrix4toByte64(matrix)
// 	} else {
// 		console.error(`${matrix} (constructor: ${matrix?.constructor.name}) is not instance of THREE.Matrix4`)
// 	}
// }

function Byte64toTHREEmartix4(byte64) {
	return new THREE.Matrix4( ...new Float32Array( Base64.Base64ToUint8( byte64 ).buffer ) )
}

function searchToUrl(search) {
	return window.location.origin + window.location.pathname + '?' + search
}

function getUrlByGuiCameraOrbitControls(gui, camera, orbitControls) {
	// tested with perspective and ortographic camera
	const data = {
		g: gui.save(),
		cm: THREEmatrix4toByte64(camera.matrix),
		dt: camera.position.distanceTo( orbitControls.target ),
	}

	if ( camera.zoom != undefined && camera.zoom != 1 ) { // 1 is default value
		data.z = camera.zoom
	}

	return searchToUrl( btoa(JSON.stringify(data)) )
}

function setGuiCameraOrbitControlsBySearch(gui, camera, orbitControls, search = window.location.search) {
	// tested with perspective and ortographic camera
	if ( search?.length <= 1 ) { return; }

	const data = JSON.parse(atob( search.slice(1) ))
	console.log('state from window.location.search\n',data)

	gui.load( data.g )

	const matrix = Byte64toTHREEmartix4( data.cm )
	matrix.decompose( camera.position, camera.quaternion, camera.scale )
	orbitControls.target = new THREE.Vector3(0,0,-data.dt).applyMatrix4(matrix)

	if (data.z) {
		camera.zoom = data.z
		camera.updateProjectionMatrix()
	}
}

export {
	 attachUniformValueToProps
	,addVisibilityChangerToGui
	,getUrlByGuiCameraOrbitControls
	,setGuiCameraOrbitControlsBySearch
}