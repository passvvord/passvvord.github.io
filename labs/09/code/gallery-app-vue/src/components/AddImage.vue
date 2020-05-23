<template>
    <div id="AddImage">
        <input type="file" id="addImage" v-on:change="AddImage()" ref="file" multiple accept="image/*">
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
            //console.log('submit ');
            if (window.FileList && window.File && window.FileReader) {
                const file = this.$refs.file.files[0];
                const reader = new FileReader();
                reader.addEventListener('load', event => {
                    //console.log(event.target.result);

                    const newImage = {
                    	id: Date.now(),
                    	src: event.target.result,
                    	status: 0
                    }

                    this.$emit('add-image',newImage);

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