const openFileElement = document.querySelector('#openFile')

function get3DarrayFrom1D(data,X,Y,Z) {
	let res = new Array(Z)
	for (let z = 0; z < Z; z++) {
		res[z] = new Array(Y)
		for (let y = 0; y < Y; y++) {
			res[z][y] = data.slice(y*X+z*Y*X,(y+1)*X+z*Y*X)
		}
	}
	return res
}

function openOneFile( arrayBufferPromise, visPar = false, choseZ = false, func = ()=>{} ) {
	const openfiletampdate = Date.now();
	draw_preloader()
	consoleOut('start opening one Dicom File -------------------------------------------')
	arrayBufferPromise.then(f=>{
    	let image = daikon.Series.parseImage(new DataView(f))
		const pixelData = new Int16Array(image.getInterpretedData())

		consoleOut('image opened')

		const X = image.getCols();
		const Y = image.getRows();
		const Z = image.getNumberOfFrames() //Math.floor(pixelData.length/X/Y);
		if (Z != Math.floor(pixelData.length/X/Y)) {consoleOut('data problems while reading')}
		const min = pixelData.reduce((a,b)=>(b<a?b:a));
		const max = pixelData.reduce((a,b)=>(b>a?b:a));
		// consoleOut(X,Y,Z,min,max)

		const orient = image.getOrientation()
		// consoleOut(X,Y,Z,min,max,`PixelSpacing: ${image.getPixelSpacing()}, Orientation: ${image.getOrientation()}, PatientID: ${image.getPatientID()}`)
		consoleOut(`${X} ${Y} ${Z} ${min} ${max} PixelSpacing: ${image.getPixelSpacing()}, Orientation: ${orient}, PatientID: ${image.getPatientID()}`)
		updateFileInfo({'X':X+'px','Y':Y+'px','Z':Z+'px','image min':min,'image max':max})
		
		const tempDate = Date.now()
		window.hist = new HistForBigIntData(
			document.querySelector('#histCanv')
			,pixelData
			,min
			,max
			,50
		)
		consoleOut(`histogram calced need time: ${Date.now() - tempDate} ms`)
		initHistogram(min,max,50)
		initShowContours(min,max)
		// setShowContours({detalised: 1, allowInMin: min, allowInMax: max})

		calcBlock3D(
			get3DarrayFrom1D(pixelData,X,Y,Z),
			{
				X: X, Y: Y, Z: Z, 
				min: min, max: max, 
				VisParams: visPar === false ? (max > 4000?[
						{min: 1000, max: 4000, gradient: true, rgba0: [0, 0, 0, 0], rgba1: [255, 255, 255, 255]},
						{min: 4000, max: max, gradient: true, rgba0: [255, 255, 0, 255], rgba1: [255, 0, 0, 255]}
					]:(max > 2500?[
						{min: 1000, max: max, gradient: true, rgba0: [0, 0, 0, 0], rgba1: [255, 255, 255, 255]}
					]:[
						{min: min, max: max, gradient: true, rgba0: [0, 0, 0, 0], rgba1: [255, 255, 255, 255]}
					])) : visPar
				,
				ChoseZoneParams: choseZ === false ? {
						visible: false, 
						X0: 0, X1: X, 
						Y0: 0, Y1: Y, 
						Z0: 0, Z1: Z
					} : choseZ
			}
		)
		// consoleOut(`scale3d(${parseInt(orient[3]+1)},${parseInt(orient[4]+1)},${parseInt(orient[5]+1)})`)
		// temporary disable of orient
		// if (orient) {
		// 	document.getElementById('block3d').style.transform = `scale3d(${parseInt(orient[3]+1)},${parseInt(orient[4]+1)},${parseInt(orient[5]+1)*-1})`
		// }
		document.getElementById('zone3d').setAttribute('style','--lZ: auto;');
		
		consoleOut('end opening one Dicom File ---------------------------------------------')
		remove_preloader()
		consoleOut(`file opened and renderd, need time: ${Date.now() - openfiletampdate} ms`)
		func()
	})
}

