import * as Cesium from "cesium";
/**
 * 鼠标事件
 */


// 鼠标点击地图事件
 function onMouseClick(viewer){
    let selected,polygonId,wallId,labelId,prvLabel,look;
    // 开启地形深度测试
    // viewer.scene.globe.depthTestAgainstTerrain = true;
    new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas).setInputAction((pick)=> {
        var res = getCartographic(viewer,pick.position);
        var pickObj = viewer.scene.pick(pick.position);
        if (Cesium.defined(pickObj) && Cesium.defined(pickObj.id)) {
            if (pickObj.id === selected) return;
            Cesium.defined(selected) && (selected = void 0);
        }
        // 点击事件
        if (Cesium.defined(pickObj) && Cesium.defined(pickObj.primitive) && Cesium.defined(pickObj.id)) {
            if (typeof pickObj.id == 'undefined' || pickObj.id == null) return
            console.log('picked.id==>',pickObj.id);
            let labelName = pickObj.id.name
            Cesium.GeoJsonDataSource.load('/static/cq_qx_area.geoJson').then((dataSource)=>{
                // 立体面
                let entities = dataSource.entities.values;
                entities.forEach((e)=>{
                    if(e.name === labelName){
                        // 删除上一个
                        if(Cesium.defined(prvLabel)){
                            prvLabel.show = true
                        }
                        pickObj.id.show = false
                        viewer.entities.remove(polygonId)
                        viewer.entities.remove(wallId)
                        viewer.entities.remove(labelId)
                        prvLabel = pickObj.id
                        polygonId = viewer.entities.add(e)
                        polygonId.polygon.outline = false
                        // 表面贴图
                        let materialImg = new Cesium.ImageMaterialProperty({
                          image:'/static/img/excavate_bottom_min.jpg',
                          repeat: new Cesium.Cartesian2(1,1)
                        })
                        e.polygon.material = materialImg
                        // 四周贴图
                        let wallMaterialImg = new Cesium.ImageMaterialProperty({
                            image:'/static/img/excavate_side_min.jpg'
                        })
                        let positions = polygonId.polygon._hierarchy._value.positions
                        wallId = viewer.entities.add(new Cesium.Entity({
                            id:'wall_id',
                            show: true,
                            polylineVolume: {
                                positions: positions,
                                shape: [  // 截面形状
                                    new Cesium.Cartesian2(-1*2, -0.5*6800), //2代表厚度，6800代表高度
                                    new Cesium.Cartesian2(2, -0.5*6800),
                                    new Cesium.Cartesian2(2, 0.5*6800),
                                    new Cesium.Cartesian2(-1*2, 0.5*6800)
                                ],
                                cornerType: Cesium.CornerType.MITERED,  // 线段转折处样式
                                material: wallMaterialImg,
                            },
                            polyline: {
                                positions: positions,
                                width: 8,
                                material: new Cesium.PolylineTrailLinkMaterialProperty(Cesium.Color.CYAN, '/static/img/LinkPulse.png', 30000),
                            }
                        }))
                        let exHeight = 4000
                        e.polygon.extrudedHeight = 4000
                        e.polygon.perPositionHeight = true
                        e.polygon.extrudedHeight = new Cesium.CallbackProperty(()=>{
                          if(exHeight >= 7000){
                            return exHeight
                          }
                          exHeight += 30
                          return exHeight
                        },false)
                        // label
                        let pyPositions = e.polygon._hierarchy.getValue(Cesium.JulianDate.now()).positions;
                        let pCenter = Cesium.BoundingSphere.fromPoints(pyPositions).center;
                        labelId = viewer.entities.add({
                            id:'_label_' + Math.random(0,10000000),
                            name: e.name,
                            position: pCenter,
                            label: new Cesium.LabelGraphics({
                                text: e.name,
                                font: 'normal 24px MicroSoft YaHei',
                                fillColor: Cesium.Color.fromCssColorString("#FFF"),       
                                backgroundColor: Cesium.Color.fromCssColorString('#000000bf'),  
                                showBackground:true,                
                                style: Cesium.LabelStyle.FILL,        
                                scale : 0.5,
                                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                                horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                                disableDepthTestDistance : 10000.0,
                                eyeOffset: new Cesium.Cartesian3(0, 6000, -10000)
                            })
                        })
                    }
                })
            })
          
                
                

        } else {
            Cesium.defined(selected) && (selected = void 0)
        }
  
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

   //鼠标移入地图事件
   function onMouseMove(viewer){
        var selected, primitive, color, r, attribute;
        new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas).setInputAction((move)=> {
            var pick = viewer.scene.pick(move.endPosition);
            console.log('pick==>',pick);
            if (Cesium.defined(pick) && Cesium.defined(pick.id)) {
                if (pick.id === selected) return;
                Cesium.defined(selected) && ((attribute = primitive.getGeometryInstanceAttributes(selected)).color = color, 
                attribute.show = r, selected = void 0, primitive = void 0, color = void 0, r = void 0);
            }
            
            Cesium.defined(pick) && Cesium.defined(pick.primitive) && Cesium.defined(pick.id) && Cesium.defined(pick.primitive.getGeometryInstanceAttributes) 
            ? (selected = pick.id, primitive = pick.primitive, attribute = primitive.getGeometryInstanceAttributes(selected), color = attribute.color,
            r = attribute.show, viewer.scene.invertClassification || (attribute.color = [65, 98, 195, 120]), attribute.show = [1]) 
            : Cesium.defined(selected) && ((attribute = primitive.getGeometryInstanceAttributes(selected)).color = color, attribute.show = r,
            selected = void 0, primitive = void 0, color = void 0)
            if (Cesium.defined(pick) && Cesium.defined(pick.id)) {

            } else {
                viewer.scene.postRender.removeEventListener();
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

//   坐标转换
  function getCartographic(viewer,position) {
    var ray = viewer.scene.camera.getPickRay(position);
    var cartesian = null;
    var pickPostion = {};
    var feature = viewer.scene.pick(position);
    console.log(position)
    console.log(feature)
    if (viewer.scene.pickPositionSupported && Cesium.defined(feature) && feature.content) {
        cartesian = viewer.scene.pickPosition(position);
    } else if (feature instanceof Cesium.Cesium3DTileFeature) {
        cartesian = viewer.scene.pickPosition(position);
    } else {
        cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        // cartesian = viewer.scene.pickPosition(position);
    }
    console.log(cartesian)
    if (cartesian) {
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian); // 结果对象中的值将以弧度表示。
        var longitude = Number(Cesium.Math.toDegrees(cartographic.longitude));
        var latitude = Number(Cesium.Math.toDegrees(cartographic.latitude));
        var height = Number(cartographic.height);
        pickPostion = [longitude.toFixed(6),latitude.toFixed(6),height.toFixed(2)].join(',');
    }
    console.log('pickPostion==>',pickPostion);
    return pickPostion;
  }

export{
    onMouseClick,
    onMouseMove
}