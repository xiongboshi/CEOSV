import * as Cesium from "cesium";
import { addPointLight } from './pointLight'
import { rotateMaterial } from "./rotateEllipse";
/**
 * 三维贴背景图
 */
function loadBackImg(viewer,position) {

    viewer.scene.globe.showGroundAtmosphere = false;  // 关闭地表大气层，默认是 true
    viewer.scene.skyAtmosphere.show = false;  // 关闭天空大气层，默认是 true
    // viewer.scene.globe.enableLighting = true; // 日照光
    viewer.shadows = true  //日照阴影
    //关闭天空盒，否则会显示天空颜色
    viewer.scene.skyBox.show = false;
    viewer.scene.globe.show = false;   //不显示地球
    viewer.scene.brightness.uniforms.brightness = Number(15)   //曝光度

    let datasource = map_common_addDatasouce(viewer,"circleImage");
    let backEnt = datasource.entities.add({
        position: Cesium.Cartesian3.fromDegrees(
            position[0],position[1],position[2]
        ),
        ellipse:{
            height: 3000,
            semiMajorAxis: 220000,
            semiMinorAxis: 220000,
            material: new Cesium.ImageMaterialProperty({
                image:'/static/img/back.png',
                transparent: true,
                color: new Cesium.Color(0.4, 0.4, 0.4, 0.8),
            }),
            stRotation: 0 //旋转角度
        }
    });
    viewer.zoomTo(backEnt)
    rotateMaterial(backEnt.ellipse, 65, 0.05);
}

function map_common_addDatasouce(viewer,datasouceName) {
    let datasouce = viewer.dataSources._dataSources.find(t => {
        return t && t.name == datasouceName;
    });
    if (!datasouce) {
        datasouce = new Cesium.CustomDataSource(datasouceName);
        viewer.dataSources.add(datasouce);
    }
    return datasouce;
}

export{ loadBackImg }
