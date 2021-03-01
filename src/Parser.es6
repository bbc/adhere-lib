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
import AdSourceNode from "./AdSourceNode.es6";
import AdLeafNode from "./AdLeafNode.es6";
import AdUserControlledSourceNode from "./AdUserControlledSourceNode.es6";
import SpeechSourceNode from "./SpeechSourceNode.es6";
import AudioNub from "./AudioNub.es6";
import AnimateNode from "./AnimateNode.es6";
// import Logger from "./Logger.es6";
const Logger = require("./Logger.es6").Logger;
import base64js from "base64-js";

const CACHE_STRATEGY_REUSE = true;
const CACHE_STRATEGY_NOCACHE = false;

let currentUrl = "";
const audioElements = {};
const audioResources = {};
const trackPrefix = ";track=";
const defaultVideoGain = 1;
let audioCacheStrategy = CACHE_STRATEGY_NOCACHE;

/*eslint func-style: ["error", "declaration"]*/
/*eslint no-use-before-define: ["error", { "functions": false }]*/
/*eslint max-statements: ["error", 25]*/

function isName(fullyQualifiedName, node) {
    return node.fullyQualifiedName === fullyQualifiedName;
}

function getNamedChildren(fullyQualifiedName, node) {
    return node.children.filter(isName.bind(null, fullyQualifiedName));
}

//For an audio with a <source> element, make a mediaSrc url from the base64.
function parseEmbeddedSource(node) {
    const source = getNamedChildren(`${Utils.NS_TTML_URI}%%source`, node)[0];
    const data = getNamedChildren(`${Utils.NS_TTML_URI}%%data`, source)[0];
    const dataType = data.attributes.type;
    const chunks = getNamedChildren(`${Utils.NS_TTML_URI}%%chunk`, data);
    const chunk = chunks[0]; //TODO: merge multiple chunks
    if (chunk.children.length > 0) {
        chunk.value = chunk.children[0].value;
    }
    const wsRegex = /\s/gi;

    // eslint-disable-next-line no-undef
    const dataChunk = base64js.toByteArray(chunk.value.replace(wsRegex, ""));
    const blob = new Blob([dataChunk], { type: dataType });

    return URL.createObjectURL(blob);
}

function grabAudioResources(headNode) {
    const ret = {};
    const resources = getNamedChildren(`${Utils.NS_TTML_URI}%%resources`, headNode)[0];
    if (resources) {
        const audios = getNamedChildren(`${Utils.NS_TTML_URI}%%audio`, resources);
        for (const a of audios) {
            const id = Utils.getAttributeByFullyQualifiedName(a, `${Utils.NS_XML_URI}%%id`);
            if (id) {
                audioResources[id] = parseEmbeddedSource(a);
            }
        }
    }

    return ret;
}

function getAudioElement(audioSrc, audioContext) {
    if (audioCacheStrategy === CACHE_STRATEGY_REUSE && audioSrc in audioElements) {
        // Yay reuse this one
        return audioElements[audioSrc];
    }

    // Need to make one
    const media = new Audio();
    media.onError = function() {
        Logger.error(`Error ${ media.error.code }; details: ${ media.error.message }`);
    };
    media.src = audioSrc;
    media.preload = "metadata";
    const node = audioContext.createMediaElementSource(media);
    const pair = { media, mediaNode: node };
    if (audioCacheStrategy === CACHE_STRATEGY_REUSE) {
        audioElements[audioSrc] = pair;
    }

    return pair;
}

function propagateNamespaces(xmlNode) {
    if (xmlNode.parent === null) {
        xmlNode.namespaces = Utils.gleanNamespaces(xmlNode);
        xmlNode.fullyQualifiedName = Utils.getFullyQualifiedName(xmlNode);
    }
    if (xmlNode.children) {
        for (const c of xmlNode.children) {
            if (c.parent === null || c.parent.namespaces === {}) {
                c.namespaces = Utils.gleanNamespaces(c);
            } else {
                c.namespaces = Object.assign(c.parent.namespaces, Utils.gleanNamespaces(c));
            }
            c.fullyQualifiedName = Utils.getFullyQualifiedName(c);
            propagateNamespaces(c);
        }
    }
}

//The xml parser makes anonymous spans under real spans, let's flatten the two together.
function flattenSpans(xmlNode) {
    if (xmlNode.children) {
        for (let i = 0; i < xmlNode.children.length;) {
            const c = xmlNode.children[i];
            if ((xmlNode.fullyQualifiedName === `${Utils.NS_TTML_URI}%%span` || xmlNode.fullyQualifiedName === `${Utils.NS_TTML_URI}%%chunk`) &&
                c.fullyQualifiedName === "") {
                xmlNode.value = c.value; //Take the text inside it
                xmlNode.children.splice(i, 1);
            } else {
                flattenSpans(c);
                i++;
            }
        }
    }
}

