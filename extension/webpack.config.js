const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: {
      background: './src/background.ts',
      content: './src/content.ts',
      popup: './src/popup.ts',
      'site-detector': './src/site-detector.ts',
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: 'src/manifest.json', to: 'manifest.json' },
          { from: 'src/icons', to: 'icons', noErrorOnMissing: true },
          { from: 'src/test.html', to: 'test.html', noErrorOnMissing: true },
        ],
      }),
      new HtmlWebpackPlugin({
        template: './src/popup.html',
        filename: 'popup.html',
        chunks: ['popup'],
        inject: 'body',
      }),
    ],
    devtool: isProduction ? false : 'cheap-module-source-map',
    optimization: {
      minimize: isProduction,
    },
    watchOptions: {
      ignored: /node_modules/,
    },
  };
};
