<template>
    <div id="ImageList">
        <ImageItem 
        	v-for="image of images" 
        	v-bind:image="image"
        	v-on:delete-image="deleteImage"
        	v-on:open-image="openImage"      
        />
    </div>
</template>

<script>
import ImageItem from '@/components/ImageItem'
export default {
    props: ['images'],
    components: {
        ImageItem
    },
    methods: {
    	deleteImage(id) {
    		this.$emit('delete-image',id);
    	},
    	openImage(id) {
    		this.$emit('open-image',id);
    	}
    }
}
</script>

<style>
#ImageList {
    display: flex;
    flex-wrap: wrap;
    
    justify-content: center;
}
</style>