let audio = new Audio("erro.mp3");

function randint(min, max) {
	return Math.round(Math.random() * (max - min)) + min;
}

function shake_arr(arr) {
	for (i in arr) {
		let a = arr[i];
		let b_i = randint(0, arr.length - 1);
		arr[i] = arr[b_i];
		arr[b_i] = a;
	}
	return arr;
}

let go = {
	all: {
		res: {
			set_0: ['↔', '↕', '↭', '↹', '⇄', '⇅', '⇆', '⇔', '⇕', '⇳', '⇵', '⇹', '⇼', '⇿'],
			disable: ['↮', '⇎'],
			error: ['↩', '↪', '↶', '↺', '↻', '↷', '↫', '↬', '↼', '↽', '⇀', '⇁', '↿', '⇃', '↾', '⇂', '⇋', '⇌', '⇪', '⇬', '⇭']
		}
	},
	top: {
		res: {
			set_1: ['↑', '⇡', '⇧'],
			set_2: ['↟', '⇈', '⇑', '⇮']
		}
	},
	bottom: {
		res: {
			set_1: ['↓', '↯', '⇣', '⇩'],
			set_2: ['↡', '⇊', '⇓']
		}
	},
	right: {
		res: {
			set_1: ['↝', '→', '⇝', '⇢', '⇨', '⇸', '⇾'],
			set_2: ['↠', '↣', '⇉', '⇒', '⇻'],
			set_3: ['⇛', '⇶'],
			disable: ['↛', '⇏', '⇴']
		}
	},
	left: {
		res: {
			set_1: ['←', '↜', '⇜', '⇦', '⇷', '⇺', '⇽'],
			set_2: ['↞', '↢', '⇇', '⇐'],
			set_3: ['⇚'],
			disable: ['↚', '⇍']
		}
	}
}

function get_go_value(go) {
	let go_result = {};
	for (i in go) {
		go_result[i] = {};
		if (go[i].res.set_1 != undefined) {
			for (i of go[i].res.set_1) {}
		}
	}
}

let buttons = [];

function button_style(el,checked) {
	audio.pause();
	audio.currentTime = 0;
	audio.play();
	if (checked) {
		el.style.background = '#7ce092';
	} else {
		el.style.background = 'none'
	}
}


for (i in go) {
	go[i].res_checked = {};
	for (j in go[i].res) {
		go[i].res_checked[j] = []
		for (k in go[i].res[j]) {
			go[i].res_checked[j].push(false);
			let temp_path = `go['`+i+`'].res_checked['`+j+`']['`+k+`']`;
			buttons.push('<div onclick="'+temp_path+' = !'+temp_path+'; button_style(this,'+temp_path+')">'+go[i].res[j][k]+'</div>');
		}
	}
}

buttons = shake_arr(buttons);

let temp_str = '';

for (i of buttons) {
	temp_str += i;
}

temp_str += '<div class="get_result"></div>'


document.getElementById('buttons').innerHTML += temp_str;