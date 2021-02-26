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

import Utils from "./Utils.es6";
//import Logger from "./Logger.es6";
var Logger = require("./Logger.es6").Logger;
import TimingCalculator from "./TimingCalculator.es6";

export default class AdNode {
    constructor(parent, xmlNode, audioContext) {
        this._xmlNode = xmlNode;
        this.parent = parent;
        this.time = {
            begin: TimingCalculator.computeBegin(xmlNode),
            end: undefined
        };

        this._name = xmlNode.name;
        this._value = xmlNode.value;
        if (xmlNode.attributes) {
            this._pitch = Utils.getAttributeByFullyQualifiedName(xmlNode, `${Utils.NS_TTML_AUDIO_URI}%%pitch`);
            this._speak = Utils.getAttributeByFullyQualifiedName(xmlNode, `${Utils.NS_TTML_AUDIO_URI}%%speak`);
            this._id = Utils.getAttributeByFullyQualifiedName(xmlNode, `${Utils.NS_XML_URI}%%id`);
        }
        if (audioContext) {
            this.ac = audioContext;
        }
        // Logger.log(`Constructed an AdNode for ${this.pathString}, value \"${this.value}\"
        // ${this.begin} --> ${this.end}`); // DEBUG
    }

    postComputeEnd() {
        this.time.end = TimingCalculator.computeEnd(this._xmlNode);
        // Logger.log(`postComputeEnd() for ${this.pathString}, value \"${this.value}\"
        // ${this.begin} --> ${this.end}`); // DEBUG
        if (this.children) {
            this.children.forEach((c) => { c.postComputeEnd(); });
        }
    }

    get audioContext() {
        if (this.ac) {
            return this.ac;
        }
        if (this.parent) {
            return this.parent.audioContext;
        }
        return null;
    }

    get begin() {
        let begin = NaN;
        if (this.time) {
            begin = this.time.begin;
        }
        return begin;
    }

    get end() {
        let end = NaN;
        if (this.time) {
            end = this.time.end;
        }
        return end;
    }

    get pitch() {
        if (this._pitch || this._pitch === 0) {
            return this._pitch;
        } else if (this.parent) {
            return this.parent.pitch;
        }

        return undefined;
    }

    get speak() {
        if (this._speak) {
            return this._speak;
        } else if (this.parent) {
            return this.parent.speak;
        }

        return undefined;
    }

    get value() {
        return this._value;
    }

    get videoMedia() {
        return this._videoMedia;
    }

    set videoMedia(vm) {
        this._videoMedia = vm;
    }

    makeCueObjects(arr, videoMedia) {
        this.videoMedia = videoMedia;
        const b = this.begin;
        const e = (!isNaN(this.end)) ? this.end : videoMedia.duration;
        const v = this.value;
        if (!isNaN(b) && !isNaN(e)) {
            // Logger.log(`Making a cue for ${ this.pathString }, \"${ v }\",
            // ${b} --> ${e}.`); // DEBUG
            const newCue = new VTTCue(b, e, v);
            newCue.onenter = () => this.onActive();
            newCue.onexit = () => this.onInactive();
            arr.push(newCue);
            // } else {
            //   Logger.log(`Not making a cue for ${ this.pathString }, \"${ v }\"
            //   because b (${b}) or e (${e}) is NaN.`); // DEBUG
        }

        if (this.children) {
            for (const c of this.children) {
                c.makeCueObjects(arr, videoMedia);
            }
        }
    }

    //Go down the tree, apply fn(c) to all children
    traverse(fn) {
        fn(this);
        if (this.children) {
            for (const c of this.children) {
                c.traverse(fn);
            }
        }
    }

    get name() {
        return this._name;
    }

    get pathString() {
        return ((this.parent) ? `${this.parent.pathString } -> ` : "") + `${this.name}${this.idString}`;
    }

    get idString() {
        return (this._id) ? ` id:\"${ this._id }\"` : "";
    }

    onActive() {
        this.isActive = true;
        Logger.log(`Active AdNode: ${ this.pathString}`);
    }

    onInactive() {
        this.isActive = false;
        Logger.log(`Inactive AdNode: ${ this.pathString}`);
    }

    onFinalise() {
        if (this.isActive) {
            this.onInactive();
        }
    }

}