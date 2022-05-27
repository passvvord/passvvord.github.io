const preloader_id = 'prloader_12345';
let preloader_is_active = 0;

function dce(el) { return document.createElement(el); }

function remove_preloader() {
	document.getElementById(preloader_id).remove();
	preloader_is_active = 0;
}

function draw_preloader() {
	if (preloader_is_active) {
		remove_preloader();
	}

	let preloader = dce('div');
	preloader.id = preloader_id;

	preloader.style.cssText = `
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0,0,0,0.5);
		display: flex;
		justify-content: center;
		align-items: center;
	`;

	let style = dce('style');
	style.innerHTML = `
		@keyframes circ {
			0%,100% {transform: scale(0)}
			50%     {transform: scale(2)}
		}
	`;
	preloader.appendChild(style);

	let preloader_box = dce('div');
	preloader_box.style.cssText = `
		width: 5vh;
		height: 5vh;
		background: #fff;
		animation: ease-in circ 2s infinite;
		border-radius: 50%;
	`;
	preloader.appendChild(preloader_box);

	document.body.appendChild(preloader);

	preloader_is_active = 1;
}