Inline Chunks Webpack Plugin
===================

This is a [webpack](http://webpack.github.io/) plugin that inline your chunks that is written as links or script using [HtmlWebpackPlugin](https://github.com/ampedandwired/html-webpack-plugin).
It can be use to inline manifest within script tag to save a http request as described in [this example](https://github.com/webpack/webpack/tree/master/examples/chunkhash). It is not limited to manifest chunk but can inline any other chunk.

This plugin requires [HtmlWebpackPlugin](https://www.npmjs.com/package/html-webpack-plugin) v2.10.0 and above. 

Installation
------------
Install the plugin with npm:
```shell
npm install inline-chunks-html-webpack-plugin --save-dev
```

Configuration
-----------
- `inlineChunks`: An array of names of chunk to inline.
   - `chunk.ext`: A chunk with file extension to distinguish of the same name
- `deleteFile`: delete file from asset default to `false`
```javascript
//webpack.config
const InlineChunksWebpackPlugin = require('inline-chunks-html-webpack-plugin');
module.exports = {
    //.....
    //.....
    plugins: [
      //...
      //...
      new InlineChunksWebpackPlugin({
        inlineChunks: ['manifest'],
        deleteFile: true // do not build chunks
      })
    //...
    ]
    //.....
    //.....
}
```
Example Usage
-----------

[Webpack](http://webpack.github.io/)'s runtime changes with every build. For effective long-term caching, we separate the runtime code in manifest.js. This manifest.js is very small and increases our startup time as it is a separate http request. Inlining the generated manifest.js in the index.html is a solution.

Split webpack runtime in manifest and inline it.
```javascript
// for explicit vendor chunk config
{
  entry: {
    app: './main.js',
    vendor: ['react','redux']
  },
  output: {
    path: path.join(__dirname, "js"),
    filename: "[name].[chunkhash].js",
    chunkFilename: "[chunkhash].js"
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor'
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      chunks: ['vendor']
    }),
    // extract css into its own file
    new ExtractTextPlugin('[name].[contenthash].css'),
    new HtmlWebpackPlugin({
      // your options
    }),
    new InlineChunksWebpackPlugin({
      inlineChunks: ['manifest', 'app.css'],
      deleteFile: true
	})
  ]
}
```

# License

This project is licensed under [MIT](https://github.com/ampedandwired/html-webpack-plugin/blob/master/LICENSE).