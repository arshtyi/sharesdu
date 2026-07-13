const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  // The supported browsers are modern evergreen browsers. Transpiling every
  // package forces large ESM libraries (notably @mdi/js) through Babel and
  // prevents webpack from tree-shaking unused exports effectively.
  transpileDependencies: [],
  publicPath: process.env.NODE_ENV === 'production' ? './' : './',
  chainWebpack: config => {
    config.plugin('html').tap(args => {
      args[0].title = '充实的大学生活';
      return args;
    });
  },
  configureWebpack: {
    optimization: {
      splitChunks: {
        cacheGroups: {
          // These libraries are only used by lazy pages/features. Keep them out
          // of the initial vendor bundle even when several async chunks share
          // the same dependency.
          dexie: {
            test: /[\\/]node_modules[\\/]dexie[\\/]/,
            name: 'dexie',
            chunks: 'all',
            priority: 100,
            enforce: true,
            reuseExistingChunk: false,
          },
          darkReader: {
            test: /[\\/]node_modules[\\/]darkreader[\\/]/,
            name: 'dark-reader',
            chunks: 'async',
            priority: 30,
            enforce: true,
          },
        },
      },
    },
  },
  devServer: {
    proxy: {},
    /**
     * here to ignore the error of webpack-dev-server
     */
    client: {
      overlay: false
    },

  }
});
