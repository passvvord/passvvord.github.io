const camera = new THREE.OrthographicCamera( ...Object.values({
		left: -5,
		right: 5,
		top: 5,
		bottom: -5,
		near: -10,
		far: 10,
	})
)

const renderer = new THREE.WebGLRenderer();
renderer.setSize(1000, 1000);
// renderer.setPixelRatio(window.devicePixelRatio);
const canvas = document.body.appendChild( renderer.domElement )

const scene = new THREE.Scene();

function shaderMaterialByFuncBody(
	body = `
		uniform float u_var;

		float func() {
			return cos(u_var);
		}
	`
	,uniforms = {
		u_var: { get value() {return Math.random()*0.9+0.1 } }
	},
	funcOutputType = 'float'
) {
	const material = new THREE.ShaderMaterial({
		uniforms: {
			u_N: {value: 1_000_000},
		},
		vertexShader:`
			void main() {
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
			}`,
		fragmentShader:`
			uniform int u_N;

			${body}

			void main() {
				vec4 color = vec4(0.0, 1.0, 0.0, 1.0);

				for (int i = 0; i < u_N; i++) {
					${funcOutputType} temp = func();
					color.r += float(i);
				}

				color.r = u_var;
				gl_FragColor = color;
			}`
	});
	
	Object.assign(material.uniforms, uniforms)
	return material
}

const testNum = '2'

const mat1 = shaderMaterialByFuncBody(`
	uniform float u_var;

	float pow2(float a) { return a*a; }
	float pow3(float a) { return pow2(a)*a; }

	float pow4(float a) { return pow2(pow2(a)); }
	float pow5(float a) { return pow4(a)*a; }

	float pow6(float a) { return pow2(pow3(a)); }
	float pow7(float a) { return pow6(a)*a; }

	float pow8(float a) { return pow2(pow4(a)); }
	float pow9(float a) { return pow8(a)*a; }

	float pow16(float a) { return pow4(pow4(a)); }

	float func() {
		return pow${testNum}(u_var);
	}
`)

const mat2 = shaderMaterialByFuncBody(`
	uniform float u_var;

	${
		new Array(16-1) //skip 0 and 1 and include 9
			.fill()
			.map((_,i)=>`float pow${i+2}(float a) {return ${'*a'.repeat(i+2).slice(1)};}`)
			.join('\n')
	}

	float func() {
		return pow${testNum}(u_var);
	}
`)

const mat3 = shaderMaterialByFuncBody(`
	uniform float u_var;

	float pow2(float a) { return a*a; }
	float pow3(float a) { return pow2(a)*a; }

	float pow4(float a) { return pow2(pow2(a)); }
	float pow5(float a) { return pow4(a)*a; }

	float pow6(float a) { return pow2(pow3(a)); }
	float pow7(float a) { return pow6(a)*a; }

	float pow8(float a) { return pow2(pow4(a)); }
	float pow9(float a) { return pow8(a)*a; }

	float pow16(float a) { return pow4(pow4(a)); }

	float func() {
		return pow(u_var, ${testNum}.01);
	}
`)

const materials = [mat1, mat2, mat3]

const geometry = new THREE.PlaneGeometry( 5, 5 ); // 1 / 4 of cam view

const mesh = new THREE.Mesh(geometry);

scene.add(mesh)

for (let j = 0; j < 10; j++) {
	for (let i = 0; i <  materials.length; i++) {

		mesh.material = materials[i];

		console.time(`${j}.${i}. first render + compile`)
		renderer.render( scene, camera );
		console.timeEnd(`${j}.${i}. first render + compile`)

		console.time(`${j}.${i}. second render`)
		renderer.render( scene, camera );
		console.timeEnd(`${j}.${i}. second render`)

	}
	console.log('')
}
