// expect THREE to be global object which represents THREE module

class SurfaceByFunction {

	constructor(
		 glslReadyFunc = `
			bool func(vec3 v) {
				return cos(v.x)*cos(v.y)*cos(v.z) > 0.5;
			}

			//https://www.wolframalpha.com/input?i=grad+cos%28x%29cos%28y%29cos%28z%29
			//grad(cos(x) cos(y) cos(z)) = (-cos(y) cos(z) sin(x), -cos(x) cos(z) sin(y), -cos(x) cos(y) sin(z))

			vec3 gradFunc(vec3 v) {
				return vec3(
					 -cos(v.y)*cos(v.z)*sin(v.x)
					,-cos(v.x)*cos(v.z)*sin(v.y)
					,-cos(v.x)*cos(v.y)*sin(v.z)
				);
			}`
		,camera
		,from = THREE.Vector3(0,0,0)
		,to = THREE.Vector3(1,1,1)	
	) {
		if ( !(camera instanceof THREE.OrthographicCamera) ) {
			console.warn('currently support only OrthographicCamera it will also work on PerspectiveCamera but will look not good')
		}

		// if ( !(mesh?.geometry?.boundingBox instanceof THREE.Box3) ) {
		// 	mesh.geometry.computeBoundingBox()
		// }
		const mesh = new THREE.Mesh()//geometry, material

		const geometry = new THREE.BufferGeometry()
		geometry.setAttribute( 'position', new THREE.Float32BufferAttribute(
			Float32Array.of(0,0,0, 1,0,0, 0,1,0, 1,1,0, 0,0,1, 1,0,1, 0,1,1, 1,1,1)
				.map((a,i)=> (a == 0 ? from : to)['xyz'[i%3]] )
			,3) 
		)
		geometry.setIndex( new THREE.Uint8BufferAttribute( Uint8Array.of(0,4,6, 0,1,5, 1,0,2, 2,0,6, 2,6,3, 3,1,2, 4,0,5, 4,5,7, 5,1,3, 6,7,3, 6,4,7, 7,5,3), 1 ) )

		mesh.geometry = geometry;

		const material = new THREE.ShaderMaterial({
			uniforms: {
				u_lookVec: { get value() {
					return new THREE.Vector3(0,0,-1).applyMatrix4(new THREE.Matrix4().extractRotation(camera.matrix))
				} },
				u_Ni: {value: 100},
				u_Nj: {value: 10},
				u_fillType: {value: 4},

				u_projectionMatrix: { get value() {return camera.projectionMatrix} },
				u_modelViewMatrix: { get value() {return mesh.modelViewMatrix} },

				//u_matrixWorld: { get value() {return mesh.matrixWorld} },

				u_step: {value: 5},
				u_limit: {value: 0.1},

				u_min: {value: from},//{ get value() {return mesh.geometry.boundingBox.min} },
				u_max: {value: to  },//{ get value() {return mesh.geometry.boundingBox.max} },

			},
			vertexShader:`
				varying vec3 vPosition;

				void main() {
					vPosition = position;
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}`,
			fragmentShader:`
				varying vec3 vPosition;

				uniform vec3 u_lookVec;

				uniform int u_Ni;
				uniform int u_Nj;
				uniform int u_fillType;

				uniform mat4 u_projectionMatrix;
				uniform mat4 u_modelViewMatrix;
				uniform mat4 u_matrixWorld;

				uniform float u_step;
				uniform float u_limit;

				uniform vec3 u_min;
				uniform vec3 u_max;

				//const float precisionFix = 0.00001;

				vec3 linesByStepsAndLimit(vec3 value ,float steps, float limit) {
					return vec3(
						 mod(value.x + limit/(2.0*steps), 1.0/steps)*steps < limit ? 1.0 : 0.0
						,mod(value.y + limit/(2.0*steps), 1.0/steps)*steps < limit ? 1.0 : 0.0
						,mod(value.z + limit/(2.0*steps), 1.0/steps)*steps < limit ? 1.0 : 0.0
					);
				}

				vec3 linesByStepsAndLimit(vec3 value ,vec3 steps, vec3 limit) {
					return vec3( lessThan( mod(value + limit/(2.0*steps), 1.0/steps)*steps , limit ) );
				}

				vec3 gradientBySteps(vec3 value ,float steps) {
					return mod(value, 1.0/steps)*steps;
				}

				vec3 gradientBySteps(vec3 value ,vec3 steps) {
					return mod(value, 1.0/steps)*steps;
				}

				bool inBounds(vec3 pos, vec3 min, vec3 max) {
					return pos.x >= min.x && pos.y >= min.y && pos.z >= min.z && pos.x <= max.x && pos.y <= max.y && pos.z <= max.z;
				}

				${glslReadyFunc}

				float windowSpaseZByPos(vec3 position) {
					vec4 preClipSpace = u_projectionMatrix * u_modelViewMatrix * vec4(position, 1.0);
					vec3 clipSpace = preClipSpace.xyz / preClipSpace.w;
					float windowSpaseZ = clipSpace.z*0.5 + 0.5;
					//gl_FragDepth = windowSpaseZ;

					return windowSpaseZ;
				}

				vec3 adjustByFunc(in vec3 from, in vec3 to, in int iteratoins) {
					// expected: func(from) == false && func(to) == true

					vec3 valToTest;

					for (int i = 0; i < iteratoins; i++) {
						valToTest = (from + to)/2.0;

						if ( func( valToTest ) ) {
							to = valToTest;
						} else {
							from = valToTest;
						}
					}

					return valToTest; // (from + to)/2.0			
				}

				void pushRay(in vec3 position, in vec3 direction, in vec3 min, in vec3 max, in int Ni, in int Nii, out vec3 endPosition, out vec3 normal) {

					vec3 goBy = normalize(direction)*length(max - min);

					//position = position; //*(max-min)+min;

					float Ni_f = float(Ni);

					vec3 lastPosition = position;

					for (int i = 0; i <= Ni; i++) {
						vec3 currentPosition = float(i)/Ni_f*goBy + position;

						if ( !inBounds(currentPosition, min, max) ) {
							//!inBounds(currentPosition, min-precisionFix, max+precisionFix)
							discard;
						}

						if ( func(currentPosition) ) {

							if (Nii > 0) {
								endPosition = adjustByFunc(lastPosition, currentPosition, Nii);
							} else {
								endPosition = currentPosition;
							}

							normal = normalize(gradFunc(endPosition));

							// vec3 localEndPos = (endPosition - min)/(max - min);
							// vec4 worldPos = u_matrixWorld*vec4(endPosition, 1.0);
							gl_FragDepth = windowSpaseZByPos( endPosition ); //worldPos.xyz ); // worldPos.xyz

							return;

						}

						lastPosition = currentPosition;
					}

					discard;
				}

				vec4 colorByFillType(vec3 pos, vec3 normal, int fill, float steps, float limit) {

					if (fill == 0) {
						return vec4(
							linesByStepsAndLimit(pos, steps, limit)
							,1.0
						);
					} else if (fill == 1) {
						return vec4(
							gradientBySteps(pos, steps)
							,1.0
						);
					} else if (fill == 2) {
						return vec4(
							normal*0.5 + 0.5
							,1.0
						);
					} else if (fill == 3) {
						return vec4(
							linesByStepsAndLimit(normal*0.5 + 0.5, 20.0, limit)
							,1.0
						);
					} else if (fill == 4) {
						return vec4(
							gradientBySteps(normal*0.5 + 0.5, 20.0)
							,1.0
						);
					} else {
						return vec4(1.0, 0.0, 0.0, 1.0);
					}
				}


				void main() {
					vec4 color = vec4(1.0);

					vec3 endPos = vec3(2.5);
					vec3 normal = vec3(1.0, 0.0, 0.0);

					pushRay(vPosition, u_lookVec, u_min, u_max, u_Ni, u_Nj, endPos, normal);

					color = colorByFillType(endPos, normal, u_fillType, u_step, u_limit);

					gl_FragColor = color;
				}`
		});
		
		mesh.material = material;
		this.mesh = mesh;

		return mesh
	}


