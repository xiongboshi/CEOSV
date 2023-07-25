import * as Cesium from "cesium";
import { CesiumHeatmap, HeatmapPoint } from "cesium-heatmap-es6"
import { heatMapPoi } from "./data/heat_points"
/**
 * 热力图
 */
function heatMap(viewer){
    let earthHeatMap
    const defaultDataValue = [10, 300]
    const defaultOpacityValue = [0, 0.5]
    const points = []
    let poi = heatMapPoi.features
    poi.forEach(feature => {
        const lon = feature.geometry.coordinates[0]
        const lat = feature.geometry.coordinates[1]
        points.push({
            x: lon,
            y: lat,
            value: 100 * Math.random()
        })
    })
    earthHeatMap = new CesiumHeatmap(viewer,
        {
            zoomToLayer: true,
            points,
            heatmapDataOptions: { max: defaultDataValue[1], min: defaultDataValue[0] },
            heatmapOptions: {
                maxOpacity: defaultOpacityValue[1],
                minOpacity: defaultOpacityValue[0]
            }
        }
    )
}

export{heatMap}