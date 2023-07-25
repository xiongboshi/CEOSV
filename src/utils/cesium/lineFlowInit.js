import LineFlowMaterialProperty from '@/util/lineFlowMaterial'
/**
         * @description: 竖直随机飞线初始化
         * @param {*} _viewer
         * @param {*} _center ：中心点
         * @param {*} _num ：数量
         * @return {*}
         */
 function lineFlowInit(_viewer, _center, _num) {
    let _positions = generateRandomPosition(_center, _num);
    _positions.forEach(item => {
        // 经纬度
        let start_lon = item[0];
        let start_lat = item[1];

        let startPoint = new Cesium.Cartesian3.fromDegrees(start_lon, start_lat, 0);

        // 随机高度
        let height = 5000 * Math.random();
        let endPoint = new Cesium.Cartesian3.fromDegrees(start_lon, start_lat, height);
        let linePositions = [];
        linePositions.push(startPoint);
        linePositions.push(endPoint);
        _viewer.entities.add({
            polyline: {
                positions: linePositions,
                material: new Cesium.LineFlowMaterialProperty({
                    color: new Cesium.Color(1.0 * 1.5 * Math.random(), 1.0 * 1.5 * Math.random(), 0.0, 0.8),
                    speed: 15 * Math.random(),
                    percent: 0.1,
                    gradient: 0.01
                })
            }
        })
    })
}


/**
         * @description: 产生随机点
         * @param {*} position：中心点坐标
         * @param {*} num：随机点数量
         * @return {*}
         */
 function generateRandomPosition(position, num) {
    let list = []
    for (let i = 0; i < num; i++) {
        // random产生的随机数范围是0-1，需要加上正负模拟
        let lon = position[0] + Math.random() * 0.04 * (i % 2 == 0 ? 1 : -1);
        let lat = position[1] + Math.random() * 0.04 * (i % 2 == 0 ? 1 : -1);
        list.push([lon, lat])
    }
    return list
}

export {
    lineFlowInit
}