function openManyFiles( ArrayOfarrayBufferPromise, visPar = false, choseZ = false, func = ()=>{} ) {
	const openfiletampdate = Date.now();
	draw_preloader()
	consoleOut('start opening many Dicom Files -----------------------------------------')

	let tempArrOfImg = new Array(ArrayOfarrayBufferPromise.length)
	let tempArrOfImgStatus = (new Array(ArrayOfarrayBufferPromise.length)).fill(false)
	// consoleOut(c.target.files)
	consoleOut(ArrayOfarrayBufferPromise.length)
	for (let i = 0; i < ArrayOfarrayBufferPromise.length; i++) {
		ArrayOfarrayBufferPromise[i].then(f=>{
	    	tempArrOfImg[i] = daikon.Series.parseImage(new DataView(f))
	    	tempArrOfImgStatus[i] = true;
	    	consoleOut(tempArrOfImgStatus.map(a=>(a?'■':'□')).join(''))
	    	if (tempArrOfImgStatus.reduce((a,b)=>(a?b:false),true)) {
				consoleOut('succes')

				// consoleOut(tempArrOfImg)
				const X = tempArrOfImg[0].getCols();
				const Y = tempArrOfImg[0].getRows();
				
				const minFrameNum = tempArrOfImg.reduce((a,b)=>(b.getImageNumber()<a.getImageNumber()?b:a)).getImageNumber()
				const maxFrameNum = tempArrOfImg.reduce((a,b)=>(b.getImageNumber()>a.getImageNumber()?b:a)).getImageNumber()
				consoleOut('minFrameNum',minFrameNum,'maxFrameNum',maxFrameNum)
				
				const Z = maxFrameNum - minFrameNum + 1;

				consoleOut(X,Y,Z)

				if (Z != tempArrOfImg.length) {throw `there are not enough frames \nyou give: ${tempArrOfImg.map(a=>a.getImageNumber())}`}

				let pixelData = new Int16Array(X*Y*Z)

				for (let i = 0; i < tempArrOfImg.length; i++) {
					const pos = tempArrOfImg[i].getImageNumber()-minFrameNum
					const tempPixelData = tempArrOfImg[i].getInterpretedData()

					for (let j = 0; j < tempPixelData.length; j++) {
						pixelData[pos*tempPixelData.length+j]=tempPixelData[j];
					}
				}
				const min = pixelData.reduce((a,b)=>(b<a?b:a));
				const max = pixelData.reduce((a,b)=>(b>a?b:a));
				
				const orient = tempArrOfImg[0].getOrientation()

				consoleOut(`${X} ${Y} ${Z} ${min} ${max} PixelSpacing: ${tempArrOfImg[0].getPixelSpacing()}, Orientation: ${tempArrOfImg[0].getOrientation()}, PatientID: ${tempArrOfImg[0].getPatientID()}`)
				updateFileInfo({'X':X+'px','Y':Y+'px','Z':Z+'px','image min':min,'image max':max})

				const tempDate = Date.now()
				window.hist = new HistForBigIntData(
					document.querySelector('#histCanv')
					,pixelData
					,min
					,max
					,50
				)
				consoleOut(`histogram calced need time: ${Date.now() - tempDate} ms`)
				initHistogram(min,max,50)
				initShowContours(min,max)
				// setShowContours({detalised: 1, allowInMin: min, allowInMax: max})

				calcBlock3D(
					get3DarrayFrom1D(pixelData,X,Y,Z),
					{
						X: X, Y: Y, Z: Z, 
						min: min, max: max, 
						VisParams: visPar === false ? (max > 4000?[
								{min: 1000, max: 4000, gradient: true, rgba0: [0, 0, 0, 0], rgba1: [255, 255, 255, 255]},
								{min: 4000, max: max, gradient: true, rgba0: [255, 255, 0, 255], rgba1: [255, 0, 0, 255]}
							]:(max > 2500?[
								{min: 1000, max: max, gradient: true, rgba0: [0, 0, 0, 0], rgba1: [255, 255, 255, 255]}
							]:[
								{min: min, max: max, gradient: true, rgba0: [0, 0, 0, 0], rgba1: [255, 255, 255, 255]}
							])) : visPar
						,
						ChoseZoneParams: choseZ === false ? {
								visible: false, 
								X0: 0, X1: X, 
								Y0: 0, Y1: Y, 
								Z0: 0, Z1: Z
							} : choseZ
					}
				)
				// consoleOut(`scale3d(${parseInt(orient[3]+1)},${parseInt(orient[4]+1)},${parseInt(orient[5]+1)})`)
				document.getElementById('block3d').style.transform = `scale3d(${parseInt(orient[3]+1)},${parseInt(orient[4]+1)},${parseInt(orient[5]+1)*-1})`
				document.getElementById('zone3d').setAttribute('style','--lZ: auto;');

				consoleOut('end opening many Dicom Files -------------------------------------------')
				remove_preloader()
				consoleOut(`file opened and renderd, need time: ${Date.now() - openfiletampdate} ms`)
				func()
			}
		})			
	}
}

