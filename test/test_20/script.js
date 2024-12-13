const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
camera.position.set(0,0,60)

const renderer = new THREE.WebGLRenderer({canvas: document.querySelector('canvas[id=screen]')});
renderer.setSize( window.innerWidth, window.innerHeight );
const controls = new OrbitControls( camera, renderer.domElement );


// const geometry = new THREE.SphereGeometry( 10, 8, 4 );
const geometry = new THREE.SphereGeometry( 10, 32, 16 ); 
// const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } ); 

function getMinMaxFrom2DFlatArr(Arr,itemSize) {
	return Arr.reduce( (ac,a,i)=>{
		if (a<ac[i%itemSize].min) {
			ac[i%itemSize].min=a
		} else if (a>ac[i%itemSize].max) {
			ac[i%itemSize].max=a
		}
		return ac;
	},new Array(itemSize).fill().map(a=>({min: +Infinity, max: -Infinity})) )
}

function getGeomAttrMinMax(attr) { //attr = geometry.attributes.position
	return getMinMaxFrom2DFlatArr(attr.array, attr.itemSize)
}

const uvBounds = getGeomAttrMinMax(geometry.attributes.uv)
console.log(uvBounds)

const showUVmaterial = new THREE.ShaderMaterial({
	uniforms: {
		u_UVmin: {value: new THREE.Vector2(uvBounds[0].min,uvBounds[1].min)},
		u_UVmax: {value: new THREE.Vector2(uvBounds[0].max,uvBounds[1].max)},
	},
	vertexShader:`
		varying vec2 vUV;
		void main() {
			vUV = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}`,
	fragmentShader:`
		varying vec2 vUV;
		uniform vec2 u_UVmax;
		uniform vec2 u_UVmin;
		void main() {
			vec2 uv = (vUV - u_UVmin)/(u_UVmax - u_UVmin);
			gl_FragColor = vec4(uv.xy, 0.0, 1.0);
		}`
});

const showNormalsMaterial = new THREE.ShaderMaterial({
	uniforms: {},
	vertexShader:`
		varying vec3 vNormal;
		void main() {
			vNormal = normal;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}`,
	fragmentShader:`
		varying vec3 vNormal;
		void main() {
			///max(max(vNormal.x, vNormal.y), vNormal.z)
			gl_FragColor = vec4( vNormal, 1.0);
		}`
});





const dayTexture = new THREE.DataTexture( dayImage.data, dayImage.width, dayImage.height )
dayTexture.flipY = true
dayTexture.needsUpdate = true

const nightTexture = new THREE.DataTexture( nightImage.data, nightImage.width, nightImage.height )
nightTexture.flipY = true
nightTexture.needsUpdate = true

const dayNightMaterial = new THREE.ShaderMaterial({
	uniforms: {
		u_direction: {value: new THREE.Vector3(1,1,1)},
		u_dayTexture: {value: dayTexture},
		u_nightTexture: {value: nightTexture},
	},
	vertexShader:`
		varying vec2 vUV;
		varying vec3 vNormal;
		void main() {
			vUV = uv;
			vNormal = normal;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}`,
	fragmentShader:`
		varying vec2 vUV;
		varying vec3 vNormal;

		uniform vec3 u_direction;

		uniform sampler2D u_dayTexture;
		uniform sampler2D u_nightTexture;

		float smoothChange(float move, float delta, float x) {
			return 1.0/(1.0+pow(2.0, -10.0*(x-move)/delta));
		}

		// in radians [0...pi]
		float angleBetweenVec(vec3 a, vec3 b) {
			return acos( dot(a,b)/length(a)/length(b) );
		}

		const float PI = 3.141592653589793;
		void main() {

			vec4 dayTextureColor = texture2D( u_dayTexture, vUV );
			vec4 nightTextureColor = texture2D( u_nightTexture, vUV );

			// float center = PI/2.0;
			// float halfDelta = PI/40.0;
			// float val = smoothstep( center-halfDelta, center+halfDelta, angleBetweenVec(vNormal, u_direction));

			float val = smoothChange(PI/2.0, PI/16.0, angleBetweenVec(vNormal, u_direction));

			vec4 color;


			color = mix( nightTextureColor, dayTextureColor, val );
			// color = vec4( vec2(round(val*10.0)/10.0), 1.0, 1.0 );
			// color = vec4( vec2(val), 1.0, 1.0 );
			// color = vec4( vUV.xy, val, 1.0 );
			// color = vec4( (vNormal+1.0)/2.0, 1.0 );
			gl_FragColor = color;
		}`
});

const Tmaterial = new THREE.MeshBasicMaterial({
	map: nightTexture
	// ,side: THREE.DoubleSide
});
// Tmaterial.map.magFilter = THREE.LinearFilter;

const sphere = new THREE.Mesh( geometry, dayNightMaterial );
// const sphere = new THREE.Mesh( geometry, showNormalsMaterial );

const arrowHelper = new THREE.ArrowHelper(
	dayNightMaterial.uniforms.u_direction.value.clone().normalize()
	,dayNightMaterial.uniforms.u_direction.value.clone().normalize().multiplyScalar(-12)
	,5
	,0xffff00
	,2.5
	,1
)

scene.add(
	sphere
	,new THREE.AxesHelper( 20 )
	,arrowHelper
	,new VertexNormalsHelper( sphere, 1, 0xff0000 )
);

function animate() {
	requestAnimationFrame( animate );

	const time = Date.now()/1000
	dayNightMaterial.uniforms.u_direction.value.set(Math.cos(time/4),-0.1,Math.sin(time/4))

	arrowHelper.position.copy( dayNightMaterial.uniforms.u_direction.value.clone().normalize().multiplyScalar(-15) )
	arrowHelper.setDirection(dayNightMaterial.uniforms.u_direction.value.clone().normalize())

	controls.update();
	renderer.render( scene, camera );	
};
animate();