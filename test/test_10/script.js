let audio = new Audio("erro_cut.mp3");

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
	val: 0,
	disable: false,
	error: false,
	res: {
		set_0: ['↔', '↕', '↭', '↹', '⇄', '⇅', '⇆', '⇔', '⇕', '⇳', '⇵', '⇹', '⇼', '⇿'],
		disable: ['↮', '⇎'],
		error: ['↩', '↪', '↶', '↺', '↻', '↷', '↫', '↬', '↼', '↽', '⇀', '⇁', '↿', '⇃', '↾', '⇂', '⇋', '⇌', '⇪', '⇬', '⇭']
	},
	top: {
		disable: false,
		res: {
			set_1: ['↑', '⇡', '⇧'],
			set_2: ['↟', '⇈', '⇑', '⇮']
		}
	},
	bottom: {
		disable: false,
		res: {
			set_1: ['↓', '↯', '⇣', '⇩'],
			set_2: ['↡', '⇊', '⇓']
		}
	},
	right: {
		disable: false,
		res: {
			set_1: ['↝', '→', '⇝', '⇢', '⇨', '⇸', '⇾'],
			set_2: ['↠', '↣', '⇉', '⇒', '⇻'],
			set_3: ['⇛', '⇶'],
			disable: ['↛', '⇏', '⇴']
		}
	},
	left: {
		disable: false,
		res: {
			set_1: ['←', '↜', '⇜', '⇦', '⇷', '⇺', '⇽'],
			set_2: ['↞', '↢', '⇇', '⇐'],
			set_3: ['⇚'],
			disable: ['↚', '⇍']
		}
	}
}

let buttons = [];

function button_style(el,checked) {
	audio.play();
	if (checked) {
		el.style.background = '#7ce092';
	} else {
		el.style.background = 'none'
	}
}

go.res_checked = {}
go.res_checked.set_0 = []
for (i in go.res.set_0) {
	go.res_checked.set_0.push(false);
	buttons.push('<div onclick="go.res_checked.set_0['+i+'] = !go.res_checked.set_0['+i+']; button_style(this,go.res_checked.set_0['+i+'])">'+go.res.set_0[i]+'</div>');
}

go.res_checked.disable = []
for (i in go.res.disable) {
	go.res_checked.disable.push(false);
	buttons.push('<div onclick="go.res_checked.disable['+i+'] = !go.res_checked.disable['+i+']; button_style(this,go.res_checked.disable['+i+'])">'+go.res.disable[i]+'</div>');
}




buttons = shake_arr(buttons);

let temp_str = '';

for (i of buttons) {
	temp_str += i;
}


document.getElementsByTagName('body')[0].innerHTML += temp_str;