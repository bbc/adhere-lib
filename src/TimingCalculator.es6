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

/*eslint func-style: ["error", "declaration"]*/

function nullOrUndefined(thing) {
  return thing === undefined || thing === null;
}

function specified(thing) {
  return !nullOrUndefined(thing);
}

export default class TimingCalculator {
  constructor() {
  }

  static parseTimeString(timeStr) {
    const rgx = /(\d{2,}):(\d{2,}):(\d{2}(?:\.\d*)?)/;

    const groups = timeStr.match(rgx);

    const hours = parseInt(groups[1]);
    const mins = parseInt(groups[2]);
    const secs = parseFloat(groups[3]);

    const total = (hours * 3600) + (mins * 60) + secs;

    return total;
  }

  static parseSeconds(timeText) {

    const lowerTimeText = timeText.toLowerCase();

    const isSecondsString = (lowerTimeText.charAt(timeText.length - 1) === "s");

    return (isSecondsString) ?
       this.parseSecondText(timeText) : this.parseTimeString(timeText);
  }

  static parseSecondText(timingText) {
    let timing = String(timingText);
    timing = timing.substring(0, timing.length - 1);
    return parseFloat(timing);
  }

  static computeBegin(element) {
    const parent = element.parent;
    const syncbase = (parent) ? this.computeBegin(parent) : 0;
    const beginAttr = element.attributes.begin;
    const begin = (beginAttr) ? this.parseSeconds(beginAttr) : 0;
    return syncbase + begin;
  }

  static computeEnd(element, seekUp = true) {
    let end = this.getSpecifiedEnd(element, seekUp);
    if (nullOrUndefined(end)) {
      // now we have to get the biggest defined end from each child
      const ends = [];
      element.children.forEach((c) => {
        ends.push(this.computeEnd(c, false));
      });
      if (!ends.includes(undefined) && ends.length > 0) {
        end = Math.max(...ends);
      }
    }

    return end;
  }

  static getSpecifiedEnd(element, seekUp = true) {
    let parentEnd;
    let resultingSpecifiedEnd;
    const parent = element.parent;

    if (seekUp && parent) {
      parentEnd = this.getSpecifiedEnd(parent);
    }

    const syncbase = (parent) ? this.computeBegin(parent) : 0;
    const thisEnd = (element.attributes.end) ? this.parseSeconds(element.attributes.end) + syncbase : undefined;

    if (specified(thisEnd)) {
      if (specified(parentEnd)) {
        resultingSpecifiedEnd = Math.min(thisEnd, parentEnd);
      } else {
        resultingSpecifiedEnd = thisEnd;
      }
    } else { // we don't specify an end
      resultingSpecifiedEnd = parentEnd;
    }

    return resultingSpecifiedEnd;
  }
}
