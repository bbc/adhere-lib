// Copyright 2020 British Broadcasting Corporation
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

import AdSourceNode from "./AdSourceNode.es6";
// import Logger from "./Logger.es6";
const Logger = require("./Logger.es6").Logger;

// This guy is a little weird - It's the input to it's parent; i.e. in the graph
// it is the parent, but in the tree (and xml), it's a child.
// This subclass is for user controlled sources like <video> elements, as
// opposed to sources generated by the TTML source document.
export default class AdUserControlledSourceNode extends AdSourceNode {
    constructor(parent, xmlNode, audioContext, media) {
        super(parent, xmlNode, audioContext, media);
    }

    onActive() {
        if (this.media && !this.isActive) {
            this.input = this.mediaNode;
            this.input.connect(this.gainNode);
            Logger.log(`Connected to media element source with src= ${ this.input.mediaElement.currentSrc }`);

            if (this.parent) {
                this.output.connect(this.parent.gainNode); //TODO Make formal with .input
                Logger.log(`Active source into: ${ this.parent.name }; src: ${ this.media.src}; from: ${ this.media.currentTime }`);
            } else {
                Logger.log("No parent to connect");
            }
            this.startTime = this.media.currentTime;
            this.isActive = true;
        }
    }

    onInactive() {
        if (this.media && this.isActive) {
            this.input.disconnect(this.gainNode);
            this.input = null;

            if (this.parent) {
                this.output.disconnect(this.parent.gainNode);
                Logger.log(
                    `Inactive source into: ${ this.parent.name }; src: ${ this.media.src}`);
            } else {
                Logger.log("No parent to disconnect");
            }
            this.endTime = this.media.currentTime;
            this.isActive = false;
        }
    }

    onPause() {}

    onRestart() {}

    onFinalise() {}
}
