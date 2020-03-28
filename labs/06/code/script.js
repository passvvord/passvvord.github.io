document.body.onload = function() {
    var preloader = document.getElementById('preloader');
    var line = document.getElementById('l-line');
    console.log(preloader);
    console.log('the page is ready');

    setTimeout(function() {
        preloader.style.opacity = 0;
        preloader.style.visibility = 'hidden';
    }, 200);
}