	// static getMaterial(
	// 	 glslReadyFunc = `
	// 		bool func(vec3 v) {
	// 			return cos(v.x)*cos(v.y)*cos(v.z) > 0.5;
	// 		}

	// 		//https://www.wolframalpha.com/input?i=grad+cos%28x%29cos%28y%29cos%28z%29
	// 		//grad(cos(x) cos(y) cos(z)) = (-cos(y) cos(z) sin(x), -cos(x) cos(z) sin(y), -cos(x) cos(y) sin(z))

	// 		vec3 gradFunc(vec3 v) {
	// 			return vec3(
	// 				 -cos(v.y)*cos(v.z)*sin(v.x)
	// 				,-cos(v.x)*cos(v.z)*sin(v.y)
	// 				,-cos(v.x)*cos(v.y)*sin(v.z)
	// 			);
	// 		}`
	// 	,camera
	// 	,from = THREE.Vector3(0,0,0)
	// 	,to = THREE.Vector3(1,1,1)		
	// ) {
	// 	if ( !(camera instanceof THREE.OrthographicCamera) ) {
	// 		console.warn('currently support only OrthographicCamera it will also work on PerspectiveCamera but will look not good')
	// 	}

	// 	// if ( !(mesh?.geometry?.boundingBox instanceof THREE.Box3) ) {
	// 	// 	mesh.geometry.computeBoundingBox()
	// 	// }
	// 	const mesh = new THREE.Mesh()//geometry, material

