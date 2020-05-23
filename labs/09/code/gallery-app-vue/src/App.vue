<template>
    <div id="app">
        <div id="header">Gallery</div>
        <AddImage 
          v-bind:images="images"
          @add-image="addImage"
        />
        <ImageList 
          v-bind:images="images"
          @delete-image="deleteImage"
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
                // { status: 0, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_06_gallery%2FIMG_20191106_163805-01.jpeg?alt=media&token=c41ad1b1-80ae-4e8d-ab3b-0e173b1aab0d' },
                // { status: 0, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_06_gallery%2FIMG_20191110_123517-01.jpeg?alt=media&token=c4069c13-0957-4bed-ad64-70b081804c06' },
                // { status: 0, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_06_gallery%2FIMG_20191110_143951~2-01.jpeg?alt=media&token=36ad0028-da13-43b6-aef8-08ba2cdb1377' },
                // { status: 0, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_06_gallery%2FIMG_20191111_132817-01.jpeg?alt=media&token=c83fc717-08a6-44eb-ba98-5e984fdf0976' },
                // { status: 0, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_06_gallery%2FIMG_20200107_183330-01.jpeg?alt=media&token=0f10e00f-94fd-4d5c-92b0-61f830fdb198' },
                // { status: 0, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_06_gallery%2FIMG_20200107_184524-02.jpeg?alt=media&token=78ee5699-6bf8-46c0-a58e-f4c31dec2fd6' },
                // { status: 0, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_06_gallery%2FIMG_20200202_165135-01.jpeg?alt=media&token=3eb92b2e-0ad4-494f-91cd-22bea7c75ccb' },
                // { status: 0, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_06_gallery%2F01.jpg?alt=media&token=236e5936-e3f4-408d-a15d-268cd34fe5a3' },
                // { status: 0, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_06_gallery%2FIMG_20170719_181326-01.jpeg?alt=media&token=400c368f-0b53-4e85-b039-e3c0d62bc11d' },
                // { status: 0, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_06_gallery%2FIMG_20170722_134014-01-01.jpeg?alt=media&token=3353f303-a016-48bc-98e4-965457ac7692' },
                // { status: 0, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_06_gallery%2FIMG_20171016_184358.jpg?alt=media&token=94a912e5-8ebb-47d1-b1f4-4399a872b042' },
                // { status: 0, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_06_gallery%2FIMG_20180106_125805-01.jpeg?alt=media&token=c37ce8de-ef5a-4c0b-bbfa-74093bf8e996' },
                // { status: 0, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_06_gallery%2FIMG_20180501_170055-01.jpeg?alt=media&token=a868f850-9ea0-4fc0-abe6-f9db25bd31c8' },
                // { status: 0, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_06_gallery%2FIMG_20180817_142555-01.jpeg?alt=media&token=20474b10-9cd9-482a-b553-7587b8b3749d' },
                // { status: 0, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_06_gallery%2FIMG_20180818_090239-01.jpeg?alt=media&token=4979db45-5149-446e-9d36-d6c9bf3c28ec' },
                { id: 0, status: 0, src: 'https://smashinghub.com/wp-content/uploads/2014/08/cool-loading-animated-gif-3.gif' },
                { id: 1, status: 0, src: 'https://firebasestorage.googleapis.com/v0/b/aai-database-01.appspot.com/o/web_lab_06_gallery%2FN0haYzT.gif?alt=media&token=2c617b2a-b150-4d54-b6d8-1d884cb86f9c' },
                { id: 2, status: 0, src: 'https://media0.giphy.com/media/2vr5VeJ0LBikfNHwpI/giphy.gif' }

                
            ]
        }
    },
    methods: {
      deleteImage(id) {
        this.images = this.images.filter(t => t.id !== id)
      },
      addImage(Image) {
        this.images.push(Image)
      }
    },
    components: {
        ImageList,
        AddImage
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