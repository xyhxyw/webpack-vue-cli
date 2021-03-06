const path = require('path') // 路径处理模块
const merge = require('webpack-merge');
const webpack = require('webpack');
const common = require('./webpack.base.js');

const PurifyCssWebpack = require('purifycss-webpack') // 引入PurifyCssWebpack插件
const glob = require('glob') // 引入glob模块,用于扫描全部html文件中所引用的css
const MiniCssExtractPlugin = require("mini-css-extract-plugin") //引入css分离插件
// const UglifyJsPlugin = require("uglifyjs-webpack-plugin") // 压缩js代码
// const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin') // 多线程压缩代码
const TerserPlugin = require('terser-webpack-plugin') // 压缩js代码
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin") // 压缩css代码
const { HashedModuleIdsPlugin } = require('webpack');

module.exports = merge(common, {
  output: {
    path: path.join(__dirname, '/dist'), //打包后的文件存放的地方
    filename: 'js/[name].[chunkhash:8].js',
    chunkFilename: 'js/[name].[chunkhash:8].js'
  },
  mode: 'production',// 设置mode
  module: {
    rules: [
      {
        test: /\.(le|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../'
            },
          },
          'css-loader',
          'postcss-loader',
          'less-loader',
        ]
      }
    ]
  },
  plugins: [
    // new HtmlWebpackPlugin({
    //   template: path.join(__dirname, '/index.html') // new一个这个插件的实例，并传入相关的参数
    // }),
    // new CleanWebpackPlugin(), // 所要清理的文件夹名称
    new PurifyCssWebpack({
      paths: glob.sync(path.join(__dirname, '*.html')) // 同步扫描所有html文件中所引用的css
    }),
    new MiniCssExtractPlugin({
      filename: "css/[name].[contenthash:8].css",
      chunkFilename: 'css/[id].[contenthash:8].css'
    })
  ],
  optimization: {
    // 分离chunks
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          name: "vendor",
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: "initial" // 只打包初始时依赖的第三方
        },
      }
    },
    minimizer: [
      // 压缩JS
      // new UglifyJsPlugin({
      //   uglifyOptions: {
      //     compress: {
      //       drop_debugger: true, // 去除debugger
      //       drop_console: true // 去除console.log
      //     }
      //   },
      //   cache: true, // 开启缓存
      //   parallel: true, // 平行压缩
      //   sourceMap: false 
      // }),
      new TerserPlugin({
        parallel: 4, // 开启几个进程来处理压缩，默认是 os.cpus().length - 1
        cache: true, // 是否缓存
        sourceMap: false
      }),
      // 压缩css
      new OptimizeCSSAssetsPlugin({})
    ]
  }
})