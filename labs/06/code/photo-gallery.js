class PhotoGallery extends HTMLElement {
    constructor() {
        super();
        var shadow = this.attachShadow({mode: 'open'});

        // ################## adding photos ##################

        let img_res = [];
        if (this.hasAttribute('list')) {
            img_res = this.getAttribute('list').split(';');
        } else {console.log("there is no attribute img_list");}

        let html_str = '';

        html_str+= '<style type="text/css">'+

        ' .img-block { '+
        ' display: flex; '+
        ' flex-direction: row; '+
        ' flex-wrap: wrap; '+
        ' } '+

        ' .img-block>div { '+
        ' height: 20vh; '+
        ' width: fit-content; '+
        ' margin: 1vh; '+
        ' } '+

        ' img { '+
        ' height: 100%; '+
        ' border-radius: 1vh; '+
        ' } '+

        ' @media (max-width: 100vh) { '+
        ' .img-block>div { '+
        ' height: auto; '+
        ' width: 98vw; '+
        ' margin: 1vw; '+
        ' } '+

        ' img { '+
        ' height: auto; '+
        ' width: 100%; '+
        ' border-radius: 1vh; '+
        ' } '+
        ' } '+
        ' @keyframes div_full_scren {'+
        ' 0% {'+
        ' position: fixed;'+
        ' margin: 0px;'+
        ' padding: 0px;'+
        ' top: var(--div-top);'+
        ' left: var(--div-left);'+
        ' height: var(--div-height);'+
        ' width: var(--div-width);'+
        ' background: rgba(0, 0, 0, 0);'+
        ' }'+

        ' 100% {'+
        ' position: fixed;'+
        ' margin: 0px;'+
        ' padding: 0px;'+
        ' top: 0px;'+
        ' left: 0px;'+
        ' height: 100vh;'+
        ' width: 100vw;'+
        ' background: rgba(0, 0, 0, 0.5);'+
        ' }'+
        ' }'+

        ' @keyframes img_full_scren {'+
        ' 0% {'+
        ' margin-top: 0px;'+
        ' margin-left: 0px;'+
        ' height: var(--img-height);'+
        ' width: var(--img-width);'+
        ' }'+

        ' 100% {'+
        ' margin-top: calc(50vh - var(--img-after-height)/2);'+
        ' margin-left: calc(50vw - var(--img-after-width)/2);'+
        ' height: var(--img-after-height);'+
        ' width: var(--img-after-width);'+
        ' }'+

        ' }'+

        ' @keyframes div_full_scren_r {'+
        ' 100% {'+
        ' position: fixed;'+
        ' margin: 0px;'+
        ' padding: 0px;'+
        ' top: var(--div-top);'+
        ' left: var(--div-left);'+
        ' height: var(--div-height);'+
        ' width: var(--div-width);'+
        ' background: rgba(0, 0, 0, 0);'+
        ' }'+

        ' 0% {'+
        ' position: fixed;'+
        ' margin: 0px;'+
        ' padding: 0px;'+
        ' top: 0px;'+
        ' left: 0px;'+
        ' height: 100vh;'+
        ' width: 100vw;'+
        ' background: rgba(0, 0, 0, 0.5);'+
        ' }'+
        ' }'+

        ' @keyframes img_full_scren_r {'+
        ' 100% {'+
        ' margin-top: 0px;'+
        ' margin-left: 0px;'+
        ' height: var(--img-height);'+
        ' width: var(--img-width);'+
        ' }'+

        ' 0% {'+
        ' margin-top: calc(50vh - var(--img-after-height)/2);'+
        ' margin-left: calc(50vw - var(--img-after-width)/2);'+
        ' height: var(--img-after-height);'+
        ' width: var(--img-after-width);'+
        ' }'+

        ' }'+
		' </style>';

        html_str += '<div class="img-block">'

        for (let i in img_res) {
        	html_str += '<div onclick="fullscreen(this)"><img '+
        	'src = "' + img_res[i] + '" '+
        	'id = "' + i + '" '+
        	'onerror = " this.src = ' + "'img_error.svg' " + '" '+
        	'></div> ';
        }

        html_str += '</div>'
        


        
        shadow.innerHTML = html_str;
    }
}

customElements.define('photo-gallery', PhotoGallery);

let full_screen = false;

    function fullscreen(div) {
        let div_pos = div.getBoundingClientRect();
        let img = div.firstChild;
        let img_pos = img.getBoundingClientRect();
let html = document.documentElement;

        if (!full_screen) {
            html.style.overflow = 'hidden';
            let html_pos = html.getBoundingClientRect();


            div.style.setProperty('--div-top', Math.round(div_pos.top) + 'px');
            div.style.setProperty('--div-left', Math.round(div_pos.left) + 'px');
            div.style.setProperty('--div-height', Math.round(div_pos.height) + 'px');
            div.style.setProperty('--div-width', Math.round(div_pos.width) + 'px');
            div.style.animation = 'div_full_scren 1s 0s normal 1 forwards running';

            img.style.setProperty('--img-height', Math.round(img_pos.height) + 'px');
            img.style.setProperty('--img-width', Math.round(img_pos.width) + 'px');

            if ((img_pos.height * html_pos.width) / img_pos.width < html_pos.height) {
                img.style.setProperty('--img-after-height', Math.round((img_pos.height * html_pos.width) / img_pos.width) + 'px');
                img.style.setProperty('--img-after-width', Math.round(html_pos.width) + 'px');
            }

            if ((img_pos.width * html_pos.height) / img_pos.height <= html_pos.width) {
                img.style.setProperty('--img-after-height', Math.round(html_pos.height) + 'px');
                img.style.setProperty('--img-after-width', Math.round((img_pos.width * html_pos.height) / img_pos.height) + 'px');
            }

            img.style.animation = 'img_full_scren 1s 0s normal 1 forwards running';
            img.style.borderRadius = '0px';

            full_screen = true;
        } else {

            html.style.overflow = 'visible';
            div.style.animation = 'div_full_scren_r 1s 0s normal 1 none running';
            img.style.animation = 'img_full_scren_r 1s 0s normal 1 none running';
            img.style.borderRadius = '1vh';
            full_screen = false;
        }
    }