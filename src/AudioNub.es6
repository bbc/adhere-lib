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
import Utils from "./Utils.es6";

export default class AudioNub extends AdNode {
  constructor(parent, xmlNode, audioContext) {
    super(parent, xmlNode, audioContext);
    this.copyAudioAttributes(xmlNode);
    this.createAudioNodes();
  }

  createAudioNodes() {
    this.gainNode = this.audioContext.createGain();

    // Check that StereoPanner is supported. Webkit currently only
    // supports the older interface's Panner.
    const supportsStereoPanner = this.audioContext.createStereoPanner;
    const supportsPanner = this.audioContext.createPanner;
    if (supportsStereoPanner) {
      this.panNode = this.audioContext.createStereoPanner();
    } else if (supportsPanner) {
      this.panNode = this.audioContext.createPanner();
    }
    this.gainNode.connect(this.panNode);
    this.output = this.panNode;

    if (supportsStereoPanner) {
      this.panNode.pan.value = this.pan;
    } else if (supportsPanner) {
      this.panNode.position = 90 * this.pan;
    }

    this.gainNode.gain.value = this.gain;
  }

  onActive() {
    if (this.parent && !this.isActive) {
      this.parent.output.connect(this.gainNode);
    }
    super.onActive();
  }

  onInactive() {
    if (this.parent && this.isActive) {
      this.parent.output.disconnect(this.gainNode);
    }
    super.onInactive();
  }

  onFinalise() {
    super.onFinalise();
    this.gainNode.disconnect(this.panNode);
  }

  get gain() {
    return !isNaN(this._gain) ? this._gain : 1;
  }

  get pan() {
    return !isNaN(this._pan) ? this._pan : 0;
  }

  copyAudioAttributes(xmlNode) {
    if (xmlNode.attributes) {
      this._gain = parseFloat(Utils.getAttributeByFullyQualifiedName(xmlNode, `${Utils.NS_TTML_AUDIO_URI}%%gain`));
      this._pan = parseFloat(Utils.getAttributeByFullyQualifiedName(xmlNode, `${Utils.NS_TTML_AUDIO_URI}%%pan`));
    }
  }
}
