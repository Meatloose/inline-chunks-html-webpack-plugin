var sourceMappingURL = require('source-map-url');
var _ = require('lodash');

function InlineChunkPlugin(options) {
  this.options = Object.assign({ inlineChunks: [], quiet: false }, options);
}

InlineChunkPlugin.prototype.log = function (message) {
  if (!this.options.quiet) {
    console.log(message);
  }
};

InlineChunkPlugin.prototype.performInlining = function (compilation, htmlPluginData, callback) {
  var me = this;

  var deleteFile = me.options.deleteFile

  var publicPath = compilation.options.output.publicPath || '';
  if (publicPath && publicPath.substr(-1) !== '/') {
    publicPath += '/';
  }
  _.each(me.options.inlineChunks, function (chunkName) {
        var separator = /\./;
        var splitUp = chunkName.split(separator);
        var name = splitUp[0];
        var ext = splitUp[1];
        var matchedChunk = _.filter(compilation.chunks, function(chunk) {
          return chunk.name === name
        })[0];
        var chunkPath = (ext && _.filter(matchedChunk.files, function(file) {
          return file.indexOf(ext) > -1
        }) || matchedChunk.files)[0];

    me.log("html-webpack-inline-chunk-plugin: Inlined " + chunkPath);
    if (chunkPath) {
      var path = publicPath + chunkPath;
      var head = _.find(htmlPluginData.head, { attributes: { href: path } });
      var body = _.find(htmlPluginData.body, { attributes: { src: path } });
      var tag = head || body;

      if (tag) {
        if (tag.tagName === 'script') {
          delete tag.attributes.src;
        } else if (tag.tagName === 'link') {
          tag.tagName = 'style';
          tag.closeTag = true;
          tag.attributes.type = 'text/css';

          delete tag.voidTag;
          delete tag.attributes.href;
          delete tag.attributes.rel;
        };
        tag.innerHTML = sourceMappingURL.removeFrom(compilation.assets[chunkPath].source());
      }
      if (deleteFile) {
        delete compilation.assets[chunkPath]
      }
    }
  });
  callback(null, htmlPluginData);
};

InlineChunkPlugin.prototype.apply = function (compiler) {
  var me = this;

  if (compiler.hooks) {
    // webpack 4 support
    compiler.hooks.compilation.tap('HtmlWebpackInlineChunkPlugin', function (compilation) {
      compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync('HtmlWebpackInlineChunkPlugin', function (htmlPluginData, callback) {
        me.performInlining(compilation, htmlPluginData, callback);
      });
    });
  } else {
    compiler.plugin('compilation', function (compilation) {
      compilation.plugin('html-webpack-plugin-alter-asset-tags', function (htmlPluginData, callback) {
        me.performInlining(compilation, htmlPluginData, callback);
      });
    });
  }
};

module.exports = InlineChunkPlugin;
