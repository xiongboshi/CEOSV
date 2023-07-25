import * as Cesium from "cesium";
/**
* @description: 旋转材质
* @param {*} instance ：实体
* @param {*} _stRotation : 初始材质旋转角度
* @param {*} _amount ：旋转角度变化量
* @return {*}
*/        
function rotateMaterial(instance, _stRotation, _amount) {
    instance.stRotation = new Cesium.CallbackProperty(function() {
        _stRotation += _amount;
        if (_stRotation >= 360 || _stRotation <= -360) {
            _stRotation = 0;
        }
        return Cesium.Math.toRadians(_stRotation);
    }, false)
 }

 /**
 * @description: 旋转实体entity
 * @param {*} instance ：具体的实体
 * @param {*} _rotation ：初始旋转角度
 * @param {*} _amount ：旋转角度变化量
 * @return {*}
 */        
function rotateEntity(instance, _rotation, _amount) {
    instance.rotation = new Cesium.CallbackProperty(function() {
        _rotation += _amount;
        if (_rotation >= 360 || _rotation <= -360) {
            _stRotation = 0;
        }
        return Cesium.Math.toRadians(_rotation);
    }, false)
}

export {
    rotateMaterial,
    rotateEntity
}