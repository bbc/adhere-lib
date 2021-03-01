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

const callbacks = [];
let consoleEnabled = false;
let callbacksEnabled = true;
let videoplayer;
/*eslint no-console: ["error", { allow: ["warn", "error", "log", "dir"] }] */

export default class Logger {

    static log(str) {
        if (videoplayer) {
            str = `${videoplayer.currentTime.toFixed(3).padStart(8, " ")} ${str}`;
        }
        if (consoleEnabled) {
            console.log(str);
        }
        if (callbacksEnabled) {
            callbacks.forEach((cb) => cb(str));
        }
    }

    static addCallback(cb) {
        callbacks.push(cb);
    }

    static enableBrowserLogging(value) {
        consoleEnabled = value;
    }

    static error(str) {
        if (consoleEnabled) {
            console.error(str);
        }
        if (callbacksEnabled) {
            callbacks.forEach((cb) => cb(str));
        }
    }

    static enableCallbacks(value) {
        if (consoleEnabled) {
            console.log(`Setting consoleEnabled to ${ value}.`);
        }
        callbacksEnabled = value;
    }

    static setVideoPlayer(player) {
        videoplayer = player;
        if (videoplayer) {
            this.log("Videoplayer set, log lines will be prefixed with video player currentTime.");
        } else {
            this.log("Videoplayer unset, log lines will not have a timestamp.");
        }
    }
}

module.exports = exports = { Logger };
