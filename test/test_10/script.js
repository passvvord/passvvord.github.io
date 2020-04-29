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
			set_0: ['↔', '↕', '↭', '↹', '⇄', '⇅', '⇆', '⇔', '⇕', '⇳', '⇵', '⇹', '⇼', '⇿'],
			disable: ['↮', '⇎'],
			error: ['↩', '↪', '↶', '↺', '↻', '↷', '↫', '↬', '↼', '↽', '⇀', '⇁', '↿', '⇃', '↾', '⇂', '⇋', '⇌', '⇪', '⇬', '⇭', '↪', '↶', '↺', '↻', '↷', '↫', '↬', '↼', '↽', '⇀', '⇁', '↿', '⇃', '↾', '⇂', '⇋', '⇌', '⇪', '⇬', '⇭', '↪', '↶', '↺', '↻', '↷', '↫', '↬', '↼', '↽', '⇀', '⇁', '↿', '⇃', '↾', '⇂', '⇋', '⇌', '⇪', '⇬', '⇭']
		}
	},
	top: {
		res: {
			set_1: ['↑', '⇡', '⇧','↑', '⇡','⇧','↑', '⇡', '⇧'],
			set_2: ['↟', '⇈', '⇑', '⇮','↟','⇈', '⇑', '⇮']
		}
	},
	bottom: {
		res: {
			set_1: ['↓', '↯', '⇣', '⇩','↓', '↯', '⇣', '⇩'],
			set_2: ['↡', '⇊', '⇓','↡', '⇊', '⇓']
		}
	},
	right: {
		res: {
			set_1: ['↝', '→', '⇝', '⇢', '⇨', '⇸', '⇾','↝', '→', '⇝', '⇢', '⇨', '⇸', '⇾'],
			set_2: ['↠', '↣', '⇉', '⇒', '⇻'],
			set_3: ['⇛','⇛','⇶'],
			disable: ['↛', '⇏', '⇴']
		}
	},
	left: {
		res: {
			set_1: ['←', '↜', '⇜', '⇦', '⇷', '⇺', '⇽','←', '↜', '⇜', '⇦', '⇷', '⇺', '⇽'],
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
	return go_result;
}

function move_block() {
	fullscreen_alert(document.getElementById('alert_el'),'',true);
	now_go = get_go_value(go);
	let m_block = document.getElementById('moving');
	let t_block = document.getElementById('target');
	let block = document.getElementById('block');

	let m_pos = m_block.getBoundingClientRect();
	let t_pos = t_block.getBoundingClientRect();

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
	setTimeout( () => {
		block.style.transitionDuration = '3s';
	}, 100)


	if ( Math.abs( (m_pos.x + x_move) - t_pos.x) < m_pos.height/2 && Math.abs( (m_pos.y + y_move) - t_pos.y) < m_pos.height/2 && now_go.all.error == false) {
		setTimeout( () => {
			block.style.left = t_pos.x +'px';
			block.style.top = t_pos.y +'px';
		}, 1000)
		block.innerHTML = 'YOU WIN';
		console.log('YOU WIN')
		win.play();

		setTimeout( () => {
			block.style.transitionDuration = '0s';
			block.style.visibility = 'hidden';
			next();
			fullscreen_alert(document.getElementById('alert_el'),'',false);
		},35000)
	} else {
		setTimeout( () => {
			block.innerHTML = 'YOU LOSE';
			console.log('YOU LOSE')
			block.style.left = m_pos.x + x_move + 'px';
			block.style.top = m_pos.y + y_move + 'px';
		}, 1000)

		setTimeout( () => {
			block.style.transitionDuration = '0s';
			block.style.visibility = 'hidden';
			next();
			fullscreen_alert(document.getElementById('alert_el'),'',false);
		},5000)
	}
}

function fullscreen_alert(bg_el,text,show) {
	bg_el.innerHTML = ' ' + text;

	if (show) {
		bg_el.style.visibility = 'visible';
	} else {
		bg_el.style.visibility = 'hidden';
	}
}


function button_style(el,checked) {
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
				if (i == 'all' && j == 'error') {
					buttons.push('<div onclick="next();">'+go[i].res[j][k]+'</div>');
				} else {
					buttons.push('<div onclick=" if (allow_click > 0) {'+temp_path+' = !'+temp_path+'; button_style(this,'+temp_path+') }">'+go[i].res[j][k]+'</div>');
				}
			}
		}
	}

	buttons.push('<div style="width: calc((4vh * 3) + (0.1vh * 4)) " onclick="move_block();">виконати</div>');
	buttons.push('<div style="width: calc((4vh * 2) + (0.1vh * 2)) " onclick="next();">"вам"</div>');
	buttons.push('<div style="width: calc((4vh * 3) + (0.1vh * 4)) " onclick="next();">"необхідно"</div>');
	buttons.push('<div style="width: calc((4vh * 3) + (0.1vh * 4)) " onclick="next();">"перемістити"</div>');

	buttons.push('<div style="width: calc((4vh * 2) + (0.1vh * 2)) " onclick="next();" id="moving">"блок"</div>');

	buttons.push('<div style="width: calc((4vh * 1) + (0.1vh * 0)) " onclick="next();">"до"</div>');

	buttons.push('<div style="width: calc((4vh * 2) + (0.1vh * 2)) " onclick="next();" id="target">"іншого"</div>');

	buttons.push('<div style="width: calc((4vh * 3) + (0.1vh * 4)) " onclick="next();" >зсунути (ні)</div>');
	buttons.push('<div style="width: calc((4vh * 6) + (0.1vh * 10)) " id="next_click" onclick="button_style(this, true); allow_click = 2;">&#160;виконати&#160;&#160;&#160;| натискання</div>');
	buttons.push('<div style="width: calc((4vh * 1) + (0.1vh * 0)) " onclick="next();" >ні</div>');
	buttons.push('<div style="width: calc((4vh * 2) + (0.1vh * 2)) " onclick="next();" >нічого</div>');
	buttons.push('<div style="width: calc((4vh * 1) + (0.1vh * 0)) " onclick="next();" >так</div>');
	buttons.push('<div style="width: calc((4vh * 2) + (0.1vh * 2)) " onclick="next();" >злитися</div>');
	buttons.push('<div style="width: calc((4vh * 4) + (0.1vh * 8)) " onclick="next();" >натисни мене</div>');

	buttons = shake_arr(buttons);

	buttons.push('<div id="description_text" onclick="next();">мета: виграти</div>');
	buttons.push('<div id="description_text" onclick="next();">якщо все ще но зрозуміли що тут робити то читайте далі</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">тут є різні стрілки з різним переміщенням (0,1,2,3) також є помилкові стрілки</div>');
	buttons.push('<div id="description_text" onclick="next();">стрілки що призведуть до помилки (доведеться робити все заново): ↩, ↪, ↶, ↺, ↻, ↷, ↫, ↬, ↼, ↽, ⇀, ⇁, ↿, ⇃, ↾, ⇂, ⇋, ⇌, ⇪, ⇬, ⇭</div>');
	buttons.push('<div id="description_text" onclick="next();">крок вверх на один: ↑, ⇡, ⇧</div>');
	buttons.push('<div id="description_text" onclick="next();">крок вверх на два: ↟, ⇈, ⇑, ⇮ </div>');
	buttons.push('<div id="description_text" onclick="next();">крок вниз на один: ↓, ↯, ⇣, ⇩</div>');
	buttons.push('<div id="description_text" onclick="next();">крок вниз на два: ↡, ⇊, ⇓</div>');
	buttons.push('<div id="description_text" onclick="next();">крок вправо на один: ↝, →, ⇝, ⇢, ⇨, ⇸, ⇾</div>');
	buttons.push('<div id="description_text" onclick="next();">крок вправо на два: ↠, ↣, ⇉, ⇒, ⇻</div>');
	buttons.push('<div id="description_text" onclick="next();">крок вправо на три: ⇛,⇶</div>');
	buttons.push('<div id="description_text" onclick="next();">вимкнути крок вправо: ↛, ⇏, ⇴</div>');
	buttons.push('<div id="description_text" onclick="next();">крок вліво на один: ←, ↜, ⇜, ⇦, ⇷, ⇺, ⇽</div>');
	buttons.push('<div id="description_text" onclick="next();">крок вліво на два: ↞, ↢, ⇇, ⇐</div>');
	buttons.push('<div id="description_text" onclick="next();">крок вліво на три: ⇚</div>');
	buttons.push('<div id="description_text" onclick="next();">вимкнути крок вліво: ↚, ⇍</div>');
	buttons.push('<div id="description_text" onclick="next();">вимкнути переміщення: ↮, ⇎</div>');
	buttons.push('<div id="description_text" onclick="next();">переміщення на нуль: ↔, ↕, ↭, ↹, ⇄, ⇅, ⇆, ⇔, ⇕, ⇳, ⇵, ⇹, ⇼, ⇿</div>');
	buttons.push('<div id="description_text" onclick="next();">для того щоб використовувати дію натискання шукайте відповіну кнопку</div>');
	buttons.push('<div id="description_text" onclick="next();">для того щоб виконати обране шукайте відповіну кнопку</div>');
	buttons.push('<div id="description_text" onclick="next();">інші кнопки помилкові не натискайте їх</div>');
	buttons.push('<div id="description_text" onclick="next();">якщо все ще но зрозуміли що тут робити то читайте далі</div>');
	buttons.push('<div id="description_text" onclick="next();">підказка 1 : спробуйте скласти речення з слів в подвійних лапках які знаходяться на початку сторінки</div>');
	buttons.push('<div id="description_text" onclick="next();">якщо все ще но зрозуміли що тут робити то читайте далі</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">ще нижче</div>');
	buttons.push('<div id="description_text" onclick="next();">вам просто треба виграти і для цього виконуйте наступні дії</div>');
	buttons.push('<div id="description_text" onclick="next();">1. знайдіть "блок" і "іншого" серед стрілок згори</div>');
	buttons.push('<div id="description_text" onclick="next();">2. порахуйте на скільки блоків необхідно зсунути "блок" щоб він повністю наклався на "іншого"</div>');
	buttons.push('<div id="description_text" onclick="next();">маю надію з пунктом 2 ви впорались тоді переходимо до запису дій які виконає "блок"</div>');
	buttons.push('<div id="description_text" onclick="next();">3. натисніть " виконати | натискання "</div>');
	buttons.push('<div id="description_text" onclick="next();">4. оберіть стрілку напрям і клькість кроків якої буде вам підходити для часткового або повного виконання виконання даних з пункту 2</div>');
	buttons.push('<div id="description_text" onclick="next();">5. повторіть пункти 3 і 4 поки не виберете всі необхідні стрілки для такого самого зміщення яке ви розрахували в пункті 2 </div>');
	buttons.push('<div id="description_text" onclick="next();">примітка списки стрілок і відповідних їм кроків наведені вище</div>');
	buttons.push('<div id="description_text" onclick="next();">6. натисніть на "виконати"</div>');


	// console.log(buttons)

	let temp_str = '';

	for (i of buttons) {
		temp_str += i;
	}

	// console.log(temp_str)
	// document.getElementById('buttons').innerHTML = '';
	document.getElementById('buttons').innerHTML = temp_str;
}

let allow_click = 0;
next();

document.getElementById('buttons').onclick = function() {
	audio.pause();
	audio.currentTime = 0;
	audio.play();
	allow_click -= 1;
	if (allow_click != 1) {
		button_style(document.getElementById('next_click'),false);
	}
}