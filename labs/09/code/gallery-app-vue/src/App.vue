<template>
    <div id="app">
        <div id="header">Gallery</div>
        <AddImage v-bind:images="images" @add-image="addImage" />
        <ImageList 
            v-bind:images="images" 
            @delete-image="deleteImage" 
            @open-image="openImage" 
            />
    </div>
</template>

<script>
import ImageList from '@/components/ImageList'
import AddImage from '@/components/AddImage'
export default {
    name: 'App',
    data() {
        return {
            images: [
                { id: 0, fullscreen: false, prev: false, next: false, src: "res_compressed/Знімок екрана (85).png" },
                { id: 1, fullscreen: false, prev: false, next: false, src: "res_compressed/Знімок екрана (86).png" },
                { id: 2, fullscreen: false, prev: false, next: false, src: "res_compressed/Знімок екрана (88).png" },
                { id: 3, fullscreen: false, prev: false, next: false, src: "res_compressed/Знімок екрана (89).png" },
                { id: 4, fullscreen: false, prev: false, next: false, src: "res_compressed/Знімок екрана (99).png" },
                { id: 5, fullscreen: false, prev: false, next: false, src: "res_compressed/Знімок екрана (104).png" },
                { id: 6, fullscreen: false, prev: false, next: false, src: "res_compressed/Знімок екрана (112).png" },
                { id: 7, fullscreen: false, prev: false, next: false, src: "res_compressed/Знімок екрана (159).png" },
                { id: 8, fullscreen: false, prev: false, next: false, src: "res_compressed/Знімок екрана (160).png" },
                { id: 9, fullscreen: false, prev: false, next: false, src: "res_compressed/Знімок екрана (166).png" },
                { id: 10, fullscreen: false, prev: false, next: false, src: "res_compressed/Знімок екрана (167).png" },
                { id: 11, fullscreen: false, prev: false, next: false, src: "res_compressed/Знімок екрана (171).png" },
                { id: 12, fullscreen: false, prev: false, next: false, src: "res_compressed/Знімок екрана (210).png" },
                { id: 13, fullscreen: false, prev: false, next: false, src: "res_compressed/Знімок екрана (212).png" },
                { id: 14, fullscreen: false, prev: false, next: false, src: "res_compressed/Знімок екрана (216).png" },
                { id: 15, fullscreen: false, prev: false, next: false, src: "res_compressed/Знімок екрана (217).png" },
                { id: 16, fullscreen: false, prev: false, next: false, src: "res_compressed/Знімок екрана (218).png" },
                { id: 17, fullscreen: false, prev: false, next: false, src: "res_compressed/Знімок екрана (219).png" },
                { id: 18, fullscreen: false, prev: false, next: false, src: "res_compressed/Знімок екрана (221).png" },
                { id: 19, fullscreen: false, prev: false, next: false, src: "res_compressed/Знімок екрана (224).png" },
                { id: 20, fullscreen: false, prev: false, next: false, src: "res_compressed/Знімок екрана (228).png" },
                { id: 21, fullscreen: false, prev: false, next: false, src: "res_compressed/Знімок екрана (243).png" },
                { id: 22, fullscreen: false, prev: false, next: false, src: "res_compressed/Знімок екрана (247).png" },
                { id: 23, fullscreen: false, prev: false, next: false, src: "res_compressed/Знімок екрана (251).png" }
            ]
        }
    },
    methods: {
        deleteImage(id) {
            this.images = this.images.filter(t => t.id !== id)
        },
        addImage(id) {
            this.images.push(id)
        },
        openImage(id) {
            let A = this.images;
            console.log(A);


            for (let i in A) {
                if (A[i].id === id) {
                    console.log('id is: ',id,' i is: ',i);
                    if (A[i].fullscreen) {
                        for (let i in A) {
                            A[i].fullscreen = false;
                            A[i].prev = false;
                            A[i].next = false;
                        }
                    } else {
                        for (let i in A) {
                            A[i].fullscreen = false;
                            A[i].prev = false;
                            A[i].next = false;
                        }

                        A[i].fullscreen = true;

                        if (A.length < 2) {
                          break;
                        }

                        if (i-1 >= 0) {
                            console.log('prev i is :', i-1);
                            A[i-1].prev = true;
                        } else {
                            console.log('prev i is :', A.length-1);
                            A[A.length-1].prev = true;
                        }

                        if (parseInt(i) + 1 < A.length) {
                            console.log('next i is :', parseInt(i) + 1);
                            A[parseInt(i) + 1].next = true;
                        } else {
                            console.log('next i is : 0');
                            A[0].next = true;
                        }

                        break;
                    }
                }
            }
        }
    },
    components: {
        ImageList,
        AddImage,
    }
}
</script>

<style>
@import url(../../../../../for_menu/global.css);

#app {
    color: #fff;
    text-align: center;
}

#header {
    height: 5vh;
    width: 100vw;
    font-size: 5vh;
    font-family: poly;
    text-align: center;
    line-height: 5vh;
    background: #ff3232;
    color: #fff;
}
</style>