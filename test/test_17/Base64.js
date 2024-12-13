export class Base64 {
	static alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'; //defined in RFC 4648
	static padding  = '=';                                                                //defined in RFC 4648
	static reverseAlphabet = Object.fromEntries(this.alphabet.split('').map((a,i)=>[a,i]));
	static uint8Alphabet = new TextEncoder().encode(this.alphabet);
	static uint8Padding = new TextEncoder().encode(this.padding)[0]

	// string, string sum, safe
	static Uint8ToBase64(U8arr) {
		let res = ''
		for (var i=0; i<=U8arr.length-3; i+=3) {
			res+=this.alphabet[ U8arr[i  ]>>2 & 0b111111                            ]
			    +this.alphabet[(U8arr[i  ]<<4 & 0b110000)|(U8arr[i+1]>>4 & 0b001111)]
			    +this.alphabet[(U8arr[i+1]<<2 & 0b111100)|(U8arr[i+2]>>6 & 0b000011)]
			    +this.alphabet[ U8arr[i+2]    & 0b111111                            ];
		}
		
		switch (U8arr.length%3) {
			case 0: break;
			case 1: 
				res+=this.alphabet[U8arr[i]>>2 & 0b111111]
				    +this.alphabet[U8arr[i]<<4 & 0b110000]
				    +this.padding
				    +this.padding;
				break;
			case 2:
				res+=this.alphabet[ U8arr[i  ]>>2 & 0b111111                            ]
				    +this.alphabet[(U8arr[i  ]<<4 & 0b110000)|(U8arr[i+1]>>4 & 0b001111)]
				    +this.alphabet[ U8arr[i+1]<<2 & 0b111100                            ]
				    +this.padding;
				break;
		}

		return res
	}

	// uint array, +1,2,3 , uint array to string, unsafe
	static Uint8ToBase64v1(U8arr) {
		const res = new Uint8Array(Math.ceil(U8arr.length/3)*4)
		for (var i=0,j=0; i<U8arr.length; i+=3,j+=4) {
			res[j  ]=this.uint8Alphabet[ U8arr[i  ]>>2 & 0b111111                            ]
			res[j+1]=this.uint8Alphabet[(U8arr[i  ]<<4 & 0b110000)|(U8arr[i+1]>>4 & 0b001111)]
			res[j+2]=this.uint8Alphabet[(U8arr[i+1]<<2 & 0b111100)|(U8arr[i+2]>>6 & 0b000011)]
			res[j+3]=this.uint8Alphabet[ U8arr[i+2]    & 0b111111                            ];
		}
		
		switch (U8arr.length%3) {
			// case 0: break;
			case 1: res[j-2] = res[j-1] = this.uint8Padding; break;
			case 2:            res[j-1] = this.uint8Padding; break;
		}

		return new TextDecoder().decode(res)
	}

	// uint array, +1,2,3 , uint array to string, safe
	static Uint8ToBase64v2(U8arr) {
		const res = new Uint8Array(Math.ceil(U8arr.length/3)*4)
		for (var i=0,j=0; i<=U8arr.length-3; i+=3,j+=4) {
			res[j  ]=this.uint8Alphabet[ U8arr[i  ]>>2 & 0b111111               ]
			res[j+1]=this.uint8Alphabet[(U8arr[i  ]<<4 & 0b110000)|U8arr[i+1]>>4]
			res[j+2]=this.uint8Alphabet[(U8arr[i+1]<<2 & 0b111100)|U8arr[i+2]>>6]
			res[j+3]=this.uint8Alphabet[ U8arr[i+2]    & 0b111111               ];
		}
		
		switch (U8arr.length%3) {
			//case 0:                                         break;
			case 1: 
				res[j  ]=this.uint8Alphabet[U8arr[i  ]>>2 & 0b111111]
				res[j+1]=this.uint8Alphabet[U8arr[i  ]<<4 & 0b110000]
				res[j+2] = res[j+3] = this.uint8Padding; 
				break;
			case 2:
				res[j  ]=this.uint8Alphabet[ U8arr[i  ]>>2 & 0b111111                            ]
				res[j+1]=this.uint8Alphabet[(U8arr[i  ]<<4 & 0b110000)|(U8arr[i+1]>>4 & 0b001111)]
				res[j+2]=this.uint8Alphabet[ U8arr[i+1]<<2 & 0b111100                            ]
				res[j+3]=this.uint8Padding; 
				break;
		}

		return new TextDecoder().decode(res)
	}

	// uint array, ++ operators, uint array to string, safe
	static Uint8ToBase64v3(U8arr) {
		const res = new Uint8Array(Math.ceil(U8arr.length/3)*4)
		for (var i=0,j=0; i<=U8arr.length-3;) {
			res[j++]=this.uint8Alphabet[ U8arr[i  ]>>2 & 0b111111             ]
			res[j++]=this.uint8Alphabet[(U8arr[i++]<<4 & 0b110000)|U8arr[i]>>4]
			res[j++]=this.uint8Alphabet[(U8arr[i++]<<2 & 0b111100)|U8arr[i]>>6]
			res[j++]=this.uint8Alphabet[ U8arr[i++]    & 0b111111             ]
		}
		
		switch (U8arr.length%3) {
			//case 0:                                         break;
			case 1: 
				res[j  ]=this.uint8Alphabet[U8arr[i  ]>>2 & 0b111111]
				res[j+1]=this.uint8Alphabet[U8arr[i  ]<<4 & 0b110000]
				res[j+2] = res[j+3] = this.uint8Padding; 
				break;
			case 2:
				res[j  ]=this.uint8Alphabet[ U8arr[i  ]>>2 & 0b111111                            ]
				res[j+1]=this.uint8Alphabet[(U8arr[i  ]<<4 & 0b110000)|(U8arr[i+1]>>4 & 0b001111)]
				res[j+2]=this.uint8Alphabet[ U8arr[i+1]<<2 & 0b111100                            ]
				res[j+3]=this.uint8Padding; 
				break;
		}

		return new TextDecoder().decode(res)
	}

	// static Uint8ToBase64v1(U8arr) {
	// 	let res = ''
	// 	for (var i=0; i<=U8arr.length-3; i+=3) {
	// 		res+=this.alphabet.charAt( U8arr[i  ]>>2 & 0b111111                            )
	// 		    +this.alphabet.charAt((U8arr[i  ]<<4 & 0b110000)|(U8arr[i+1]>>4 & 0b001111))
	// 		    +this.alphabet.charAt((U8arr[i+1]<<2 & 0b111100)|(U8arr[i+2]>>6 & 0b000011))
	// 		    +this.alphabet.charAt( U8arr[i+2]    & 0b111111                            );
	// 	}
		
	// 	switch (U8arr.length%3) {
	// 		case 0: break;
	// 		case 1: 
	// 			res+=this.alphabet.charAt(U8arr[i]>>2 & 0b111111)
	// 			    +this.alphabet.charAt(U8arr[i]<<4 & 0b110000)
	// 			    +this.padding
	// 			    +this.padding;
	// 			break;
	// 		case 2:
	// 			res+=this.alphabet.charAt( U8arr[i  ]>>2 & 0b111111                            )
	// 			    +this.alphabet.charAt((U8arr[i  ]<<4 & 0b110000)|(U8arr[i+1]>>4 & 0b001111))
	// 			    +this.alphabet.charAt( U8arr[i+1]<<2 & 0b111100                            )
	// 			    +this.padding;
	// 			break;
	// 	}

	// 	return res
	// }


	static Base64ToUint8(base64) {
		for (var base64LenNoPadding = base64.length; base64[base64LenNoPadding-1] === this.padding && base64LenNoPadding>0; base64LenNoPadding--) {}
		// const paddingLen = base64.length - base64LenNoPadding;
		// // console.log(base64LenNoPadding,paddingLen)
		const Uint8 = new Uint8Array(Math.floor(base64LenNoPadding/4*3))

		for (var i=0,j=0; i<base64.length; i+=4,j+=3) {
			Uint8[j  ]=this.reverseAlphabet[base64[i  ]]<<2 | this.reverseAlphabet[base64[i+1]]>>4;
			Uint8[j+1]=this.reverseAlphabet[base64[i+1]]<<4 | this.reverseAlphabet[base64[i+2]]>>2;
			Uint8[j+2]=this.reverseAlphabet[base64[i+2]]<<6 | this.reverseAlphabet[base64[i+3]];
		}

		return Uint8
	}
}