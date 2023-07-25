import * as Cesium from "cesium";
function setGlobeRotation(viewer){
    window.Cesium = Cesium
    window.viewer = viewer
    window._rota = Date.now();
    viewer['scene']['screenSpaceCameraController']['maximumZoomDistance']=0x3b9ac9ff;
    viewer['clock']['onTick']['addEventListener'](rotate);
    setTimeout(() => {
      viewer.clock.onTick.removeEventListener(rotate);
      viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(106.333387,29.329044, 35000),
          orientation:{ 
              heading: 0.5884413259732771, //旋转角 正东为90°
              pitch: Cesium.Math.toRadians(-35), //俯仰角，水平为0°
              roll: 0.0014112073156402616     //翻滚角
          }
      })
    },4000)
}

function rotate() {
    let a = .1;
    let t = Date.now();
    let n = (t - window._rota) / 1e3;
    window._rota = t;
    window.viewer.scene.camera.rotate(window.Cesium.Cartesian3.UNIT_Z, -a * n);
}

export{
    setGlobeRotation
}