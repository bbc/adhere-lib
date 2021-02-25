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
import TimingCalculator from "./TimingCalculator.es6";
import Logger from "./Logger.es6";
import props from "./PlaybackProperties.es6";

const readyStateMap =
  {
    0: "HAVE_NOTHING",
    1: "HAVE_METADATA",
    2: "HAVE_CURRENT_DATA",
    3: "HAVE_FUTURE_DATA",
    4: "HAVE_ENOUGH_DATA"
  };

// This guy is a little weird - It's the input to it's parent; i.e. in the graph
// it is the parent, but in the tree (and xml), it's a child.
// Don't use it for user controlled sources like video elements:
// instead user AdUserControlledSourceNode for them.
export default class AdSourceNode extends AudioNub {
  constructor(parent, xmlNode, audioContext, mediaPair) {
    super(parent, xmlNode, audioContext);

    this.mediaPair = mediaPair;
    this.media = mediaPair.media;
    this.mediaNode = mediaPair.mediaNode;
    if (xmlNode.attributes.clipBegin) {
      this.clipBegin = TimingCalculator.parseSeconds(xmlNode.attributes.clipBegin) || 0;
    } else {
      this.clipBegin = 0;
    }

    if (xmlNode.attributes.clipEnd) {
      this.clipEnd = TimingCalculator.parseSeconds(xmlNode.attributes.clipEnd) || NaN;
    }
  }

  mediaReadyState(m) {
    const readyState = m.readyState;
    return readyStateMap[readyState];
  }

  addDebugEventHandlers() {
    const m = this.mediaPair.media;
    if (m) {
      m.addEventListener("abort", () => {
        Logger.log(`Audio source aborted loading. readyState = ${this.mediaReadyState(m)}`);
      });
      m.addEventListener("error", () => {
        Logger.log(`Audio source error. readyState = ${this.mediaReadyState(m)}`);
      });
      m.addEventListener("loadeddata", () => {
        Logger.log(`Audio source loaded data. readyState = ${this.mediaReadyState(m)}`);
      });
      m.addEventListener("loadstart", () => {
        Logger.log(`Audio source loadstart. readyState = ${this.mediaReadyState(m)}`);
      });
      m.addEventListener("playing", () => {
        Logger.log(`Audio source is playing. readyState = ${this.mediaReadyState(m)}`);
      });
      m.addEventListener("progress", () => {
        Logger.log(`Audio source making progress. readyState = ${this.mediaReadyState(m)}`);
      });
      m.addEventListener("waiting", () => {
        Logger.log(`Audio source is waiting for more data. readyState = ${this.mediaReadyState(m)}`);
      });
    }
  }

  get end() {
    let ret;
    const normalEnd = super.end;

    if (this.clipEnd) {
      //The duration of the clip added to the start time, or the span end, whichever comes first.
      ret = Math.min(normalEnd, this.begin + (this.clipEnd - this.clipBegin));
    } else {
      ret = normalEnd;
    }

    // Logger.log(`AdSourceNode end() super said ${normalEnd} but I'm saying ${ret}`); // DEBUG
    return ret;
  }

  onActive() {
    if (this.mediaPair && !this.isActive) {
      Logger.log(`Active AdSourceNode: ${ this.pathString}`);
      const offset = this.videoMedia.currentTime - this.begin;
      this.media.currentTime = (this.clipBegin) ? this.clipBegin + offset : offset;
      this.input = this.mediaNode;
      this.gainNode.gain.value = this.gain * props.getCurrentGain();
      this.input.connect(this.gainNode);
      Logger.log(`Connected to media element source with src= ${ this.input.mediaElement.currentSrc }`);

      this.media.play().catch((e) => {
        Logger.log(`AdSourceNode play rejected with error: ${e}.`);
      });
      this.output.connect(this.parent.gainNode);//TODO Make formal with .input
      Logger.log(`Active source into: ${ this.parent.name }; src: ${ this.media.src}; from: ${ this.media.currentTime } including offset of ${offset}.`);
      this.startTime = this.media.currentTime;
      this.isActive = true;

      this.gainId = props.registerCallback((uiGain) => {
        //const oldVal = this.gainNode.gain.value;
        //console.info("Base gain", this.gain, "UI gain", uiGain);
        this.gainNode.gain.value = this.gain * uiGain;
        //console.info("Final gain changes from", oldVal, "to", this.gainNode.gain.value);
      });

    }
  }

  onInactive() {
    if (this.media && this.isActive) {
      Logger.log(`Inactive AdSourceNode: ${ this.pathString}`);
      this.media.pause();
      this.input.disconnect(this.gainNode);
      this.input = null;

      this.output.disconnect(this.parent.gainNode);
      Logger.log(
        `Inactive source into: ${ this.parent.name }; src: ${ this.media.src}`);
      this.endTime = this.media.currentTime;
      // DEBUG: clipBegin/clipEnd
      Logger.log(
        // eslint-disable-next-line max-len
        `ran source for: ${ this.endTime - this.startTime } clipBegin: ${ this.startTime } clipEnd: ${ this.endTime}`);
      this.isActive = false;
      props.deregisterCallback(this.gainId);
    }
  }

  onPause() {
    if (this.media && this.isActive) {
      this.media.pause();
    }
  }

  onRestart() {
    if (this.media && this.isActive) {
      this.media.play();
    }
  }

  onFinalise() {
    if (this.media) {
      super.onFinalise();
      const src = this.media.src;
      if ((src + "").indexOf("blob://") > 0) {
        Logger.log("Clear audio src " + this.media.src);
        this.media.src = "";
        URL.revokeObjectURL(src);
      }
      if (this.input) {
        this.input.disconnect(this.gainNode);
      }
    }
  }
}
