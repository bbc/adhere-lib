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

import AdNode from "./AdNode.es6";
// import Logger from "./Logger.es6";
var Logger = require("./Logger.es6").Logger;

/*eslint func-style: ["error", "declaration"]*/

function speakToRate(str) {
    let ret;
    switch (str) {
        case "fast":
            ret = 1.5;
            break;
        case "slow":
            ret = 0.66;
            break;
        case "normal":
        default:
            ret = 1;
            break;
    }

    return ret;
}

//Convert to a value between 0 and 2, 1 being a standard pitch
//What this output number means isn't clear, and probably up to the browser
function pitchToValue(str) {
    let ret = 1;
    if (str) {
        const pcIdx = str.indexOf("%");
        if (pcIdx >= 0) {
            const pcstr = str.substring(0, pcIdx);
            ret = (parseFloat(pcstr) / 100) + 1;
        }
    }

    return ret;
}

export default class SpeechSourceNode extends AdNode {
    constructor(parent, xmlNode, audioContext) {
        super(parent, xmlNode, audioContext);

        this.utter = new SpeechSynthesisUtterance();
        this.utter.text = this.value;
        this.utter.lang = "en-US";
        this.utter.rate = speakToRate(this.speak);
        this.utter.pitch = pitchToValue(this.pitch);
    }

    onActive() {
        super.onActive();
        Logger.log(`${this.name } active speak: ${ this.utter.text}`);
        speechSynthesis.speak(this.utter);
    }

    onInactive() {
        super.onInactive();
        Logger.log(`${this.name } inactive speak: ${ this.utter.text}`);
        speechSynthesis.cancel(this.utter);
    }

    onPause() {
        speechSynthesis.pause();
    }

    onResume() {
        speechSynthesis.resume();
    }

}