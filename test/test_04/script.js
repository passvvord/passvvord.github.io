let username = '';
let password = '';
const check_user = document.getElementById("user-data");
const the_button = document.getElementById("the_button");
const database = firebase.database();
const path = '/github/github_io/test_04_data/';
let now_path = '';

let local_counter = 0;


check_user.addEventListener('click', (e) => {
	e.preventDefault();

	if (username != '')
	{
		if (password != '')
		{

			now_path = path + username + '/' + password;
			console.log(now_path)









			database.ref(now_path).set({
				click_counter: 0
			});
		}
		else
		{
			console.log('nopassword')
		}
	}
	else
	{
		console.log('noname')
	}

});


the_button.addEventListener('click', (e) => {
	e.preventDefault();

	//click-count = ... + 1
	local_counter += 1;

	const new_data = {click_counter: local_counter};

	database.ref(now_path).update(new_data);


});