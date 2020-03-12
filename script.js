let person_name = 'XXX';
let person_surname = 'XXX';
let person_gender = true; //false - female; true - male
let person_date = 'XXXX-XX-XX';

let p_light_bg = true;


let vowel_str = 'default';
let v_light_bg = true;

let carpet_str = 'default/default/default';
let c_light_bg = true;

const leters1 = ['A','E','I','O','U','Y','А','Е','Є','И','І','Ї','О','У','Ю','Я'];
const leters2 = ['B','C','D','F','G','H','J','K','L','M','N','P','Q','R','S','T','V','W','Z','Б','В','Г','Ґ','Д','Ж','З','Й','К','Л','М','Н','П','Р','С','Т','Ф','X','Ц','Ч','Ш','Щ'];

class PERSON {
  constructor(name,surname,gender,date) 
  {
    this.Pname = name;
    this.Psurname = surname;
    this.Pgender = gender;
    this.Pdate = date;
  }
}


function isCodeComplete(code) {
	return code.length === 3
}

function calc_code(name,surname,gender,date)
{
	name = name.toUpperCase();
	surname = surname.toUpperCase();
	const months = {'01':"A",'02':"B",'03':"C",'04':"D",'05':"E",'06':"H",'07':"L",'08':"M",'09':"P",'10':"R",'11':"S",'12':"T",'XX':"XX"};
	let code = '';
	let temp_text = '';

	for (let i of surname) 
		for (let j of leters2)
			if (i == j)
			{
				temp_text+=i;
				console.log('temp = ',temp_text );
				if (temp_text.length == 3)
					code=temp_text;
			}
	console.log('=приголосні додані=');
	if (code == '')
		for (let i of surname)
			for (let j of leters1)
				if (i == j)
				{
					temp_text+=i;
					console.log('temp = ',temp_text );
					if (temp_text.length == 3)
						code=temp_text;
				}
	console.log('=голосні додані=');
	if (code == '')
	{
		for (let i = 0; i <= 3-temp_text.length; i++)
		{
			temp_text += 'X';
			console.log('temp = ',temp_text );
		}
		code=temp_text;
	}
	console.log('=прізвище оброблено=');
	temp_text = '';

	for (let i of name)
		for (let j of leters2)
			if (i == j)
			{
				temp_text+=i;
				console.log('temp = ',temp_text );
			}
	if (temp_text.length >= 3)
		code+=temp_text[0] + temp_text[temp_text.length-2] + temp_text[temp_text.length-1];

	console.log('=приголосні додані=');
	if (code.length == 3)
		for (let i of name)
			for (let j of leters1)
				if (i == j)
				{
					temp_text+=i;
					console.log('temp = ',temp_text );
					if (temp_text.length == 3)
						code+=temp_text;
				}
	console.log('=голосні додані=');
	if (code.length == 3)
	{
		for (let i = 0; i <= 3-temp_text.length; i++)
		{
			temp_text += 'X';
			console.log('temp = ',temp_text );
		}
		code+=temp_text;
	}
	console.log('=ім\'я оброблено=');
	console.log(date.substring(5,7));
	

	code+=date.substring(2,4)+months[date.substring(5,7)];

	if (gender)
		code+=date[8];
	else
		code+=parseInt(date[8])+4;
	code+=date[9];
	return code;
}

function print_person_code()
{
	let person_text = '';
	if (p_light_bg)
	{
		person_text+='<div class="p_hist_row0">';
		p_light_bg = false;
	}
	else
	{
		person_text+='<div class="p_hist_row1">';
		p_light_bg = true;
	}
	
	person_text+='<div>'+person_name+'</div>';
	person_text+='<div>'+person_surname+'</div>';
	if (person_gender)
		person_text+='<div>чоловік</div>';
	else
		person_text+='<div>жінка</div>';
	person_text+='<div>'+person_date+'</div>';
	person_text+='<div>'+calc_code(person_name,person_surname,person_gender,person_date)+'</div>';
	person_text+='</div>';

	document.getElementById("person_output").innerHTML += person_text;
}

function nearest_vowel(str)
{
	str = str.toUpperCase();
	let arr = [];
	let pos = 0;
	let vowel = false;
	for (let i = 0; i < str.length ; i++) 
	{	
		if (!vowel)
			arr.push(str.length);
		else
		{	
			pos++;
			arr.push(pos);
		}
		console.log(str,arr)
		for (let j of leters1)
		{
			if (str[i] == j)
			{
				pos = 0;
				arr[i]=pos;
				vowel = true;
			}

		}
	}
	console.log(str,arr,'======')
	vowel = false;

	for (let i = str.length-1; i >= 0 ; i--) 
	{	
		if (vowel)
		{	
			pos++;
			if (arr[i] > pos)
				arr[i] = pos;
			console.log(str,arr)
		}
		for (let j of leters1)
		{
			if (str[i] == j)
			{
				pos = 0;
				vowel = true;
			}

		}
	}
	console.log(str,arr,'======')
	if (arr[Math.round(arr.length/2)] != str.length)
		return arr;
	else
		return 'no vowel';
}

function print_neraest_vowel()
{
	let vowel_text = '';
	if (v_light_bg)
	{
		vowel_text+='<div class="v_hist_row0">';
		v_light_bg = false;
	}
	else
	{
		vowel_text+='<div class="v_hist_row1">';
		v_light_bg = true;
	}
	
	vowel_text+='<div>'+vowel_str+'</div>';
	vowel_text+='<div>'+nearest_vowel(vowel_str)+'</div>';
	vowel_text+='</div>';

	document.getElementById("vowel_output").innerHTML += vowel_text;
}

function cheack_carpet(arr)
{
	hor = true;
	ver = true;

	for (let i = 0; i < arr.length; i++)
	{
		for (let j = 0; j < arr[i].length; j++)
		{
			if (ver && arr[i][j] != arr[i][arr[i].length - 1 - j])
				ver = false;

			if (hor && arr[i][j] != arr[arr.length - 1 - i][j])
				hor = false;
		}
	}
	console.log('hor = ',hor,' ver = ',ver);

	let output = '';

	switch(hor + 2*ver)
	{
		case 0: output = 'imperfect'; break;
		case 1: output = 'horizontally symmetric'; break;
		case 2: output = 'vertically symetric'; break;
		case 3: output = 'perfect'; break;
		default: output = 'невідома помилка'; break;
	}

	return output;
}

function print_carpet()
{
	let carpet_text = '';
	if (c_light_bg)
	{
		carpet_text+='<div class="c_hist_row0">';
		c_light_bg = false;
	}
	else
	{
		carpet_text+='<div class="c_hist_row1">';
		c_light_bg = true;
	}
	
	carpet_text+='<div>'+carpet_str+'</div>';
	carpet_text+='<div>'+cheack_carpet(carpet_str.split('/'))+'</div>';
	carpet_text+='</div>';
	document.getElementById("carpet_output").innerHTML += carpet_text;
}