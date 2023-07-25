/**
 * 区域掩膜
 */
 function addMaskArea(Cesium,viewer,geojson,bool,height = 0){
     console.log(geojson['features'])
    let arr=[];geojson['features']['forEach'](_0x2af991=>{if(_0x2af991['geometry']['geometries']!=undefined){_0x2af991['geometry']['geometries']['forEach'](_0x30afac=>{_0x30afac['coordinates'][0xdd0d2^0xdd0d2]['forEach'](_0x3da215=>{if(bool){_0x3da215=gCoord['transform']([_0x3da215[0xdce75^0xdce75],_0x3da215[0x7407d^0x7407c]],gCoord['BD09'],gCoord['WGS84']);}arr['push'](_0x3da215[0xcc8c3^0xcc8c3]);arr['push'](_0x3da215[0xdf599^0xdf598]);});});}else{_0x2af991['geometry']['coordinates'][0xc6a14^0xc6a14]['forEach'](_0x5e2068=>{if(bool){_0x5e2068=gCoord['transform']([_0x5e2068[0xee7e3^0xee7e3],_0x5e2068[0xdf2fd^0xdf2fc]],gCoord['BD09'],gCoord['WGS84']);}arr['push'](_0x5e2068[0x2b648^0x2b648]);arr['push'](_0x5e2068[0x85635^0x85634]);});}});var polygonWithHole=new Cesium['PolygonGeometry']({'polygonHierarchy':
    new Cesium['PolygonHierarchy'](Cesium['Cartesian3']['fromDegreesArray']([0x49,0x35,0x3e506^0x3e54f,0xd3a26^0xd3a26,0x88030^0x880b7,0x0,0x87,0x35]),
    [new Cesium['PolygonHierarchy'](Cesium['Cartesian3']['fromDegreesArray'](arr))]),'extrudedHeight':height});var geometry=Cesium['PolygonGeometry']['createGeometry'](polygonWithHole);let instances=[];instances['push'](new Cesium['GeometryInstance']({'geometry':geometry,'attributes':{'color':Cesium['ColorGeometryInstanceAttribute']['fromColor'](Cesium['Color']['fromCssColorString']('#000000'))}}));var entity=new Cesium['Primitive']({'geometryInstances':instances,asynchronous: false,'appearance':new Cesium['PerInstanceColorAppearance']({'flat':!![],'translucent':!![]})});viewer['scene']['primitives']['add'](entity);
    return arr
  }

  export{
    addMaskArea
  }