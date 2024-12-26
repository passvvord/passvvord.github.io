//https://stackoverflow.com/questions/79170092/threejs-add-border-for-text-object



// window.THREE = THREE

function rgbaTextureFromCanvas(c) {
	const texture = new THREE.DataTexture(new Uint8Array(c.width*c.height*4), c.width, c.height, THREE.RGBAFormat)
	const gl = c.getContext('webgl2')
	texture.canvasChanged = function() {
		gl.readPixels(0, 0, c.width, c.height, gl.RGBA, gl.UNSIGNED_BYTE, this.source.data.data)
		this.needsUpdate = true;
	}
	texture.canvasChanged()
	// texture.flipY = false;
	
	return texture
}

function readCanvasRGBAPixelsTo(canvas,readTo) {
	const gl = canvas.getContext('webgl2')
	gl.readPixels(0, 0, c.width, c.height, gl.RGBA, gl.UNSIGNED_BYTE, readTo)
}


function calcPixelsHistRGBA(texture, printTop20 = false) {
	const pixels = texture.source.data.data
	const hist = {}
	for (let i = 0; i < pixels.length; i+=4) {
		//const key = `${(pixels[i  ]).toString().padStart(3)};${(pixels[i+1]).toString().padStart(3)};${(pixels[i+2]).toString().padStart(3)};${(pixels[i+3]).toString().padStart(3)};` //faster
		const key = pixels.slice(i,i+4).reduce((ac,a)=>ac+a.toString().padStart(3)+';','');
		if (hist.hasOwnProperty(key)) {
			hist[key]++
		} else {
			hist[key] = 1
		}
	}
	if (printTop20) {
		console.log(Object.entries(hist).sort((a,b)=>b[1]-a[1]).slice(0,20).reduce(
			(ac,a,i)=>ac+`\n\x1b[48;2;${a[0].slice(0,11).replaceAll(' ','')}m   \x1b[m${a[0].padStart(16)}|${a[1].toString().padStart(16)}|${(a[1]/pixels.length).toFixed(2).padStart(6)}%`
		,'        rgba       |      count     | % of all'))
	}
	return hist
}


