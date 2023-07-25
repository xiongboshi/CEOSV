<template>
    <div id="cesiumContainer" ref="cesiumContainer"></div>
</template>
<script lang="ts" setup>
import { onMounted,ref } from "vue";
import * as Cesium from "cesium";
import "@/utils/Widgets/widgets.css";
import { exportCesium, initCesium, renderCesium } from "@/utils/cesium/cesium_init";
import { initThree, createMesh, renderThree } from "@/utils/three/three_init"
import { GUI } from 'three/addons/libs/lil-gui.module.min'


let tileGroup: any[] = [];
let viewer:any = ref(null);

onMounted(()=>{
    initScene();
    initGUI();
})

function initGUI(){
    let gui = new GUI();
    let params = {
        addFBX:false
    }

    gui.add(params,'addFBX').name('中国石油模型').onChange((val:boolean)=>{
        if(val){
            init3DTile(viewer,'model/3dtiles/fbx/guanqu/tileset.json','guanqu');
        }else{
            tileGroup.forEach(e=>{
                if(e.name == "guanqu"){
                    e.show = false;
                }
            })
        }
    })
}


function init3DTile(viewer:any,url:string,name:string){
    let tileset = new Cesium.Cesium3DTileset({
        url: url,
        show: true,
        maximumMemoryUsage: 128,
        backFaceCulling:false,//背面绘制
    });

    viewer.scene.primitives.add(tileset);

    tileset.readyPromise.then((tile:any)=>{
        tile.name = name;
        tileGroup.push(tile);
        viewer.flyTo(tile);
    })
}

function initScene() {
  // 设置显示模型的渲染范围(用于设置范围)
  let minWGS84 = [115.39, 38.9];
  let maxWGS84 = [117.39, 40.9];
  //初始化Cesium
  initCesium(minWGS84, maxWGS84, 'cesiumContainer');
  let cesium = exportCesium();
  console.log(cesium)
  viewer = cesium.viewer
  //初始化Three
  initThree(minWGS84, maxWGS84);
  //创建物体
  // createMesh(minWGS84, maxWGS84);

  const loop = () => {
    requestAnimationFrame(loop);
    // cesium渲染
    renderCesium();
    // three.js渲染
    renderThree(cesium);
  }
  loop();
}

</script>
<style scoped>
#cesiumContainer {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

#cesiumContainer>canvas {
  position: absolute;
  top: 0;
  left: 0;
  /* 设置鼠标事件穿透 */
  pointer-events: none;
}
</style>