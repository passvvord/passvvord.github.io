class Base64 {
	static alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'; //defined in RFC 4648
	static padding  = '=';                                                                //defined in RFC 4648
	static reverseAlphabet = Object.fromEntries(this.alphabet.split('').map((a,i)=>[a,i]));
	static uint8Alphabet = new TextEncoder().encode(this.alphabet);
	static uint8Padding = new TextEncoder().encode(this.padding)[0]

	static Uint8ToBase64(U8arr) {
		const res = new Uint8Array(Math.ceil(U8arr.length/3)*4)
		for (var i=0,j=0; i<=U8arr.length-3; i+=3,j+=4) {
			res[j  ] = this.uint8Alphabet[                           U8arr[i  ]>>2]
			res[j+1] = this.uint8Alphabet[(U8arr[i  ]<<4 & 0b110000)|U8arr[i+1]>>4]
			res[j+2] = this.uint8Alphabet[(U8arr[i+1]<<2 & 0b111100)|U8arr[i+2]>>6]
			res[j+3] = this.uint8Alphabet[ U8arr[i+2]    & 0b111111               ]
		}
		
		switch (U8arr.length%3) {
			//case 0: break;
			case 1: 
				res[j  ] = this.uint8Alphabet[U8arr[i  ]>>2           ]
				res[j+1] = this.uint8Alphabet[U8arr[i  ]<<4 & 0b110000]
				res[j+2] = res[j+3] = this.uint8Padding; 
				break;
			case 2:
				res[j  ] = this.uint8Alphabet[                           U8arr[i  ]>>2]
				res[j+1] = this.uint8Alphabet[(U8arr[i  ]<<4 & 0b110000)|U8arr[i+1]>>4]
				res[j+2] = this.uint8Alphabet[ U8arr[i+1]<<2 & 0b111100               ]
				res[j+3] = this.uint8Padding;
				break;
		}

		return new TextDecoder().decode(res)
	}

	static Base64ToUint8(base64) {
		for (var base64LenNoPadding = base64.length; base64[base64LenNoPadding-1] === this.padding && base64LenNoPadding > base64.length-2; base64LenNoPadding--) {}
		const Uint8 = new Uint8Array(Math.floor(base64LenNoPadding/4*3))

		for (var i=0,j=0; i<base64.length; i+=4,j+=3) {
			Uint8[j  ] = this.reverseAlphabet[base64[i  ]]<<2 | this.reverseAlphabet[base64[i+1]]>>4;
			Uint8[j+1] = this.reverseAlphabet[base64[i+1]]<<4 | this.reverseAlphabet[base64[i+2]]>>2;
			Uint8[j+2] = this.reverseAlphabet[base64[i+2]]<<6 | this.reverseAlphabet[base64[i+3]];
		}

		return Uint8
	}
}

function getTestMethods() {
	return {
		Uint8ToBase64: {
			 equal(a,b) {return a === b} // for result
			,data: [
				{
					 in: new Uint8Array(256).map((a,i)=>i)
					,out: 'AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w=='
					,name: 'Uint8Array( [0...255] ) -> Base64'
				},{ 
					 in: Uint8Array.of(108, 105, 103, 104, 116, 32, 119, 111, 114, 107, 46) // == new TextEncoder().encode('light work.')
					,out: 'bGlnaHQgd29yay4='
					,name: `'light work.' as Uint8 array -> Base64`
				},{
					// https://en.wikipedia.org/wiki/Base64#Output_padding
					 in: new TextEncoder().encode('light work.')
					,out: 'bGlnaHQgd29yay4='
					,name: `'light work.' encoded to Uint8 -> Base64`
				},{
					 in: new TextEncoder().encode('light work')
					,out: 'bGlnaHQgd29yaw=='
					,name: `'light work' encoded to Uint8 -> Base64`
				},{
					 in: new TextEncoder().encode('light wor')
					,out: 'bGlnaHQgd29y'
					,name: `'light wor' encoded to Uint8 -> Base64`
				},{
					 in: new TextEncoder().encode('light wo')
					,out: 'bGlnaHQgd28='
					,name: `'light wo' encoded to Uint8 -> Base64`
				},{
					 in: new TextEncoder().encode('light w')
					,out: 'bGlnaHQgdw=='
					,name: `'light w' encoded to Uint8 -> Base64`
				}
			]
		}
		,get Base64ToUint8() {
			delete this.Base64ToUint8
			const data = this.Uint8ToBase64.data.map(a=>({
				 in: a.out
				,out: a.in
				,name: a.name.split('->').map((a,i,A)=>A[A.length-1-i]).join(' -> ')
			}) )
			this.Base64ToUint8 = {
				 equal(A,B) { return A.reduce((ac,a,i)=> ac && a === B[i] ,true) }
				,data: data
			}
			return this.Base64ToUint8
		}
	}
}

function test() {
	const testData = getTestMethods();

	let i = 0;
	for (let key in testData) {
		for (let test of testData[key].data) {
			const resultIsEqualToExpectedResult = testData[key].equal( Base64[key](test.in) , test.out)
			console.log(
				( resultIsEqualToExpectedResult ? '\x1b[48;2;0;255;0m\x1b[38;2;0;0;0m OK ' : '\x1b[48;2;255;60;60m\x1b[38;2;0;0;0mFAIL' )
				,'test'  , i++
				,'method:', key
				,'name:', test.name
			)
		}		
	}

}

export { Base64, test }