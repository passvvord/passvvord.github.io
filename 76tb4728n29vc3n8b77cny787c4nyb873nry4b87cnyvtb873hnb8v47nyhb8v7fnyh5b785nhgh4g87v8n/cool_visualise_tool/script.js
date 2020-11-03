function create_voxel_object(voxel_data = [[0,0,0,2],[0,1,0,1],[0,2,0,2],[2,0,0,1],[2,0,2,3]],colors = [[255,0,0],[0,255,0],[0,0,255]]) {
	function custom_max_min(A,index) {
		let min = Infinity;
		let max = -Infinity;
		for (let i of A) {
			if (i[index] > max) {
				max = i[index];
			} else if (i[index] < min) {
				min = i[index];
			}
		}
		return [min,max,max - min + 1];
	}

	function get_array_from_voxel_data(A) {
		const x_min_max = custom_max_min(voxel_data,0);
		const y_min_max = custom_max_min(voxel_data,1);
		const z_min_max = custom_max_min(voxel_data,2);
		const c_min_max = custom_max_min(voxel_data,3);

		console.log(x_min_max,y_min_max,z_min_max,c_min_max);

		if (c_min_max[0] < 0 && c_min_max[1] >= 256) {
			return;
		}

		// console.log((x_min_max[1] - x_min_max[0] + 1)*(y_min_max[1] - y_min_max[0] + 1)*(z_min_max[1] - z_min_max[0] + 1))
		const voxels = new Uint8Array(x_min_max[2]*y_min_max[2]*z_min_max[2]);

		for (let i of voxel_data) {
			voxels[(((i[2] - z_min_max[0]) * y_min_max[2] + (i[1] - y_min_max[0])) * x_min_max[2] + (i[0] - x_min_max[0]))] = i[3];
		}

		// console.log(voxels)
		return {array: voxels, x: x_min_max, y: y_min_max, z: z_min_max}
	}

	const voxel_array_data = get_array_from_voxel_data(voxel_data);
	// console.log(voxel_array_data);

	for (let i in colors) {
		for (j in colors[i]) {
			colors[i][j] = colors[i][j]/255;
		}
	}

	// console.log(colors);

	const pos = [];
	const norm = [];
	const col = [];

	function calc_down(x,y,z)   {return {pos: [x+0,y+0,z+0, x+1,y+0,z+0, x+0,y+0,z+1,   x+1,y+0,z+0, x+1,y+0,z+1, x+0,y+0,z+1,], norm: [0,-1,0,  0,-1,0,  0,-1,0,   0,-1,0,  0,-1,0,  0,-1,0,],} }
	function calc_bottom(x,y,z) {return {pos: [x+0,y+0,z+0, x+0,y+1,z+0, x+1,y+0,z+0,   x+1,y+0,z+0, x+0,y+1,z+0, x+1,y+1,z+0,], norm: [0,0,-1,  0,0,-1,  0,0,-1,   0,0,-1,  0,0,-1,  0,0,-1,],} }
	function calc_left(x,y,z)   {return {pos: [x+0,y+0,z+0, x+0,y+0,z+1, x+0,y+1,z+0,   x+0,y+0,z+1, x+0,y+1,z+1, x+0,y+1,z+0,], norm: [-1,0,0,  -1,0,0,  -1,0,0,   -1,0,0,  -1,0,0,  -1,0,0,],} }
	function calc_up(x,y,z)     {return {pos: [x+0,y+1,z+1, x+1,y+1,z+0, x+0,y+1,z+0,   x+0,y+1,z+1, x+1,y+1,z+1, x+1,y+1,z+0,], norm: [ 0,1,0,   0,1,0,   0,1,0,    0,1,0,   0,1,0,   0,1,0,],} }
	function calc_top(x,y,z)    {return {pos: [x+1,y+0,z+1, x+0,y+1,z+1, x+0,y+0,z+1,   x+1,y+1,z+1, x+0,y+1,z+1, x+1,y+0,z+1,], norm: [ 0,0,1,   0,0,1,   0,0,1,    0,0,1,   0,0,1,   0,0,1,],} }
	function calc_right(x,y,z)  {return {pos: [x+1,y+1,z+0, x+1,y+0,z+1, x+1,y+0,z+0,   x+1,y+1,z+0, x+1,y+1,z+1, x+1,y+0,z+1,], norm: [ 1,0,0,   1,0,0,   1,0,0,    1,0,0,   1,0,0,   1,0,0,],} }

	for (let z = 0;  z < voxel_array_data.z[2]; z+=1 ) {
		console.log(z/(voxel_array_data.z[2]-1)*100,'% of 3d object is compleated')
		for (let y = 0;  y < voxel_array_data.y[2]; y+=1 ) {
			for (let x = 0;  x < voxel_array_data.x[2]; x+=1 ) {
				const xyz = ((z * voxel_array_data.y[2] + y) * voxel_array_data.x[2] + x);
				const xyzv = voxel_array_data.array[xyz];
				if ( voxel_array_data.array[xyz] != 0 && voxel_array_data.array[xyz]) {
					// console.log(x,y,x,xyz,xyzv)
					if (voxel_array_data.array[((z * voxel_array_data.y[2] + y-1) * voxel_array_data.x[2] + x)] == 0 || y == 0) {
							const down = calc_down(x,y,z);
							for (let i in down.pos) {
								pos.push(down.pos[i]);
								norm.push(down.norm[i]);
							}
							col.push(colors[xyzv-1][0],colors[xyzv-1][1],colors[xyzv-1][2])
							col.push(colors[xyzv-1][0],colors[xyzv-1][1],colors[xyzv-1][2])
							col.push(colors[xyzv-1][0],colors[xyzv-1][1],colors[xyzv-1][2])
							col.push(colors[xyzv-1][0],colors[xyzv-1][1],colors[xyzv-1][2])
							col.push(colors[xyzv-1][0],colors[xyzv-1][1],colors[xyzv-1][2])
							col.push(colors[xyzv-1][0],colors[xyzv-1][1],colors[xyzv-1][2])
					}

					if (voxel_array_data.array[(((z-1) * voxel_array_data.y[2] + y) * voxel_array_data.x[2] + x)] == 0|| z == 0) {
							const bottom = calc_bottom(x,y,z);
							for (let i in bottom.pos) {
								pos.push(bottom.pos[i]);
								norm.push(bottom.norm[i]);
							}
							col.push(colors[xyzv-1][0],colors[xyzv-1][1],colors[xyzv-1][2])
							col.push(colors[xyzv-1][0],colors[xyzv-1][1],colors[xyzv-1][2])
							col.push(colors[xyzv-1][0],colors[xyzv-1][1],colors[xyzv-1][2])
							col.push(colors[xyzv-1][0],colors[xyzv-1][1],colors[xyzv-1][2])
							col.push(colors[xyzv-1][0],colors[xyzv-1][1],colors[xyzv-1][2])
							col.push(colors[xyzv-1][0],colors[xyzv-1][1],colors[xyzv-1][2])
					}

					if (voxel_array_data.array[((z * voxel_array_data.y[2] + y) * voxel_array_data.x[2] + x-1)] == 0 || x == 0) {
							const left = calc_left(x,y,z);
							for (let i in left.pos) {
								pos.push(left.pos[i]);
								norm.push(left.norm[i]);
							}
							col.push(colors[xyzv-1][0],colors[xyzv-1][1],colors[xyzv-1][2])
							col.push(colors[xyzv-1][0],colors[xyzv-1][1],colors[xyzv-1][2])
							col.push(colors[xyzv-1][0],colors[xyzv-1][1],colors[xyzv-1][2])
							col.push(colors[xyzv-1][0],colors[xyzv-1][1],colors[xyzv-1][2])
							col.push(colors[xyzv-1][0],colors[xyzv-1][1],colors[xyzv-1][2])
							col.push(colors[xyzv-1][0],colors[xyzv-1][1],colors[xyzv-1][2])							
						
					}

					if (voxel_array_data.array[((z * voxel_array_data.y[2] + y+1) * voxel_array_data.x[2] + x)] == 0 || y == voxel_array_data.y[2] - 1) {
							const up = calc_up(x,y,z);
							for (let i in up.pos) {
								pos.push(up.pos[i]);
								norm.push(up.norm[i]);
							}
							col.push(colors[xyzv-1][0],colors[xyzv-1][1],colors[xyzv-1][2])
							col.push(colors[xyzv-1][0],colors[xyzv-1][1],colors[xyzv-1][2])
							col.push(colors[xyzv-1][0],colors[xyzv-1][1],colors[xyzv-1][2])
							col.push(colors[xyzv-1][0],colors[xyzv-1][1],colors[xyzv-1][2])
							col.push(colors[xyzv-1][0],colors[xyzv-1][1],colors[xyzv-1][2])
							col.push(colors[xyzv-1][0],colors[xyzv-1][1],colors[xyzv-1][2])
					}


					if (voxel_array_data.array[(((z+1) * voxel_array_data.y[2] + y) * voxel_array_data.x[2] + x)] == 0 || z == voxel_array_data.z[2] - 1) {
							const top = calc_top(x,y,z);
							for (let i in top.pos) {
								pos.push(top.pos[i]);
								norm.push(top.norm[i]);
							}
							col.push(colors[xyzv-1][0],colors[xyzv-1][1],colors[xyzv-1][2])
							col.push(colors[xyzv-1][0],colors[xyzv-1][1],colors[xyzv-1][2])
							col.push(colors[xyzv-1][0],colors[xyzv-1][1],colors[xyzv-1][2])
							col.push(colors[xyzv-1][0],colors[xyzv-1][1],colors[xyzv-1][2])
							col.push(colors[xyzv-1][0],colors[xyzv-1][1],colors[xyzv-1][2])
							col.push(colors[xyzv-1][0],colors[xyzv-1][1],colors[xyzv-1][2])
					}

					if (voxel_array_data.array[((z * voxel_array_data.y[2] + y) * voxel_array_data.x[2] + x+1)] == 0 || x == voxel_array_data.x[2] - 1) {
							const right = calc_right(x,y,z);
							for (let i in right.pos) {
								pos.push(right.pos[i]);
								norm.push(right.norm[i]);
							}
							col.push(colors[xyzv-1][0],colors[xyzv-1][1],colors[xyzv-1][2])
							col.push(colors[xyzv-1][0],colors[xyzv-1][1],colors[xyzv-1][2])
							col.push(colors[xyzv-1][0],colors[xyzv-1][1],colors[xyzv-1][2])
							col.push(colors[xyzv-1][0],colors[xyzv-1][1],colors[xyzv-1][2])
							col.push(colors[xyzv-1][0],colors[xyzv-1][1],colors[xyzv-1][2])
							col.push(colors[xyzv-1][0],colors[xyzv-1][1],colors[xyzv-1][2])							
					}

				}
			}
		}
	}

	// console.log(pos)
	// console.log(norm)
	// console.log(col)

	console.log(pos.length/9,' polygons are in this model')

	const geometry = new THREE.BufferGeometry();

	geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( pos, 3 ) );
	geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( norm, 3 ) );
	geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( col, 3 ) );

	const material = new THREE.MeshPhongMaterial( {
		color: 0xaaaaaa,
		specular: 0xffffff,
		shininess: 250,
		vertexColors: true
	});

	return new THREE.Mesh( geometry, material );
}




