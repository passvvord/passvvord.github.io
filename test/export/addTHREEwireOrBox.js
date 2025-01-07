// tested with THREE version == 0.170.0

function computeBBifnoBB(mesh) {
	if ( !(mesh?.geometry?.boundingBox instanceof THREE.Box3) ) {
		mesh.geometry.computeBoundingBox()
	}
}

function doIfMeshHasGeometry(mesh, f = (mesh)=>{console.log(' this function must do something with mesh ')}) {
	if ( mesh instanceof THREE.Mesh ) {
		if ( mesh.geometry instanceof THREE.BufferGeometry ) {
			f(mesh)
		} else {
			console.warn(`no geometry in given Mesh`)
		}			
	} else {
		console.warn(`${ mesh } (constructor: ${ mesh?.constructor.name }) is not instanceof THREE.Mesh`)
	}	
}

function addBoundingBox(...meshes) {
	let color = 0x20_20_20;
	if ( typeof meshes.at(-1) === 'number' || meshes.at(-1) instanceof THREE.Color ) {
		color = meshes.at(-1)
		meshes = meshes.slice(0,-1)
	}
	for (let mesh of meshes) {
		computeBBifnoBB(mesh)
		doIfMeshHasGeometry(mesh, mesh=>{
			mesh.add( new THREE.Box3Helper( mesh.geometry.boundingBox, color ) )
		})
	}	
}

function addWireFrame(...meshes) {
	let color = 0x20_20_20;
	if ( typeof meshes.at(-1) === 'number' || meshes.at(-1) instanceof THREE.Color ) {
		color = meshes.at(-1)
		meshes = meshes.slice(0,-1)
	}
	for (let mesh of meshes) {
		doIfMeshHasGeometry(mesh, mesh=>{
			mesh.add( new THREE.Mesh(
				 mesh.geometry
				,new THREE.MeshBasicMaterial({color: color, wireframe: true })
			) )
		})
	}		
}

export { addBoundingBox, addWireFrame }