/*
usage:

pngFile = await new PNG().build(data) //data must be instanceof File or ArrayBuffer or Uint8Array or String Base64

*/


export class PNG {
	error = (...a)=>{console.error(...a)}
	warn = (...a)=>{console.warn(...a)}
	log = (...a)=>{console.log(...a)}

	#isOpened = false;
	get isOpened() {return this.#isOpened;}

	#signature = new Uint8Array([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]) //137 P N G 13 10 26 10
	get isPNG() {
		if (this.#isOpened && this.#dataView) {
			if (this.#dataView.byteLength > 8) {
				for (let i=0; i<8; i++) {
					if (this.#dataView.getUint8(i) != this.#signature[i]) {
						this.warn('wrong signature, this is not png file')
						return false
					}
				}

				return this.haveBaseChunks;
			}
		} else {
			this.warn('no data to check if this is PNG')
		}
		return false
	}

	get haveBaseChunks() {
		const chunkList = this.chunkList().map(a=>a.name);
		return ['IHDR', 'IDAT', 'IEND'].reduce((ac,name)=>ac&&chunkList.includes(name),true)
	}

	#supportedChunkNames = {
		// 1229472850: 'IHDR',
		// 1347179589: 'PLTE',
		// 1229209940: 'IDAT',
		// 1229278788: 'IEND',

		// 1649100612: 'bKGD',
		// 1665684045: 'cHRM',
		// 1665745744: 'cICP',
		// 1683179847: 'dSIG',
		// 1700284774: 'eXIf',
		// 1732332865: 'gAMA',
		// 1749635924: 'hIST',
		// 1766015824: 'iCCP',
		// 1767135348: 'iTXt',
		// 1883789683: 'pHYs',
		// 1933723988: 'sBIT',
		// 1934642260: 'sPLT',
		// 1934772034: 'sRGB',
		// 1934902610: 'sTER',
		// 1950701684: 'tEXt',
		// 1950960965: 'tIME',
		// 1951551059: 'tRNS',
		// 2052348020: 'zTXt',

		0x49_48_44_52: 'IHDR',
		0x50_4c_54_45: 'PLTE',
		0x49_44_41_54: 'IDAT',
		0x49_45_4e_44: 'IEND',

		0x62_4b_47_44: 'bKGD',
		0x63_48_52_4d: 'cHRM',
		0x63_49_43_50: 'cICP',
		0x64_53_49_47: 'dSIG',
		0x65_58_49_66: 'eXIf',
		0x67_41_4d_41: 'gAMA',
		0x68_49_53_54: 'hIST',
		0x69_43_43_50: 'iCCP',
		0x69_54_58_74: 'iTXt',
		0x70_48_59_73: 'pHYs',
		0x73_42_49_54: 'sBIT',
		0x73_50_4c_54: 'sPLT',
		0x73_52_47_42: 'sRGB',
		0x73_54_45_52: 'sTER',
		0x74_45_58_74: 'tEXt',
		0x74_49_4d_45: 'tIME',
		0x74_52_4e_53: 'tRNS',
		0x7a_54_58_74: 'zTXt',
	}

	#u32toText(u32) {return new TextDecoder().decode( new Uint8Array(4).map((a,i)=>u32>>((3-i)*8)) )}
	#u32toHex(u32) {return u32.toString(16).padStart(8,'0')}
	chunkList(updateThis=true) {
		const chunks = []
		for (let byte=8; byte<this.#dataView.byteLength;) {
			// this.log(byte)
			const size = this.#dataView.getUint32(byte)
			const name = this.#dataView.getUint32(byte+4)
			const crc  = this.#dataView.getUint32(byte+4+size) //name!=0x49_45_4e_44?...:undefined;
			if ( this.#supportedChunkNames.hasOwnProperty(name) ) {
				chunks.push({name: this.#supportedChunkNames[name], size: size, crc: crc, offset: byte})
			} else {
				this.warn(`not supported chunk in file\noffset: ${byte} size: ${size}bytes, name: 0x${this.#u32toHex(name)} "${this.#u32toText(name)}" \n${Object.values(this.#supportedChunkNames).join(', ')}`)
			}
			if (size) {
				byte+=size+12 //4 bytes (for size in u32) + 4 bytes (for name) + 4 bytes (for crc32 in 4 bytes)
			} else {
				break;
			}
		}
		this.log(chunks)
		if (updateThis) {
			this.chunks = chunks;
		}
		return chunks
	}

	#dataView;
	get dataView() {return this.#dataView}

	async readFile(file) {this.readBuffer(await file.arrayBuffer());}
	readBuffer(buffer)   {this.#dataView = new DataView(buffer);}
	readUint8(uint8)     {this.#dataView = new DataView(uint8.buffer)}
	readBase64(base64)   {this.#dataView = new DataView(Base64.Base64ToUint8(base64).buffer)}

	constructor(data) {
		if (data) {
			this.build(data)
		}
	}

	async build(data) {
		if (data instanceof File) {
			await this.readFile(data)
		} else if (data instanceof Response && data.body instanceof ReadableStream) {
			await this.readFile(data)
		} else if (data instanceof ArrayBuffer) {
			this.readBuffer(data)
		} else if (data instanceof Uint8Array) {
			this.readUint8(data)
		} else if (typeof(data) === 'string') {
			this.readBase64(data)
		} else {
			this.error('PNG constructor support only data instanceof File or ArrayBuffer or Uint8Array or String Base64 data')
		}

		this.#isOpened = true

		this.log('this is png?', this.isPNG)
	}

	async fromURL(url) {
		const response = await fetch(url)
		if (response.body instanceof ReadableStream) {
			this.build(response)
		} else {
			this.error('response.body is not instanceof ReadableStream if bytes are represented there differently try get array buffer and then PNG.built(ArrayBuffer)')
		}
	}
}