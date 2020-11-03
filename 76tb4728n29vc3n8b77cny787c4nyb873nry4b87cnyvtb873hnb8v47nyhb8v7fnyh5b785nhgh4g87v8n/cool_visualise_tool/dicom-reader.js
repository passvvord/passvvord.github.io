function arrayMin(arr) {
    var len = arr.length, min = Infinity;
    while (len--) {
        if (arr[len] < min) {
            min = arr[len];
        }
    }
    return min;
};

function arrayMax(arr) {
    var len = arr.length, max = -Infinity;
    while (len--) {
        if (arr[len] > max) {
            max = arr[len];
        }
    }
    return max;
};

function CustomMinMax(A) {
    let min = max = A[0];
    let min_count = 0;
    for (let i of A) {
        if (i > max) {
            max = i;
        } else if (i < min){
            min = i;
            min_count = 1;
        } else if (i == min) {
            min_count+=1;
        }
    }
    if (min_count/A.length > 0.05) {
        let cmin = Infinity;
        for (let i of A) {
            if (i < cmin && i != min) {
                cmin = i;
            }
        }
        return [cmin,max];
    } else {
        return [min,max];
    }
}

// function ArrMinMax(A) {
//     let min = max = A[0];
//     for (let i of A) {
//         if (i > max) {
//             max = i;
//         } else {
//             min = i;
//         }
//     }
//     return [min,max];
// }

function toGrayscale(imageData,min,max) {
    const buffer = new ArrayBuffer(512 * 512 * 4);
    const pixels = new Uint8ClampedArray(buffer);
    const t = max - min;
    for (let i = 0; i < 512; i++) {
        for (let j = 0; j < 512; j++) {
            const px = (i * 512 + j) * 4;
            if (imageData[i * 512 + j] >= min && imageData[i * 512 + j] <= max) {
                pixels[px] = pixels[px + 1] = pixels[px + 2] = parseInt((imageData[i * 512 + j]-min)*255/t);             
            } else {
                pixels[px] = pixels[px + 1] = pixels[px + 2] = 0;
            }
            pixels[px + 3] = 255;
        }
    }
    return new ImageData(pixels, 512, 512);
}

// let currentSlice = 0;

// function drawCurrentSlice() {
//     const arrayBuffer = currentSeries.images[currentSlice].getInterpretedData();
//     // console.log(currentSeries.images[currentSlice].index)
//     const MinMax = CustomMinMax(arrayBuffer);    
//     drawOnCanvas(document.getElementById("image_layer"),toGrayscale(arrayBuffer,MinMax[0],MinMax[1]));
// }

// function drawOnCanvas(canvas,imageData) {
//     const ctx = canvas.getContext('2d');
//     ctx.putImageData(imageData, 0, 0);
// }

function readDicomFromZip(file) {
    return new Promise((resolve, reject) => {
        const zip = new JSZip();
        zip.loadAsync(file)
            .then((zip) => {
                const series = new daikon.Series();
                const promises = [];

                draw_preloader(document.body)

                for (const file in zip.files) {
                    const fileContentPromise = zip.files[file].async("arraybuffer");
                    promises.push(fileContentPromise);
                }
                Promise.all(promises).then((files) => {
                    for (file of files) {
                        const image = daikon.Series.parseImage(new DataView(file));
                        if (image === null) {
                            reject(daikon.Series.parserError);
                        } else if (image.hasPixelData()) {
                            if ((series.images.length === 0) ||
                                (image.getSeriesId() === series.images[0].getSeriesId())) {
                                series.addImage(image);
                            }
                        }
                    }
                    series.buildSeries();
                    resolve(series);

                    remove_preloader();

                });
            });
    });
}


