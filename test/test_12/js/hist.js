class HistForBigIntData { // class for big int data for example for Uint16Array(length: 134 217 728) 
	//element
	#element;
	#canvas;
	#ctx;

	#dataMin;
	#dataMax;
	#cutDataByMin;
	#cutDataByMax;
	#fullHisto;
	#currentHisto;
	#parts;

	#col='#fff';

	constructor(element,data,dataMin,dataMax,parts = 15,col = '#fff') {
		// console.log(element,min,max,parts,element.getBoundingClientRect())
		this.#element = element;
		this.#canvas = document.createElement('canvas');
		// console.log(this.#element,element)
		this.#element.appendChild(this.#canvas);
		let tempsize = element.getBoundingClientRect();
		if (tempsize.width == 0 || tempsize.height == 0) {
			throw `histogram init error: width(${tempsize.width}) or height(${tempsize.height}) of object is 0`;
			// alert(`histogram init error: width(${tempsize.width}) or height(${tempsize.height}) of object is 0`);		
		}
		this.#canvas.width = tempsize.width;
		this.#canvas.height = tempsize.height;
		this.#ctx = this.#canvas.getContext('2d');

		console.log('start to calc fullHisto');
		const temp = Date.now();
		this.#dataMin = dataMin;
		this.#dataMax = dataMax;
		this.#fullHisto = this.#calcFullHisto(data,dataMin,dataMax);
		// console.log(this.#fullHisto)
		console.log('fullHisto succesfully calced, need time:',Date.now()-temp);
		// console.log( this.#fullHisto.reduce((a,b)=>a+b) , data.length)
		// console.log( this.#fullHisto.reduce((a,b)=>a+(b==0?1:0),0))
		this.update(parts,dataMin,dataMax,col)
	}

	update(parts=this.#parts,min=this.#cutDataByMin,max=this.#cutDataByMax,col=this.#col) {
		this.#parts = parts;
		this.#cutDataByMin = min;
		this.#cutDataByMax = max;
		this.#col = col;
		// const temp = Date.now()
		this.#currentHisto = this.#calcCurrentHisto(this.#fullHisto,parts,min,max);
		// console.log(Date.now()-temp)
		// console.log( this.#currentHisto.count.reduce((a,b)=>a+b) )
		this.#draw(this.#currentHisto)
	}

	#calcFullHisto(data,dataMin,dataMax) {
		let fullHisto = new BigUint64Array(dataMax-dataMin+1);
		for (let i = 0; i < data.length; i+=1) {
			fullHisto[data[i]-dataMin]+=1n;
		}
		return fullHisto
	}

	#calcCurrentHisto(fullHisto,parts,cutMin,cutMax,sameWidth = false) {
		let CurrentHisto = {
			min: cutMin,
			parts: parts,
			max: cutMax,
			count: new BigUint64Array(parts)
		}

		if (cutMax - cutMin > 1) {
			if (sameWidth === true) {
				const step = Math.round( (cutMax-cutMin)/parts )
				for (let i = 0; i < parts; i+=1) {
					for (let j = i*step+cutMin; j < (i+1)*step+cutMin; j+=1) {
						if (j < cutMax) {
							CurrentHisto.count[i]+=fullHisto[j-this.#dataMin];
						} else {
							break;
						}
					}
				}			
			} else {
				const temp = (cutMax-cutMin)*0.00001;
				const tcutMin = (cutMin-temp);
				const tcutDelta = (cutMax+temp)-tcutMin;
				for (let i = cutMin; i <= cutMax; i+=1) {
					CurrentHisto.count[Math.floor( (i-tcutMin)/tcutDelta*parts )]+=fullHisto[i-this.#dataMin];
				}					
			}
		} else {
			throw `too small region or max (${cutMax}) value is smaller than min (${cutMin})`
			// alert(`too small region or max (${cutMax}) value is smaller than min (${cutMin})`)
		}

		return CurrentHisto
	}

	#draw(currentHisto) {
		const pd = 15;
		const sps = 2;
		const lnw = 2;
		const fsize = 11;

		this.#ctx.clearRect(0,0,this.#canvas.width,this.#canvas.height);
		this.#ctx.fillStyle = this.#col;
		this.#ctx.strokeStyle = this.#col;
		this.#ctx.lineWidth = lnw;
		this.#ctx.textAlign = 'center';
		this.#ctx.textBaseline = 'top';
		this.#ctx.font = fsize + 'px Arial';

		const barZoneWidth = this.#canvas.width - 2*pd;
		const barZoneHeight = this.#canvas.height - 1*pd - 5*sps - 1*fsize;
		const barMax = Number(currentHisto.count.reduce((a,b)=>(b>a?b:a)));

		const tempText = `max count: ${barMax}`
		const tempTextWidth = this.#ctx.measureText(tempText).width

		this.#ctx.fillRect(
			this.#canvas.width/2-tempTextWidth/2-pd,
			pd-lnw,
			tempTextWidth+pd*2,
			lnw
		);

		this.#ctx.fillText(
			tempText,
			this.#canvas.width/2,
			0
		);

		this.#ctx.fillRect(
			0,
			pd+barZoneHeight,
			this.#canvas.width,
			lnw
		);

		let tpos = -10;
		for (let i = 0; i < currentHisto.parts; i+=1) {
			this.#ctx.strokeRect(
				pd+(barZoneWidth/currentHisto.parts)*i,
				pd+barZoneHeight-barZoneHeight*(Number(currentHisto.count[i])/barMax),
				(barZoneWidth/currentHisto.parts),
				barZoneHeight*(Number(currentHisto.count[i])/barMax)
			);
			this.#ctx.fillRect(
				pd+(barZoneWidth/currentHisto.parts)*i,
				pd+barZoneHeight,
				lnw,
				sps*2
			);
			const ttext = Math.round(currentHisto.min+i*(currentHisto.max-currentHisto.min)/currentHisto.parts)
			const mstext = this.#ctx.measureText(ttext).width/2
			if (tpos < pd+(barZoneWidth/currentHisto.parts)*i-mstext-sps) {
				this.#ctx.fillRect(
					pd+(barZoneWidth/currentHisto.parts)*i,
					pd+barZoneHeight,
					lnw,
					sps*4
				);
				this.#ctx.fillText(
					ttext,
					pd+(barZoneWidth/currentHisto.parts)*i,
					pd+barZoneHeight+sps*5
				);
				tpos = pd+(barZoneWidth/currentHisto.parts)*i+mstext;
			}
		}

		if (tpos < pd+barZoneWidth-this.#ctx.measureText(currentHisto.max).width/2-sps) {
			this.#ctx.fillRect(
				pd+barZoneWidth,
				pd+barZoneHeight,
				lnw,
				sps*4
			);
			this.#ctx.fillText(
				currentHisto.max,
				pd+barZoneWidth,
				pd+barZoneHeight+sps*5
			);
		}

	}

}