//<run-sprite img="" frame_delay=""></run-sprite>

class RunSprite extends HTMLElement {
	constructor() {
		super();
		let shadow = this.attachShadow({mode: 'open'});

		if (this.hasAttribute('img') && this.hasAttribute('frame_delay')) {

			let sprite_src = this.getAttribute('img');
			let frame_delay = this.getAttribute('frame_delay');
			let one_farme_size = Math.round(this.getBoundingClientRect().height)

			const imgbox = document.createElement('div');
			imgbox.style.height = one_farme_size + 'px';
			imgbox.style.width = one_farme_size + 'px';
			imgbox.style.imageRendering = 'pixelated';
			imgbox.style.backgroundSize = 'cover';
			imgbox.style.backgroundPosition = '0px 0px';
			
			let frames_count = 0;	

			let img = new Image();

			img.onload = function() {
				imgbox.style.backgroundImage = 'url('+sprite_src+')';
				frames_count = Math.round(this.width/this.height);
				
				if (frames_count > 1) {

					let bg_pos = 0;

					setInterval( ()=> {
						if (bg_pos > -1*one_farme_size*frames_count) {
							bg_pos+=-1*one_farme_size;
						} else {
							bg_pos = 0;
						}
						imgbox.style.backgroundPosition = bg_pos + 'px 0px';			
					},frame_delay)
				}
			}

			img.onerror = function() {
				imgbox.style.backgroundImage = 'url(Error.gif)';
			}

			img.src = sprite_src;

			shadow.appendChild(imgbox);
		}
	}
}

customElements.define('run-sprite', RunSprite);