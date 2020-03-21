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
		' </style>';

        html_str += '<div class="img-block">'

        for (let i in img_res) {
        	html_str += '<div><img '+
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