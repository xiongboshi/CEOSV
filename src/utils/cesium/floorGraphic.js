/**
 * 楼栋分层，合并，平移
 */
export default class floorGraphic{

    constructor(Cesium,viewer,options){
        console.log(options)
        if(!viewer) throw new Error('no viewer object!');
        this.Cesium = Cesium;
        this._viewer = viewer;
        this.position = options.position  // 楼层位置
        this.floorUrl = options.floorUrl  // 楼层的模型
        this.topUrl = options.topUrl  // 楼顶的模型
        this.spacing = options.spacing  // 每层层高,单位:米
        this.count = options.count  // 总层数（不含楼顶）
        this.modelArr = []
        this.nextSel = null
        this.timers = []
        this.addFloorByEach()
    }

    /**
     * 楼栋循环加载
     */
    addFloorByEach(){
        let _this = this
        let height = 0
        for (let i = 0; i <= _this.count; i++) {
            height = _this.spacing * i
            console.log(height)
            let params = {
                tx: _this.position.lng,  //模型中心X轴坐标（经度，单位：十进制度）
                ty: _this.position.lat,    //模型中心Y轴坐标（纬度，单位：十进制度）
                tz: height,    //模型中心Z轴坐标（高程，单位：米）
                rx: _this.position.rx,    //X轴（经度）方向旋转角度（单位：度）
                ry: _this.position.ry,    //Y轴（纬度）方向旋转角度（单位：度）
                rz: _this.position.rz     //Z轴（高程）方向旋转角度（单位：度）
            };
            if(i == _this.count){
                // 房顶加载
                _this.addFloor(params,_this.topUrl)
                continue
            }
            //楼层加载
            _this.addFloor(params,_this.floorUrl)
        }


        //事件
        let canvas = _this._viewer.scene.canvas;
        let handler = new _this.Cesium.ScreenSpaceEventHandler(canvas);
        //点击事件
        handler.setInputAction(function(movement) {
            // 根据返回的位置信息 获取添加的实体 pick 
            let pick = _this._viewer.scene.pick(movement.position); 
            // console.log(pick)
            if(pick == undefined) return
            if(pick.primitive != undefined){
                
                if(_this.nextSel != null){
                    //清空
                    _this.nextSel.primitive.color = new _this.Cesium.Color(1, 1, 1, 1)
                    _this.nextSel.primitive.silhouetteSize = 0
                }
                _this.floorLucency()
                // pick.primitive.color = new _this.Cesium.Color(1, 1, 0, 1); //选中模型后高亮
                pick.primitive.silhouetteColor = _this.Cesium.Color.fromAlpha(_this.Cesium.Color.BLUE, 1);//设置模型外轮廓颜色与透明度
                pick.primitive.silhouetteSize = 1.0;//设置模型外轮廓线宽度
                _this.nextSel = pick
            }
        }, _this.Cesium.ScreenSpaceEventType.LEFT_CLICK);

    }

    /**
     * 楼栋加载
     */
    addFloor(params,url){
        let _this = this
        let model = _this._viewer.scene.primitives.add(
            _this.Cesium.Model.fromGltf({
                url: url,
                show: true,                    
                scale: 3.0,
                maximumScale: 1
            })
        )
        model.option ={
            oriHeight: params.tz,
            scale: 3.0
        }
        model.readyPromise.then((model)=>{
            _this.modelArr.push(model)
            console.log(model)
            _this.update3dtilesMaxtrix(_this.Cesium,params,model)
        })
    }

