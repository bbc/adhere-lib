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
import TrackApi from "./TrackAPIHelper.es6";
import XMLReader from "./XMLReader.es6";
import parseTree from "./Parser.es6";
import { setAudioCacheStrategy, getAudioCacheStrategy } from "./Parser.es6";
// import Logger from "./Logger.es6";
const Logger = require("./Logger.es6").Logger;

export default class VideoAudioHook {
    constructor(videoplayer) {
        this.videoplayer = videoplayer;

        this.Utils = Utils;
        this.TrackApi = TrackApi;
        this.XMLReader = XMLReader;
        this.FileReader = FileReader;
        this.firstTime = true;

        this.videoplayer.addEventListener(
            "play",
            this.onVideoPlay.bind(this)
        );

        this.videoplayer.addEventListener(
            "pause",
            this.onVideoPause.bind(this)
        );
    }

    setup() {
        this.xmlReader = new this.XMLReader();
        this.track = new this.TrackApi(this.videoplayer);
    }

    attachTTMLfromFile(ttmlFile) {
        const reader = new this.FileReader();

        reader.onload = () => {
            this.parseTTML(ttmlFile, reader.result);
        };

        Logger.log(`Reading TTML file at: ${ ttmlFile }`);
        reader.readAsText(ttmlFile);
    }

    attachTTMLfromURL(ttmlURL) {
        Logger.log(`Fetching TTML from URL at: ${ ttmlURL }`);
        fetch(ttmlURL).then(response => {
            if (!response.ok) throw Error(response.statusText);
            return response.text().then(text => { this.parseTTML(ttmlURL, text); });
        });
    }

    getHttpTTML(ttmlUrl) {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", ttmlUrl);
        xhr.addEventListener("load", this.onTTMLLoad.bind(this));
        Logger.log(`GET ttml at: ${ ttmlUrl}`);
        xhr.send();
    }

    onTTMLLoad(e) {
        this.parseTTML(e.target.responseURL, e.target.responseText);
    }

    parseTTML(url, result) {
        const media = this.videoplayer;
        this.xmlReader.parseXML(
            result,
            () => null,
            this.setupTree.bind(this, media, url)
        );
    }

    set audioCacheStrategy(cacheStrategy) {
        setAudioCacheStrategy(cacheStrategy);
    }

    get audioCacheStrategy() {
        return getAudioCacheStrategy();
    }

    setupTree(media, documentPath, xmlTree) {
        if (this.tree) {
            this.resetTree();
        }

        // Work around Webkit, which currently offers the prefixed version only
        const AudioContext = window.AudioContext || window.webkitAudioContext;

        const audioContext = this.tree ? this.tree.audioContext : new AudioContext();

        this.tree = parseTree(audioContext, media, documentPath, xmlTree, this.tree);
        const cues = [];
        Logger.log(`VideoAudioHook.setupTree media.duration = ${media.duration}`);
        this.tree.makeCueObjects(cues, media);

        cues.forEach(c => {
            this.track.addCue(c);
        });

        if (this.videoplayer.currentTime > 0) {
            this.activateTree();
            this.videoplayer.currentTime = 0;
        }
    }

    //For all nodes in the tree with a NaN beginning, activate them.
    //We can't do this until play() - Else audio sources without bbegin will start on load
    activateTree() {
        this.tree.traverse(c => {
            if (isNaN(c.begin)) {
                c.onActive();
            }
        });
    }

    //onFinalise() goes a little further than onInactive
    //onInactive should be sufficient for audionode garbage collection, but it's not clear if it's the case
    //Firefox webaudio tab shows audionodes persisting(actually though?) long after use and disconnection
    //At the very least, we need to revokeObjectURL.
    resetTree() {
        this.track.removeCues();
        this.tree.traverse(c => {
            if (typeof c.onFinalise === "function") {
                c.onFinalise();
            }
        });
        this.tree.children = [];
    }

    onVideoPlay() {
        const audioContext = this.tree.audioContext;
        if (audioContext) {
            Logger.log("resuming audio context");
            audioContext.resume().then(() => {
                if (this.firstTime) {
                    this.activateTree();
                    this.firstTime = false;
                } else {
                    this.tree.traverse(c => {
                        if (typeof c.onRestart === "function") {
                            c.onRestart();
                        }
                    });
                }
            });
        }

    }

    onVideoPause() {
        const audioContext = this.tree.audioContext;
        if (audioContext && audioContext.state === "running") {
            Logger.log("suspending audio context");
            audioContext.suspend().then(() => {
                this.tree.traverse(c => {
                    if (typeof c.onPause === "function") {
                        c.onPause();
                    }
                });
            });
        }
    }
}

module.exports = exports = { VideoAudioHook };
