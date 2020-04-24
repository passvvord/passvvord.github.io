let audio = new Audio("erro.mp3");
let win = new Audio("err_song.mp3");

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
			set_0: ['↔', '↕', '↭', '↹', '⇄', '⇅', '⇆', '⇔', '⇕', '⇳', '⇵', '⇹', '⇼', '⇿','↔', '↕', '↭', '↹', '⇄', '⇅', '⇆', '⇔', '⇕', '⇳', '⇵', '⇹', '⇼', '⇿','↔', '↕', '↭', '↹', '⇄', '⇅', '⇆', '⇔', '⇕', '⇳', '⇵', '⇹', '⇼', '⇿','↔', '↕', '↭', '↹', '⇄', '⇅', '⇆', '⇔', '⇕', '⇳', '⇵', '⇹', '⇼', '⇿'],
			disable: ['↮', '⇎'],
			error: ['↩', '↪', '↶', '↺', '↻', '↷', '↫', '↬', '↼', '↽', '⇀', '⇁', '↿', '⇃', '↾', '⇂', '⇋', '⇌', '⇪', '⇬', '⇭', '↪', '↶', '↺', '↻', '↷', '↫', '↬', '↼', '↽', '⇀', '⇁', '↿', '⇃', '↾', '⇂', '⇋', '⇌', '⇪', '⇬', '⇭', '↪', '↶', '↺', '↻', '↷', '↫', '↬', '↼', '↽', '⇀', '⇁', '↿', '⇃', '↾', '⇂', '⇋', '⇌', '⇪', '⇬', '⇭']
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
			set_3: ['⇛','⇛','⇶'],
			disable: ['↛', '⇏', '⇴']
		}
	},
	left: {
		res: {
			set_1: ['←', '↜', '⇜', '⇦', '⇷', '⇺', '⇽'],
			set_2: ['↞', '↢', '⇇', '⇐'],
			set_3: ['⇚','⇚','⇚'],
			disable: ['↚', '⇍']
		}
	}
}

function get_go_value(go) {
	let go_result = {};
	for (i in go) {
		go_result[i] = {};
		let val = 0;
		
		if (go[i].res.set_1 != undefined) {
			val += go[i].res_checked.set_1.reduce((a, b) => a + b, 0) * 1;
		}	

		if (go[i].res.set_2 != undefined) {
			val += go[i].res_checked.set_2.reduce((a, b) => a + b, 0) * 2;
		}		

		if (go[i].res.set_3 != undefined) {
			val += go[i].res_checked.set_3.reduce((a, b) => a + b, 0) * 3;
		}		

		if (go[i].res.disable != undefined) {
			if (go[i].res_checked.disable.reduce((a, b) => a + b, 0) > 0) {
				val = 0;
			}
		}

		go_result[i].val = val;

		if (go[i].res.error != undefined) {
			go_result[i].error = go[i].res_checked.error.reduce((a, b) => a + b, 0) > 0;
		}		
	}
	return go_result
}

function move_block() {
	now_go = get_go_value(go);
	let m_block = document.getElementById('moving');
	let t_block = document.getElementById('target');
	let block = document.getElementById('block');

	let m_pos = m_block.getBoundingClientRect();
	console.log(m_pos);
	let t_pos = t_block.getBoundingClientRect();
	console.log(t_pos);


	let x_move = (now_go.right.val - now_go.left.val) * (m_pos.height + m_pos.height/20);
	let y_move = (now_go.bottom.val - now_go.top.val) * (m_pos.height + m_pos.height/20);

	block.innerHTML = ' ';
	block.style.transitionDuration = '0s';
	block.style.left = m_pos.x + 'px';
	block.style.top = m_pos.y + 'px';
	block.style.height = m_pos.height + 'px';
	block.style.width = m_pos.width + 'px';
	block.style.background = '#f14a52';
	block.style.visibility = 'visible';
	block.style.transitionDuration = '3s';

	if ( Math.abs( (m_pos.x + x_move) - t_pos.x) < m_pos.height/2 && Math.abs( (m_pos.y + y_move) - t_pos.y) < m_pos.height/2) {
		setTimeout( () => {
			block.style.left = t_pos.x +'px';
			block.style.top = t_pos.y +'px';
		}, 1000)
		block.innerHTML = 'YOU WIN';
		console.log('You win')
		win.play();

		setTimeout( () => {
			block.style.transitionDuration = '0s';
			block.style.visibility = 'hidden';
			next();
		},30000)
	} else {
		setTimeout( () => {
			block.innerHTML = 'YOU LOSE';
			block.style.left = m_pos.x + x_move + 'px';
			block.style.top = m_pos.y + y_move + 'px';
		}, 1000)

		setTimeout( () => {
			block.style.transitionDuration = '0s';
			block.style.visibility = 'hidden';
			next();
		},5000)
	}




}


