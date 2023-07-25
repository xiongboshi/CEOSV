import * as Cesium from "cesium";
    /**
     * 光锥图元
     */
    var Cartesian3 = Cesium.Cartesian3
    , ComponentDatatype = Cesium.ComponentDatatype
    , PrimitiveType = Cesium.PrimitiveType
    , BoundingSphere = Cesium.BoundingSphere
    , GeometryAttribute = Cesium.GeometryAttribute
    , GeometryPipeline = Cesium.GeometryPipeline
    , Geometry = Cesium.Geometry
    , defined = Cesium.defined
    , RenderState = Cesium.RenderState
    , ShaderSource = Cesium.ShaderSource
    , ShaderProgram = Cesium.ShaderProgram
    , DrawCommand = Cesium.DrawCommand
    , RenderState = Cesium.RenderState
    , Pass = Cesium.Pass
    , Appearance = Cesium.Appearance
    , BufferUsage = Cesium.BufferUsage
    , Color = Cesium.Color
    , VertexArray = Cesium.VertexArray
    , Pass = Cesium.Pass
    , buildModuleUrl = Cesium.buildModuleUrl
    , Matrix4 = Cesium.Matrix4
    , Matrix3 = Cesium.Matrix3
    , Texture = Cesium.Texture
    , Resource = Cesium.Resource
    , Transforms = Cesium.Transforms
    , defaultValue = Cesium.defaultValue;

    function TetrahedronPrimitive(viewer,options) {
        console.log(options)
        this.show = true;
        this._command = undefined;
        this._enuMatrix = undefined;
        this._scaleMatrix = undefined;
        this._localPosition = options.position
        this._createCommand = createCommand;
        this._angle = 0;
        this._distance = defaultValue(options.distance, 1);
        this._setInterval = undefined;
        this._viewer = viewer;
        this._speed = defaultValue(options.speed, 1.0);
        this._color = defaultValue(options.color, new Color(1.0, 1.0, 0.0, 0.8));
        this._scale = defaultValue(options.scale, new Cartesian3(10, 10, 15));
        this._texture = undefined;
        this._imageUrl = buildModuleUrl('/static/img/fence.png');
        this._modelMatrix = computeModelMatrix(this);
        this._height = computeHeight(this);
        createTexture(this);
    }
    TetrahedronPrimitive.prototype.update = function (frameState) {
    if (!this.show) {
        return;
    }
    if (!defined(this._command)) {
        this._command = this._createCommand(frameState.context, this);
        this._command.pickId = 'v_pickColor';
    }
    if (defined(this._command)) {
        frameState.commandList.push(this._command);
    }
    }
    TetrahedronPrimitive.prototype.isDestroyed = function () {
    return false;
    }
    TetrahedronPrimitive.prototype.destroy = function () {
    if (defined(this._command)) {
        this._command.shaderProgram = this._command.shaderProgram && this._command.shaderProgram.destroy();
    }
    return destroyObject(this);
    }
    //开启动画
    TetrahedronPrimitive.prototype.startAnimate = function () {
    let that = this;
    this._setInterval = setInterval(animateFunc, 5);
    function animateFunc() {
        that._angle = that._angle + 0.01;
        Math.sin(that._angle) > 0 ? that._height = 0.01 : that._height = -0.01;
        let translation = new Cesium.Cartesian3(0, 0, that._height);
        Matrix4.multiplyByTranslation(that._modelMatrix, translation, that._modelMatrix)
        let rotationZ = Matrix4.fromRotationTranslation(Matrix3.fromRotationZ(Cesium.Math.toRadians(that._speed)));
        Matrix4.multiply(that._modelMatrix, rotationZ, that._modelMatrix);
    }
    }
    //关闭动画
    TetrahedronPrimitive.prototype.closeAnimate = function () {
    clearInterval(this._setInterval);
    }
    //创建command
    function createCommand(context, tetrahedronPrimitive) {
    var translucent = false;
    var closed = true;
    var vs = creaateVertexShader();
    var fs = createFragmentShader();
    // Appearance.getDefaultRenderState
    var rawRenderState = Appearance.getDefaultRenderState(translucent, closed, undefined);
    var renderState = RenderState.fromCache(rawRenderState);
    var vertexShaderSource = new ShaderSource({
        sources: [vs]
    });
    var fragmentShaderSource = new ShaderSource({
        sources: [fs]
    });
    var uniformMap = {
        color: function () {
            return tetrahedronPrimitive._color;
        },
        myImage: function () {
            if (defined(tetrahedronPrimitive._texture)) {
                return tetrahedronPrimitive._texture;
            } else {
                return tetrahedronPrimitive._viewer.scene.context.defaultTexture;
            }
        }
    }
    let attributeLocations = {
        position: 0,
        textureCoordinates: 1
    };
    var shaderProgram = ShaderProgram.fromCache({
        context: context,
        vertexShaderSource: vertexShaderSource,
        fragmentShaderSource: fragmentShaderSource,
        attributeLocations: attributeLocations
    });
    return new DrawCommand({
        vertexArray: createVertexArray(context),
        primitiveType: PrimitiveType.TRIANGLES,
        renderState: renderState,
        shaderProgram: shaderProgram,
        uniformMap: uniformMap,
        owner: this,
        pass: Pass.TRANSLUCENT,
        modelMatrix: tetrahedronPrimitive._modelMatrix,
    });
    }
    //创建vertexArray
    function createVertexArray(context) {
    let attributeLocations = {
        position: 0,
        textureCoordinates: 1
    };
    var positionsAndIndice = cereatePositionsAndIndice();
    var geometry = new Geometry({
        attributes: {
            position: new GeometryAttribute({
                // 使用double类型的position进行计算
                // componentDatatype : Cesium.ComponentDatatype.DOUBLE,
                componentDatatype: ComponentDatatype.FLOAT,
                componentsPerAttribute: 3,
                values: positionsAndIndice.positions
            }),
            textureCoordinates: new GeometryAttribute({
                componentDatatype: ComponentDatatype.FLOAT,
                componentsPerAttribute: 2,
                values: positionsAndIndice.sts
            }),
        },
        // Workaround Internet Explorer 11.0.8 lack of TRIANGLE_FAN
        indices: positionsAndIndice.indices,
        primitiveType: PrimitiveType.TRIANGLES,
        boundingSphere: BoundingSphere.fromVertices(positionsAndIndice.positions)
    });
    //计算geometry的法向量
    var geometryNormal = GeometryPipeline.computeNormal(geometry);
    var vertexArray = VertexArray.fromGeometry({
        context: context,
        geometry: geometryNormal,
        attributeLocations: attributeLocations,
        bufferUsage: BufferUsage.STATIC_DRAW,
    });

    return vertexArray;
    }
    //创建顶点数组与索引
    function cereatePositionsAndIndice() {
    var positions = new Float64Array(5 * 3);
    // position 0
    positions[0] = 0.0;
    positions[1] = 1.0;
    positions[2] = 0.0;

    // position 1
    positions[3] = -1.0;
    positions[4] = 0.0;
    positions[5] = 0.0;

    // position 2
    positions[6] = 0.0;
    positions[7] = -1.0;
    positions[8] = 0.0;

    // position 3
    positions[9] = 1.0;
    positions[10] = 0.0;
    positions[11] = 0.0;

    // position 4
    positions[12] = 0.0;
    positions[13] = 0.0;
    positions[14] = -1.0;
    var indices = new Uint16Array(6 * 3);
    // back triangle
    indices[0] = 4;
    indices[1] = 2;
    indices[2] = 3;

    // left triangle
    indices[3] = 4;
    indices[4] = 3;
    indices[5] = 0;

    // right triangle
    indices[6] = 4;
    indices[7] = 0;
    indices[8] = 1;

    // bottom triangle
    indices[9] = 4;
    indices[10] = 1;
    indices[11] = 2;
    // bottom triangle
    indices[12] = 1;
    indices[13] = 2;
    indices[14] = 3;

    // bottom triangle
    indices[15] = 1;
    indices[16] = 3;
    indices[17] = 0;

    // 1.3 定义纹理数组
    var sts = new Float32Array([
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0,
        0.0, 1.0, 0.5, 0.5,
    ]);
    return {
        indices: indices,
        positions: positions,
        sts: sts
    }
    }
    //创建顶点着色器
    function creaateVertexShader() {
    var vertexShader =
        `
    attribute vec3 position;
    attribute vec3 normal;
    attribute vec2 st;
    attribute float batchId;
    varying vec3 v_positionEC;
    varying vec3 v_normalEC;
    varying vec2 v_st;
    varying vec4 v_pickColor;
    void main()
    {
        v_positionEC = (czm_modelView * vec4(position, 1.0)).xyz;       // position in eye coordinates
        v_normalEC = czm_normal * normal;                               // normal in eye coordinates
        v_st = st;
        //v_pickColor = czm_batchTable_pickColor(batchId);
        gl_Position = czm_modelViewProjection * vec4(position, 1.0);
    }
    `;
    return vertexShader;
    }
    //创建片源着色器
    function createFragmentShader() {
    var fragmentShader =
        `
    varying vec3 v_positionEC;
    varying vec3 v_normalEC;
    varying vec2 v_st;
    uniform vec4 color;
    varying vec4 v_pickColor;
    uniform sampler2D myImage;
    void main()
    {
        vec3 positionToEyeEC = -v_positionEC;
        vec3 normalEC = normalize(v_normalEC);
    #ifdef FACE_FORWARD
        normalEC = faceforward(normalEC, vec3(0.0, 0.0, 1.0), -normalEC);
    #endif
        czm_materialInput materialInput;
        materialInput.normalEC = normalEC;
        materialInput.positionToEyeEC = positionToEyeEC;
        materialInput.st = v_st;
        vec2 st = materialInput.st;
        czm_material material = czm_getDefaultMaterial(materialInput);
        float dt_a11 = fract(czm_frameNumber / 100.0) * 3.14159265 * 2.0;
        float dt_a12 = sin(dt_a11);
        float vst=smoothstep(0.7, 1.0, dt_a12)+0.4;
        vec4 colorImage = texture2D(myImage, vec2(fract(st.s- czm_frameNumber*0.003), st.t));
        material.alpha =mix(0.1,1.0,clamp((1.0-st.t) * color.a,0.0,1.0)) +(1.0-sign(st.t-czm_frameNumber*0.001))*0.2*(1.0-colorImage.r)+0.4 ;
        material.diffuse =(1.0-colorImage.a)*vec3(1.0,2.0,1.0)+colorImage.rgb*vec3(1.0,2.0,1.0);
    #ifdef FLAT
        gl_FragColor = vec4(material.diffuse + material.emission, material.alpha);
    #else
        gl_FragColor = czm_phong(normalize(positionToEyeEC), material, czm_lightDirectionEC);
    #endif
    }
    `;
    return fragmentShader;
    }
    //创建纹理
    function createTexture(tetrahedronPrimitive) {

    Resource.createIfNeeded(tetrahedronPrimitive._imageUrl).fetchImage().then(function (image) {
        var vTexture;
        var context = tetrahedronPrimitive._viewer.scene.context;
        if (defined(image.internalFormat)) {
            vTexture = new Texture({
                context: context,
                pixelFormat: image.internalFormat,
                width: image.naturalWidth,
                height: image.naturalHeight,
                source: {
                    arrayBufferView: image.bufferView
                }
            });
        } else {
            vTexture = new Texture({
                context: context,
                source: image
            });
        }
        tetrahedronPrimitive._texture = vTexture;
    });
    }
    //计算矩阵
    function computeModelMatrix(tetrahedronPrimitive) {
    let enuMatrix = Transforms.eastNorthUpToFixedFrame(tetrahedronPrimitive._localPosition);
    let scaleMatrix = Matrix4.fromScale(tetrahedronPrimitive._scale);
    let modelMatrix = Matrix4.multiply(enuMatrix, scaleMatrix, new Matrix4());
    tetrahedronPrimitive._scaleMatrix = scaleMatrix;
    tetrahedronPrimitive._enuMatrix = enuMatrix;
    return modelMatrix;
    }
    //计算高度
    function computeHeight(tetrahedronPrimitive) {
    let point = Cartesian3.fromElements(0, 0, tetrahedronPrimitive._distance, new Cesium.Cartesian3());
    let enuPoint = Cesium.Matrix4.multiplyByPoint(tetrahedronPrimitive._enuMatrix, point, new Cartesian3());
    let upPositionEC = Matrix4.multiplyByPoint(tetrahedronPrimitive._viewer.scene.camera._viewMatrix, enuPoint, new Cartesian3());
    let upPositionPC = Matrix4.multiplyByPoint(tetrahedronPrimitive._viewer.scene.camera.frustum.projectionMatrix, upPositionEC, new Cartesian3());
    return Cartesian3.normalize(upPositionPC, new Cartesian3()).z;
    }

    Cesium.TetrahedronPrimitive = TetrahedronPrimitive;
