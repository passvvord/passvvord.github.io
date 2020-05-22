<template>
    <div id="app">
        <div id="header">Gallery</div>
        <AddImage />
        <ImageList />
    </div>
</template>

<script>
import ImageList from '@/components/ImageList'
import AddImage from '@/components/AddImage'
export default {
    name: 'App',
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
    color: #2c3e50;
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