import * as Cesium from "cesium";
import "../Widgets/widgets.css";
// 设置cesium的token
Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhMzNkNTE5Zi1mMjY4LTRiN2QtOTRlZC1lOTUyM2NhNDYzNWYiLCJpZCI6NTU0OTYsImlhdCI6MTYyNTAyNjMyOX0.a2PEM4hQGpeuMfeB9-rPp6_Gkm6O-02Dm4apNbv_Dlk";
// cesium默认资源路径
window.CESIUM_BASE_URL = "/Cesium/";
// 设置默认的视角为中国
Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(
  // 西边经度
  89.5,
  // 南边维度
  20.4,
  // 东边经度
  110.4,
  // 北边维度
  61.2
);
// 设置全局cesium对象
let cesium = {
  viewer: null,
};
function initCesium(minWGS84, maxWGS84, cesiumContainerid) {
  // 设置cesium容器
  var cesiumContainer = document.getElementById(cesiumContainerid);
  // 初始化cesium渲染器
  cesium.viewer = new Cesium.Viewer(cesiumContainer, {
    useDefaultRenderLoop: false,
    selectionIndicator: false,
    homeButton: false,
    infoBox: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    animation: false,
    shouldAnimate: true,  //开启动画
    timeline: false,
    fullscreenButton: false,
    baseLayerPicker: false,
    clock: false,
    geocoder: false,
    terrainProvider : Cesium.createWorldTerrain({
        requestVertexNormals: true  //启用地形照明
    }),
    terrainProvider : Cesium.createWorldTerrain({
        requestWaterMask: true   //水体效果
    }),
    //     天地图矢量路径图
    // imageryProvider: new Cesium.WebMapTileServiceImageryProvider({
    //   url: "http://t0.tianditu.com/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=30d07720fa76f07732d83c748bb84211",
    //   layer: "tdtBasicLayer",
    //   style: "default",
    //   format: "image/jpeg",
    //   tileMatrixSetID: "GoogleMapsCompatible",
    // }),
    //cesium中webgl选项
    contextOptions: {
      webgl: {
        //透明度
        alpha: false,
        // 抗锯齿
        antialias: true,
        //深度检测
        depth: false,
      },
    },
  });
  //设置隐藏logo
  cesium.viewer.cesiumWidget.creditContainer.style.display = "none";
  // 地图叠加
  var imageryLayers = cesium.viewer.imageryLayers;
  // //console.log(imageryLayers);
  // var layer = imageryLayers.addImageryProvider(
  //   new Cesium.WebMapTileServiceImageryProvider({
  //     url: "http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=30d07720fa76f07732d83c748bb84211",
  //     layer: "tdtBasicLayer",
  //     style: "default",
  //     format: "image/jpeg",
  //     tileMatrixSetID: "GoogleMapsCompatible",
  //   })
  // );
  // 地图透明度
  // layer.alpha = 0.1;
  

  /**
   * 加载xyz影像瓦片
   *  */   
  setTimeout(()=>{
    //  imageryLayers.remove(viewer.imageryLayers.get(0));  //移除自带地图影像
      // let mapLayer =  imageryLayers.addImageryProvider(new Cesium.UrlTemplateImageryProvider({
      //   url: "http://192.168.0.124:5500/cq_yb_tdt/Mapnik/{z}/{x}/{y}.png",
      //   fileExtension: "png"
      // }));
      // cesium.viewer.scene.globe.enableLighting = true;
      // mapLayer.dayAlpha = 0
  },9000)

  // 天空盒子
  let defaultSkyBox = new Cesium['SkyBox']({'sources':{'positiveX':'/static/sky_box/Version2_dark_px.jpg','negativeX':'/static/sky_box/Version2_dark_mx.jpg','positiveY':'/static/sky_box/Version2_dark_py.jpg','negativeY':'/static/sky_box/Version2_dark_my.jpg','positiveZ':'/static/sky_box/Version2_dark_pz.jpg','negativeZ':'/static/sky_box/Version2_dark_mz.jpg'}});
  cesium.viewer['scene']['skyBox'] = defaultSkyBox

  // 修改鼠标控制地图视图的默认行为：左键拖动，右键旋转
  cesium.viewer.scene.screenSpaceCameraController.zoomEventTypes = [
      Cesium.CameraEventType.WHEEL,
      Cesium.CameraEventType.MIDDLE_DRAG,
      // Cesium.CameraEventType.PINCH,
  ];
  cesium.viewer.scene.screenSpaceCameraController.tiltEventTypes = [
      Cesium.CameraEventType.RIGHT_DRAG,
      // Cesium.CameraEventType.PINCH,
      {
          eventType: Cesium.CameraEventType.RIGHT_DRAG,
          modifier: Cesium.KeyboardEventModifier.CTRL,
      },

      {
          eventType: Cesium.CameraEventType.MIDDLE_DRAG,
          modifier: Cesium.KeyboardEventModifier.CTRL,
      },
  ];

  //是否开启抗锯齿
  if(Cesium.FeatureDetection.supportsImageRenderingPixelated()){
    //判断是否支持图像渲染像素化处理
    cesium.viewer.resolutionScale = window.devicePixelRatio;
  }
  cesium.viewer.scene.fxaa = true;
  cesium.viewer.scene.postProcessStages.fxaa.enabled = true;
  

  //显示帧率
  cesium.viewer.scene.debugShowFramesPerSecond = true;
  if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
    var vtxf_dpr = window.devicePixelRatio;
    // 适度降低分辨率
    while (vtxf_dpr >= 2.0) {
      vtxf_dpr /= 2.0;
    }
    cesium.viewer.resolutionScale = vtxf_dpr;
  }
  console.log('cesium.version==>',Cesium.VERSION)

  // 获取要改变的的图层
  let layer1 = cesium.viewer.scene.imageryLayers.get(0);
  layer1.gamma = 0.7;
  // 亮度设置
  let stages = cesium.viewer.scene.postProcessStages;
  cesium.viewer.scene.brightness =  cesium.viewer.scene.brightness || stages.add(Cesium.PostProcessStageLibrary.createBrightnessStage());
  cesium.viewer.scene.brightness.enabled = true;
  cesium.viewer.scene.brightness.uniforms.brightness = Number(1);


  // 初始化位置
  cesium.viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(112.962475, 28.195802, 15000000),
      orientation: {
          // 指向
          heading: 6.283185307179581,
          // 视角
          pitch: -1.5688168484696687,
          roll: 0.0
      }
  });

}
function renderCesium() {
  cesium.viewer.render();
}
function exportCesium() {
    let viewer = cesium;
    return viewer;
}
export  { exportCesium,initCesium, renderCesium };
