<template>
    <div class="ImageItem" v-bind:class="{fullscreen: image.fullscreen}">
        <img id="img" 
        	v-bind:src="image.src" 
        	v-on:click="image.fullscreen = !image.fullscreen"
        	
        >
        <div id="del" v-on:click="$emit('delete-image', image.id)">⨉</div>
    </div>
    <!-- v-on:click="$emit('open-image', image.id)" -->
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
    box-shadow: 0 0 0 0.2vh #fff;
    overflow: hidden;
    transition-duration: 0.2s;
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
    user-select: none;
}

.ImageItem:hover>#del, #del:hover {
    visibility: visible;
}

.fullscreen:hover>#del {
    visibility: hidden;
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
}

img {
    height: 20vh;
    width: 20vh;
    object-fit: cover;
    /*transition-duration: 0.2s;*/
}

.fullscreen > img {
	height: 100vh;
    width: 100vw;
    object-fit: contain;
}

</style>