// var scene = new THREE.Scene();
// var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

// scene.background = new THREE.Color( 0x999999 );

// var renderer = new THREE.WebGLRenderer();
// renderer.setSize( window.innerWidth, window.innerHeight );
// document.body.appendChild( renderer.domElement );

// // scene.fog = new THREE.Fog( 0x050505, 2000, 3500 );

// scene.add( new THREE.AmbientLight( 0x999999 ) );

// const light1 = new THREE.DirectionalLight( 0xffffff, 0.1 );
// light1.position.set( 0, 0, 10 );
// scene.add( light1 );

// // const light2 = new THREE.DirectionalLight( 0xffffff, 0.05 );
// // light2.position.set( 10, -10, 0 );
// // scene.add( light2 );

// // const light3 = new THREE.DirectionalLight( 0xffffff, 0.05 );
// // light3.position.set( 10, 10, 0 );
// // scene.add( light3 );

// // const light4 = new THREE.DirectionalLight( 0xffffff, 0.05 );
// // light4.position.set( -10, -10, 0 );
// // scene.add( light4 );

// // const light5 = new THREE.DirectionalLight( 0xffffff, 0.05 );
// // light5.position.set( -10, 10, 0 );
// // scene.add( light5 );

// const light6 = new THREE.DirectionalLight( 0xffffff, 0.05 );
// light6.position.set( 10, 0, 0 );
// scene.add( light6 );

