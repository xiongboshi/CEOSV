import * as Cesium from "cesium";
/**
 * 获取相机位置
 * @returns 
 */
function getCameraPosition (viewer) {
    if (viewer) {

        var result = viewer.scene.camera.pickEllipsoid(new Cesium.Cartesian2(viewer.canvas.clientWidth / 2, viewer.canvas
            .clientHeight / 2));
        if (result) {

            var curPosition = Cesium.Ellipsoid.WGS84.cartesianToCartographic(result),
                lon = curPosition.longitude * 180 / Math.PI
                , lat = curPosition.latitude * 180 / Math.PI;

            var direction = viewer.camera._direction,
                x = Cesium.Math.toDegrees(direction.x),
                y = Cesium.Math.toDegrees(direction.y),
                z = Cesium.Math.toDegrees(direction.z),
                height = viewer.camera.positionCartographic.height,
                heading = Cesium.Math.toDegrees(viewer.camera.heading),
                pitch = Cesium.Math.toDegrees(viewer.camera.pitch),
                roll = Cesium.Math.toDegrees(viewer.camera.roll);

            var rectangle = viewer.camera.computeViewRectangle(),
                west = rectangle.west / Math.PI * 180,
                north = rectangle.north / Math.PI * 180,
                east = rectangle.east / Math.PI * 180,
                south = rectangle.south / Math.PI * 180,
                centerx = (west + east) / 2,
                cnetery = (north + south) / 2;

            console.log('窗口视角===>',{
                lon: lon,
                lat: lat,
                height: height,
                heading: heading,
                pitch: pitch,
                roll: roll,
                position: viewer.camera.position,
                center: { x: centerx, y: cnetery },
                direction: new Cesium.Cartesian3(x, y, z)
            })

            return {
                lon: lon,
                lat: lat,
                height: height,
                heading: heading,
                pitch: pitch,
                roll: roll,
                position: viewer.camera.position,
                center: { x: centerx, y: cnetery },
                direction: new Cesium.Cartesian3(x, y, z)
            };
        }
    }
}
export {getCameraPosition}