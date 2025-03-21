// import * as THREE from 'three'
// need lib dicomParser.js and THREE.js
// need glsltext.js

class DicomData {
	error = (...a)=>{console.error(...a)}
	warn = (...a)=>{console.warn(...a)}
	log = (...a)=>{console.log(...a)}
	time = (a)=>{console.time(a)}
	timeEnd = (a)=>{console.timeEnd(a)}

	#isOpened = false;
	get isOpened() {
		if ( !this.#isOpened ) {
			this.warn(`a lot of class functional work only after opening file`);
		}
		return this.#isOpened;
	}

	dataType(text = false) { //{0: Uint8, 1: Int8, 2: Uint16, 3: Int16}
		if (this.isOpened === true) {
			if (text === true) {
				return `${(this.PixelRepresentation === 0?'Ui':'I')}nt${this.BitsAllocated}`
			} else {
				return (this.BitsAllocated === 16) << 1 | (this.PixelRepresentation === 1)
			}
		}
	}

	#rawPixelData;
	get rawPixelData() {return this.#rawPixelData;}

	get rawMin    () {return this.rawDataMin;}
	get rawMax    () {return this.rawDataMax;}

	get realMin   () {return this.realDataMin;}
	get realMax   () {return this.realDataMax;}
	get min       () {return this.realDataMin;}
	get max       () {return this.realDataMax;}

	get w         () {return this.width     ;}
	get h         () {return this.height    ;}

	get sizepx() {
		return new THREE.Vector3(this.w, this.h, this.frames)
	}

	get pxSizemm() {
		const spacing = this.image.getPixelSpacing()
		const thickness = this.image.getSliceThickness()
		return new THREE.Vector3( spacing[0], spacing[1], thickness )
	}

	get sizemm() {
		return this.sizepx.multiply(this.pxSizemm);
	}

	readBuffer(buffer) {
		this.fileBuffer = buffer;

		const image = daikon.Series.parseImage(new DataView(this.fileBuffer));
		this.image = image;
		this.#isOpened = true;

		this.BitsAllocated = image.getBitsAllocated();
		this.PixelRepresentation = image.getPixelRepresentation();

		switch (this.dataType()) {
			case 0:	this.#rawPixelData = new  Uint8Array(image.getRawData()); break;
			case 1:	this.#rawPixelData = new   Int8Array(image.getRawData()); break;
			case 2:	this.#rawPixelData = new Uint16Array(image.getRawData()); break;
			case 3:	this.#rawPixelData = new  Int16Array(image.getRawData()); break;
			default: this.error(this.dataType()); break;
		}

		this.rawDataMin = this.#rawPixelData.reduce((a,b)=>(b<a?b:a));
		this.rawDataMax = this.#rawPixelData.reduce((a,b)=>(b>a?b:a));

		this.width  = image.getCols();
		this.height = image.getRows();
		this.frames = image.getNumberOfFrames();

		this.scaleSlope = image.getDataScaleSlope();
		this.scaleIntercept = image.getDataScaleIntercept();

		this.realDataMin = this.rescaleRawToReal( this.rawDataMin );
		this.realDataMax = this.rescaleRawToReal( this.rawDataMax );

		this.getInfo(true)
	}

	getInfo(log = false) {
		if (this.isOpened === true) {
			const image = this.image;
			// const wd = image.getCols();
			// const hd = image.getRows();
			// const frames = image.getNumberOfFrames()
			const spacing = image.getPixelSpacing();

			const rawlen = image.getRawData().byteLength
			const mustlen = image.getNumberOfSamplesPerPixel()*this.width*this.height*this.frames*(this.BitsAllocated/8)

			const info = {
				'Series ID'                 : image.getSeriesId(),
				'Modality'                  : image.getModality(),
				'Photometric Interpretation': image.getPhotometricInterpretation(),
				'Samples per Pixel'         : image.getNumberOfSamplesPerPixel(),
				'Pixel Representation'      : `${image.getPixelRepresentation()} (${(image.getPixelRepresentation() == 0?'un':'')}signed)`,
				'Bits Allocated'            : `${image.getBitsAllocated()} (so raw data type is ${(image.getPixelRepresentation() == 0?'Ui':'I')}nt${image.getBitsAllocated()})`,
				'Bits Stored'               : image.getBitsStored(),
				//'min bits count needed to store this data': Math.ceil(Math.log2(raw_max-raw_min+1)),
				'raw data min'    : this.rawDataMin,
				'raw data max'    : this.rawDataMax,
				'Scale Intercept' : this.scaleIntercept,
				'ScaleSlope'      : this.scaleSlope,
				'Real pixel value': `${this.scaleSlope} * raw pixel value ${(this.scaleIntercept>=0?'+ ':'')}${this.scaleIntercept}`,
				'real data min'   : this.realDataMin,
				'real data max'   : this.realDataMax,

				'dicom frames in file count': this.frames,
				'width (px)': this.width,
				'height (px)': this.height,
				'raw pixel data byte length': rawlen,
				'pixel data byte length must be': `${mustlen} (${ (rawlen==mustlen?'same as raw as expected':'!!! not same as raw !!!') })`,

				'pixel spacing rows,cols mm': spacing,
				'width (mm)': (spacing?this.width*spacing[1]:null),
				'height (mm)': (spacing?this.height*spacing[0]:null),
			}

			if (log) {
				//this.log(info)
				const maxLength = Object.entries( info ).reduce((ac,a)=>{
					ac[0] = Math.max( String(a[0]).length, ac[0] );
					ac[1] = Math.max( String(a[1]).length, ac[1] );
					return ac;
				},[0,0])
				console.log( Object.entries( info ).map(a=>`${String(a[0]).padEnd(maxLength[0])}: ${a[1]}`).join('\n') )
			} else {
				return info
			}
			
		}
	}

	fetchByUrl(url) { // '../../dicomData/DATA1/BODYAKA_D_YU.dcm'
		return new Promise((resolve, reject)=>{
			this.time(`load file : ${url}`)
			fetch(url)
				.then(response=>{
					this.timeEnd(`load file : ${url}`)
					this.log(response)

					this.time(`to Array Buffer : ${url}`)
					return response.arrayBuffer()
				})
				.then(buffer=>{
					this.timeEnd(`to Array Buffer : ${url}`)

					this.time(`read buffer : ${url}`)
					this.readBuffer(buffer)
					this.timeEnd(`read buffer : ${url}`)

					resolve(this)
				})
		})
	}

	constructor() {

		// if (typeof data === 'string') {
		// 	this.#data = new DataView(new TextEncoder().encode(data).buffer)
		// } else if (data.buffer instanceof ArrayBuffer) {
		// 	this.#data = new DataView(data.buffer)
		// } else if (data instanceof ArrayBuffer) {
		// 	this.#data = new DataView(data)
		// } else {
		// 	this.error('constructor support only String, ArrayBuffer and if data.buffer is instanceof ArrayBuffer')
		// }

	}

	get rawDataTypeMin() { return (-2)**(this.BitsAllocated-this.PixelRepresentation)*this.PixelRepresentation; }
	get rawDataTypeMax() { return 2**(this.BitsAllocated-this.PixelRepresentation)-1; }
	
	getTHREEtexture() {
		let texture;
		const typeMin = this.rawDataTypeMin;
		switch (this.dataType()) {
			case 0: texture = new THREE.DataTexture(                 this.#rawPixelData                           , this.w, this.h, THREE.RedFormat); break; // Uint8
			case 1: texture = new THREE.DataTexture( new Uint8Array( this.#rawPixelData.map(a=>a+typeMin).buffer ), this.w, this.h, THREE.RedFormat); break; //  Int8
			case 2: texture = new THREE.DataTexture( new Uint8Array( this.#rawPixelData.buffer )                  , this.w, this.h, THREE.RGFormat ); break; //Uint16
			case 3: texture = new THREE.DataTexture( new Uint8Array( this.#rawPixelData.map(a=>a+typeMin).buffer ), this.w, this.h, THREE.RGFormat ); break; // Int16
			default: this.error(this.dataType()); break;
		}
		texture.needsUpdate = true;
		return texture
	}

	get3DTHREEtexture() {
		let texture;
		const typeMin = this.rawDataTypeMin;
		switch (this.dataType()) {
			case 0: texture = new THREE.Data3DTexture(                 this.#rawPixelData,                            this.w, this.h, this.frames); texture.format = THREE.RedFormat; break; // Uint8
			case 1: texture = new THREE.Data3DTexture( new Uint8Array( this.#rawPixelData.map(a=>a+typeMin).buffer ), this.w, this.h, this.frames); texture.format = THREE.RedFormat; break; //  Int8
			case 2: texture = new THREE.Data3DTexture( new Uint8Array( this.#rawPixelData.buffer ),                   this.w, this.h, this.frames); texture.format = THREE.RGFormat ; break; //Uint16
			case 3: texture = new THREE.Data3DTexture( new Uint8Array( this.#rawPixelData.map(a=>a+typeMin).buffer ), this.w, this.h, this.frames); texture.format = THREE.RGFormat ; break; // Int16
			default: this.error(this.dataType()); break;
		}

		//texture.format = THREE.RedFormat;

		// texture.unpackAlignment = 1;

		// texture.minFilter = THREE.LinearFilter;
		// texture.magFilter = THREE.LinearFilter;

		texture.needsUpdate = true;
		return texture
	}

	calc3DIsotropicMagnituge16bit() {
		if ( !this.#isOpened ) { this.error('no data'); return;}

		console.time('startCalcFilter')
		const filterX = 3;
		const filterY = 3;
		const filterZ = 3;

		const s3 = 1/Math.sqrt(3);
		const s2 = 1/Math.sqrt(2);
		const s1 = 1/Math.sqrt(1);

		const filter = Float64Array.of(
			-s3,-s2,-s3,
			-s2,-s1,-s2,
			-s3,-s2,-s3,

			  0,  0,  0,
			  0,  0,  0,
			  0,  0,  0,

			 s3, s2, s3,
			 s2, s1, s2,
			 s3, s2, s3,
		)

		const X = this.w;
		const Y = this.h;
		const Z = this.frames;

		const dataInMin = this.rawMin
		const dataInMax = this.rawMax
		const filterOutMin = filter.reduce((ac,a)=>ac + a*( a > 0 ? dataInMin : dataInMax ), 0)
		const filterOutMax = filter.reduce((ac,a)=>ac + a*( a < 0 ? dataInMin : dataInMax ), 0)

		//console.log(dataInMin, dataInMax, filterOutMin, filterOutMax)

		// tested in https://www.desmos.com/calculator/bnqre4e5xh

		// fOut =>  1/(1+Math.exp(( (fOut - filterOutMin)/(filterOutMax - filterOutMin) - 0.5 )/-0.0728432477272727))
		const thisFilterConstant = 0.0728432477272727;
		const multConstant = ((filterOutMin-filterOutMax)*thisFilterConstant)
		const addConstant = 0.5/thisFilterConstant - filterOutMin/multConstant

		//console.log( multConstant, addConstant )

		//console.log( `fOut=>1/(1+Math.exp(fOut*${1/multConstant}${glsl.asFloatPlus(addConstant)}))` )

		// const equaliseFilterOutHist = eval(`fOut=>1/(1+Math.exp(fOut*${1/multConstant}${glsl.asFloatPlus(addConstant)}))`)
		const equaliseFilterOutHist = eval(`fOut=>1/(1+Math.exp(fOut/${multConstant}))-0.5`)

		this.log(equaliseFilterOutHist)
		
		const result = new Uint16Array(X*Y*Z);
		const rescale = (2**16-1)*2/Math.sqrt(3)

		let pos, fpos;

		for (let z = 1; z < Z-1; z++) {
			for (let y = 1; y < Y-1; y++) {
				for (let x = 1; x < X-1; x++) {
					pos = (z*Y + y)*X + x;

					let F0 = 0, F1 = 0, F2 = 0;
					for (let i = -1; i <= 1; i++) {
						for (let j = -1; j <= 1; j++) {
							for (let k = -1; k <= 1; k++) {
								fpos = (i*3 + j)*3 + k + 13;

								//npos = (z*Y + y+i)*X + x+j;
								F0 += filter[fpos]*this.#rawPixelData[ ((z+i)*Y + y+j)*X + x+k ]
								F1 += filter[fpos]*this.#rawPixelData[ ((z+j)*Y + y+k)*X + x+i ]
								F2 += filter[fpos]*this.#rawPixelData[ ((z+k)*Y + y+i)*X + x+j ]
							}
						}
					}

					F0 = equaliseFilterOutHist(F0)
					F1 = equaliseFilterOutHist(F1)
					F2 = equaliseFilterOutHist(F2)

					result[pos] = Math.sqrt( F0*F0 + F1*F1 + F2*F2 )*rescale;
				}
			}
		}
	
		this.isotropic = result;
		this.isotropicMin = dicom.isotropic.reduce((a,b)=>a<b?a:b)
		this.isotropicMax = dicom.isotropic.reduce((a,b)=>a>b?a:b)
		
		const texture = new THREE.Data3DTexture( new Uint8Array( this.isotropic.buffer ), X, Y, Z); 
		texture.format = THREE.RGFormat ;
		texture.magFilter = THREE.LinearFilter;
		texture.needsUpdate = true;

		this.isotropicTex = texture;


		console.timeEnd('startCalcFilter')
	}

	rescaleRawToReal(raw ) {return raw*this.scaleSlope + this.scaleIntercept;}
	rescaleRealToRaw(real) {return Math.round( (real - this.scaleIntercept)/this.scaleSlope );} //raw are always int or uint

	get GLSLfuncRescaleRealToRaw() {

		// float readPxAsRaw(vec4 pxVal) {
		// 	return ${
		// 		this.BitsAllocated === 16 ?
		// 			//'pxVal.g*65280. + pxVal.r*255.' // 65280 = 255*256 // 2 MUL, 1 ADD
		// 			'(pxVal.g*256. + pxVal.r)*255.'                      // 1 MAD, 1 MUL
		// 		: 
		// 			'pxVal.r*255.'
		// 	}${this.rawDataTypeMin != 0 ? glsl.asFloatPlus(+1*this.rawDataTypeMin) : ''};
		// }

		return `
			int readPxAsRawInt(vec4 pxVal) {
				return ${
					this.BitsAllocated === 16 ?
						'int(pxVal.g*255.)*256 + int(pxVal.r*255.)'
					: 
						'pxVal.r*255.'
				}${this.rawDataTypeMin != 0 ? glsl.asIntPlus(+1*this.rawDataTypeMin) : ''};
			}

			// expected rande of input is from ${glsl.asFloat(this.realDataMin)} to ${glsl.asFloat(this.realDataMax)}
			int RescaleRealToRaw(float realVal) {
				// (real - scaleIntercept)/scaleSlope = real*(1/scaleSlope) - (scaleIntercept/scaleSlope)
				//                       1 SUB, 1 DIV -> 1 MAD
				return int( realVal*${glsl.asFloat(+1/this.scaleSlope)}${glsl.asFloatPlus(-1*this.scaleIntercept/this.scaleSlope)} );
				${''/* reverseRescale = (realVal ${this.asGLSLFloatPlus(-1*this.scaleIntercept)})/${this.asGLSLFloat(this.scaleSlope)} */}
			}
		`
	}


}

export { DicomData }