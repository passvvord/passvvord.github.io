// import * as THREE from 'three'
// need lib THREE.js

class VoxelObject {

	camera;
	mesh;
	texture;

	constructor(
		// 16 bit uint data example
		GLSLreadyFuncReadPx = `
			int readPxAsRawInt(vec4 pxVal) {
				return int(pxVal.g*255.)*256 + int(pxVal.r*255.);
			}

			// expected rande of input is from -1000. to 4143.
			int RescaleRealToRaw(float realVal) {
				// (real - scaleIntercept)/scaleSlope = real*(1/scaleSlope) - (scaleIntercept/scaleSlope)
				//                       1 SUB, 1 DIV -> 1 MAD
				return int( realVal*1.+1000. );
				
			}
		`
		,tex3D
		,texRawMin
		,texRawMax
		,cutRawMin
		,cutRawMax
		,camera) {
		this.camera = camera;
		this.texture = tex3D;
		this.mesh = new THREE.Mesh() // geometry, material

		const geometry = new THREE.BufferGeometry()
		const pos = Float32Array.of(0,0,0, 1,0,0, 0,1,0, 1,1,0, 0,0,1, 1,0,1, 0,1,1, 1,1,1)
		geometry.setAttribute('position', new THREE.Float32BufferAttribute(	pos.map(a=>a-0.5) ,3 ))
		geometry.setAttribute('position01', new THREE.Float32BufferAttribute( pos ,3 ))
		geometry.setIndex( new THREE.Uint8BufferAttribute( Uint8Array.of(0,4,6, 0,1,5, 1,0,2, 2,0,6, 2,6,3, 3,1,2, 4,0,5, 4,5,7, 5,1,3, 6,7,3, 6,4,7, 7,5,3), 1 ) )
		this.mesh.geometry = geometry;

		// bounding box
		const bbox = {
			min: new THREE.Vector3(-0.5,-0.5,-0.5),
			max: new THREE.Vector3( 0.5, 0.5, 0.5),
		}
		bbox.delta = new THREE.Vector3().subVectors(bbox.max,bbox.min)
		bbox.center = new THREE.Vector3().addVectors(bbox.max,bbox.min).divideScalar(2)

		const thi = this;

		const material = new THREE.ShaderMaterial({
			uniforms: {
				

				// uniforms for vertex:
				u_camPos: { get value() { return thi.camera.position; }},
				u_camDir: { get value() { 
					return new THREE.Vector3(0,0,-1).applyMatrix4(new THREE.Matrix4().extractRotation(thi.camera.matrix))
				}},
				u_isPerspective: { get value() { return thi.camera.isPerspectiveCamera } },
				u_modelMatrixWorld: { get value() { return thi.mesh.matrixWorld } },

				// uniforms for fragment:
				u_image: { value: thi.texture },

				// u_texAsMask: {  },

				u_bbmin: { get value() {return bbox.min} },
				u_bbdelta: { get value() {return bbox.delta} },

				u_enableCut: { value: false },
				u_cutMin: { value: new THREE.Vector3(0,0,0) },
				u_cutMax: { value: new THREE.Vector3(1,1,1) },

				u_rayStep: {value: 0.5}, // per px size
				u_globalOpacity: {value: 1.0},
				u_discardSmallAlpha: {value: true},
				u_returnFirstInBounds: {value: false},

				u_blackColRawVal: {value: texRawMin}, // -> vec4(0.0)
				u_whiteColRawVal: {value: texRawMax}, // -> vec4(1.0)

				u_minCutRawVal: {value: cutRawMin},
				u_maxCutRawVal: {value: cutRawMax},

				u_scaleVec: {value: new THREE.Vector3(1,1,1)},
				u_scaleMat: {value: new THREE.Matrix4() },

				u_blackColor: {value: new THREE.Vector4(0,0,0,0)},
				u_whiteColor: {value: new THREE.Vector4(1,1,1,1)},

				// u_Ni: {value: 100},
				// u_Nj: {value: 10},
				// u_fillType: {value: 4},

				u_projectionMatrix: { get value() {return thi.camera.projectionMatrix} },
				u_modelViewMatrix: { get value() {return thi.mesh.modelViewMatrix} },

				// // u_pojectXmodelViewMatrix: { get value() {
				// // 	return thi.camera.projectionMatrix.clone().multiply()}
				// // }

				// u_step: {value: 10},
				// u_limit: {value: 0.1},

				// u_min: {value: from},//{ get value() {return mesh.geometry.boundingBox.min} },
				// u_max: {value: to  },//{ get value() {return mesh.geometry.boundingBox.max} },

				// // u_windowSpaceZcenter: {	get value() {
				// // 		return mesh.geometry.boundingSphere.center.clone()
				// // 			.applyMatrix4( mesh.modelViewMatrix )
				// // 			.applyMatrix4( camera.projectionMatrix )
				// // 			.z*0.5+0.5
				// // } },
				// u_windowSpaceZnear: { get value() {
				// 	return mesh.geometry.boundingSphere.center.clone()
				// 			.applyMatrix4( mesh.modelViewMatrix )
				// 			.applyMatrix4( camera.projectionMatrix )
				// 			.z*0.5+0.5
				// 			-mesh.geometry.boundingSphere.radius/(camera.far - camera.near)
				// } },
				// u_windowSpaceZdelta: { get value() {
				// 	return mesh.geometry.boundingSphere.radius*2/(camera.far - camera.near)
				// } },

				// u_localZmin: {value: 0},
				// u_localZmax: {value: 1},
			},
			vertexShader:`
				attribute vec3 position01;

				uniform vec3 u_camPos;
				uniform vec3 u_camDir;
				uniform bool u_isPerspective;
				uniform mat4 u_modelMatrixWorld;

				varying vec3 vPosition01; // start pos of ray ralative
				varying vec3 vPosition;   // start pos of ray
				varying vec3 vDirection;  // ray direction from camera into object

				uniform vec3 u_scaleVec;

				void main() {
					vPosition01 = position01; //*u_scaleVec;
					vPosition = position;

					if (u_isPerspective) {
						vDirection = normalize( (u_modelMatrixWorld * vec4(position, 1.0)).xyz - u_camPos );
					} else {
						vDirection = u_camDir*u_scaleVec;
					}

					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}`,
			fragmentShader:`
				precision highp sampler3D;

				varying vec3 vPosition01;
				//varying vec3 vPosition;
				varying vec3 vDirection;

				uniform sampler3D u_image;

				uniform int u_blackColRawVal;
				uniform int u_whiteColRawVal;

				uniform int u_minCutRawVal;
				uniform int u_maxCutRawVal;	

				uniform vec4 u_blackColor;
				uniform vec4 u_whiteColor;		

				uniform mat4 u_scaleMat;

				${GLSLreadyFuncReadPx}

				float toBounds(float val, float minv, float maxv) {
					return min(max(val,minv),maxv);
				}

				uniform vec3 u_cutMin;
				uniform vec3 u_cutMax;
				uniform bool u_enableCut;

				vec4 normaliseByBounds(int rawPxVal) {
					if ( rawPxVal >= u_minCutRawVal && rawPxVal <= u_maxCutRawVal ) {
						return u_blackColor + (u_whiteColor - u_blackColor)*toBounds( float(rawPxVal - u_blackColRawVal)/float(u_whiteColRawVal - u_blackColRawVal), 0.0, 1.0 );
					} else {
						return vec4(0.0);
					}
				}

				int getRawPx(vec3 pos) {
					// vec4 pixel = texture(u_image , pos);
					return readPxAsRawInt( texture(u_image , pos) );
				}

				float intLerp(int a, int b, float t) {
					return float(b-a)*t + float(a);
				}

				float floatLerp(float a, float b, float t) {
					return (b-a)*t + a;
				}

				int getRawPx1(vec3 pos, vec3 ts, vec3 ts2) {

					// ivec3 iTextireSize = textureSize(u_image, 0);
					// vec3 fTextureSize = vec3float(iTextireSize);
					// vec3 ts = 1.0/fTextureSize;

					vec3 pos1 = floor( pos/ts );
					vec3 pos2 = pos/ts - pos1;
					vec3 move = vec3(
						pos2.x >= 0.5 ? ts2.x : -ts2.x,
						pos2.y >= 0.5 ? ts2.y : -ts2.y,
						pos2.z >= 0.5 ? ts2.z : -ts2.z
					);

					vec3 pos3 = pos1*ts + move;
					vec3 pos4 = mod(pos + move, ts)/ts;

					return int( floatLerp(
						floatLerp(
							intLerp(
								getRawPx(pos3+vec3( 0.0, 0.0, 0.0)), getRawPx(pos3+vec3(ts.x, 0.0, 0.0)),
								pos4.x
							),
							intLerp(
								getRawPx(pos3+vec3( 0.0,ts.y, 0.0)), getRawPx(pos3+vec3(ts.x,ts.y, 0.0)),
								pos4.x
							),
							pos4.y
						),
						floatLerp(
							intLerp(
								getRawPx(pos3+vec3( 0.0, 0.0,ts.z)), getRawPx(pos3+vec3(ts.x, 0.0,ts.z)),
								pos4.x
							),
							intLerp(
								getRawPx(pos3+vec3( 0.0,ts.y,ts.z)), getRawPx(pos3+vec3(ts.x,ts.y,ts.z)),
								pos4.x
							),
							pos4.y
						),
						pos4.z
					) );


					// vec4 pixel = texture(u_image , pos);
					// return readPxAsRawInt(pixel);
				}

				vec3 getRawPx2(vec3 pos, vec3 ts, vec3 ts2) {

					vec3 temp =  mod(pos, ts)/ts;
					if ( temp.x < 0.01 || temp.y < 0.01 || temp.z < 0.01 ) {
						return vec3(0.0);
					}

					vec3 pos1 = floor( pos/ts );
					vec3 pos2 = pos/ts - pos1;
					vec3 move = vec3(
						pos2.x >= 0.5 ? ts2.x : -ts2.x,
						pos2.y >= 0.5 ? ts2.y : -ts2.y,
						pos2.z >= 0.5 ? ts2.z : -ts2.z
					);

					vec3 pos3 = pos1*ts + move;
					vec3 pos4 = mod(pos + move, ts)/ts;

					return pos4;
				}

				vec4 getRawCol(vec3 pos) {
					return texture(u_image , pos);
				}

				bool inBounds(vec3 pos, vec3 min, vec3 max) {
					return pos.x >= min.x && pos.y >= min.y && pos.z >= min.z && pos.x <= max.x && pos.y <= max.y && pos.z <= max.z;
				}

				vec3 vec3float(ivec3 v) {
					return vec3( float(v.x), float(v.y), float(v.z) );
				}

				uniform float u_rayStep;

				//const float precisionFix = 0.00001;

				// vec3 adjustByFunc(in vec3 from, in vec3 to, in int iteratoins) {
				// 	// expected: func(from) == false && func(to) == true

				// 	vec3 valToTest;

				// 	for (int i = 0; i < iteratoins; i++) {
				// 		valToTest = (from + to)/2.0;

				// 		if ( func( valToTest ) ) {
				// 			to = valToTest;
				// 		} else {
				// 			from = valToTest;
				// 		}
				// 	}

				// 	return valToTest; // (from + to)/2.0			
				// }

				bvec3 v3lessThan(vec3 a, vec3 b) {
					return bvec3(a.x < b.x, a.y < b.y, a.z < b.z);
				}

				vec3 linesByStepsAndLimit(vec3 value ,float steps, float limit) {
					return vec3( v3lessThan( mod(value + limit/(2.0*steps), 1.0/steps)*steps , vec3(limit) ) );
				}

				vec3 linesByStepsAndLimit(vec3 value ,vec3 steps, vec3 limit) {
					return vec3( lessThan( mod(value + limit/(2.0*steps), 1.0/steps)*steps , limit ) );
				}

				vec3 gradientBySteps(vec3 value ,float steps) {
					return mod(value, 1.0/steps)*steps;
				}

				uniform mat4 u_projectionMatrix;
				uniform mat4 u_modelViewMatrix;

				float windowSpaseZByPos(vec3 position) {
					vec4 preClipSpace = u_projectionMatrix * u_modelViewMatrix * vec4(position, 1.0);
					vec3 clipSpace = preClipSpace.xyz / preClipSpace.w;
					float windowSpaseZ = clipSpace.z*0.5 + 0.5;
					//gl_FragDepth = windowSpaseZ;

					return windowSpaseZ;
				}

				uniform float u_globalOpacity;
				uniform bool u_discardSmallAlpha;
				uniform bool u_returnFirstInBounds;

				void pushRay(in vec3 startPosition, in vec3 direction, out vec4 color, out vec3 endPos) {

					vec3 min = vec3(0.0);
					vec3 max = vec3(1.0);

					ivec3 iTextireSize = textureSize(u_image, 0);
					vec3 fTextureSize = vec3float(iTextireSize);
					vec3 fTexelSize = 1.0/fTextureSize;
					vec3 fTexelSize2 = 0.5/fTextureSize;

					vec3 rayStep = u_rayStep*direction/fTextureSize;

					color = vec4(0.0);

					// vec3 currentPosition = vec3(
					// 	 ceil(startPosition.x/rayStep.x)*rayStep.x
					// 	,ceil(startPosition.y/rayStep.y)*rayStep.y
					// 	,ceil(startPosition.z/rayStep.z)*rayStep.z

					// );

					vec3 currentPosition = startPosition;
					vec4 curentColor;

					vec4 lastColor;
					vec3 lastPosition;

					int limiter = 2000;

					//bool zfound = false;

					for (int i; i < limiter; i++) {

						if ( !inBounds(currentPosition, min, max) ) {
							discard;
							// color = vec4(0.0, 0.0, 0.2, 1.0);
							// return;
						}
						
						curentColor = normaliseByBounds(getRawPx1(currentPosition, fTexelSize, fTexelSize2)); //normaliseByBounds( getRawPx(currentPosition) );

						if ( inBounds(currentPosition, u_cutMin, u_cutMax) && u_returnFirstInBounds && curentColor.a > 0.0) {
							vec3 lines = linesByStepsAndLimit( currentPosition , fTextureSize*0.2 , vec3(0.1) );

							// if ( lines.x > 0. || lines.y > 0. || lines.z > 0. ) {
							// 	color.rgb = lines*0.2;
							// } else {
								color.rgb = curentColor.rgb;
								//color.rgb = getRawCol(currentPosition).rgb; 
								//color.rgb = getRawPx2(currentPosition, fTexelSize, fTexelSize/2.).rgb;
							//}
							color.a = 1.0;
							// zfound = true;
							endPos = currentPosition;
							return;
						}

						if ( color.a + curentColor.a*u_rayStep <= 1.0 ) {

							if (u_enableCut) {
								if ( inBounds(currentPosition, u_cutMin, u_cutMax) ) {
									// curentColor = normaliseByBounds( getRawPx(currentPosition) );

									color.rgb = (u_rayStep*curentColor.rgb + color.rgb)/(u_rayStep + 1.0);
									color.a += curentColor.a*u_rayStep;
								} else {
									curentColor = vec4(0.0);
								}								
							} else {
								
								color.rgb = (u_rayStep*curentColor.rgb + color.rgb)/(u_rayStep + 1.0);
								color.a += curentColor.a*u_rayStep;
							}


							

							// lastColor = color;
							// lastPosition = currentPosition;

							
						} else {

							color.a = 1.0;

							// if ( !u_returnFirstInBounds ) {
								endPos = currentPosition;
							// }			
							return;

							// vec3 from = lastPosition - rayStep*1.0;
							// vec3 to = lastPosition - rayStep*0.0;
							// vec3 valToTest;
							// vec4 curentColor;


							// vec4 fromCol = normaliseByBounds( getRawPx(from) );
							// vec4 toCol = normaliseByBounds( getRawPx(to) );

							// if ( lastColor.a >= 1.0 ) {
							// 	color.rgb = vec3(1.0, 0.0, 0.0);
							// 	return;
							// } else if (toCol.a < fromCol.a) {
							// 	color.rgb = vec3(1.0, 0.0, 1.0);
							// 	return;
							// } else if (lastColor.a + fromCol.a*u_rayStep > 1.0) {
							// 	color.rgb = vec3(1.0, 1.0, 0.0);
							// 	return;
							// } else if (lastColor.a + toCol.a*u_rayStep > 1.0) {
							// 	color.rgb = vec3(0.0, 1.0, 0.0);
							// 	return;
							// }

							//if ( lastColor.a > 1.0 ) {
								//color.a

								// float step = 0.5;
								// color = vec4(vec3( mod(color.a, step)/step ), 1.0);
								// return;

								// color = vec4(currentPosition, 1.0);
								//color = vec4( linesByStepsAndLimit(currentPosition, 100., 0.1), 1.0);
								// color.rgb = gradientBySteps(currentPosition, 100.);
								// return;



							//}

							// for (int i = 0; i < 10; i++) {
							// 	valToTest = (from + to)/2.0;

							// 	curentColor = normaliseByBounds( getRawPx(valToTest) );

							// 	if ( lastColor.a + curentColor.a*u_rayStep > 1.0 ) {
							// 		to = valToTest;
							// 	} else {
							// 		from = valToTest;
							// 	}
							// }

							//color.rgb = (u_rayStep*curentColor.rgb + lastColor.rgb)/(u_rayStep + 1.0);
							//color.a += curentColor.a*u_rayStep;
							

							//color.rgb = vec3( ((valToTest-from)/(to-from)).x , 0.0, 0.0 );

							//color.rgb = gradientBySteps( (valToTest-from)/(to-from) , 1.);

							// color.rgb = gradientBySteps(currentPosition, 100.);
							// color.rgb = gradientBySteps(valToTest, 100.);
						}

						//lastPosition = currentPosition;
						
						currentPosition += rayStep;

					}

					if (u_discardSmallAlpha) {
						discard;
					}
					//  else {
					// 	color.a = 1.0;
					// }
					
					//color = vec4(0.0, 0.0, 0.2, 1.0);					

				}

				uniform vec3 u_bbmin;
				uniform vec3 u_bbdelta;

				void main() {
					vec4 color = vec4(1.0, 0.0, 0.0, 1.0);

					vec3 endPos; //= vec3(2.5);
					// vec3 normal; // = vec3(1.0, 0.0, 0.0);
					// float zPos = 0.0;

					pushRay(vPosition01, vDirection, color, endPos);

					// gl_FragColor = normaliseByBounds( getRawPx( vPosition01 + vDirection*0.3 ) );

					//color.rgb = vPosition01;
					// color.rgb = vDirection*0.5 + 0.5;

					gl_FragDepth = windowSpaseZByPos(endPos*u_bbdelta + u_bbmin);

					gl_FragColor = color;
				}`
		});
		
		this.mesh.material = material;
		//Object.assign(mesh.material.uniforms, uniforms)

		//this.mesh = mesh;

		return this.mesh
	}

}

export { VoxelObject }