function initOpenFile(element = openFileElement) {
	initTool(element,true,false);

	element.querySelector('#oneDicomFile').addEventListener('change', c => {
		openOneFile( c.target.files[0].arrayBuffer() )
	})

	element.querySelector('#manyDicomFiles').addEventListener('change', c => {
		openManyFiles( new Array(c.target.files.length).fill().map( (a,i)=>c.target.files[i].arrayBuffer() ) )
		// const openfiletampdate = Date.now();
		// draw_preloader()
		// consoleOut('start opening many Dicom Files -----------------------------------------')

		// let tempArrOfImg = new Array(c.target.files.length)
		// let tempArrOfImgStatus = (new Array(c.target.files.length)).fill(false)
		// consoleOut(c.target.files)
		// consoleOut(c.target.files.length)
		// for (let i = 0; i < c.target.files.length; i++) {
		// 	c.target.files[i].arrayBuffer().then(f=>{
		//     	tempArrOfImg[i] = daikon.Series.parseImage(new DataView(f))
		//     	tempArrOfImgStatus[i] = true;
		//     	consoleOut(tempArrOfImgStatus.map(a=>(a?'■':'□')).join(''))
		//     	if (tempArrOfImgStatus.reduce((a,b)=>(a?b:false),true)) {
		// 			consoleOut('succes')

		// 			// consoleOut(tempArrOfImg)
		// 			const X = tempArrOfImg[0].getCols();
		// 			const Y = tempArrOfImg[0].getRows();
					
					

		// 			const minFrameNum = tempArrOfImg.reduce((a,b)=>(b.getImageNumber()<a.getImageNumber()?b:a)).getImageNumber()
		// 			const maxFrameNum = tempArrOfImg.reduce((a,b)=>(b.getImageNumber()>a.getImageNumber()?b:a)).getImageNumber()
		// 			consoleOut('minFrameNum',minFrameNum,'maxFrameNum',maxFrameNum)
					
		// 			const Z = maxFrameNum - minFrameNum + 1;

		// 			consoleOut(X,Y,Z)

		// 			if (Z != tempArrOfImg.length) {throw `there are not enough frames \nyou give: ${tempArrOfImg.map(a=>a.getImageNumber())}`}

		// 			let pixelData = new Int16Array(X*Y*Z)

		// 			for (let i = 0; i < tempArrOfImg.length; i++) {
		// 				const pos = tempArrOfImg[i].getImageNumber()-minFrameNum
		// 				const tempPixelData = tempArrOfImg[i].getInterpretedData()

		// 				for (let j = 0; j < tempPixelData.length; j++) {
		// 					pixelData[pos*tempPixelData.length+j]=tempPixelData[j];
		// 				}
		// 			}
		// 			const min = pixelData.reduce((a,b)=>(b<a?b:a));
		// 			const max = pixelData.reduce((a,b)=>(b>a?b:a));
					
		// 			const orient = tempArrOfImg[0].getOrientation()

		// 			consoleOut(`${X} ${Y} ${Z} ${min} ${max} PixelSpacing: ${tempArrOfImg[0].getPixelSpacing()}, Orientation: ${tempArrOfImg[0].getOrientation()}, PatientID: ${tempArrOfImg[0].getPatientID()}`)
		// 			updateFileInfo({'X':X+'px','Y':Y+'px','Z':Z+'px','image min':min,'image max':max})

		// 			const tempDate = Date.now()
		// 			window.hist = new HistForBigIntData(
		// 				document.querySelector('#histCanv')
		// 				,pixelData
		// 				,min
		// 				,max
		// 				,50
		// 			)
		// 			consoleOut(`histogram calced need time: ${Date.now() - tempDate} ms`)
		// 			initHistogram(min,max,50)
		// 			initShowContours(min,max)
		// 			// setShowContours({detalised: 1, allowInMin: min, allowInMax: max})

		// 			calcBlock3D(
		// 				get3DarrayFrom1D(pixelData,X,Y,Z),
		// 				{
		// 					X: X, Y: Y, Z: Z, 
		// 					min: min, max: max, 
		// 					VisParams: (max > 4000?[
		// 							{min: 1000, max: 4000, gradient: true, rgba0: [0, 0, 0, 0], rgba1: [255, 255, 255, 255]},
		// 							{min: 4000, max: max, gradient: true, rgba0: [255, 255, 0, 255], rgba1: [255, 0, 0, 255]}
		// 						]:(max > 2500?[
		// 							{min: 1000, max: max, gradient: true, rgba0: [0, 0, 0, 0], rgba1: [255, 255, 255, 255]}
		// 						]:[
		// 							{min: min, max: max, gradient: true, rgba0: [0, 0, 0, 0], rgba1: [255, 255, 255, 255]}
		// 						])

		// 					),
		// 					ChoseZoneParams: {
		// 						visible: false, 
		// 						X0: 0, X1: X, 
		// 						Y0: 0, Y1: Y, 
		// 						Z0: 0, Z1: Z
		// 					}
		// 				}
		// 			)
		// 			// consoleOut(`scale3d(${parseInt(orient[3]+1)},${parseInt(orient[4]+1)},${parseInt(orient[5]+1)})`)
		// 			document.getElementById('block3d').style.transform = `scale3d(${parseInt(orient[3]+1)},${parseInt(orient[4]+1)},${parseInt(orient[5]+1)*-1})`
		// 			document.getElementById('zone3d').setAttribute('style','--lZ: auto;');

		// 			consoleOut('end opening many Dicom Files -------------------------------------------')
		// 			remove_preloader()
		// 			consoleOut(`file opened and renderd, need time: ${Date.now() - openfiletampdate} ms`)
		// 		}
		// 	})			
		// }
	})
}