// const light7 = new THREE.DirectionalLight( 0xffffff, 0.05 );
// light7.position.set( 0, 10, 0 );
// scene.add( light7 );

// const light8 = new THREE.DirectionalLight( 0xffffff, 0.05 );
// light8.position.set( 0, -10, 0 );
// scene.add( light8 );

// const light9 = new THREE.DirectionalLight( 0xffffff, 0.05 );
// light9.position.set( -10, 0, 0 );
// scene.add( light9 );

// // geometry.computeBoundingSphere();



// // const temp_points = []
// // // temp_points.push([0,0,0,2])

// // for (let i = 0; i < 3; i++ ) {
// // 	for (let j = 0; j < 3; j++ ) {
// // 		for (let k = 0; k < 3; k++ ) {
// // 			temp_points.push([i,j,k,(i+j+k)%2+1]);
// // 		}
// // 	}

// // }

// // const mesh = create_voxel_object(temp_points,[[255,0,0],[0,255,0],[0,0,255]]);
// // delete temp_points
// // scene.add( mesh ); 			

// // const mesh = create_voxel_object(temp_points,[[255,0,0],[0,255,0],[0,0,255]]);

// // delete temp_points

// // scene.add( mesh ); 

// camera.position.z = 5;

// renderer.render( scene, camera );


// document.addEventListener('mousemove', move => {
// 	if (move.buttons == 1 && mesh) {
		
// 		mesh.rotation.x += move.movementY/100;
// 		mesh.rotation.y += move.movementX/100;
		
// 		renderer.render( scene, camera );
// 	}
// })

// document.addEventListener('wheel', wheel => {
// 	// wheel.preventDefault();
// 		camera.position.z += wheel.deltaY/100;
// 		renderer.render( scene, camera );

// })


