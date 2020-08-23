const path = require('path')
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


const isDev = process.env.NODE_ENV === 'development' ? true : false;
const isProd = process.env.NODE_ENV === 'production' ? true : false;
let mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';

const optimization = () => {
    const config = {splitChunks: {chunks: 'all'}}
    if (isProd) config.minimizer = [new OptimizeCssAssetsPlugin(), new TerserPlugin()]
    return config;
}

const getStyleLoader = () => {
    return isProd ? MiniCssExtractPlugin.loader : "style-loader";
};

const getPlugins = () => {
    const plugins = [
        new HtmlWebpackPlugin({
            title: "App",
            buildTime: new Date().toString(),
            template: path.resolve(__dirname, "public/index.html")
        }),
        new CleanWebpackPlugin(),
        // new CopyPlugin({
        //     patterns: [
        //         {
        //             from: path.resolve(__dirname, './src/assets/images/webpack.png'),
        //             to: path.resolve(__dirname, './dist/assets/images/app')
        //         }
        //     ],
        // }),
    ];
    if (isProd) {
        plugins.push(new MiniCssExtractPlugin({filename: "css/app-[hash:8].css"}));
        // plugins.push(new BundleAnalyzerPlugin());
    }
    return plugins;
};

module.exports = (env = {}) => {
    return {
        mode: mode,
        entry: {
            index: ["@babel/polyfill", path.resolve(__dirname, "src/index.js")]
        },
        output: {
            filename: isProd ? "[name]-[hash:8].js" : undefined,
            path: path.resolve(__dirname, "dist"),
            publicPath: '/'
        },
        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
        optimization: optimization(),
        module: {// modules
            rules: [
                { // loading .js and .jsx
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    loader: {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/preset-env", "@babel/preset-react"],
                            plugins: ['@babel/plugin-proposal-class-properties']
                        }
                    }
                },
                { // loading .ts and .tsx
                    test: /\.(ts|tsx)$/,
                    exclude: /node_modules/,
                    loader: {
                        loader: "babel-loader",
                        options: {
                            presets: ['@babel/preset-env', "@babel/preset-react", "@babel/preset-typescript"],
                            plugins: ['@babel/plugin-proposal-class-properties']
                        }
                    }
                },
                {// loading .css
                    test: /\.css$/,
                    use: [getStyleLoader(), "css-loader"]
                },
                {// loading .sass .scss
                    test: /\.(scss|sass)$/,
                    use: [getStyleLoader(), "css-loader", "sass-loader"]
                },
                {// loading .less
                    test: /\.(less)$/,
                    use: [getStyleLoader(), "css-loader", "less-loader"]
                },
                {//   loading images
                    test: /\.(png|jpg|jpeg|gif|ico|svg)$/i,
                    use: [
                        {
                            loader: "file-loader",
                            options: {
                                outputPath: "images",
                                name: "[name]-[sha1:hash:12].[ext]"
                            }
                        }
                    ]
                },
                {//  loading fonts
                    test: /\.(ttf|otf|eot|woff|woff2)$/i,
                    use: [
                        {
                            loader: "file-loader",
                            options: {
                                outputPath: "fonts",
                                name: "[name].[ext]"
                            }
                        }
                    ]
                },
                {//  loading audio
                    test: /\.(WAV|AIFF|APE|FLAC|MP3|Ogg)$/i,
                    use: [
                        {
                            loader: "file-loader",
                            options: {
                                outputPath: "audio",
                                name: "[name].[ext]"
                            }
                        }
                    ]
                },
                {//  loading video
                    test: /\.(AVI|OGG|OGM|MKV|MP4|MOV)$/i,
                    use: [
                        {
                            loader: "file-loader",
                            options: {
                                outputPath: "video",
                                name: "[name].[ext]"
                            }
                        }
                    ]
                }
            ]
        },
        plugins: getPlugins(),
        devServer: {
            // ռոուտինգի նորմալ աշխատանքի համար պարտադիրա
            historyApiFallback: true,
            port: 9001,
            overlay: true,
            open: true,
            proxy: {"/api/**": {target: 'http://localhost:5000', secure: false}}
        }
    };
};
