let avatars = ["avatars/angel.svg","avatars/bag-on-head.svg","avatars/bionic-eye.svg","avatars/boy.svg","avatars/boy-1.svg","avatars/boy-2.svg","avatars/boy-3.svg","avatars/boy-4.svg","avatars/boy-5.svg","avatars/boy-6.svg","avatars/boy-7.svg","avatars/cat-mask.svg","avatars/dracula.svg","avatars/frankestein-monster.svg","avatars/girl.svg","avatars/girl-1.svg","avatars/girl-2.svg","avatars/girl-3.svg","avatars/girl-4.svg","avatars/girl-5.svg","avatars/girl-6.svg","avatars/girl-7.svg","avatars/girl-8.svg","avatars/girl-9.svg","avatars/girl-10.svg","avatars/girl-11.svg","avatars/girl-12.svg","avatars/girl-13.svg","avatars/girl-14.svg","avatars/girl-with-cat-ears.svg","avatars/hanibal-lecter.svg","avatars/man.svg","avatars/man-1.svg","avatars/man-2.svg","avatars/man-3.svg","avatars/man-4.svg","avatars/man-5.svg","avatars/man-6.svg","avatars/man-7.svg","avatars/man-8.svg","avatars/mujer.svg","avatars/mujer-1.svg","avatars/ninja.svg","avatars/nun.svg","avatars/pirate.svg","avatars/superheroe.svg","avatars/walter-white.svg","avatars/woman.svg","avatars/woman-1.svg","avatars/woman-2.svg"];
let avatar = "avatars/ADMIN.svg";
let us_name = '';
let text = '';
let count_likes = 0;
let name_create = 0;

const database = firebase.database();
const path = '/github/github_io/lab_07_data/';

function print_coment_in(id,avatar,name,text,like,path_name) {
	let element = document.getElementById(id);
	let element_str = "";
	
	element_str += `<div class="comment-div">`
	+ `<div class="img-div"><img src="`+avatar+`"></div>`
	+ `<div class="text-block">`
	+ `<div class="name">`+name+`</div>`
	+ `<div class="text">`+text+`</div>`
	+ `<div class="likes" onclick="like_up(`+ path_name +`)">❤ `+like+`</div>`
	+ `</div>`
	+ `</div>`;
	element.innerHTML += element_str;
}

function add_coment() {
	var today = new Date();
	var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
	var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();



	database.ref(path+name_create).set({
		avatar: avatar,
		name: us_name,
		comment: text,
		likes: count_likes,
		date: date,
		time: time,
		display_w: document.documentElement.clientWidth,
		display_h: document.documentElement.clientHeight
	});
}

function like_up(path_name) {
	let now_likes = 0;
database.ref(path + path_name).once("value", function(snapshot) {
	console.log('now_likes = ',snapshot.val().likes);
	now_likes = parseInt(snapshot.val().likes) + 1;
	});
database.ref(path + path_name).update({likes: now_likes});
}

// function print_avatars_in(id) {
// 	let element = document.getElementById(id);
// 	let element_str = "";
// 	for (let i of avatars) {
// 		element_str += `<div class="comment-div">`
// 		+ `<div class="img-div"><img src="avatars/`+i+`"></div>`
// 		+ `<div class="text-block">`
// 		+ `<div class="name">`+name+`</div>`
// 		+ `<div class="text">`+text+`</div>`
// 		+ `<div class="likes">❤ `+count_likes+`</div>`
// 		+ `</div>`
// 		+ `</div>`;
// 	}
// 	element.innerHTML += element_str;
// }

database.ref(path).orderByKey().on('value', snapshot => {

	console.log(snapshot.hasChild('004'));
	console.log(snapshot.val());

	document.getElementById('comments').innerHTML = '';
	name_create = 0;


	for (let i in snapshot.val()) {
		// console.log("i = ",i);
		if (name_create <= i) { name_create = parseInt(i) + 1;}

		print_coment_in('comments'
			,snapshot.val()[i]['avatar']
			,snapshot.val()[i]['name']
			,snapshot.val()[i]['comment']
			,snapshot.val()[i]['likes']
			,i);
	}	
});


