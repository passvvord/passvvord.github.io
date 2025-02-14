const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(0,0,5)

// const camera = new THREE.OrthographicCamera( ...Object.values( getParamsToOrtoGraficCamera(perspectiveCamera,5) ) )
// camera.near = 0
// camera.position.set(0.5,0.5,-5)

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
const canvas = document.body.appendChild( renderer.domElement )

const controls = new OrbitControls( camera, renderer.domElement );
// controls.target.set(0.5,0.5,0.5)
// controls.update();

const scene = new THREE.Scene();


const sphere = new THREE.Mesh(
	 new THREE.SphereGeometry(500, 64, 32)
	,new THREE.MeshBasicMaterial({
		map: new THREE.TextureLoader().load('https://i.imgur.com/wJeAbfa.jpeg'),
		side: THREE.DoubleSide
	})
)
scene.add(sphere)


// const dayNightMaterial = new THREE.ShaderMaterial({
// 	uniforms: {
// 		u_direction: {value: new THREE.Vector3(1,1,1)},
// 		u_dayTexture: {value: dayTexture},
// 		u_nightTexture: {value: nightTexture},
// 	},
// 	vertexShader:`
// 		// varying vec2 vUV;
// 		// varying vec3 vNormal;
// 		void main() {
// 			// vUV = uv;
// 			// vNormal = normal;
// 			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
// 		}`,
// 	fragmentShader:`
// 		varying vec2 vUV;
// 		varying vec3 vNormal;

// 		uniform vec3 u_direction;

// 		uniform sampler2D u_dayTexture;
// 		uniform sampler2D u_nightTexture;

// 		float smoothChange(float move, float delta, float x) {
// 			return 1.0/(1.0+pow(2.0, -10.0*(x-move)/delta));
// 		}

// 		// in radians [0...pi]
// 		float angleBetweenVec(vec3 a, vec3 b) {
// 			return acos( dot(a,b)/length(a)/length(b) );
// 		}

// 		const float PI = 3.141592653589793;
// 		void main() {

// 			vec4 dayTextureColor = texture2D( u_dayTexture, vUV );
// 			vec4 nightTextureColor = texture2D( u_nightTexture, vUV );

// 			gl_FragColor = color;
// 		}`
// });



// const texture = new THREE.TextureLoader().load('xyzCube2.png',tex=>{
// 	// plane.geometry.scale(
// 	// 	 tex.source.data.width
// 	// 	,tex.source.data.height
// 	// 	,1
// 	// )

// 	// tex.magFilter = THREE.NearestFilter
// 	// tex.needsUpdate = true
// 	// cubeTex.uniforms.u_tex.value = tex;
// 	material.map = tex
// });



scene.add(
	new THREE.AxesHelper( 5 )
)
function animate() {
	requestAnimationFrame( animate );
	controls.update();

	renderer.render( scene, camera );
};
animate();