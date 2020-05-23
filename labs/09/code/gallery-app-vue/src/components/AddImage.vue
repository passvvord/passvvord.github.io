<template>
    <div id="AddImage">
        <input 
        	type="file" 
        	id="addImage" 
        	v-on:change="AddImage()" 
        	ref="file" 
        	multiple accept="image/*"
        >
    </div>
</template>

<script>
export default {
    methods: {
        data() {
            return {
                src: ''
            }
        },

        AddImage(data) {
            if (window.FileList && window.File && window.FileReader) {
                const file = this.$refs.file.files[0];
                const fileS = this.$refs.file.style

                if (!file.type || !file.type.match('image.*')) {
                	fileS.transitionDuration = '0.1s';
                	fileS.background = '#f00';
                	setTimeout( () => {
						fileS.transitionDuration = '1s';
                		fileS.background = 'transparent';
                	},200);
                	
                    return;
                }

                const reader = new FileReader();
                reader.addEventListener('load', event => {

                    const newImage = {
                        id: Date.now(),
                        src: event.target.result,
                        fullscreen: false,
                        prev: false,
                        next: false
                    }

					fileS.transitionDuration = '0.1s';
                	fileS.background = '#0f0';
                	setTimeout( () => {
						fileS.transitionDuration = '1s';
                		fileS.background = 'transparent';
                	},200);

                    this.$emit('add-image', newImage);



                });
                reader.readAsDataURL(file);
            }
        }
    }
}
</script>

<style scoped>
input {
    height: 20vh;
    width: 90%;
    max-width: 80vh;
    box-sizing: border-box;
    border-radius: 2vh;
    border-color: #fff;
    border-width: 0.5vh;
    border-style: dashed;
    font-size: 1.5vh;
    padding: 1vh;
    margin: 1vh;
}
</style>