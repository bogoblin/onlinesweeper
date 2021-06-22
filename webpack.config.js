import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const contentBase = path.resolve(path.resolve(), 'client_dist');

export default {
    entry: './client/client.js',
    resolve: {
        extensions: ['*', '.js', '.jsx']
    },
    output: {
        path: contentBase,
        filename: "[name].bundle.js"
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Online Minesweeper'
        }),
        // new webpack.HotModuleReplacementPlugin(),
    ],
    devServer: {
        contentBase: contentBase,
        hot: true,
    },
    module: {
        rules: [
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: 'babel-loader',
            }
        ]
    },
    mode: 'development',
}