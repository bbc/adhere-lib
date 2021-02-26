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

import AudioNub from "./AudioNub.es6";
// import Logger from "./Logger.es6";
var Logger = require("./Logger.es6").Logger;
// import TextPresenter from "./TextPresenter.es6";
var TextPresenter = require("./TextPresenter.es6").TextPresenter;

let defaultOutput = null;

export default class AdLeafNode extends AudioNub {
    constructor(parent, node, audioContext) {
        super(parent, node, audioContext);

        if (!this._name) {
            this._name = "span (anonymous)";
        }
    }

    makeDefaultOutput() {
        if (defaultOutput) {
            defaultOutput.onInactive();
        }
        this.onActive();
        defaultOutput = this;
    }

    onActive() {
        if (!this.isActive) {
            this.output.connect(this.audioContext.destination);
            if (defaultOutput && defaultOutput !== this) {
                defaultOutput.onInactive();
            }
            Logger.log(`Active leaf: ${ this.pathString}`);
        }
        super.onActive();
        if (this.value) {
            this.tpKey = TextPresenter.present(this.value, this.pathString);
        }
    }

    onInactive() {
        if (this.isActive) {
            if (this.tpKey) {
                TextPresenter.unPresent(this.tpKey);
            }
            this.output.disconnect(this.audioContext.destination);
            if (defaultOutput && defaultOutput !== this) {
                defaultOutput.onActive();
            }
            Logger.log(`Inactive leaf: ${ this.pathString}`);
        }
        super.onInactive();
    }
}