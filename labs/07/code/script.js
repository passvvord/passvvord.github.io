let avatars = ["angel.svg","bag-on-head.svg","bionic-eye.svg","boy.svg","boy-1.svg","boy-2.svg","boy-3.svg","boy-4.svg","boy-5.svg","boy-6.svg","boy-7.svg","cat-mask.svg","dracula.svg","frankestein-monster.svg","girl.svg","girl-1.svg","girl-2.svg","girl-3.svg","girl-4.svg","girl-5.svg","girl-6.svg","girl-7.svg","girl-8.svg","girl-9.svg","girl-10.svg","girl-11.svg","girl-12.svg","girl-13.svg","girl-14.svg","girl-with-cat-ears.svg","hanibal-lecter.svg","man.svg","man-1.svg","man-2.svg","man-3.svg","man-4.svg","man-5.svg","man-6.svg","man-7.svg","man-8.svg","mujer.svg","mujer-1.svg","ninja.svg","nun.svg","pirate.svg","superheroe.svg","walter-white.svg","woman.svg","woman-1.svg","woman-2.svg"];
let name = 'userg';
let text = `Мню несметных ини прошедший Наполнить Отч увы чту тех соединюся незаконно испускают. Погибли Соломон мудрецы дождями чувство. Проводит доверься умиленье порочные. Владыку ею превыше ль до пастыри надобно не их надейся Ум по желаньи. Песчинка Ту радушным их Им возглашу легионам ни На судьбины. Другой благим уныние милует. Ключом верный мерить козней.`;
let count_likes = 345;


function print_avatars_in(id) {
	let element = document.getElementById(id);
	let element_str = "";
	for (let i of avatars) {
		element_str += `<div class="comment-div">`
		+ `<div class="img-div"><img src="avatars/`+i+`"></div>`
		+ `<div class="text-block">`
		+ `<div class="name">`+name+`</div>`
		+ `<div class="text">`+text+`</div>`
		+ `<div class="likes">❤ `+count_likes+`</div>`
		+ `</div>`
		+ `</div>`;
	}
	element.innerHTML += element_str;
}


print_avatars_in('comments');