//remove any nodes that don't fall under the isAudioType definition
//clear out the unrelated ttml stuff
function removeOther(xmlNode) {
    if (xmlNode.children) {
        for (let i = 0; i < xmlNode.children.length;) {
            const c = xmlNode.children[i];
            if (!Utils.isAudioType(c.fullyQualifiedName)) {
                xmlNode.children.splice(i, 1);
            } else {
                removeOther(c);
                i++;
            }
        }
    }
}

function siblingsHaveAudio(xmlNode) {
    const siblings = xmlNode.parent.children;
    for (const s of siblings) {
        // eslint-disable-next-line eqeqeq
        if (s != xmlNode && s.fullyQualifiedName === `${Utils.NS_TTML_URI}%%audio`) {
            return true;
        }
    }
    return false;
}

function markAudio(xmlNode) {
    if (xmlNode.parent) {
        xmlNode.hasAudio = xmlNode.parent.hasAudio;
    }
    if (Utils.isAudioElement(xmlNode) ||
        ((xmlNode.fullyQualifiedName === `${Utils.NS_TTML_URI}%%p` ||
                xmlNode.fullyQualifiedName === `${Utils.NS_TTML_URI}%%div` ||
                xmlNode.fullyQualifiedName === "" ||
                xmlNode.fullyQualifiedName === `${Utils.NS_TTML_URI}%%span`) &&
            siblingsHaveAudio(xmlNode))) {
        xmlNode.hasAudio = true;
    }
    if (xmlNode.children) {
        for (const c of xmlNode.children) {
            markAudio(c);
        }

        xmlNode.hasAudio = xmlNode.hasAudio || xmlNode.children.some((c) => c.hasAudio);
    }
}

function markSpeech(xmlNode, parentSpeech) {
    let speechSpecified = false;
    if (xmlNode.attributes) {
        const speakAttribute = Utils.getAttributeByFullyQualifiedName(xmlNode, `${Utils.NS_TTML_AUDIO_URI}%%speak`);
        if (speakAttribute) {
            speechSpecified = true;
            xmlNode.hasSpeech = !(speakAttribute === "none");
        }
    }
    if (!speechSpecified) { // it's inherited downwards, if I don't specify, I get what my parent specifies.
        xmlNode.hasSpeech = parentSpeech;
    }

    if (xmlNode.children) {
        const hasSpeech = xmlNode.hasSpeech;
        for (const c of xmlNode.children) {
            const thisChildHasSpeech = markSpeech(c, hasSpeech);
            xmlNode.hasSpeech = thisChildHasSpeech || xmlNode.hasSpeech; //If any children have speech, I have speech (but that doesn't mean all my children do).
        }
    }

    return xmlNode.hasSpeech;
}

function removeNotAudio(xmlNode) { //Remove anythin without .hasAudio or .hasSpeech.
    if (xmlNode.children) {
        for (let i = 0; i < xmlNode.children.length;) {
            const c = xmlNode.children[i];
            if (c.hasAudio || c.hasSpeech) {
                removeNotAudio(c);
                i++;
            } else {
                xmlNode.children.splice(i, 1);
            }
        }
    }
}

function prepareXML(xmlNode) {
    propagateNamespaces(xmlNode);
    flattenSpans(xmlNode);
    removeOther(xmlNode);

    //Mark nodes for hasSpeech and hasAudio
    //Basically am I used in the pathway; if I or my descendants or my ascendants
    //have speech or audio attributes, I'm marked too.
    markAudio(xmlNode);
    markSpeech(xmlNode);
    removeNotAudio(xmlNode);
}

function parseAnimateNode(parent, node, audioContext) {
    const ret = new AnimateNode(parent, node, audioContext);

    return ret;
}

function isLeafNode(node) {
    return node.fullyQualifiedName === `${Utils.NS_TTML_URI}%%span` || node.fullyQualifiedName === ""; //span or anonymous span/
}

function parseSpeechNode(parent, node, audioContext) {
    const ret = new SpeechSourceNode(parent, node, audioContext);

    return ret;
}

