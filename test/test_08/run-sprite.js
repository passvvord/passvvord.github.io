//<run-sprite img="" frame_delay=""></run-sprite>
//підтримуються лише спрайти з квадратними кадрами
//js не завершено бо виникло припущення що адекватне відображення сотень спрайтів і джаваскріпт це не поєднувані речі


let aviable_sprites = {};

class RunSprite extends HTMLElement {
	constructor() {
		super();
		if (this.hasAttribute('img') && this.hasAttribute('frame_delay')) {
			set_sprite(this,this.getAttribute('img'),this.getAttribute('frame_delay'));
			//set_sprite_unsafe(this);
		}
	}
}
customElements.define('run-sprite', RunSprite);

function set_sprite(element, new_url, new_delay) {
	//if (element.hasAttribute('img') && element.hasAttribute('frame_delay') && !Number.isNaN(element.getAttribute('frame_delay')) ) {
	//	if (element.getAttribute('img') != new_url || element.getAttribute('frame_delay') != new_delay || element.getAttribute('new') == 'true') {

	//		element.setAttribute('new','false');

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
				console.log('create obj')
				aviable_sprites[var_name] = {};
				aviable_sprites[var_name].src = new_url;
				aviable_sprites[var_name].this_sprites_count = 0;
				aviable_sprites[var_name].delay = new_delay;
				aviable_sprites[var_name].bg_x_pos = 0;
				aviable_sprites[var_name].size = Math.round(element.getBoundingClientRect().height);
				
				let img = new Image();

				img.onload = function() {

					aviable_sprites[var_name].frames_count = Math.round(this.width / this.height);

					if (aviable_sprites[var_name].frames_count > 1 && aviable_sprites[var_name].delay != 0) {

						aviable_sprites[var_name].setInterval_id = var_name;
						console.log('set interval')
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

				// img.onerror = function() {
				// 	element.style.backgroundImage = 'url(Error.gif)';
				// }

				img.src = aviable_sprites[var_name].src;
			}

			aviable_sprites[var_name].this_sprites_count += 1;

			// if (var_name != old_var_name) {
			// 	aviable_sprites[old_var_name].this_sprites_count -= 1;
			// 	if (aviable_sprites[old_var_name].this_sprites_count == 0) {
			// 	 	clearInterval(window[aviable_sprites[old_var_name].setInterval_id]);
			// 	 	window[aviable_sprites[old_var_name].setInterval_id] = null;
			// 	// 	delete aviable_sprites[old_var_name];
			// 	}
			// }

			console.log('use data')
			element.style.height = aviable_sprites[var_name].size + 'px';
			element.style.width = aviable_sprites[var_name].size + 'px';
			element.style.imageRendering = 'pixelated';
			element.style.backgroundSize = 'cover';
			element.style.setProperty('background-position', 'var(--' + var_name + '-bg_x_pos) 0px');
		
			//console.log(element,new_url,new_delay,aviable_sprites[var_name]);
		//}
	//}
}

function set_sprite_unsafe(element) {

	let url = element.getAttribute('img');
	let delay = parseInt(element.getAttribute('frame_delay'));

	let var_name = 'var_'+url.replace(/[/.:;=()]/g, '_')+'_'+delay;

	let is_new = true;

	for (let i in aviable_sprites) {
		if (i == var_name) {
			is_new = false;
			break;
		}
	}

	if (is_new) {
		console.log('f set_sprite : create obj ');
		aviable_sprites[var_name] = {};
		aviable_sprites[var_name].this_sprites_count = 0;
		aviable_sprites[var_name].src = url;
		aviable_sprites[var_name].working_link = false;
		aviable_sprites[var_name].delay = delay;
				
		let img = new Image();

		img.onload = function() {

			aviable_sprites[var_name].working_link = true;

			aviable_sprites[var_name].bg_x_pos = 0;
			aviable_sprites[var_name].size = Math.round(element.getBoundingClientRect().height);

			aviable_sprites[var_name].frames_count = Math.round(this.width / this.height);

			if (aviable_sprites[var_name].frames_count > 1 && aviable_sprites[var_name].delay != 0) {
				console.log('f set_sprite : create interval for obj ');

				aviable_sprites[var_name].setInterval_id = var_name;

				window[aviable_sprites[var_name].setInterval_id] = setInterval(() => {
					if (aviable_sprites[var_name].bg_x_pos > -1 * aviable_sprites[var_name].size * aviable_sprites[var_name].frames_count) {
						aviable_sprites[var_name].bg_x_pos += -1 * aviable_sprites[var_name].size;
					} else {
						aviable_sprites[var_name].bg_x_pos = 0;
					}
					document.documentElement.style.setProperty('--' + var_name + '-bg_x_pos', aviable_sprites[var_name].bg_x_pos + 'px');
				}, aviable_sprites[var_name].delay)
			}
		}

		img.src = aviable_sprites[var_name].src;
	}

	console.log('f set_sprite : use obj data ');

	aviable_sprites[var_name].this_sprites_count += 1;

	element.style.backgroundImage = 'url(' + url + ')';
	element.style.height = aviable_sprites[var_name].size + 'px';
	element.style.width = aviable_sprites[var_name].size + 'px';
	element.style.imageRendering = 'pixelated';
	element.style.backgroundSize = 'cover';
	element.style.setProperty('background-position', 'var(--' + var_name + '-bg_x_pos) 0px');
	
}

function update_sprite_unsafe(element, new_url, new_delay) {
	if (element.getAttribute('img') != new_url || element.getAttribute('frame_delay') != new_delay) {

		let old_url = element.getAttribute('img');
		let old_var_name = 'var_'+old_url.replace(/[/.:;=()]/g, '_')+'_'+element.getAttribute('frame_delay');
		element.setAttribute('img',new_url);
		element.setAttribute('frame_delay',new_delay);

		let var_name = 'var_'+new_url.replace(/[/.:;=()]/g, '_')+'_'+new_delay;

		let is_new = true;

		for (let i in aviable_sprites) {
			if (i == var_name) {
				is_new = false;
				break;
			}
		}

		if (is_new) {
			aviable_sprites[var_name] = {};
			aviable_sprites[var_name].this_sprites_count = 0;
			aviable_sprites[var_name].src = new_url;
			aviable_sprites[var_name].working_link = false;
			aviable_sprites[var_name].delay = new_delay;
			console.log(old_url,new_url,var_name);
			if (old_url != new_url) {
				element.style.backgroundImage = 'url(' + new_url + ')';

				let img = new Image();

				img.onload = function() {

					aviable_sprites[var_name].working_link = true;

					aviable_sprites[var_name].bg_x_pos = 0;
					aviable_sprites[var_name].size = Math.round(element.getBoundingClientRect().height);

					aviable_sprites[var_name].frames_count = Math.round(this.width / this.height);

					if (aviable_sprites[var_name].frames_count > 1 && aviable_sprites[var_name].delay != 0) {

						aviable_sprites[var_name].setInterval_id = var_name;

						window[aviable_sprites[var_name].setInterval_id] = setInterval(() => {
							if (aviable_sprites[var_name].bg_x_pos > -1 * aviable_sprites[var_name].size * aviable_sprites[var_name].frames_count) {
								aviable_sprites[var_name].bg_x_pos += -1 * aviable_sprites[var_name].size;
							} else {
								aviable_sprites[var_name].bg_x_pos = 0;
							}
							document.documentElement.style.setProperty('--' + var_name + '-bg_x_pos', aviable_sprites[var_name].bg_x_pos + 'px');
						}, aviable_sprites[var_name].delay)
					}
				}

				img.src = aviable_sprites[var_name].src;
			} else  {
				aviable_sprites[var_name].bg_x_pos = aviable_sprites[old_var_name].bg_x_pos;
				aviable_sprites[var_name].size = aviable_sprites[old_var_name].size;
				aviable_sprites[var_name].frames_count = aviable_sprites[old_var_name].frames_count;
				aviable_sprites[var_name].setInterval_id = var_name;				

				window[aviable_sprites[var_name].setInterval_id] = setInterval(() => {
					if (aviable_sprites[var_name].bg_x_pos > -1 * aviable_sprites[var_name].size * aviable_sprites[var_name].frames_count) {
						aviable_sprites[var_name].bg_x_pos += -1 * aviable_sprites[var_name].size;
					} else {
						aviable_sprites[var_name].bg_x_pos = 0;
					}
					document.documentElement.style.setProperty('--' + var_name + '-bg_x_pos', aviable_sprites[var_name].bg_x_pos + 'px');
				}, aviable_sprites[var_name].delay)
			}
		}

		aviable_sprites[var_name].this_sprites_count += 1;
		if (aviable_sprites[var_name].this_sprites_count == 1) {
			if (aviable_sprites[var_name].frames_count > 1 && aviable_sprites[var_name].delay != 0) {
				window[aviable_sprites[var_name].setInterval_id] = setInterval(() => {
					if (aviable_sprites[var_name].bg_x_pos > -1 * aviable_sprites[var_name].size * aviable_sprites[var_name].frames_count) {
						aviable_sprites[var_name].bg_x_pos += -1 * aviable_sprites[var_name].size;
					} else {
						aviable_sprites[var_name].bg_x_pos = 0;
					}
					document.documentElement.style.setProperty('--' + var_name + '-bg_x_pos', aviable_sprites[var_name].bg_x_pos + 'px');
				}, aviable_sprites[var_name].delay)
			}
		}

		aviable_sprites[old_var_name].this_sprites_count -= 1;
		if (aviable_sprites[old_var_name].this_sprites_count == 0) {
		 	clearInterval(window[aviable_sprites[old_var_name].setInterval_id]);
			// 	delete aviable_sprites[old_var_name];
		}


			element.style.height = aviable_sprites[var_name].size + 'px';
			element.style.width = aviable_sprites[var_name].size + 'px';
			element.style.imageRendering = 'pixelated';
			element.style.backgroundSize = 'cover';
			element.style.setProperty('background-position', 'var(--' + var_name + '-bg_x_pos) 0px');
		
			//console.log(element,new_url,new_delay,aviable_sprites[var_name]);

	}
}

function update_sprite_url_unsafe(element, new_url) {
	if (element.getAttribute('img') != new_url) {
		let delay = parseInt(element.getAttribute('frame_delay'));

		let old_url = element.getAttribute('img');
		let old_var_name = 'var_'+old_url.replace(/[/.:;=()]/g, '_')+'_'+delay;

		let var_name = 'var_'+new_url.replace(/[/.:;=()]/g, '_')+'_'+delay;
		
		element.setAttribute('img',new_url);

		let is_new = true;
		let url_is_new = true;
		let var_name_to_copy;

		for (let i in aviable_sprites) {

			if (aviable_sprites[i].src == new_url) {
				url_is_new = false;
				var_name_to_copy = i;
				break;
			}
		}

		if (!url_is_new) {
			for (let i in aviable_sprites) {
				if (i == var_name) {
					is_new = false;
					break;
				}
			}
		}

		if (url_is_new) {
			console.log('this is new url and no existing object, create : ',var_name);
			aviable_sprites[var_name] = {};
			aviable_sprites[var_name].this_sprites_count = 0;
			aviable_sprites[var_name].src = new_url;
			aviable_sprites[var_name].working_link = false;
			aviable_sprites[var_name].delay = delay;

			let img = new Image();

			img.onload = function() {
				aviable_sprites[var_name].working_link = true;
				aviable_sprites[var_name].bg_x_pos = 0;
				aviable_sprites[var_name].size = Math.round(element.getBoundingClientRect().height);
				aviable_sprites[var_name].frames_count = Math.round(this.width / this.height);

				if (aviable_sprites[var_name].frames_count > 1 && aviable_sprites[var_name].delay != 0) {
					aviable_sprites[var_name].setInterval_id = var_name;

					window[aviable_sprites[var_name].setInterval_id] = setInterval(() => {
						if (aviable_sprites[var_name].bg_x_pos > -1 * aviable_sprites[var_name].size * aviable_sprites[var_name].frames_count) {
							aviable_sprites[var_name].bg_x_pos += -1 * aviable_sprites[var_name].size;
						} else {
							aviable_sprites[var_name].bg_x_pos = 0;
						}
						document.documentElement.style.setProperty('--' + var_name + '-bg_x_pos', aviable_sprites[var_name].bg_x_pos + 'px');
					}, aviable_sprites[var_name].delay)
				}
			}
			img.src = aviable_sprites[var_name].src;	
		} else {
			if (is_new) {
				console.log('this is new url and there is existing object, create : ',var_name,' and copy some from',var_name_to_copy);
				aviable_sprites[var_name] = {};
				aviable_sprites[var_name].this_sprites_count = 0;
				aviable_sprites[var_name].src = new_url;
				aviable_sprites[var_name].working_link = aviable_sprites[var_name_to_copy].working_link;
				aviable_sprites[var_name].delay = delay;

				element.style.backgroundImage = 'url(' + new_url + ')';

				aviable_sprites[var_name].bg_x_pos = 0;
				aviable_sprites[var_name].size = aviable_sprites[var_name_to_copy].size;
				aviable_sprites[var_name].frames_count = aviable_sprites[var_name_to_copy].frames_count;
				aviable_sprites[var_name].setInterval_id = var_name;

			}
		}

		element.style.backgroundImage = 'url(' + new_url + ')';
		element.style.setProperty('background-position', 'var(--' + var_name + '-bg_x_pos) 0px');

		aviable_sprites[var_name].this_sprites_count += 1;
		if (aviable_sprites[var_name].this_sprites_count == 1) {
			if (aviable_sprites[var_name].frames_count > 1 && aviable_sprites[var_name].delay != 0) {
				window[aviable_sprites[var_name].setInterval_id] = setInterval(() => {
					if (aviable_sprites[var_name].bg_x_pos > -1 * aviable_sprites[var_name].size * aviable_sprites[var_name].frames_count) {
						aviable_sprites[var_name].bg_x_pos += -1 * aviable_sprites[var_name].size;
					} else {
						aviable_sprites[var_name].bg_x_pos = 0;
					}
					document.documentElement.style.setProperty('--' + var_name + '-bg_x_pos', aviable_sprites[var_name].bg_x_pos + 'px');
				}, aviable_sprites[var_name].delay)
			}
		}

		aviable_sprites[old_var_name].this_sprites_count -= 1;
		if (aviable_sprites[old_var_name].this_sprites_count == 0) {
		 	clearInterval(window[aviable_sprites[old_var_name].setInterval_id]);
			// 	delete aviable_sprites[old_var_name];
		}
	}
}