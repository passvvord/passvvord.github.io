document.body.onload = function() {
    var preloader = document.getElementById('preloader');
    var line = document.getElementById('l-line');
    console.log(preloader);
    console.log('the page is ready');

    line.style.animation = 'none';
    preloader.style.setProperty('--loading', '40vw');
    setTimeout(function() {
        preloader.style.opacity = 0;
        preloader.style.visibility = 'hidden';
    }, 200);
}


function calc_size(img)
{
	let img_pos = img.getBoundingClientRect();
	if (img_pos.height <= img_pos.width) {
		img.style.height = '100%';
		img.style.width = 'auto';
	}
	if (img_pos.height > img_pos.width) {
		img.style.height = 'auto';
		img.style.width = '100%';
	}
	
}