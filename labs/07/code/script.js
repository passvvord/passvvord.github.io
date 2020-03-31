let avatars = ["angel.svg","bag-on-head.svg","bionic-eye.svg","boy.svg","boy-1.svg","boy-2.svg","boy-3.svg","boy-4.svg","boy-5.svg","boy-6.svg","boy-7.svg","cat-mask.svg","dracula.svg","frankestein-monster.svg","girl.svg","girl-1.svg","girl-2.svg","girl-3.svg","girl-4.svg","girl-5.svg","girl-6.svg","girl-7.svg","girl-8.svg","girl-9.svg","girl-10.svg","girl-11.svg","girl-12.svg","girl-13.svg","girl-14.svg","girl-with-cat-ears.svg","hanibal-lecter.svg","man.svg","man-1.svg","man-2.svg","man-3.svg","man-4.svg","man-5.svg","man-6.svg","man-7.svg","man-8.svg","mujer.svg","mujer-1.svg","ninja.svg","nun.svg","pirate.svg","superheroe.svg","walter-white.svg","woman.svg","woman-1.svg","woman-2.svg"];
let avatar = "DEFAULT.svg";
let us_name = 'heh';
let text = '';
let count_likes = 0;

const database = firebase.database();
const path = '/github/github_io/lab_07_data/';

function print_coment_in(id,avatar,name,text,like) {
	let element = document.getElementById(id);
	let element_str = "";
	
	element_str += `<div class="comment-div">`
	+ `<div class="img-div"><img src="avatars/`+avatar+`"></div>`
	+ `<div class="text-block">`
	+ `<div class="name">`+name+`</div>`
	+ `<div class="text">`+text+`</div>`
	+ `<div class="likes">❤ `+like+`</div>`
	+ `</div>`
	+ `</div>`;
	element.innerHTML += element_str;
}

function add_coment() {
	var today = new Date();
	var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
	var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

	database.ref(path+us_name).set({
		avatar: avatar,
		name: us_name,
		comment: text,
		likes: count_likes,
		date: date,
		time: time
	});

}




database.ref(path).orderByKey().on('value', snapshot => {

	console.log(snapshot.hasChild('004'));
	console.log(snapshot.val());

	document.getElementById('comments').innerHTML = '';
	for (let i in snapshot.val()) {
		// console.log(snapshot.val()[i])
		print_coment_in('comments'
			,snapshot.val()[i]['avatar']
			,snapshot.val()[i]['name']
			,snapshot.val()[i]['comment']
			,snapshot.val()[i]['likes']);
	}
});


