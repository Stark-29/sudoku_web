const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./public/sudo.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "public", "dist"),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        type: "asset/resource",
      },
    ],
  },
  devServer: {
    static: path.resolve(__dirname, "public"),
    hot: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html", // Ruta al archivo HTML de tu carpeta public
      filename: "index.html", // Nombre del archivo HTML generado
      inject: "head", // Inyectar los scripts al final del body
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "public/styles.css", to: "styles.css" },
        { from: "public/assets", to: "assets" },
      ],
    }),
  ],
};
