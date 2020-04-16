//<run-sprite img="" frame_delay=""></run-sprite>
//підтримуються лише спрайти з квадратними кадрами 

let aviable_sprites = {};

class RunSprite extends HTMLElement {
	constructor() {
		super();
		if (this.hasAttribute('img') && this.hasAttribute('frame_delay')) {
			set_sprite(this,this.getAttribute('img'),this.getAttribute('frame_delay'));
		}
	}
}
customElements.define('run-sprite', RunSprite);

function set_sprite(element, new_url, new_delay) {
	if (element.hasAttribute('img') && element.hasAttribute('frame_delay') && !Number.isNaN(element.getAttribute('frame_delay')) ) {
		if (element.getAttribute('img') != new_url || element.getAttribute('frame_delay') != new_delay || element.getAttribute('new') == 'true') {

			element.setAttribute('new','false');

			let old_src = element.getAttribute('img');
			let old_var_name = 'var_'+old_src.replace(/[/.:;=()]/g, '_')+'_'+element.getAttribute('frame_delay');
			element.setAttribute('img',new_url);
			element.setAttribute('frame_delay',new_delay);

			let var_name = 'var_'+new_url.replace(/[/.:;=()]/g, '_')+'_'+new_delay;

			element.style.backgroundImage = 'url(' + new_url + ')';

			let is_new = true;

			for (let i in aviable_sprites) {
				if (i == var_name) {
					is_new = false;
					break;
				}
			}

			if (is_new) {
				aviable_sprites[var_name] = {};
				aviable_sprites[var_name].src = new_url;
				aviable_sprites[var_name].this_sprites_count = 0;
				aviable_sprites[var_name].delay = new_delay;
				aviable_sprites[var_name].bg_x_pos = 0;
				// aviable_sprites[var_name].bg_y_pos = 0;
				// if (element.hasAttribute('size')) {
				// 	aviable_sprites[var_name].size = element.getAttribute('size');	
				// } else {
					aviable_sprites[var_name].size = Math.round(element.getBoundingClientRect().height);
				// }

				let img = new Image();

				img.onload = function() {

					aviable_sprites[var_name].frames_count = Math.round(this.width / this.height);

					if (aviable_sprites[var_name].frames_count > 1 && aviable_sprites[var_name].delay != 0) {

						aviable_sprites[var_name].setInterval_id = var_name;

						window[var_name] = setInterval(() => {
							if (aviable_sprites[var_name].bg_x_pos > -1 * aviable_sprites[var_name].size * aviable_sprites[var_name].frames_count) {
								aviable_sprites[var_name].bg_x_pos += -1 * aviable_sprites[var_name].size;
							} else {
								aviable_sprites[var_name].bg_x_pos = 0;
							}
							document.documentElement.style.setProperty('--' + var_name + '-bg_x_pos', aviable_sprites[var_name].bg_x_pos + 'px');
						}, aviable_sprites[var_name].delay)
					}
				}

				img.onerror = function() {
					element.style.backgroundImage = 'url(Error.gif)';
				}

				img.src = aviable_sprites[var_name].src;
			}

			aviable_sprites[var_name].this_sprites_count += 1;

			if (var_name != old_var_name) {
				aviable_sprites[old_var_name].this_sprites_count -= 1;
				if (aviable_sprites[old_var_name].this_sprites_count == 0) {
					clearInterval(window[aviable_sprites[old_var_name].setInterval_id]);
					delete aviable_sprites[old_var_name];
				}
			}

			element.style.height = aviable_sprites[var_name].size + 'px';
			element.style.width = aviable_sprites[var_name].size + 'px';
			element.style.imageRendering = 'pixelated';
			element.style.backgroundSize = 'cover';
			element.style.setProperty('background-position', 'var(--' + var_name + '-bg_x_pos) 0px');
		
			//console.log(element,new_url,new_delay,aviable_sprites[var_name]);
		}
	}
}