	// 	const geometry = new THREE.BufferGeometry()
	// 	geometry.setAttribute( 'position', new THREE.Float32BufferAttribute(
	// 		Float32Array.of(0,0,0, 1,0,0, 0,1,0, 1,1,0, 0,0,1, 1,0,1, 0,1,1, 1,1,1)
	// 			.map((a,i)=> (a == 0 ? from : to)['xyz'[i%3]] )
	// 		,3) 
	// 	)
	// 	geometry.setIndex( new THREE.Uint8BufferAttribute( Uint8Array.of(0,4,6, 0,1,5, 1,0,2, 2,0,6, 2,6,3, 3,1,2, 4,0,5, 4,5,7, 5,1,3, 6,7,3, 6,4,7, 7,5,3), 1 ) )

	// 	mesh.geometry = geometry;

	// 	const material = new THREE.ShaderMaterial({
	// 		uniforms: {
	// 			u_lookVec: { get value() {
	// 				return new THREE.Vector3(0,0,-1).applyMatrix4(new THREE.Matrix4().extractRotation(camera.matrix))
	// 			} },
	// 			u_Ni: {value: 100},
	// 			u_Nj: {value: 10},
	// 			u_fillType: {value: 4},

	// 			u_projectionMatrix: { get value() {return camera.projectionMatrix} },
	// 			u_modelViewMatrix: { get value() {return mesh.modelViewMatrix} },

	// 			//u_matrixWorld: { get value() {return mesh.matrixWorld} },

	// 			u_step: {value: 5},
	// 			u_limit: {value: 0.1},

	// 			u_min: {value: from},//{ get value() {return mesh.geometry.boundingBox.min} },
	// 			u_max: {value: to  },//{ get value() {return mesh.geometry.boundingBox.max} },

	// 		},
	// 		vertexShader:`
	// 			varying vec3 vPosition;

	// 			void main() {
	// 				vPosition = position;
	// 				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	// 			}`,
	// 		fragmentShader:`
	// 			varying vec3 vPosition;

	// 			uniform vec3 u_lookVec;

	// 			uniform int u_Ni;
	// 			uniform int u_Nj;
	// 			uniform int u_fillType;

	// 			uniform mat4 u_projectionMatrix;
	// 			uniform mat4 u_modelViewMatrix;
	// 			uniform mat4 u_matrixWorld;

	// 			uniform float u_step;
	// 			uniform float u_limit;

	// 			uniform vec3 u_min;
	// 			uniform vec3 u_max;

	// 			const float precisionFix = 0.00001;

	// 			vec3 linesByStepsAndLimit(vec3 value ,float steps, float limit) {
	// 				return vec3(
	// 					 mod(value.x + limit/(2.0*steps), 1.0/steps)*steps < limit ? 1.0 : 0.0
	// 					,mod(value.y + limit/(2.0*steps), 1.0/steps)*steps < limit ? 1.0 : 0.0
	// 					,mod(value.z + limit/(2.0*steps), 1.0/steps)*steps < limit ? 1.0 : 0.0
	// 				);
	// 			}

	// 			vec3 linesByStepsAndLimit(vec3 value ,vec3 steps, vec3 limit) {
	// 				return vec3( lessThan( mod(value + limit/(2.0*steps), 1.0/steps)*steps , limit ) );
	// 			}

	// 			vec3 gradientBySteps(vec3 value ,float steps) {
	// 				return mod(value, 1.0/steps)*steps;
	// 			}

	// 			vec3 gradientBySteps(vec3 value ,vec3 steps) {
	// 				return mod(value, 1.0/steps)*steps;
	// 			}

