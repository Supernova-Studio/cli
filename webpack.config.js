const TerserPlugin = require("terser-webpack-plugin");
const ReplaceInFileWebpackPlugin = require("replace-in-file-webpack-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const path = require("path");
const webpack = require("webpack");

module.exports = (env, argv) => ({
  mode: "production",
  devtool: false,
  target: ["node"],
  node: {
    __dirname: true,
  },
  entry: [
    "./dist/index.js",
  ],
  output: {
    filename: "build.js",
    path: path.resolve(__dirname, "discard"),
    libraryTarget: "commonjs",
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
    new BundleAnalyzerPlugin(),
    new ReplaceInFileWebpackPlugin([{
      dir: "node_modules/@oclif/core/lib",
      files: ["execute.js"],
      rules: [{
        search: "if (options.development)",
        replace: "if (false && options.development)",
      }],
    }]),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  },
});
