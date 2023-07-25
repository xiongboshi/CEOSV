import * as Cesium from "cesium";
/**
 * 体积云
 */
function setcloudEffect(numClouds, startLong, stopLong, startLat, stopLat, minHeight, maxHeight) {
    //加载云特效
    Cesium.Math.setRandomNumberSeed(2.5);
    const clouds = new Cesium.CloudCollection()
    // 在某一区域随机生成云
    const rangeLong = stopLong - startLong;
    const rangeLat = stopLat - startLat;
    for (let i = 0; i < numClouds; i++) {
        let long = startLong + getRandomNumberInRange(0, rangeLong);
        let lat = startLat + getRandomNumberInRange(0, rangeLat);
        let height = getRandomNumberInRange(minHeight, maxHeight);
        let scaleX = getRandomNumberInRange(50000, 125000);  //云大小
        let scaleY = scaleX / 2.0 - getRandomNumberInRange(0, scaleX / 4.0);
        let slice = getRandomNumberInRange(0.1, 0.7);
        let depth = getRandomNumberInRange(50, 100);
        let aspectRatio = getRandomNumberInRange(0.5, 2.1);
        let cloudHeight = getRandomNumberInRange(50, 200);
        clouds.add({
            position: Cesium.Cartesian3.fromDegrees(long, lat, height),
            scale: new Cesium.Cartesian2(scaleX, scaleY),
            maximumSize: new Cesium.Cartesian3(
                aspectRatio * cloudHeight,
                cloudHeight,
                depth
            ),
            slice: slice,
        });
    }
    viewer.scene.primitives.add(clouds);
    function getRandomNumberInRange(minValue, maxValue) {
        return (
            minValue + Cesium.Math.nextRandomNumber() * (maxValue - minValue)
        );
    }
}

Cesium.setcloudEffect = setcloudEffect