	// 			bool inBounds(vec3 pos, vec3 min, vec3 max) {
	// 				return pos.x >= min.x && pos.y >= min.y && pos.z >= min.z && pos.x <= max.x && pos.y <= max.y && pos.z <= max.z;
	// 			}

	// 			${glslReadyFunc}

	// 			float windowSpaseZByPos(vec3 position) {
	// 				vec4 preClipSpace = u_projectionMatrix * u_modelViewMatrix * vec4(position, 1.0);
	// 				vec3 clipSpace = preClipSpace.xyz / preClipSpace.w;
	// 				float windowSpaseZ = clipSpace.z*0.5 + 0.5;
	// 				//gl_FragDepth = windowSpaseZ;

	// 				return windowSpaseZ;
	// 			}

	// 			vec3 adjustByFunc(in vec3 from, in vec3 to, in int iteratoins) {
	// 				// expected: func(from) == false && func(to) == true

	// 				vec3 valToTest;

	// 				for (int i = 0; i < iteratoins; i++) {
	// 					valToTest = (from + to)/2.0;

	// 					if ( func( valToTest ) ) {
	// 						to = valToTest;
	// 					} else {
	// 						from = valToTest;
	// 					}
	// 				}

	// 				return valToTest; // (from + to)/2.0			
	// 			}

	// 			void pushRay(in vec3 position, in vec3 direction, in vec3 min, in vec3 max, in int Ni, in int Nii, out vec3 endPosition, out vec3 normal) {

	// 				vec3 goBy = normalize(direction)*length(max - min);

	// 				//position = position; //*(max-min)+min;

	// 				float Ni_f = float(Ni);

	// 				vec3 lastPosition = position;

	// 				for (int i = 0; i <= Ni; i++) {
	// 					vec3 currentPosition = float(i)/Ni_f*goBy + position;

	// 					if ( !inBounds(currentPosition, min, max) ) {
	// 						//!inBounds(currentPosition, min-precisionFix, max+precisionFix)
	// 						discard;
	// 					}

	// 					if ( func(currentPosition) ) {

	// 						if (Nii > 0) {
	// 							endPosition = adjustByFunc(lastPosition, currentPosition, Nii);
	// 						} else {
	// 							endPosition = currentPosition;
	// 						}

	// 						normal = normalize(gradFunc(endPosition));

	// 						// vec3 localEndPos = (endPosition - min)/(max - min);
	// 						// vec4 worldPos = u_matrixWorld*vec4(endPosition, 1.0);
	// 						gl_FragDepth = windowSpaseZByPos( endPosition ); //worldPos.xyz ); // worldPos.xyz

	// 						return;

	// 					}

	// 					lastPosition = currentPosition;
	// 				}

	// 				discard;
	// 			}

	// 			vec4 colorByFillType(vec3 pos, vec3 normal, int fill, float steps, float limit) {

	// 				if (fill == 0) {
	// 					return vec4(
	// 						linesByStepsAndLimit(pos, steps, limit)
	// 						,1.0
	// 					);
	// 				} else if (fill == 1) {
	// 					return vec4(
	// 						gradientBySteps(pos, steps)
	// 						,1.0
	// 					);
	// 				} else if (fill == 2) {
	// 					return vec4(
	// 						normal*0.5 + 0.5
	// 						,1.0
	// 					);
	// 				} else if (fill == 3) {
	// 					return vec4(
	// 						linesByStepsAndLimit(normal*0.5 + 0.5, 20.0, limit)
	// 						,1.0
	// 					);
	// 				} else if (fill == 4) {
	// 					return vec4(
	// 						gradientBySteps(normal*0.5 + 0.5, 20.0)
	// 						,1.0
	// 					);
	// 				} else {
	// 					return vec4(1.0, 0.0, 0.0, 1.0);
	// 				}
	// 			}


	// 			void main() {
	// 				vec4 color = vec4(1.0);

	// 				vec3 endPos = vec3(2.5);
	// 				vec3 normal = vec3(1.0, 0.0, 0.0);

	// 				pushRay(vPosition, u_lookVec, u_min, u_max, u_Ni, u_Nj, endPos, normal);

	// 				color = colorByFillType(endPos, normal, u_fillType, u_step, u_limit);

	// 				gl_FragColor = color;
	// 			}`
	// 	});
		
	// 	mesh.material = material;

	// 	return mesh
	// }

}

export { SurfaceByFunction }