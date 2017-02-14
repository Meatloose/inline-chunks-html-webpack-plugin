var sourceMappingURL = require('source-map-url');
var _ = require('lodash');

function InlineChunkPlugin(options) {
  this.options = Object.assign({ inlineChunks: [] }, options);
}

InlineChunkPlugin.prototype.apply = function(compiler) {
  var me = this

  compiler.plugin('compilation', function(compilation) {

    compilation.plugin('html-webpack-plugin-alter-asset-tags', (htmlPluginData, callback) => {
      var inlineChunks = me.options.inlineChunks
      var deleteFile = me.options.deleteFile
      var publicPath = compilation.options.output.publicPath || '';

      if (publicPath && publicPath.substr(-1) !== '/') {
        publicPath += '/';
      }

      _.each(inlineChunks, function(chunkName) {
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

        console.log("inline-chunks-html-webpack-plugin: Inlined " + chunkPath);

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
    });
  });
}

module.exports = InlineChunkPlugin
