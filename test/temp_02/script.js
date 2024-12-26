function rgbaTextureFromCanvas(c) {
	const texture = new THREE.DataTexture(new Uint8Array(c.width*c.height*4), c.width, c.height, THREE.RGBAFormat)
	const gl = c.getContext('webgl2')
	texture.canvasChanged = function() {
		gl.readPixels(0, 0, c.width, c.height, gl.RGBA, gl.UNSIGNED_BYTE, this.source.data.data)
		// this.flipY = false;
		this.needsUpdate = true;
	}
	texture.canvasChanged()
	return texture
}

const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.01, 1000 );
camera.position.set(0,0,6.5)

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
const canvas = document.body.appendChild( renderer.domElement )

const controls = new OrbitControls( camera, renderer.domElement );

const scene = new THREE.Scene();

const screenTexture = rgbaTextureFromCanvas(renderer.domElement)
const specialMaterial = new THREE.ShaderMaterial({
	uniforms: {
		u_screenTexture: {value: screenTexture}
	},
	vertexShader:`
		varying vec2 vUV;

		void main() {
			vUV = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}`,
	fragmentShader:`
		varying vec2 vUV;

		uniform sampler2D u_screenTexture;
		// uniform vec2 u_resolution;

		float RGBtoGray(vec4 C) { return 0.299*C.r + 0.587*C.g + 0.114*C.b; }



		void main() {

			ivec2 iTextureSize = textureSize(u_screenTexture,0);
			vec2 fTextureSize = vec2( float(iTextureSize.x) , float(iTextureSize.y) );

			vec4 color = texture2D( u_screenTexture, gl_FragCoord.xy/fTextureSize );

			if ( all(equal(color,vec4(0.0))) ) {
				// not overlapped
				color = vec4(1.0, 0.0, 1.0, 1.0);
			} else {
				// overlapped by some other object
				color = vec4(color.rgb*0.8, 1.0);
				float delta = 0.05;
				float limit = 0.33; 
				if ( mod(vUV.x+vUV.y,delta)/delta < limit || mod(vUV.x-vUV.y,delta)/delta < limit ) {
					if ( RGBtoGray(color) > 0.5 ) {
						color -= vec4(0.33, 0.33, 0.33, 0.0);
					} else {
						color += vec4(0.33, 0.33, 0.33, 0.0);
					}
				}

			}

			gl_FragColor = color;
		}`
});
specialMaterial.depthTest = false

const transparentPixels = new THREE.ShaderMaterial({
	uniforms: {},
	vertexShader:`
		void main() {
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}`,
	fragmentShader:`
		void main() {
			gl_FragColor = vec4(0.0);
		}`
});

const specialMesh = new THREE.Mesh(
	 new THREE.BoxGeometry(1, 1, 1)
	,transparentPixels
)

const mesh1 = new THREE.Mesh(
	 new THREE.BoxGeometry(1, 1, 1)
	,new THREE.MeshBasicMaterial({color: 0xff_ff_00})
)
mesh1.position.set(-1,0,2)

const mesh2 = new THREE.Mesh(
	 new THREE.BoxGeometry(1, 1, 1)
	,new THREE.MeshBasicMaterial({color: 0x00_00_ff})
)
mesh2.position.set( 1,0,2)

const mesh3 = new THREE.Mesh(
	 new THREE.BoxGeometry(1, 1, 1)
	,new THREE.MeshBasicMaterial({color: 0x00_00_00})
)
mesh3.position.set(0,-1,2)

const mesh4 = new THREE.Mesh(
	 new THREE.BoxGeometry(1, 1, 1)
	,new THREE.MeshBasicMaterial({color: 0xff_ff_ff})
)
mesh4.position.set(0, 1,2)


for (mesh of [specialMesh,mesh1,mesh2,mesh3,mesh4]) {
	if ( !(mesh.geometry.boundingBox instanceof THREE.Box3) ) {
		mesh.geometry.computeBoundingBox()
	}
	mesh.add( new THREE.Box3Helper( mesh.geometry.boundingBox, 0x20_20_20 ) )
}

scene.add(
	 specialMesh
	,mesh1
	,mesh2
	,mesh3
	,mesh4
	,new THREE.AxesHelper( 5 )
)

function animate() {
	requestAnimationFrame( animate );
	// controls.update();

	renderer.autoClear = true;
	specialMesh.material = transparentPixels;
	specialMesh.layers.set(0)
	camera.layers.set(0)
	renderer.render( scene, camera );

	renderer.autoClear = false;
	screenTexture.canvasChanged()
	specialMesh.material = specialMaterial
	specialMesh.layers.set(1)
	camera.layers.set(1)
	renderer.render( scene, camera );
};
animate();

