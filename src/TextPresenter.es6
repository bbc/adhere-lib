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

// import Logger from "./Logger.es6";
var Logger = require("./Logger.es6").Logger;

const callbacks = [];
const presentedStrings = new Map();
let key = 1; // if you start with zero, the first one never leaves
/*eslint no-console: ["error", { allow: ["warn", "error", "log", "dir"] }] */

export default class TextPresenter {

    static present(str, source) {
        const thisKey = key;
        presentedStrings.set(thisKey, str);
        key++;
        Logger.log(`TP: adding key ${ thisKey } from ${ source }: ${ str }`);
        this.updatePresentedText();
        return thisKey;
    }

    static unPresent(removeKey) {
        // remove the text with the key
        Logger.log(`TP: removing value for key ${ removeKey }`);
        presentedStrings.delete(removeKey);
        this.updatePresentedText();
    }

    static updatePresentedText() {
        let generatedString = "";
        presentedStrings.forEach((v) => {
            generatedString = v; // change = to += to concatenate, or leave as is to just show the last one
        });
        callbacks.forEach((cb) => cb(generatedString));
    }

    static addCallback(cb) {
        callbacks.push(cb);
    }
}

module.exports = exports = { TextPresenter };