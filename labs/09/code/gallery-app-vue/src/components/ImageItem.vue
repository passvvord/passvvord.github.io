<template>
    <div 
		class="ImageItem" 
		v-bind:class="{fullscreen: image.fullscreen, prev: image.prev, next: image.next}"
	>
        <img id="img" 
        	v-bind:src="image.src" 
        	v-on:click="$emit('open-image', image.id)"
        >
        <div id="del" v-on:click="$emit('delete-image', image.id)">⨉</div>
    </div>
</template>

<script>
export default {
    props: {
        image: {
            type: Object,
            required: true
        }
    }
}
</script>

<style scoped>
.ImageItem {
    width: 20vh;
    height: 20vh;
    margin: 1vh;
    border-radius: 2vh;
    display: flex;
    align-content: center;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 0 0.2vh rgba(255,255,255,0.75);
    overflow: hidden;
    user-select: none;
}

img {
    height: 20vh;
    width: 20vh;
    object-fit: cover;
    transition-duration: 0.5s;
}

#del {
    background: #f00;
    color: #fff;
    font-size: 2vh;
    height: 3vh;
    width: 3vh;
    text-align: center;
    line-height: 3vh;
    border-radius: 1.5vh;
    position: absolute;
    margin-top: -9.5vh;
    margin-left: 9.5vh;
    visibility: hidden;
    cursor: pointer;

}

.ImageItem:hover>#del, #del:hover {
    visibility: visible;
}

.fullscreen {
	position: fixed;
	top: 0;
	width: 100vw;
    height: 100vh;
    margin: 0;
    border-radius: 0vh;
	background: rgba(0, 0, 0, 0.75);
	box-shadow: none;
	z-index: 100;
}

.fullscreen > img {
	height: 100vh;
    width: 100vw;
    object-fit: contain;
}

.fullscreen:hover > #del, .prev:hover > #del, .next:hover > #del {
    visibility: hidden;
}

.prev , .next {
	z-index: 101;
	position: fixed;
	opacity: 0.25;
	top: 40vh;
    animation: openImage 0.5s linear 1;
	transition-duration: 0.5s;
}

/*.prev > img , .next > img {
    animation: openImage2 0.5s linear 1;
}*/


.prev {left: -5vh;}
.next {right: -5vh;}

.prev:hover, .next:hover {
	opacity: 1;
}

/*.prev:hover > img, .next:hover > img {
    animation: none;
}*/

.prev:hover {left: -2vh;}
.next:hover {right: -2vh;}

@keyframes openImage {
    0%,100%   {z-index: 101}
}

</style>