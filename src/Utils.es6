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

export default class Utils {

  static get NS_XML_URI() {
    return "http://www.w3.org/XML/1998/namespace";
  }

  static get NS_TTML_URI() {
    return "http://www.w3.org/ns/ttml";
  }

  static get NS_TTML_PARAMETER_URI() {
    return "http://www.w3.org/ns/ttml#parameter";
  }

  static get NS_TTML_STYLING_URI() {
    return "http://www.w3.org/ns/ttml#styling";
  }

  static get NS_TTML_AUDIO_URI() {
    return "http://www.w3.org/ns/ttml#audio";
  }

  static get NS_TTML_METADATA_URI() {
    return "http://www.w3.org/ns/ttml#metadata";
  }

  static get NS_TTML_ISD_URI() {
    return "http://www.w3.org/ns/ttml#isd";
  }

  static isUndefined(element) {
    return (
         element === null
      || element === undefined
      || element.attributes === undefined
      || element.name === undefined
    );
  }

  static isAudioType(fullyQualifiedName) {
    return (
      fullyQualifiedName === `${Utils.NS_TTML_URI}%%body`
      || fullyQualifiedName === `${Utils.NS_TTML_URI}%%div`
      || fullyQualifiedName === `${Utils.NS_TTML_URI}%%p`
      || fullyQualifiedName === `${Utils.NS_TTML_URI}%%span`
      || fullyQualifiedName === `${Utils.NS_TTML_URI}%%animate`
      || fullyQualifiedName === `${Utils.NS_TTML_URI}%%audio`
      || fullyQualifiedName === `${Utils.NS_TTML_URI}%%source`
      || fullyQualifiedName === `${Utils.NS_TTML_URI}%%data`
      || fullyQualifiedName === `${Utils.NS_TTML_URI}%%chunk`
      || fullyQualifiedName === ""
    );
  }

  static hasAudioAttribute(element) {
    return (
      this.getAttributeByFullyQualifiedName(element, `${Utils.NS_TTML_URI}#audio%%gain`) !== undefined
      || this.getAttributeByFullyQualifiedName(element, `${Utils.NS_TTML_URI}#audio%%pan`) !== undefined
      || this.getAttributeByFullyQualifiedName(element, `${Utils.NS_TTML_URI}#audio%%pitch`) !== undefined
      || this.getAttributeByFullyQualifiedName(element, `${Utils.NS_TTML_URI}#audio%%speak`) !== undefined
    );
  }

  static isAudioElement(element) {

    if (Utils.isUndefined(element)) {
      return false;
    }

    const fullyQualifiedName = element.fullyQualifiedName;

    if (fullyQualifiedName === `${Utils.NS_TTML_URI}%%audio`
        || fullyQualifiedName === `${Utils.NS_TTML_URI}%%source`
        || fullyQualifiedName === `${Utils.NS_TTML_URI}%%data`
        || fullyQualifiedName === `${Utils.NS_TTML_URI}%%chunk`) {
      return true;
    }

    return Utils.isAudioType(fullyQualifiedName) && Utils.hasAudioAttribute(element);
  }

  static gleanNamespaces(element) {
    const namespaces = { "xml": Utils.NS_XML_URI };
    for (const key in element.attributes) {
      if (element.attributes.hasOwnProperty(key)) {
        if (key === "xmlns") {
          namespaces.default = element.attributes[key];
        } else if (key === "xmlns:xml" && element.attributes[key] !== Utils.NS_XML_URI) {
          console.warn("Namespace xmlns:xml is reserved in XML and must not be bound to another namespace!");
          console.warn(`${key}=${element.attributes[key]} is ignored.`);
        } else if (key.startsWith("xmlns:")) {
          namespaces[key.split(":")[1]] = element.attributes[key];
        } else continue;
      }
    }
    return namespaces;
  }

  static getFullyQualifiedName(element) {
    if (element.name.includes(":")) {
      const prefix = element.name.split(":")[0];
      const suffix = element.name.split(":")[1];
      if (element.namespaces.hasOwnProperty(prefix)) {
        return `${element.namespaces[prefix]}%%${suffix}`;
      } else {
        console.warn(`Cannot find the namespace for element ${element.name}. Make sure your TTML2 file is valid XML.`);
        return undefined;
      }
    }
    return element.name === "" ? "" : `${element.namespaces.default}%%${element.name}`;
  }

  static getAttributeByFullyQualifiedName(element, fullyQualifiedAttributeName) {
    if (fullyQualifiedAttributeName.includes("%%")) {
      const namespaceURI = fullyQualifiedAttributeName.split("%%")[0];
      const name = fullyQualifiedAttributeName.split("%%")[1];
      if (namespaceURI === "" &&
          element.attributes.hasOwnProperty(name)) {
        return element.attributes[name];
      }
      for (const prefix in element.namespaces) {
        if (namespaceURI === element.namespaces[prefix] &&
            element.attributes.hasOwnProperty(`${prefix}:${name}`)) {
            return element.attributes[`${prefix}:${name}`];
        }
      }
    }
    return undefined;
  }
}
