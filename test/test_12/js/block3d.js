class DicomBlock3D {
	#element;
	#block3d;

	#pixels; //big 1d array
	#X; // uint
	#Y; // uint
	#Z; // uint
	#max;
	#min;

	#vecRot;
	#rot3D; //radians

	#zoom;

	get max() {return this.#max}
	get min() {return this.#min}

	#vecMult = (A,B)=>[A[1]*B[2]-A[2]*B[1],A[2]*B[0]-A[0]*B[2],A[0]*B[1]-A[1]*B[0]];
	#scaVecMult = (A,B)=>A[0]*B[0]+A[1]*B[1]+A[2]*B[2];
	#vecLen = (A)=>Math.sqrt(A[0]*A[0]+A[1]*A[1]+A[2]*A[2]);
	#vecOnScalMult = (A,b)=>A.map(a=>a*b);
	#vecAdd3 = (A,B,C)=>[A[0]+B[0]+C[0],A[1]+B[1]+C[1],A[2]+B[2]+C[2]];

	#oneVec = (A)=>A.map(a=>a/this.#vecLen(A));
	#vecProecLen = (A,B)=>this.#scaVecMult(A,B)/this.#vecLen(B);
	#vecProec = (A,B)=>this.#vecOnScalMult(B,this.#scaVecMult(A,B)/this.#vecLen(B));

	#rotateVecAroundAnother(O,A,angle) {
		O = oneVec(O);
		const OAoneVecMult = this.#oneVec(this.#vecMult(O,A));
		// console.log(OAoneVecMult);
		const OA_OoneVecMult = this.#oneVec(this.#vecMult(OAoneVecMult,O));
		// console.log(OA_OoneVecMult);
		const OxProectA = this.#vecOnScalMult(OA_OoneVecMult,this.#scaVecMult(A,OA_OoneVecMult));
		// console.log(OxProectA);
		const OyProectA = this.#vecOnScalMult(OAoneVecMult,this.#vecLen(OxProectA));
		// console.log(OyProectA);
		const OzProectA = this.#vecOnScalMult(O,this.#scaVecMult(A,O));
		// console.log(OzProectA);
		return this.#vecAdd3(this.#vecOnScalMult(OxProectA,Math.cos(angle)),this.#vecOnScalMult(OyProectA,Math.sin(angle)),OzProectA);
	}

	#initLayer(Block3D,data,axName,layerTransform,A,B,C) {
		for (let a = 0; a < A; a+=1) {
			let canv = document.createElement('canvas');
			canv.id = axName+a;
			canv.className = axName+'layer';
			canv.width = B;
			canv.height = C;
			canv.style.transform = layerTransform(A,a);
			Block3D.appendChild(canv);
		}
	}

	#upgradeLayer(Block3D,data,axName,A,B,C,min,delta,ColArray) {
		let posf;
		if (axName === 'X') {
			posf = (x,z,y,X,Z,Y)=>(x+y*X+(Z-z)*X*Y);
		} else if (axName === 'Y') {
			posf = (y,x,z,Y,X,Z)=>(x+(Y-y)*X+z*X*Y);
		} else if (axName === 'Z') {
			posf = (z,x,y,Z,X,Y)=>(x+y*X+z*X*Y);
		}
		
		for (let a = 0; a < A; a+=1) {
			let ctx = document.getElementById(axName+a).getContext("2d");
			let pixels = new Uint8ClampedArray(B*C*4);
			for (let c = 0; c < C; c++) {
				for (let b = 0; b < B; b++) {
					const temp = Math.round( (data[posf(a,b,c,A,B,C)]-min)/delta*255 )
					for (let col = 0; col < 4; col+=1) {
						pixels[(c*B+b)*4+col] = ColArray[temp*4+col];
					}
				}
			}
			ctx.putImageData(new ImageData(pixels,B,C), 0, 0);
		}
	}

	#init() {
		this.#initLayer(this.#block3d,this.#pixels,'X',(A,a)=>`rotateY(-90deg) translateZ(${Math.floor(A/2-a)}px)`,this.#X,this.#Z,this.#Y)
		this.#initLayer(this.#block3d,this.#pixels,'Y',(A,a)=>`rotateX(-90deg) translateZ(${Math.floor(A/2-a)}px)`,this.#Y,this.#X,this.#Z)
		this.#initLayer(this.#block3d,this.#pixels,'Z',(A,a)=>`translateZ(${Math.floor(A/2-a)}px)`                ,this.#Z,this.#X,this.#Y)
	}

	constructor(element,data,x,y,z) {
		this.#element = element;
		this.#block3d = this.#element.getElementById("block3d");
		this.#pixels = data;
		this.#X = x;
		this.#Y = y;
		this.#Z = z;
		this.#min = this.#pixels.reduce((a,b)=>(b<a?b:a));
		this.#max = this.#pixels.reduce((a,b)=>(b>a?b:a));

		this.#block3d.width  = this.X;
		this.#block3d.height = this.Y;
		this.#init();
	}

	update(ColArray) {
		this.#upgradeLayer(this.#block3d,this.#pixels,'X',this.#X,this.#Z,this.#Y,this.#min,this.#max-this.#min,ColArray)
		this.#upgradeLayer(this.#block3d,this.#pixels,'Y',this.#Y,this.#X,this.#Z,this.#min,this.#max-this.#min,ColArray)
		this.#upgradeLayer(this.#block3d,this.#pixels,'Z',this.#Z,this.#X,this.#Y,this.#min,this.#max-this.#min,ColArray)
	}
}