function button_style(el,checked) {
	audio.pause();
	audio.currentTime = 0;
	audio.play();
	if (checked) {
		el.style.background = '#f14a52'; //#f14a52  #7ce092
	} else {
		el.style.background = 'none'
	}
}


function next() {
	let buttons = [];
	
	for (i in go) {
		go[i].res_checked = {};
		for (j in go[i].res) {
			go[i].res_checked[j] = []
			for (k in go[i].res[j]) {
				go[i].res_checked[j].push(false);
				let temp_path = `go['`+i+`'].res_checked['`+j+`']['`+k+`']`;
				buttons.push('<div onclick=" if (allow_click > 0) {'+temp_path+' = !'+temp_path+'; button_style(this,'+temp_path+') }">'+go[i].res[j][k]+'</div>');
			}
		}
	}

	buttons.push('<div style="width: calc((4vh * 3) + (0.1vh * 4)) " onclick="move_block();">виконати</div>');
	buttons.push('<div style="width: calc((4vh * 2) + (0.1vh * 2)) ">"вам"</div>');
	buttons.push('<div style="width: calc((4vh * 3) + (0.1vh * 4)) ">"необхідно"</div>');
	buttons.push('<div style="width: calc((4vh * 3) + (0.1vh * 4)) ">"перемістити"</div>');
	buttons.push('<div style="width: calc((4vh * 2) + (0.1vh * 2)) " id="moving">"блок"</div>');
	buttons.push('<div style="width: calc((4vh * 1) + (0.1vh * 0)) ">"до"</div>');
	buttons.push('<div style="width: calc((4vh * 2) + (0.1vh * 2)) " id="target">"іншого"</div>');
	buttons.push('<div style="width: calc((4vh * 3) + (0.1vh * 4)) " onclick="button_style(this, true); ">зсунути (ні)</div>');
	buttons.push('<div style="width: calc((4vh * 6) + (0.1vh * 10)) " id="next_click" onclick="button_style(this, true); allow_click = 2;">&#160;виконати&#160;&#160;&#160;| натискання</div>');
	buttons.push('<div style="width: calc((4vh * 1) + (0.1vh * 0)) " onclick="button_style(this, true); ">ні</div>');
	buttons.push('<div style="width: calc((4vh * 2) + (0.1vh * 2)) " onclick="button_style(this, true); ">нічого</div>');
	buttons.push('<div style="width: calc((4vh * 1) + (0.1vh * 0)) " onclick="button_style(this, true); ">так</div>');
	buttons.push('<div style="width: calc((4vh * 2) + (0.1vh * 2)) " onclick="button_style(this, true); win.play(); ">злитися</div>');

	buttons = shake_arr(buttons);

	let temp_str = '';

	for (i of buttons) {
		temp_str += i;
	}

	document.getElementById('buttons').innerHTML = '';
	document.getElementById('buttons').innerHTML += temp_str;
}

let allow_click = 0;
next();

document.onclick = function() {
	allow_click -= 1;
	if (allow_click != 1) {
		button_style(document.getElementById('next_click'),false);
	}
}