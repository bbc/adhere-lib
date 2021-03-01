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
const Logger = require("./Logger.es6").Logger;
import Utils from "./Utils.es6";

export default class AnimateNode extends AdNode {
    constructor(parent, xmlNode, audioContext) {
        super(parent, xmlNode, audioContext);

        if (Utils.getAttributeByFullyQualifiedName(xmlNode, `${Utils.NS_TTML_AUDIO_URI}%%gain`)) {
            this.gains = Utils.getAttributeByFullyQualifiedName(xmlNode, `${Utils.NS_TTML_AUDIO_URI}%%gain`).split(";").map(parseFloat);
        }

        if (Utils.getAttributeByFullyQualifiedName(xmlNode, `${Utils.NS_TTML_AUDIO_URI}%%pan`)) {
            this.pans = Utils.getAttributeByFullyQualifiedName(xmlNode, `${Utils.NS_TTML_AUDIO_URI}%%pan`).split(";").map(parseFloat);
        }
    }

    onActive() {
        super.onActive();
        const duration = this.end - this.begin;
        if (this.gains && this.gains.length > 0) {
            this.parent.gainNode.gain.setValueCurveAtTime(
                Float32Array.from(this.gains),
                this.audioContext.currentTime,
                duration);
            Logger.log(
                // eslint-disable-next-line max-len
                `Active animate node into: ${ this.parent.name }; gain: ${ this.gains.join(", ") }; dur: ${ duration}`);
        }

        if (this.pans && this.pans.length > 0) {
            // Try to work around older spec support in Webkit, noting that
            // the PannerNode interface does not use AudioParam and therefore
            // the attempt to use setValueCurveAtTime fails.
            const panPosition = this.parent.panNode.pan || this.parent.panNode.position;
            panPosition.setValueCurveAtTime(
                Float32Array.from(this.pans),
                this.audioContext.currentTime,
                duration);
            Logger.log(
                // eslint-disable-next-line max-len
                `Active animate node into: ${ this.parent.name }; pan: ${ this.pans.join(", ") }; dur: ${ duration}`);
        }
    }

    onInactive() {
        super.onInactive();
    }

}
