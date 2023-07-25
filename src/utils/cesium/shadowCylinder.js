import * as Cesium from "cesium";
import circle from '@turf/circle';

/**
 * 渐变色柱状图
 * @param {*} viewer 
 * @param {*} data 
 */
function shadowCylinder(viewer,data) {
    if (data && data.length > 0) {
        let datasource = map_common_addDatasouce(viewer,"point");
        datasource.entities.removeAll();
        data.forEach(item => {
        		let center = item.coordinates;
                let radius = 0.053;//半径
                let options = {steps: 10, units: 'kilometers', properties: {foo: 'bar'}};
                //引入turf构建范围面    
                let circleData = circle(center, radius, options);
                let height = item.rainValue;//高度
                let wallPositions = circleData.geometry.coordinates[0].map(item => {
                    return [...item, height]
                });
                let positions = Array.prototype.concat.apply(
                    [],
                    wallPositions
                );
                //通过围墙实现渐变填充
                datasource.entities.add({
                    wall: {
                        positions: Cesium.Cartesian3.fromDegreesArrayHeights(positions),
                        material: new Cesium.ImageMaterialProperty({
                            image: getColorRamp([0.1, 0.5, 1.0], true, "county_border_line"),
                            repeat: new Cesium.Cartesian2(1.0, 1),
                            transparent: false,
                        }),
                        minimumHeights: wallPositions.map(() => 0),
                        outline: false,
                    }
                });
                //填充纯色围墙
                datasource.entities.add({
                    position: Cesium.Cartesian3.fromDegrees(item.coordinates[0], item.coordinates[1], 0),
                    cylinder: {
                        length: height - 0,
                        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
                        topRadius: 50,
                        bottomRadius: 50,
                        material: Cesium.Color.fromCssColorString('#0077AF'),
                        outline: false
                    }
                })
        })
    }
}

/**
 * 颜色渐变
 */
function getColorRamp(elevationRamp, isVertical = true) {
    let ramp = document.createElement('canvas');
    ramp.width = isVertical ? 1 : 100;
    ramp.height = isVertical ? 100 : 1;
    let ctx = ramp.getContext('2d');

    let values = elevationRamp;
    let grd = isVertical ? ctx.createLinearGradient(0, 0, 0, 100) : ctx.createLinearGradient(0, 0, 100, 0);
    grd.addColorStop(values[0], '#0084FF');
    grd.addColorStop(values[1], '#00FCFF');
    grd.addColorStop(values[2], '#00FF7E');
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = grd;
    if (isVertical)
        ctx.fillRect(0, 0, 1, 100);
    else
        ctx.fillRect(0, 0, 100, 1);

    return ramp;
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

export {shadowCylinder}
