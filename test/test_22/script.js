




// const texStr = {
// 	width: 6,
// 	height: 5,
// 	str: `
// +----+
// --++--
// +----+
// --++--
// +----+
// +-++++
// `,
// 	colors: {
// 		'+': [255,255,0,255],
// 		'-': [0,0,255,255],
// 	},
// }

// console.log(
// 	texStr.str.replaceAll(/[^+-]/g,'').split('').reduce((ac,a,i)=>ac+`${i%texStr.width==0&&i!=0?'\n':''}\x1b[48;2;${texStr.colors[a].slice(0,3).join(';')}m. `,'')
// )

// const texData = texStr.str.replaceAll(/[^+-]/g,'').split('').reduce((ac,a,i)=>{
//     const pos = i*4;
//     ac[pos  ] = texStr.colors[a][0];
//     ac[pos+1] = texStr.colors[a][1];
//     ac[pos+2] = texStr.colors[a][2];
//     ac[pos+3] = texStr.colors[a][3];
//     return ac
// },new Uint8Array(texStr.width*texStr.height*4))


// const texture = new THREE.DataTexture(texData, texStr.width, texStr.height, THREE.RGBAFormat)
// texture.flipY = true;
// texture.needsUpdate = true;

const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.01, 10000 );

const renderer = new THREE.WebGLRenderer({canvas: document.querySelector('canvas[id=screen]')});
renderer.setSize( window.innerWidth, window.innerHeight );
const controls = new OrbitControls( camera, renderer.domElement );

const scene = new THREE.Scene();


const smooth2colorTexture = new THREE.ShaderMaterial({
	uniforms: {
		u_tex: {value: new THREE.DataTexture()},
		u_usePixels: {value: 1.5},
		u_onlyColor: {value: false},
		u_stepAsGrad: {value: true},
		u_gridDots: {value: true},
		u_showRealTexColor: {value: true},
		u_step: {value: 0.03},
		u_color0: {value: new THREE.Color(0xffff00)},
		u_color1: {value: new THREE.Color(0x0000ff)},
		u_color0modifier: {value: 1},
		u_color1modifier: {value: 1},
		u_showDiffWithRealColor: {value: false},
	},
	vertexShader:`
		varying vec2 vUV;
		void main() {
			vUV = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}`,
	fragmentShader:`
		varying vec2 vUV;

		uniform sampler2D u_tex;
		
		uniform vec3 u_color0;
		uniform vec3 u_color1;

		uniform float u_usePixels;

		uniform float u_step;
		uniform bool u_onlyColor;
		uniform bool u_stepAsGrad;
		uniform bool u_gridDots;
		uniform bool u_showRealTexColor;
		uniform float u_color0modifier;
		uniform float u_color1modifier;
		uniform bool u_showDiffWithRealColor;


		// vec4 getPx(sampler2D tex, vec2 pos, vec4 background) {
		// 	if (pos.x < 0.0 || pos.x > 1.0 || pos.y < 0.0 || pos.y > 1.0) {
		// 		return background;
		// 	} else {
		// 		return texture2D( tex, pos );
		// 	}
		// }

		vec3 getColor(sampler2D tex, vec2 pos, vec3 col0, vec3 col1) {

			ivec2 iTextureSize = textureSize(tex,0);
			vec2 fTextureSize = vec2( float(iTextureSize.x) , float(iTextureSize.y) );
			vec2 fTexelSize = 1.0/fTextureSize;

			vec2 texelCenterPos = (floor(pos*fTextureSize)+0.5)/fTextureSize;

			ivec2 pxLimit = ivec2( ceil(u_usePixels), ceil(u_usePixels) );
			float pixelsCount = (float(pxLimit.x)*2.0+1.0)*(float(pxLimit.y)*2.0+1.0);
			vec2 limiter = 9.0/2.0/vec2(pow(u_usePixels*fTexelSize.x,2.0),pow(u_usePixels*fTexelSize.y,2.0));

			highp float col0sum = 0.0;
			highp float col1sum = 0.0;
			
			for (int y = -pxLimit.y; y <= pxLimit.y; y++) {
				for (int x = -pxLimit.x; x <= pxLimit.x; x++) {
					vec2 newPos = texelCenterPos + fTexelSize*vec2( float(x), float(y) );
					vec4 texel = texture2D( tex, newPos );

					highp float h = exp(-limiter.x*pow(pos.x-newPos.x,2.0))*exp(-limiter.y*pow(pos.y-newPos.y,2.0))/pixelsCount;
					if (all(equal(texel.rgb,col0))) {
						col0sum+=h;
					} else if (all(equal(texel.rgb,col1))) {
						col1sum+=h;
					} else {
						return vec3(0.0, 1.0, 0.0); // idk why, maybe strange compilation but this makes random wrong pixels disappear 
					}
				}
			}

			col0sum*=u_color0modifier;
			col1sum*=u_color1modifier;

			if (u_onlyColor) {
				if (col0sum > col1sum) {
					return col0;
				} else {
					return col1;
				}
			} else {
				if (u_stepAsGrad) {
					if (col0sum > col1sum) {
						return col0*(1.0-mod(col0sum, u_step)/u_step);
					} else {
						return col1*(1.0-mod(col1sum, u_step)/u_step);
					}					
				} else {
					if (col0sum > col1sum) {
						return mod(col0sum, u_step)/u_step <= 0.5 ? col0 : vec3(0.0);
					} else {
						return mod(col1sum, u_step)/u_step <= 0.5 ? col1 : vec3(0.0);
					}
				}
			}
		}		

		void main() {
			vec4 thisColor = texture2D( u_tex, vUV);

			ivec2 iTextureSize = textureSize(u_tex,0);
			vec2 fTextureSize = vec2( float(iTextureSize.x) , float(iTextureSize.y) );
			vec2 fTexelSize = 1.0/fTextureSize;
			vec2 texelCenterPos = (floor(vUV*fTextureSize)+0.5)/fTextureSize;

			vec3 color = getColor(u_tex, vUV, u_color0, u_color1);;

			if ( u_showDiffWithRealColor ) {
				if (any(notEqual(color,thisColor.rgb))) {
					float tempSize = (fTexelSize.x+fTexelSize.y)/20.0;
					if ( mod(vUV.x+vUV.y,tempSize)/tempSize < 0.33 || mod(vUV.x-vUV.y,tempSize)/tempSize < 0.33 ) {
						color = vec3(1.0, 0.0, 0.0);
					}
				}
			}
			if ( u_gridDots && all(greaterThan(abs(texelCenterPos-vUV), fTexelSize*0.48)) ) {
				if ( all(greaterThan(abs(texelCenterPos-vUV), fTexelSize*0.49)) ) {
					color = vec3(1.0);
				} else {
					color = vec3(0.0);
				}
			} else if ( u_showRealTexColor && length((texelCenterPos - vUV)/fTexelSize) < 0.08 ) {
				if ( length((texelCenterPos - vUV)/fTexelSize) < 0.065 ) {
					color = thisColor.rgb;
				} else {
					color = vec3(0.0);
				}
			}

			// color = thisColor.rgb;



			gl_FragColor = vec4(color, 1.0);
		}`
});
smooth2colorTexture.needsUpdate = true;