function parseAudioSourceNode(parent, node) {
    const src = node.attributes.src;
    if (src && src.indexOf(trackPrefix) >= 0) { //Ignore body level track specifiers.
        return undefined;
    }

    let audioSrc;
    if (src) {
        if (src.indexOf("#") === 0) {
            audioSrc = audioResources[src.substring(1)];
        } else {
            audioSrc = currentUrl + src;
        }
    } else if (!src && node.children) {
        audioSrc = parseEmbeddedSource(node);
    } else {
        Logger.error("Found an audio node but couldn't work out what its source is supposed to be.");
    }

    let ret;
    if (audioSrc) {
        const mediaPair = getAudioElement(audioSrc, parent.audioContext);
        ret = new AdSourceNode(parent, node, undefined, mediaPair);
    }

    return ret;
}

function parseNode(parent, node) {
    let ret = null;
    if (node.fullyQualifiedName === `${Utils.NS_TTML_URI}%%audio`) {
        ret = parseAudioSourceNode(parent, node);
    } else if (node.fullyQualifiedName === `${Utils.NS_TTML_URI}%%animate`) {
        ret = parseAnimateNode(parent, node);
    } else if (isLeafNode(node)) {
        ret = parseLeafNode(parent, node);
    } else {
        ret = parseIntermediateNode(parent, node);
    }

    return ret;
}

function parseLeafNode(parent, node, audioContext) {
    const ret = new AdLeafNode(parent, node, audioContext);
    ret.children = node.children.map(parseNode.bind(null, ret));

    //Remove nulls. These are nodes to nowhere. We should also remove anonymous spans if we're a leaf.
    ret.children = ret.children.filter(
        (n) => !!n && (n._xmlNode.fullyQualifiedName === `${Utils.NS_TTML_URI}%%audio` ||
            n._xmlNode.fullyQualifiedName === `${Utils.NS_TTML_URI}%%animate`));

    if (node.hasSpeech) {
        ret.children.push(parseSpeechNode(ret, node, audioContext));
    }

    return ret;
}

function parseIntermediateNode(parent, node, audioContext) {
    const ret = new AudioNub(parent, node, audioContext);
    ret.children = node.children.map(parseNode.bind(null, ret));
    ret.children = ret.children.filter((n) => !!n); //Remove nulls. These are nodes to nowhere

    return ret;
}

function parseBody(parent, node, audioContext) {
    const body = parseNode(parent, node, audioContext);
    body.postComputeEnd();

    return body;
}

export default function parseTree(audioContext, media, url, xmlTree, startRoot) {
    let root;
    if (startRoot) { //We can't make a new AdSourceNode on the media without
        root = startRoot;
    } else {
        //Make an magic source node for the media - there's no xml for this so fake it.
        const mediaPair = { media, mediaNode: audioContext.createMediaElementSource(media) };
        root = new AdUserControlledSourceNode(
            null, {
                name: "root(mediaAudio)",
                attributes: { "tta:gain": defaultVideoGain, "tta:pan": 0 },
                namespaces: {
                    "default": Utils.NS_TTML_URI,
                    "xml": Utils.NS_XML_URI,
                    "tta": `${Utils.NS_TTML_AUDIO_URI}`
                },
                fullyQualifiedName: `${Utils.NS_TTML_URI}%%tt`
            },
            audioContext,
            mediaPair);
    }
    const defaultOutput = new AdLeafNode(
        root, {
            name: "default audio out",
            attributes: {},
            namespaces: {
                "xml": Utils.NS_XML_URI
            },
            fullyQualifiedName: ""
        },
        audioContext);
    defaultOutput.makeDefaultOutput();
    root.children = [defaultOutput];

    if (typeof url === "string") {
        currentUrl = `${url.slice(0, url.lastIndexOf("/")) }/`;
    } else {
        currentUrl = "";
    }

    prepareXML(xmlTree);

    const head = getNamedChildren(`${Utils.NS_TTML_URI}%%head`, xmlTree)[0];
    if (head) {
        grabAudioResources(head);
    }

    if (isName(`${Utils.NS_TTML_URI}%%tt`, xmlTree)) {
        const body = getNamedChildren(`${Utils.NS_TTML_URI}%%body`, xmlTree)[0];
        if (body) {
            root.children.push(parseBody(root, body, null));
        } else {
            Logger.error("Couldn't find body element in the ttml document");
        }
    }
    return root;
}

export function setAudioCacheStrategy(cacheStrategy) {
    audioCacheStrategy = cacheStrategy;
    Logger.log(`Audio cache strategy set to ${(cacheStrategy === CACHE_STRATEGY_REUSE) ? "REUSE" : "NO CACHE"}`);
}

export function getAudioCacheStrategy() {
    return audioCacheStrategy;
}
