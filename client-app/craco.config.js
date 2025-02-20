const webpack = require("webpack");
const {CracoAliasPlugin} = require('react-app-alias')

module.exports = {
  babel: {
    plugins: ["@babel/plugin-syntax-import-assertions"],
  },
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        'process/browser': require.resolve('process/browser')
      };
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        vm: false,
        process: require.resolve("process/browser"),
      };

      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.ProvidePlugin({
          process: 'process/browser',  // Ensure process is provided globally
          Buffer: ['buffer', 'Buffer'], // Optional, if buffer is required
        })
      ];

      return webpackConfig;
    },
  },
  plugins: [
    {
      plugin: CracoAliasPlugin,
      options: {}
    }
  ]

};