function makeFlatBorder(geometry,borderWidth=5,fontColor=0x0000ff,borderColor=0xffff00,pxYSize = 200,canvas=document.createElement('canvas')) {
	if ( !(geometry.boundingBox instanceof THREE.Box3) ) {
		geometry.computeBoundingBox()
	}
	const bb = geometry.boundingBox.clone()
	const size = new THREE.Vector3().subVectors(bb.max,bb.min)
	const ortCam = new THREE.OrthographicCamera(
		bb.min.x,    bb.max.x,   //left, right
		bb.max.y,    bb.min.y,   //top , bottom
		bb.min.z-10, bb.max.z+10 //near, far 
	)

	const gl = canvas.getContext('webgl2')
	const maxTexSize = gl.getParameter(gl.MAX_TEXTURE_SIZE)
	
	const texSize = size.clone().divideScalar(size.y/pxYSize).round()
	if (texSize.x > maxTexSize || texSize.y > maxTexSize) {
		console.warn('you are trying to create too big texture (x,y):',texSize.x,texSize.y, '\nsize will be reduced')
		texSize.divideScalar((texSize.x > texSize.y ? texSize.x : texSize.y)/maxTexSize).floor()
		console.log('size of texture reduced to (x,y):',texSize.x,texSize.y)
	} else {
		console.log('texture size (x,y):',texSize.x,texSize.y)
	}
	
	const renderer = new THREE.WebGLRenderer({canvas: canvas});
	renderer.setSize( texSize.x, texSize.y );

	const scene0 = new THREE.Scene();
	const material = new THREE.MeshBasicMaterial({color: 0xffffff});
	material.depthTest = false;
	const text = new THREE.Mesh(geometry, material)
	scene0.add(text)
	renderer.render( scene0, ortCam );


	const renderedFrameAsTexture = rgbaTextureFromCanvas(canvas)
	// calcPixelsHistRGBA(renderedFrameAsTexture, true)

	const addBorderInside = new THREE.ShaderMaterial({
		uniforms: {
			u_tex: {value: renderedFrameAsTexture}, // result of rendering only text object with one color
			u_min: {value: bb.min},
			u_max: {value: bb.max},
			u_delta: {value: size},
			u_width: {value: borderWidth}, // in 3D space units
			u_targetColor: {value: new THREE.Color(fontColor)},
			// u_backgroundColor: {value: new THREE.Color(0x00_00_00)},
			u_borderColor: {value: new THREE.Color(borderColor)},
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
			
			uniform vec3 u_min;
			uniform vec3 u_max;
			uniform vec3 u_delta;

			uniform vec3 u_targetColor;
			uniform vec3 u_backgroundColor;
			uniform vec3 u_borderColor;

			uniform float u_width;

			vec4 getPx(sampler2D tex, vec2 pos, vec4 background) {
				if (pos.x < 0.0 || pos.x > 1.0 || pos.y < 0.0 || pos.y > 1.0) {
					return background;
				} else {
					return texture2D( tex, pos );
				}
			}

			float minDistanceToBorder(sampler2D tex, vec2 pos, float limit, vec4 backgroundColor, vec4 targetColor) {
				vec4 thisColor = texture2D( tex, pos );
				if (all(equal(thisColor,backgroundColor))) {
					return limit;
				}

				ivec2 iTextureSize = textureSize(tex,0);
				vec2 fTextureSize = vec2( float(iTextureSize.x) , float(iTextureSize.y) );
				vec2 fTexelSize = 1.0/fTextureSize;
				vec3 tempLimit = limit/u_delta*vec3(fTextureSize,0.0);
				ivec2 pxLimit = ivec2( floor(tempLimit.x), floor(tempLimit.y) );
				
				float result = limit;
				for (int y = -pxLimit.y; y <= pxLimit.y; y++) {
					for (int x = -pxLimit.x; x <= pxLimit.x; x++) {
						vec2 newPos = pos + fTexelSize*vec2( float(x), float(y) );
						vec4 texel = getPx( tex, newPos, backgroundColor );
						if (all(equal(texel,backgroundColor))) {
							float dist = distance(pos*u_delta.xy,newPos*u_delta.xy);                       // rounded edges
							// float dist = abs(pos.x-newPos.x)*u_delta.x + abs(pos.y-newPos.y)*u_delta.y; // sharp edges
							if (dist < result) { return 0.0; }
							// result = min(result, dist);
						}
					}
				}
				return result;
			}		

			void main() {
				vec4 thisColor = texture2D( u_tex, vUV );

				vec3 color = thisColor.rgb*u_targetColor;
				if (u_width > 0.0) {
					if (all(lessThan( thisColor.rgb, vec3(0.5) ))) {
						color = u_borderColor;
					} else {
						float distanceToNearestBackgroundPx = minDistanceToBorder( u_tex, vUV, u_width, vec4(0.0, 0.0, 0.0, 1.0), vec4(u_targetColor, 1.0) );
						float val = distanceToNearestBackgroundPx/u_width;
						color = u_borderColor*(1.0-val) + u_targetColor*val;						
					}
				}

				gl_FragColor = vec4(color,1.0);		
			}`
	});
	addBorderInside.needsUpdate = true;
	
	const scene1 = new THREE.Scene();
	const plane = new THREE.Mesh(new THREE.PlaneGeometry( size.x, size.y ), addBorderInside)
	plane.position.copy(new THREE.Vector3().lerpVectors(bb.max,bb.min,0.5))
	scene1.add(plane)
	renderer.render( scene1, ortCam );
	const resTexture = rgbaTextureFromCanvas(canvas) // result of applying shader on texture to add borders
	// calcPixelsHistRGBA(resTexture, true)

	resTexture.newBorder = function (borderWidth) {
		console.time('update')
		addBorderInside.uniforms.u_width.value = borderWidth
		renderer.render( scene1, ortCam )
		const gl = canvas.getContext('webgl2')
		gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, this.source.data.data)
		this.needsUpdate = true;
		console.timeEnd('update')		
	}

	return resTexture
}


function flatUVbyXY(geometry) {
	if ( !(geometry.boundingBox instanceof THREE.Box3) ) {
		geometry.computeBoundingBox()
	}
	const bb = geometry.boundingBox.clone()
	const delta = new THREE.Vector3().subVectors(bb.max,bb.min)

	for (let i = 0,j = 0; i < geometry.attributes.position.array.length; i+=3, j+=2) {
		geometry.attributes.uv.array[j  ] = (geometry.attributes.position.array[i  ]-bb.min.x)/delta.x
		geometry.attributes.uv.array[j+1] = (geometry.attributes.position.array[i+1]-bb.min.y)/delta.y
	}
	geometry.attributes.uv.needsUpdate = true;
}

	
const scene = new THREE.Scene();
window.scene = scene
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 20_000 );


const renderer = new THREE.WebGLRenderer({canvas: document.querySelector('canvas[id=screen]')});
renderer.setSize( window.innerWidth, window.innerHeight );
const controls = new OrbitControls( camera, renderer.domElement );


const loader = new FontLoader();
// const fontUrl = 'https://cdn.jsdelivr.net/npm/three@v0.170.0/examples/fonts/helvetiker_bold.typeface.json';
// const font = await fetch(fontUrl).then(r=>r.text().then(t=>loader.parse(JSON.parse(t))))
const font = loader.parse(window.fontObj)


const symbolsPerLine = Math.round(Math.sqrt(Object.keys(font.data.glyphs).length/2.5)*2.5)
const allSymbols = Object.keys(font.data.glyphs).sort().reduce((ac,a,i)=>ac+(i%symbolsPerLine==0 && i!=0?'\n':'')+a,'')


const geometry = new TextGeometry(allSymbols, {
	font: font,
	size: 80,
	depth: 10,
	bevelEnabled: false,
	bevelThickness: 1,
	bevelSize: 1,
	bevelOffset: 0,
	bevelSegments: 0
} );

flatUVbyXY(geometry)
const material = new THREE.MeshBasicMaterial( {
	// wireframe: true,
	color: 0xff0000
});




// const Tmaterial = new THREE.MeshBasicMaterial({
// 	map: new THREE.DataTexture(new Uint8Array([255,0,0,0]),1,1)
// 	// ,side: THREE.DoubleSide
// });
// Tmaterial.map.needsUpdate

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

// const uvBounds = getGeomAttrMinMax(geometry.attributes.uv)
// const showUVmaterial = new THREE.ShaderMaterial({
// 	uniforms: {
// 		u_UVmin: {value: new THREE.Vector2(uvBounds[0].min,uvBounds[1].min)},
// 		u_UVmax: {value: new THREE.Vector2(uvBounds[0].max,uvBounds[1].max)},
// 	},
// 	vertexShader:`
// 		varying vec2 vUV;
// 		void main() {
// 			vUV = uv;
// 			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
// 		}`,
// 	fragmentShader:`
// 		varying vec2 vUV;
// 		uniform vec2 u_UVmax;
// 		uniform vec2 u_UVmin;
// 		void main() {
// 			vec2 uv = (vUV - u_UVmin)/(u_UVmax - u_UVmin);
// 			gl_FragColor = vec4(uv.xy, 0.0, 1.0);
// 		}`
// });


const Tmaterial = new THREE.MeshBasicMaterial({
	map: makeFlatBorder(
	 	 geometry // text geometry
	 	,3        // borderWidth in 3D space units
	 	,0x0000ff // fontColor
	 	,0xffff00 // borderColor
	 	,2048     // target texture height in pixels (if width will be bigger than gl.MAX_TEXTURE_SIZE size will be reduced to allowed bounds)
	 	,document.querySelector('canvas[id=screen2]') // (optional) canvas in interface which show all texture
	)
	// ,side: THREE.DoubleSide
});
Tmaterial.map.magFilter = THREE.LinearFilter;
Tmaterial.map.needsUpdate = true

document.querySelector('canvas[id=screen2]').style.height = '200px'
document.querySelector('canvas[id=screen2]').style.width = 'auto'

const mesh = new THREE.Mesh(geometry, Tmaterial)
// const mesh = new THREE.Mesh(geometry, showUVmaterial)

geometry.computeBoundingSphere()
camera.position.set(
	 geometry.boundingSphere.center.x
	,geometry.boundingSphere.center.y
	,geometry.boundingSphere.radius/Math.tan(camera.fov/2/180*Math.PI)
)
controls.target = geometry.boundingSphere.center
controls.update();

geometry.computeBoundingBox()
scene.add(
	mesh
	,new THREE.Box3Helper( geometry.boundingBox, 0x00ff00 )
)

function animate() {
	requestAnimationFrame( animate );
	controls.update();
	renderer.render( scene, camera );	
};
animate();

// ------------------------------------------------------------------------
const gui = new GUI()
const props = {
	showTexture: true,
	borderWidth: 3,
}

gui.add( props, 'showTexture' ).onChange(value=>{
	document.querySelector('canvas[id=screen2]').style.display = value ? '' : 'none'; 
});
gui.add( props, 'borderWidth', 0, 10).onChange(value=>{
	console.log(value)
	Tmaterial.map.newBorder(value);
});