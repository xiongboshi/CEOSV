const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  publicPath: './',
  // outputDir: './dist',
  // assetsDir:'./public',
  // indexPath: './index.html',
  // lintOnSave: false,
  // parallel:false,
  transpileDependencies: true,
  // productionSourceMap: false,
  devServer: {
    proxy: {
      '/MODELS': {
        target: 'http://tomato_server/MODELS/Beidaihe',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/MODELS/, ""),
      }
    }
  }
})