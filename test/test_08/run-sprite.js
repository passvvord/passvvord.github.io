//<run-sprite img="" frame_delay=""></run-sprite>
//підтримуються лише спрайти з квадратними кадрами 

let aviable_sprites = {};

class RunSprite extends HTMLElement {
	constructor() {
		super();

		if (this.hasAttribute('img') && this.hasAttribute('frame_delay')) {

			let sprite_src = this.getAttribute('img');
			let css_var_name = this.getAttribute('img').replace(/[/._:;=()]/g,'-');

			let is_new = true;

			for (let i in aviable_sprites) {
				if (i == sprite_src) {
					is_new = false;
					break;
				}
			}

			if (is_new) {
				aviable_sprites[sprite_src] = {};
				aviable_sprites[sprite_src].delay = this.getAttribute('frame_delay');
				aviable_sprites[sprite_src].bg_x_pos = 0;
				// aviable_sprites[sprite_src].bg_y_pos = 0;
				aviable_sprites[sprite_src].size = Math.round(this.getBoundingClientRect().height);
				document.documentElement.style.setProperty('--'+css_var_name+'-bg_x_pos',aviable_sprites[sprite_src].bg_x_pos + 'px');

				let element = this;

				let img = new Image();

				img.onload = function() {
					
					aviable_sprites[sprite_src].frames_count = Math.round(this.width/this.height);
					
					if (aviable_sprites[sprite_src].frames_count > 1) {

						let sprite_anim = setInterval( ()=> {
							if (aviable_sprites[sprite_src].bg_x_pos > -1*aviable_sprites[sprite_src].size*aviable_sprites[sprite_src].frames_count) {
								aviable_sprites[sprite_src].bg_x_pos += -1*aviable_sprites[sprite_src].size;
							} else {
								aviable_sprites[sprite_src].bg_x_pos = 0;
							}
							document.documentElement.style.setProperty('--'+css_var_name+'-bg_x_pos',aviable_sprites[sprite_src].bg_x_pos + 'px');			
						},aviable_sprites[sprite_src].delay)
					}
				}

				img.onerror = function() {
					element.style.backgroundImage = 'url(Error.gif)';
				}

				img.src = sprite_src;
			}

			this.style.backgroundImage = 'url('+sprite_src+')';
			this.style.height = aviable_sprites[sprite_src].size + 'px';
			this.style.width = aviable_sprites[sprite_src].size + 'px';
			this.style.imageRendering = 'pixelated';
			this.style.backgroundSize = 'cover';
			this.style.setProperty('background-position','var(--'+css_var_name+'-bg_x_pos) 0px');
		}
	}
}

customElements.define('run-sprite', RunSprite);

// function change_img(element,new_url,new_delay) {
// 	// clearInterval(sprite_anim);

// 	let img = new Image();

// 	img.onload = function() {
// 		element.shadowRoot.firstChild.style.backgroundImage = 'url('+new_url+')';
// 		frames_count = Math.round(this.width/this.height);
	
// 		if (frames_count > 1) {
// 			let bg_pos = 0;
		
// 			let sprite_anim = setInterval( ()=> {
// 				if (bg_pos > -1*one_farme_size*frames_count) {
// 					bg_pos+=-1*one_farme_size;
// 				} else {
// 					bg_pos = 0;
// 				}
		
// 				element.shadowRoot.firstChild.style.backgroundPosition = bg_pos + 'px 0px';			
// 			},new_delay)
// 		}
// 	}

// 	img.onerror = function() {
// 		element.shadowRoot.firstChild.style.backgroundImage = 'url(Error.gif)';
// 	}

// 	img.src = new_url;
// }