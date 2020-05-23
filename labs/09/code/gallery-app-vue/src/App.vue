<template>
    <div id="app">
        <div id="header">Gallery</div>
        <AddImage v-bind:images="images" @add-image="addImage" />
        <ImageList v-bind:images="images" @delete-image="deleteImage" />
        <ImagePreview v-bind:images="images" />
    </div>
</template>
<script>
import ImagePreview from '@/components/ImagePreview'
import ImageList from '@/components/ImageList'
import AddImage from '@/components/AddImage'
export default {
    name: 'App',
    data() {
        return {
            images: [
                // { id: 0, fullscreen: false, inPrevLine: false, src: 'https://smashinghub.com/wp-content/uploads/2014/08/cool-loading-animated-gif-3.gif' },
                // { id: 1, fullscreen: false, inPrevLine: false, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_06_gallery%2FN0haYzT.gif?alt=media&token=2c617b2a-b150-4d54-b6d8-1d884cb86f9c' },
                // { id: 2, fullscreen: false, inPrevLine: false, src: 'https://media0.giphy.com/media/2vr5VeJ0LBikfNHwpI/giphy.gif' }
                { id: 0, fullscreen: false, inPrevLine: false, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_09_gallery%2F%D0%97%D0%BD%D1%96%D0%BC%D0%BE%D0%BA%20%D0%B5%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%20(104).png?alt=media&token=34c8ec00-8ad5-4605-88c8-d52941645a80' },
                { id: 1, fullscreen: false, inPrevLine: false, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_09_gallery%2F%D0%97%D0%BD%D1%96%D0%BC%D0%BE%D0%BA%20%D0%B5%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%20(112).png?alt=media&token=0d94eb75-f521-4c93-a854-b15d584bb3c8' },
                { id: 2, fullscreen: false, inPrevLine: false, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_09_gallery%2F%D0%97%D0%BD%D1%96%D0%BC%D0%BE%D0%BA%20%D0%B5%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%20(159).png?alt=media&token=43852f4b-e366-45af-8a57-c552c5d8d212' },
                { id: 3, fullscreen: false, inPrevLine: false, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_09_gallery%2F%D0%97%D0%BD%D1%96%D0%BC%D0%BE%D0%BA%20%D0%B5%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%20(160).png?alt=media&token=c303c557-7ce3-4744-8c5a-c799cc85cbf9' },
                { id: 4, fullscreen: false, inPrevLine: false, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_09_gallery%2F%D0%97%D0%BD%D1%96%D0%BC%D0%BE%D0%BA%20%D0%B5%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%20(166).png?alt=media&token=f22d2e88-5d5c-41fd-b05f-0873098e6bda' },
                { id: 5, fullscreen: false, inPrevLine: false, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_09_gallery%2F%D0%97%D0%BD%D1%96%D0%BC%D0%BE%D0%BA%20%D0%B5%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%20(167).png?alt=media&token=a10e61ce-f6c7-4561-a605-e0ceace7b23d' },
                { id: 6, fullscreen: false, inPrevLine: false, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_09_gallery%2F%D0%97%D0%BD%D1%96%D0%BC%D0%BE%D0%BA%20%D0%B5%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%20(171).png?alt=media&token=425229ea-a201-4860-bd87-9ba30ed2e251' },
                { id: 7, fullscreen: false, inPrevLine: false, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_09_gallery%2F%D0%97%D0%BD%D1%96%D0%BC%D0%BE%D0%BA%20%D0%B5%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%20(210).png?alt=media&token=d07f062e-4628-47fe-9750-4dc1571d97c6' },
                { id: 8, fullscreen: false, inPrevLine: false, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_09_gallery%2F%D0%97%D0%BD%D1%96%D0%BC%D0%BE%D0%BA%20%D0%B5%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%20(212).png?alt=media&token=a5d14633-439f-4a26-88e0-9a89ce58b67d' },
                { id: 9, fullscreen: false, inPrevLine: false, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_09_gallery%2F%D0%97%D0%BD%D1%96%D0%BC%D0%BE%D0%BA%20%D0%B5%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%20(216).png?alt=media&token=f8df6bda-3f4f-43a4-b71c-7fd629ec4597' },
                { id: 10, fullscreen: false, inPrevLine: false, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_09_gallery%2F%D0%97%D0%BD%D1%96%D0%BC%D0%BE%D0%BA%20%D0%B5%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%20(217).png?alt=media&token=bc5207f4-d5e0-4e28-a7c1-a96263455b79' },
                { id: 11, fullscreen: false, inPrevLine: false, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_09_gallery%2F%D0%97%D0%BD%D1%96%D0%BC%D0%BE%D0%BA%20%D0%B5%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%20(218).png?alt=media&token=a8957e81-b085-482d-bb3e-abaa6f98e59c' },
                { id: 12, fullscreen: false, inPrevLine: false, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_09_gallery%2F%D0%97%D0%BD%D1%96%D0%BC%D0%BE%D0%BA%20%D0%B5%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%20(219).png?alt=media&token=3cb8b6d2-3f5c-4e2c-8166-8b84384790a7' },
                { id: 13, fullscreen: false, inPrevLine: false, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_09_gallery%2F%D0%97%D0%BD%D1%96%D0%BC%D0%BE%D0%BA%20%D0%B5%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%20(221).png?alt=media&token=bb8da6cd-7d51-4046-bfca-ced82a7fc110' },
                { id: 14, fullscreen: false, inPrevLine: false, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_09_gallery%2F%D0%97%D0%BD%D1%96%D0%BC%D0%BE%D0%BA%20%D0%B5%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%20(224).png?alt=media&token=ccfbb1d7-38b6-4f3e-803b-9172ec5c4475' },
                { id: 15, fullscreen: false, inPrevLine: false, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_09_gallery%2F%D0%97%D0%BD%D1%96%D0%BC%D0%BE%D0%BA%20%D0%B5%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%20(228).png?alt=media&token=15ae2fad-1d56-49da-8eb7-c2bf4d1cf866' },
                { id: 16, fullscreen: false, inPrevLine: false, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_09_gallery%2F%D0%97%D0%BD%D1%96%D0%BC%D0%BE%D0%BA%20%D0%B5%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%20(243).png?alt=media&token=547c4121-6e0f-4cba-87c1-cdd42d2092b6' },
                { id: 17, fullscreen: false, inPrevLine: false, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_09_gallery%2F%D0%97%D0%BD%D1%96%D0%BC%D0%BE%D0%BA%20%D0%B5%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%20(247).png?alt=media&token=dbadf98e-3322-42eb-b374-5ac47b1368f6' },
                { id: 18, fullscreen: false, inPrevLine: false, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_09_gallery%2F%D0%97%D0%BD%D1%96%D0%BC%D0%BE%D0%BA%20%D0%B5%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%20(251).png?alt=media&token=b8b52d56-bfee-4c7c-a239-2e8eaae0bdaf' },
                { id: 19, fullscreen: false, inPrevLine: false, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_09_gallery%2F%D0%97%D0%BD%D1%96%D0%BC%D0%BE%D0%BA%20%D0%B5%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%20(85).png?alt=media&token=e2b09b91-68e4-4d93-963f-b256a9b10369' },
                { id: 20, fullscreen: false, inPrevLine: false, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_09_gallery%2F%D0%97%D0%BD%D1%96%D0%BC%D0%BE%D0%BA%20%D0%B5%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%20(86).png?alt=media&token=6c7e14e5-1672-4dfd-90ca-ef0ef9c962ee' },
                { id: 21, fullscreen: false, inPrevLine: false, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_09_gallery%2F%D0%97%D0%BD%D1%96%D0%BC%D0%BE%D0%BA%20%D0%B5%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%20(88).png?alt=media&token=68141b93-f6f7-44b9-ba66-0df48f2cc8dd' },
                { id: 22, fullscreen: false, inPrevLine: false, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_09_gallery%2F%D0%97%D0%BD%D1%96%D0%BC%D0%BE%D0%BA%20%D0%B5%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%20(89).png?alt=media&token=82ed460c-5a3f-4d59-8340-88a6f2df5b9c' },
                { id: 23, fullscreen: false, inPrevLine: false, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_09_gallery%2F%D0%97%D0%BD%D1%96%D0%BC%D0%BE%D0%BA%20%D0%B5%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%20(99).png?alt=media&token=6670b71b-fc43-46c8-a023-7ef8a9096277' }
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
            for (i in this.images) {}

        }
    },
    components: {
        ImageList,
        AddImage,
        ImagePreview
    }
}
</script>
<style>
@import url(../../../../../for_menu/global.css);

#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #fff;
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