const plane = new THREE.Mesh(new THREE.PlaneGeometry( 1, 1), smooth2colorTexture)

const texture = new THREE.TextureLoader().load('testTex1.png',tex=>{
	plane.geometry.scale(
		 tex.source.data.width
		,tex.source.data.height
		,1
	)

	tex.magFilter = THREE.NearestFilter
	tex.needsUpdate = true
	smooth2colorTexture.uniforms.u_tex.value = tex;
});

scene.add(plane)

plane.geometry.computeBoundingSphere()
camera.position.set(
	 plane.geometry.boundingSphere.center.x
	,plane.geometry.boundingSphere.center.y
	,0.1 //plane.geometry.boundingSphere.radius/Math.tan(camera.fov/2/180*Math.PI)
)
controls.target = plane.geometry.boundingSphere.center
controls.update();

function animate() {
	requestAnimationFrame( animate );
	controls.update();
	renderer.render( scene, camera );	
};
animate();


// ------------------------------------------------------------------------
const gui = new GUI()
const props = {
	get gausRadius() {return smooth2colorTexture.uniforms.u_usePixels.value},
	set gausRadius(v) {      smooth2colorTexture.uniforms.u_usePixels.value = v},

	get step() {return smooth2colorTexture.uniforms.u_step.value},
	set step(v) {      smooth2colorTexture.uniforms.u_step.value = v},

	get stepAsGrad() {return smooth2colorTexture.uniforms.u_stepAsGrad.value},
	set stepAsGrad(v) {      smooth2colorTexture.uniforms.u_stepAsGrad.value = v},

	get onlyColor() {return smooth2colorTexture.uniforms.u_onlyColor.value},
	set onlyColor(v) {      smooth2colorTexture.uniforms.u_onlyColor.value = v},

	get gridDots() {return smooth2colorTexture.uniforms.u_gridDots.value},
	set gridDots(v) {      smooth2colorTexture.uniforms.u_gridDots.value = v},

	get showRealTexColor() {return smooth2colorTexture.uniforms.u_showRealTexColor.value},
	set showRealTexColor(v) {      smooth2colorTexture.uniforms.u_showRealTexColor.value = v},

	get color0modifier() {return smooth2colorTexture.uniforms.u_color0modifier.value},
	set color0modifier(v) {      smooth2colorTexture.uniforms.u_color0modifier.value = v},

	get color1modifier() {return smooth2colorTexture.uniforms.u_color1modifier.value},
	set color1modifier(v) {      smooth2colorTexture.uniforms.u_color1modifier.value = v},

	get showDiffWithRealColor() {return smooth2colorTexture.uniforms.u_showDiffWithRealColor.value},
	set showDiffWithRealColor(v) {      smooth2colorTexture.uniforms.u_showDiffWithRealColor.value = v},
}

gui.add( props, 'gausRadius', 0.5, 10)
gui.add( props, 'step', 0.001, 0.5)
gui.add( props, 'stepAsGrad')
gui.add( props, 'onlyColor')
gui.add( props, 'gridDots')
gui.add( props, 'showRealTexColor')
gui.add( props, 'color0modifier',0,2)
gui.add( props, 'color1modifier',0,2)
gui.add( props, 'showDiffWithRealColor')