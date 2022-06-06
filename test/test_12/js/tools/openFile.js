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

function initOpenFile(element = openFileElement) {
	initTool(element,true,false);

	element.querySelector('#oneDicomFile').addEventListener('change', c => {
		consoleOut('start opening one Dicom File -------------------------------------------')
		c.target.files[0].arrayBuffer().then(f=>{
	    	let image = daikon.Series.parseImage(new DataView(f))
			const pixelData = new Int16Array(image.getInterpretedData())

			consoleOut('image opened')

			const X = image.getCols();
			const Y = image.getRows();
			const Z = image.getNumberOfFrames() //Math.floor(pixelData.length/X/Y);
			if (Z != Math.floor(pixelData.length/X/Y)) {consoleOut('data problems while reading')}
			const min = pixelData.reduce((a,b)=>(b<a?b:a));
			const max = pixelData.reduce((a,b)=>(b>a?b:a));
			consoleOut(X,Y,Z,min,max)

			
			consoleOut(`PixelSpacing: ${image.getPixelSpacing()}, Orientation: ${image.getOrientation()}, PatientID: ${image.getPatientID()}`)
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

			calcBlock3D(get3DarrayFrom1D(pixelData,X,Y,Z),X,Y,Z,min,max)
			document.getElementById('zone3d').setAttribute('style','--lZ: auto;');
			
			consoleOut('end opening one Dicom File ---------------------------------------------')
		})
		
	})

	element.querySelector('#manyDicomFiles').addEventListener('change', c => {
		consoleOut('start opening many Dicom Files -----------------------------------------')

		let tempArrOfImg = new Array(c.target.files.length)
		let tempArrOfImgStatus = (new Array(c.target.files.length)).fill(false)
		consoleOut(c.target.files)
		consoleOut(c.target.files.length)
		for (let i = 0; i < c.target.files.length; i++) {
			c.target.files[i].arrayBuffer().then(f=>{
		    	tempArrOfImg[i] = daikon.Series.parseImage(new DataView(f))
		    	tempArrOfImgStatus[i] = true;
		    	consoleOut(tempArrOfImgStatus.map(a=>(a?'■':'□')).join(''))
		    	if (tempArrOfImgStatus.reduce((a,b)=>(a?b:false),true)) {
					consoleOut('succes')

					// consoleOut(tempArrOfImg)
					const X = tempArrOfImg[0].getCols();
					const Y = tempArrOfImg[0].getRows();
					
					// consoleOut(X,Y,Z,min,max)

					const minFrameNum = tempArrOfImg.reduce((a,b)=>(b.getImageNumber()<a.getImageNumber()?b:a)).getImageNumber()
					const maxFrameNum = tempArrOfImg.reduce((a,b)=>(b.getImageNumber()>a.getImageNumber()?b:a)).getImageNumber()
					consoleOut('minFrameNum',minFrameNum,'maxFrameNum',maxFrameNum)
					
					const Z = maxFrameNum - minFrameNum;

					if (Z+1 != tempArrOfImg.length) {throw `there are not enough frames \nyou give: ${tempArrOfImg.map(a=>a.getImageNumber())}`}

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
					consoleOut(X,Y,Z,min,max)
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

					calcBlock3D(get3DarrayFrom1D(pixelData,X,Y,Z),X,Y,Z,min,max)
					document.getElementById('zone3d').setAttribute('style','--lZ: auto;');

					consoleOut('end opening many Dicom Files -------------------------------------------')
				}
			})			
		}
	})
	
}