    /**
     * 楼栋分层,还原
     */
    floorLayered(addHeight){
        let _this = this
        for (let i = 0; i < _this.modelArr.length; i++) {
            let modelItem = _this.modelArr[i]
            if(i == 0) continue
            // 模型高度调整
            let height = addHeight * i;
            let oldMatrix = modelItem.modelMatrix;// 模型的矩阵
            let oldCenter = new _this.Cesium.Cartesian3(oldMatrix[12],oldMatrix[13],oldMatrix[14]);// 模型高度调整前中心点笛卡尔坐标
            let oldCartographic = _this.Cesium.Cartographic.fromCartesian(oldCenter);// 高度调整前的弧度坐标
            let newHeight = oldCartographic.height + height;
            let newCartographic = new _this.Cesium.Cartographic( oldCartographic.longitude, oldCartographic.latitude, newHeight ); // 高度调整后的弧度坐标
            let newCartesian = _this._viewer.scene.globe.ellipsoid.cartographicToCartesian(newCartographic);
            let headingPitchRoll = new _this.Cesium.HeadingPitchRoll(0,0,0);
            let m = _this.Cesium.Transforms.headingPitchRollToFixedFrame(newCartesian, headingPitchRoll, _this.Cesium.Ellipsoid.WGS84, _this.Cesium.Transforms.eastNorthUpToFixedFrame, new _this.Cesium.Matrix4());
            modelItem.modelMatrix = m;// 平移变换

            // let startTime = new _this.Cesium.JulianDate.now()
            // modelItem.activeAnimations.addAll({
            //     loop : Cesium.ModelAnimationLoop.REPEAT,
            //     delay: 10,
            //     multiplier : 1,  //速度
            //     // reverse : true //false顺时针  true逆时针
            //     startTime: startTime,
            //     stopTime: _this.Cesium.JulianDate.addSeconds(startTime,100,new Cesium.JulianDate())
            // });
        }
    }

    /**
     * 分层动画
     */
     opeAll(height, time , interval = 100) {
        let _this = this
        this.resetAll();
        let point = this.position; //楼栋位置
        this.clearFloorTimers()
        for (let i = 0; i < this.modelArr.length; i++) {
            let model = this.modelArr[i]

            let changeRate = Number((i * height * model.option.scale)) * (interval / time)
            // let alt = i * height * model.option.scale + model.option.oriHeight;
            if (i != 0) {
                let count = 1;
                let timer = setInterval(function () {
                    let add = model.option.oriHeight + changeRate * (count++)
                    var origin = _this.Cesium.Cartesian3.fromDegrees(point.lng, point.lat, add);
                    var modelMatrix = _this.Cesium.Transforms.eastNorthUpToFixedFrame(origin);
                    model.modelMatrix = modelMatrix;
                    if (count >= (time / interval)) {
                        model.option.currentHeight=add;
                        clearInterval(timer)
                        timer = null;
                    }
                    // console.log(count)
                }, interval)
                this.timers.push(timer)
            }
        }
    }

    /**
     * 楼层还原
     */
     resetAll() {
        let _this = this
        this.clearFloorTimers()
        let point = this.position; //楼栋位置
        for (let i = 0; i < this.modelArr.length; i++) {
            let model = this.modelArr[i];
            var origin = _this.Cesium.Cartesian3.fromDegrees(point.lng, point.lat, model.option.oriHeight);
            var modelMatrix = _this.Cesium.Transforms.eastNorthUpToFixedFrame(origin);
            model.option.currentHeight=model.option.oriHeight
            model.modelMatrix = modelMatrix;
            model.show = true;
        }
    }

    /**
     * 合并楼层动画
     */
     unionAll (height, time, interval = 100) {
        let _this = this
        let point = this.position; //楼栋位置
        this.clearFloorTimers()
        for (let i = 0; i < this.modelArr.length; i++) {
            let model = this.modelArr[i];
            // 如果是初始位置，代表已经为合并状态。
            if(model.option.currentHeight==model.option.oriHeight){
                continue;
            }
            let currentHeight = model.option.oriHeight + (i * height * model.option.scale);
            let changeRate = Number((i * height * model.option.scale)) * (interval / time)
            model.show = true;
            let count = 1;
            let timer = setInterval(function () {
                let add = currentHeight - changeRate * (count++)
                var origin = _this.Cesium.Cartesian3.fromDegrees(point.lng, point.lat, add);
                var modelMatrix = _this.Cesium.Transforms.eastNorthUpToFixedFrame(origin);
                model.modelMatrix = modelMatrix;
                if (count >= (time / interval)) {
                    var origin = _this.Cesium.Cartesian3.fromDegrees(point.lng, point.lat, model.option.oriHeight);
                    var modelMatrix = _this.Cesium.Transforms.eastNorthUpToFixedFrame(origin);
                    model.modelMatrix = modelMatrix;
                    model.option.currentHeight=model.option.oriHeight
                    clearInterval(timer)
                }
            }, interval)
            this.timers.push(timer)
        }
    }

