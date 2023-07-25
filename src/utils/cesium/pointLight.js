
import * as Cesium from "cesium";
// 点光源
function addPointLight(centerLngLat,bounds,range) {

    let fragmentShader = `
        uniform sampler2D colorTexture;
        uniform sampler2D depthTexture;
        varying vec2 v_textureCoordinates;
        uniform vec3 lightCenter;

        #define PI 3.1415926535897932384626433832795

        float getDepth(in vec4 depth){
            float z_window = czm_unpackDepth(depth);
            z_window = czm_reverseLogDepth(z_window);
            float n_range = czm_depthRange.near;
            float f_range = czm_depthRange.far;
            return (2.0 * z_window - n_range - f_range) / (f_range - n_range);
        }

        vec4 toWorldPos(in vec2 uv,in float depth){
            vec2 xy = vec2((uv.x * 2.0 - 1.0) , (uv.y * 2.0 - 1.0));
            vec4 posInCamera = czm_inverseProjection * vec4(xy ,depth , 1.0);
            posInCamera = posInCamera / posInCamera.w;
            return czm_inverseModelView * posInCamera;
        }

        void main(){
            vec4 optColor = texture2D(colorTexture, v_textureCoordinates);

            float depth = getDepth(texture2D(depthTexture, v_textureCoordinates));
            vec4 worldPos = toWorldPos(v_textureCoordinates, depth);

            float distanceToLight = distance(worldPos, vec4(lightCenter, 1.0));

            vec3 lightDir = lightCenter - worldPos.xyz / worldPos.w;
            vec3 invLight = normalize(czm_inverseView * vec4(lightDir ,0.0)).xyz;
            
            vec3 eyeDir = worldPos.xyz;
            vec3 invEye = normalize(czm_inverseView * vec4(eyeDir ,0.0)).xyz;

            float angle = acos(dot(invLight, invEye));

            if(angle < PI * 30.0 / 180.0){
                gl_FragColor = optColor * 1.6;
            }else{
                gl_FragColor = optColor;
            }

        }
    `

    let _time = new Date().getTime();

    let latDir = 1
    let lngDir = 1

    let pointLightStage = new Cesium.PostProcessStage({
        fragmentShader,

        uniforms: {
            lightCenter: function () {

                let delta = range * Math.sin((new Date().getTime() - _time) * 0.012 * Math.PI / 180)

                centerLngLat[0] += (delta * latDir)
                centerLngLat[1] += (delta * lngDir)

                if (centerLngLat[0] > bounds.max[0] || centerLngLat[0] < bounds.min[0]) latDir *= -1
                if (centerLngLat[1] > bounds.max[1] || centerLngLat[1] < bounds.min[1]) lngDir *= -1

                let center = Cesium.Cartesian3.fromDegreesArrayHeights(centerLngLat)[0]
                return center;
            },
        }
    })

    return pointLightStage
}
export{
    addPointLight
}