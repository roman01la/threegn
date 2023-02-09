const { execSync } = require("child_process");
const path = require("path");
const webpack = require("webpack");

const DEV = process.env.DEBUG === "1";

module.exports = {
  mode: DEV ? "development" : "production",
  entry: {
    main: "./src/main.js",
    demo: "./src/demo.js",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  devtool: DEV ? "inline-source-map" : undefined,
  devServer: {
    static: ["./", "./resources"],
  },
  module: {
    rules: [
      {
        test: /\.?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      _DEBUG_: JSON.stringify(process.env.DEBUG === "1"),
      _HASH_: JSON.stringify(execSync("git rev-parse --short HEAD").toString()),
    }),
  ],
};
