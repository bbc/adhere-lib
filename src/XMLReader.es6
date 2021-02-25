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

import XmlReader from "xml-reader";
import XmlQuery from "xml-query";

export default class XMLReader {
  constructor() {
    this.xmlReader = XmlReader.create();
    this.xmlQuery = XmlQuery;
  }

  parseXML(ttmlFile, processDiv, doneCB) {
    this.xmlReader.reset();
    this.xmlReader.once("done", doneCB);

    this.xmlReader.parse(ttmlFile);
  }
}
