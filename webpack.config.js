// Copyright 2019 British Broadcasting Corporation
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const path = require("path");

const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    "target": "web",
    "mode": "development",
    "entry": [
        "./src/index.es6"
    ],
    "output": {
        "path": path.resolve(__dirname, "dist"),
        "filename": "./bin/js/bundle.js",
        "library": "adhere-lib",
        "libraryTarget": "umd"
    },
    "devServer": {
        "contentBase": "./dist",
        "index": "index.html",
        "watchContentBase": true
    },
    "module": {
        "rules": [{
                "enforce": "pre",
                "test": /\.html$/,
                "loader": "htmllint-loader"
            },
            {
                "test": /\.(es6|js)$/,
                "exclude": /node_modules/,
                "loader": "babel-loader"
            },
            {
                "test": /\.scss$/,
                "use": ExtractTextPlugin.extract({
                    "fallback": "style-loader",
                    "use": [{
                        "loader": "css-loader",
                        "options": {
                            "url": false
                        }
                    }]
                })
            },
            {
                "test": /\.css$/,
                "use": ExtractTextPlugin.extract({
                    "fallback": "style-loader",
                    "use": ["css-loader"]
                })
            },
            {
                "test": /\.html$/,
                "loader": "file-loader?name=[name].[ext]"
            },
            {
                "test": /\.(mp3|mp4|ttml|xml|wav)$/,
                "loader": "file-loader?name=[path][name].[ext]"
            }
        ]
    },
    "plugins": [
        new ExtractTextPlugin({ filename: "bin/css/page.css" })
    ]
};