        /**
         * 显示指定楼层
         *
         * @param {Number} maxHeight 指定从顶部落下的高度
         * @param {Number} floorNum 指定显示的楼层，第1层开始
         * @param {Number} [time=1000] 楼层下落需要时间,单位:毫秒
         * @param {Number} [interval=100] 楼层下落触发间隔时间,单位:毫秒
         * @return {void}  无
         */
         openFloorModel (maxHeight = 120, floorNum, time = 1000, interval = 100) {
            let _this = this
            this.clearFloorTimers();
            floorNum--;
            let point = this.position; //楼栋位置
            for (let i = floorNum; i < this.modelArr.length; i++) {
                let model = this.modelArr[i];
                var origin = _this.Cesium.Cartesian3.fromDegrees(point.lng, point.lat, model.option.oriHeight + maxHeight);
                var modelMatrix = _this.Cesium.Transforms.eastNorthUpToFixedFrame(origin);
                model.modelMatrix = modelMatrix;
                model.show = false;
                model.option.currentHeight=model.option.oriHeight + maxHeight
            }
            for (let j = 0; j <= floorNum; j++) {
                let model = this.modelArr[j];
                console.log(model)
                 // 如果是初始位置，代表已经为合并状态。
                 model.show = true;
                 if(model.option.currentHeight==model.option.oriHeight&&j!=floorNum){
                    continue;
                }
                
                let currentHeight = model.option.oriHeight + maxHeight;
                let changeRate = maxHeight * (interval / time)
                let count = 1;
                let timer = setInterval(function () {
                    let add = currentHeight - changeRate * (count++)
                    var origin = _this.Cesium.Cartesian3.fromDegrees(point.lng, point.lat, add);
                    var modelMatrix = _this.Cesium.Transforms.eastNorthUpToFixedFrame(origin);
                    model.modelMatrix = modelMatrix;
                    if (count >= (time / interval)) {
                        var origin = _this.Cesium.Cartesian3.fromDegrees(point.lng, point.lat, model.option.oriHeight);
                        var modelMatrix = _this.Cesium.Transforms.eastNorthUpToFixedFrame(origin);
                        model.modelMatrix = modelMatrix;
                        model.option.currentHeight=model.option.oriHeight
                        clearInterval(timer)
                    }
                }, interval)
                this.timers.push(timer)
            }
 
        }

    clearFloorTimers () {
        if (this.timers.length > 0) {
            this.timers.forEach(t => {
                if (t) {
                    clearInterval(t)
                }
            })
        }
        this.timers = [];
    }

    /**
     * 楼栋透明
     */
    floorLucency(){
        let _this = this
        for (let i = 0; i < _this.modelArr.length; i++) {
            let modelItem = _this.modelArr[i]
            // console.log(modelItem)
            // 透明
            modelItem.color = _this.Cesium.Color.WHITE.withAlpha(0.1);
        }
    }

     /**
     * 修改3DTiles位置
     */
    update3dtilesMaxtrix(Cesium,params,model) {
        //旋转
        let mx = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(params.rx));
        let my = Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(params.ry));
        let mz = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(params.rz));
        let rotationX = Cesium.Matrix4.fromRotationTranslation(mx);
        let rotationY = Cesium.Matrix4.fromRotationTranslation(my);
        let rotationZ = Cesium.Matrix4.fromRotationTranslation(mz);
        //平移
        let position = Cesium.Cartesian3.fromDegrees(params.tx, params.ty, params.tz);
        let m = Cesium.Transforms.eastNorthUpToFixedFrame(position);
        //旋转、平移矩阵相乘
        Cesium.Matrix4.multiply(m, rotationX, m);
        Cesium.Matrix4.multiply(m, rotationY, m);
        Cesium.Matrix4.multiply(m, rotationZ, m);
        //赋值给model
        if (Cesium.defined(model.primitive)) {
            model.primitive.modelMatrix = m;
        }
        model.modelMatrix = m;
        model.color = Cesium.Color.WHITE.withAlpha(1);
    }

    /**
     * 清空楼栋
     */
    clearAll(){
        if(this.modelArr.length>0){
            this.modelArr.forEach(m=>{
                window.viewer.scene.primitives.remove(m)
            })
        }
    }
}