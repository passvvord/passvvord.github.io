let username = '';
let password = '';
const check_user = document.getElementById("user-data");
const the_button = document.getElementById("the_button");
const database = firebase.database();
const path = '/github/github_io/test_04_data/';
let now_path = '';


check_user.addEventListener('click', (e) => {
	e.preventDefault();

	if (username != '')
	{
		if (password != '')
		{


			//console.log(database.ref('/github/github_io/test_04_data/').val().child(username).exists())
			database.ref(path).orderByKey().on('value', snapshot => {
				
				if (snapshot.val()[username]['password'])
					console.log('it is real')
				else
					console.log('oh fuck here we go again')



				console.log(snapshot.val()[username]['password']);

				let temp = '';
				console.log(temp);
				temp = snapshot.val()[username]['password'];
				console.log(temp);


				if (temp == password)
				{
					console.log('password is true')
				}
				else if (temp != password)
				{
					console.log('password is incorrect')
				}
				else 
				{
					console.log('there is no user like this')
				}
			});



			// now_path = path + username;
			// console.log(now_path)



			// database.ref(now_path).set({
			// 	password: password,
			// 	click_counter: 0
			// });
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


// the_button.addEventListener('click', (e) => {
// 	e.preventDefault();

// 	//click-count = ... + 1
// 	counter =  1;

// 	const new_data = {click_counter: local_counter};

// 	database.ref(now_path).update(new_data);

// });

database.ref('/').orderByKey().on('value', snapshot => {
	console.log(snapshot.val());
});
