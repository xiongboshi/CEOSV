import * as Cesium from "cesium";
let idx = 0
let pathArr = []
let posiitons = []
let forNum = 20 // 插值间隔
/**
 * 线分割 插值
 * @param startP 起始位置  
 * @param endP 结束位置 
 * @param duration 总花费时长 
 * @param imgUrl 材质图片路径 
 * @param times 材质图片流动时间
 */
function animationLine(startP,endP,duration,imgUrl,times) {

    splitPosition(startP,endP,duration).then(res=>{
        pathArr = pathArr.concat(res.splice(0 , res.length - 1))
    })
    // 立体流体材质线条
    viewer.entities.add({
        id:'lt_polyline',
        name: 'lt_polyline',
        polyline: {
            positions: new Cesium.CallbackProperty(() => {
                let pos = getPostions(idx)
                idx ++
                return pos
            }, false),
            show: true,
            material: new Cesium.PolylineTrailLinkMaterialProperty(Cesium.Color.CYAN, imgUrl, times),
            width: 12
        }
    })
}

function getPostions(idx){
    if(idx > pathArr.length - 1){
        return posiitons
    } 
    posiitons.push(pathArr[idx])
    return posiitons
}

function splitPosition (startP, endP, duration) {
    return new Promise((resolve) => {
        let arr = []
        duration = duration * 1000
        for (let i = 0; i <= duration; i = i + forNum) {
            let pos = Cesium.Cartesian3.lerp(startP, endP, i / duration, new Cesium.Cartesian3());
            arr.push(pos)
        }
        if (duration % forNum !== 0) {
            arr.push(endP)
        }
        // console.log('arr===>',arr)
        resolve(arr);
    })
}

export{
    animationLine,
    getPostions,
    splitPosition
}