function initView() {
    const file = document.getElementById('zip-input').files[0];
    readDicomFromZip(file).then((series) => {
        window.currentSeries = series;
        // currentSlice = 0;
        delete series;

        let global_min = Infinity;
        let global_max = -Infinity;

        for (let i of currentSeries.images) {
            let MaxMin = CustomMinMax(i.getInterpretedData());
            if (global_min > MaxMin[0]) {
                global_min = MaxMin[0]
            } else if (global_max < MaxMin[1]) {
                global_max = MaxMin[1]
            }
        }
        console.log(global_min,global_max);

        const colors = []
        for (let i = 0; i < 256; i+=1) {
            colors.push([i,i,i])
        }

        const voxels = []

        let global_cut_min = Math.floor((global_min + (global_max-global_min)*0.5))
        let global_cut_max = Math.floor((global_max - (global_max-global_min)*0.0))

        // let global_cut_min = -300
        // let global_cut_max = -300

        // let x_lim = [50,511-50]
        // let y_lim = [140,410]
        let x_lim = [0,511]
        let y_lim = [0,511]
        // let z_lim = [250,300]
        let skip_x = 2
        let skip_y = 2
        let skip_z = 4

        console.log(global_cut_min,global_cut_max);

        for (let i in currentSeries.images) {
            // if (parseInt(i) <= z_lim[1] && parseInt(i) >= z_lim[0]) {
            if (parseInt(i)%skip_z == 0) {
                const temp_data = currentSeries.images[i].getInterpretedData()
                for (let j = y_lim[0]; j <= y_lim[1]; j+=skip_y) {
                    for (let k = x_lim[0]; k <= x_lim[1]; k+=skip_x) {
                        const pos = j*512 + k;
                            if (temp_data[pos] >= global_cut_min && temp_data[pos] <= global_cut_max) {
                                voxels.push([k/skip_x,j/skip_y,parseInt(i)/skip_z,Math.round(((temp_data[pos] - global_min)/(global_max - global_min))*255)])
                        }

                    }
                }
                console.log(i,'/',currentSeries.images.length,' зображень оброблено  ',voxels.length,' точок знайдено')
            }
        }

        delete window.currentSeries

        // for (let i = 0; i < 3; i+=1) {
        //     // voxels.push([i,0,0,128])
        //     // voxels.push([0,i,0,128])
        //     // voxels.push([0,0,i,128])
        //     // voxels.push([i,i,0,128])
        //     // voxels.push([i,0,i,128])
        //     // voxels.push([0,i,i,128])
        //     voxels.push([i,i*2,i%2,i+1])
        // }

        // console.log(voxels)



    

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

        scene.background = new THREE.Color( 0x999999 );

        var renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );

        scene.fog = new THREE.Fog( 0x050505, 100, 800 );

        scene.add( new THREE.AmbientLight( 0xffffff ) );

        // const light1 = new THREE.DirectionalLight( 0xffffff, 0.05 );
        // light1.position.set( 0, 0, 280 );
        // scene.add( light1 );

        // const light6 = new THREE.DirectionalLight( 0xffffff, 0.05 );
        // light6.position.set( 280, 0, 0 );
        // scene.add( light6 );

        // const light7 = new THREE.DirectionalLight( 0xffffff, 0.05 );
        // light7.position.set( 0, 280, 0 );
        // scene.add( light7 );

        // const light8 = new THREE.DirectionalLight( 0xffffff, 0.05 );
        // light8.position.set( 0, -280, 0 );
        // scene.add( light8 );

        // const light9 = new THREE.DirectionalLight( 0xffffff, 0.05 );
        // light9.position.set( -280, 0, 0 );
        // scene.add( light9 );

        camera.position.z = 280;

        const mesh = create_voxel_object(voxels,colors);
        delete voxels;
        // const mesh = create_voxel_object();
        // mesh.position.set(-256,-256,-256)
        scene.add( mesh ); 

        renderer.render( scene, camera );

        

        document.addEventListener('mousemove', move => {
            if (move.buttons == 1 && mesh) {
                
                mesh.rotation.x += move.movementY/100;
                

                if (move.shiftKey) {
                    mesh.rotation.z += move.movementX/100;
                } else {
                    mesh.rotation.y += move.movementX/100;
                }
                
                renderer.render( scene, camera );
            }
        })

        document.addEventListener('wheel', wheel => {
            // wheel.preventDefault();
                camera.position.z += wheel.deltaY/100;
                renderer.render( scene, camera );

        })
    })
}

// document.getElementById('image_layer').addEventListener("wheel", (evt) => {
//     const direction = Math.sign(evt.deltaY/1000)
//     currentSlice += direction;
//     if (currentSlice > currentSeries.images.length-1) {
//         currentSlice = currentSeries.images.length-1;
//     } else if (currentSlice < 0) {
//         currentSlice = 0;
//     } else {
//         drawCurrentSlice();
//     }
// })


