import * as Cesium from "cesium";
/**
 * 自定义气泡弹窗
 * @param {*} options 
 */
function canvasBillboard (viewer,options) {

    if (options && options.position) {

        var img = document.createElement('img');
        img.src = options.img || 'data/images/file/div1.png'
        // 绘制canvas
        function drawCompanyTip(options) {
            if (!options.image) return
            var canvas = document.createElement('canvas');
            canvas.width = options.width || 150;
            canvas.height = options.height || 80;
            var context = canvas.getContext('2d');
            context.clearRect(0,0,150,180)
            context.drawImage(options.image, 0, 0);
            var dom = options.text;
            context.font = options.font;
            context.fillStyle = "#fff";
            context.fillText(dom, options.fontOffset[0], options.fontOffset[1]);
            document.body.appendChild(canvas)
            return canvas;
        }
        img.onload = function () {
            options.image = img;
            var entity = viewer.entities.add({
                id: options.domId,
                name: options.text,
                position: options.position,
                billboard: {
                    image: drawCompanyTip(options),
                    scaleByDistance: new Cesium.NearFarScalar(1.5e2, 0.7, 1.5e7, 0.5),
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: options.b_pixelOffset || new Cesium.Cartesian2(10, 0),
                    width: options.b_width || 140,
                    height: options.b_height || 100,
                    scale: options.b_scale || 1.5,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    // imageSubRegion: { x: 0, y: 0, width: 200, height: 150 }
                },
            })
            if (typeof options.callback === 'function') {

                options.callback(entity)
            }
        };
    }
}

export {canvasBillboard}