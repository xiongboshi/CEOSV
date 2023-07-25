import * as Cesium from "cesium";
/**
     * 局部粒子下雨效果
     */
export function setParticleRain(viewer,box) {
    console.log('viewer.clock.startTime===>',viewer.clock.startTime)
    console.log('Cesium.JulianDate.now()===>',Cesium.JulianDate.now())
    console.log('Cesium.version====>99999  ',Cesium.VERSION)
    var gravityVector = new Cesium.Cartesian3();
    var graviry = -6;
    viewer.scene.primitives.add(
        new Cesium.ParticleSystem({
        image: "/static/img/rain.png",
        // 设置初始颜色
        startColor: Cesium.Color.WHITE,
        // 设置结束的颜色
        endColor: Cesium.Color.WHITE.withAlpha(0.1),
        imageSize: new Cesium.Cartesian2(10, 10),
        // 设置发射器
        // 圆形发射器
        // emitter: new Cesium.CircleEmitter(200),
        // 矩形发射器
        emitter: new Cesium.BoxEmitter(new Cesium.Cartesian3(75000, 10000, 10000)),
        // 锥型设置
        // emitter: new Cesium.ConeEmitter(Math.PI / 4),
        // 球体发射器
        // emitter: new Cesium.SphereEmitter(500),
        startScale: 1.0,
        endScale: 4.0,
        particleLife: 5.0,
        // speed: 1.0,
        // 设置随机的速度
        minimumSpeed: 1.0,
        maximumSpeed: 10.0,
        // 每秒钟设置粒子发射的数量
        emissionRate: 800,
        // 控制发射在不同阶段的数量
        bursts: [
            new Cesium.ParticleBurst({
            time: 0.0,
            minimum: 2,
            maximum: 5,
            }),
            new Cesium.ParticleBurst({
            time: 10.0,
            minimum: 100,
            maximum: 150,
            }),
            new Cesium.ParticleBurst({
            time: 15.0,
            minimum: 5,
            maximum: 10,
            }),
        ],
        lifetime: 15.0,
    
        // 设置粒子随机的大小
        minimumImageSize: new Cesium.Cartesian2(10, 10),
        maximumImageSize: new Cesium.Cartesian2(40, 40),
        modelMatrix: box.computeModelMatrix(
            // viewer.clock.startTime,
            Cesium.JulianDate.now(),
            new Cesium.Matrix4()
        ),
        updateCallback: (p, dt) => {
            var position = p.position;
            Cesium.Cartesian3.normalize(position, gravityVector);
            Cesium.Cartesian3.multiplyByScalar(
                gravityVector,
                graviry,
                gravityVector
            );
    
            p.velocity = Cesium.Cartesian3.add(
                p.velocity,
                gravityVector,
                p.velocity
            );
        },
        })
    );
    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(106.511749,29.541279,
            19000),
        orientation:{ 
            heading: 0.5884413259732771, //旋转角 正东为90°
            pitch: Cesium.Math.toRadians(-35), //俯仰角，水平为0°
            roll: 0.0014112073156402616     //翻滚角
        }
    })
}


/**
     * 局部粒子烟雾效果
     */
function setParticleSmoke(viewer,box){
    viewer.scene.primitives.add(
        new Cesium.ParticleSystem({
        image: "/static/img/smoke2.png",
        // 设置初始颜色
        startColor: Cesium.Color.YELLOW,
        // 设置结束的颜色
        endColor: Cesium.Color.WHITE.withAlpha(0.1),
        imageSize: new Cesium.Cartesian2(20, 20),
        // 设置发射器
        // 圆形发射器
        // emitter: new Cesium.CircleEmitter(200),
        // 矩形发射器
        // emitter: new Cesium.BoxEmitter(new Cesium.Cartesian3(100, 100, 1000)),
        // 锥型设置
        // emitter: new Cesium.ConeEmitter(Math.PI / 4),
        // 球体发射器
        emitter: new Cesium.SphereEmitter(500),
        startScale: 1.0,
        endScale: 4.0,
        particleLife: 5.0,
        speed: 1.0,
    
        emissionRate: 6,
    
        lifetime: 15.0,
        modelMatrix: box.computeModelMatrix(
            viewer.clock.startTime,
            new Cesium.Matrix4()
        ),
        })
    );
}

Cesium.setParticleRain = setParticleRain
Cesium.setParticleSmoke = setParticleSmoke

