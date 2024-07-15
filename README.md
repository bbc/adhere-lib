[![Build 🛠️](https://github.com/bbc/adhere-lib/actions/workflows/build.yml/badge.svg?branch=main&event=status)](https://github.com/bbc/adhere-lib/actions/workflows/build.yml)

# adhere-lib
Javascript library for processing AD profile TTML2 and presenting with an HTML video element

adhere-lib is a reference implementation for the TTML2 Spec work it is to showcase
the use of audio attributes that can be controlled from a TTML2 document.

The library is designed as a module to be incorporated into package-based builds
e.g. with webpack.

For details of the TTML2 AD document format, see https://w3c.github.io/adpt/

A web page showcasing adhere-lib is available at https://bbc.github.io/Adhere/

## Prerequisites
- [Node.js](https://nodejs.org/en/)
- [NVM](https://github.com/creationix/nvm)

# Basic build instructions

## Setup

```Shell
nvm install 20.11.0
nvm use 20.11.0
nvm install-latest-npm
```

(latest npm is currently 10.8.1)

`cd` to project dir

```Shell
npm install
```

## Build and lint

```Shell
npm run-script build # builds the project once.
npm run-script lint # checks for linting issues.
```

The build artefacts are placed into the `dist` folder. Import the module into your project
either using a local file path in your `package.json` or by referencing `bbc/adhere-lib`, for example:

```json
    "dependencies": {
        "adhere-lib": "file:../adhere-lib"
    }
```

# Usage Documentation

... is something we ought to write more properly! In the meantime:

There are three main objects:
* `Logger`
* `TextPresenter`
* `VideoAudioHook`

```javascript
import { VideoAudioHook, TextPresenter, Logger } from "adhere-lib";
```

## Logger

Log messages will be sent to the console if `true` is passed to `Logger.enableBrowserLogging()`.
To do something else with them register a callback handler.

For example to prepend new log messages to a `<textarea>` HTML element whose `id="logarea"`,
_and_ log everything to the browser:

```javascript
        const logarea = document.getElementById("logarea");
        Logger.addCallback((str) => {
            logarea.textContent = `${str}\r\n${logarea.textContent}`;
        });
        Logger.enableBrowserLogging(true);
```

To prepend each log message with the video playback time, tell the Logger which video element is being used:

```javascript
        videoplayer = document.querySelector("video");
        Logger.setVideoPlayer(videoplayer);
```

## TextPresenter

To process the text of audio descriptions when they are played, add a callback handler to TextPresenter.

For example to set the text of an HTML `<p>` element whose `id="textpresentationarea"`:

```javascript
        const textarea = document.getElementById("textpresentationarea");
        TextPresenter.addCallback((str) => {
            textarea.style.display = "none";
            textarea.textContent = str;
            textarea.style.display = "block";
        });
```

Ny using `role` and `aria-live` attributes on the `p` you can expose this text to assistive technology
such as a screen reader.
Changing the `display` style property to `block` after setting the text can trigger
the screen reader to examine the element.

## VideoAudioHook

VideoAudioHook is the main object that processes the TTML2 audio description file.

When a TTML file is loaded, it creates Text Track Cues and associates them with the video.
During playback, the video's audio output is processed using Web Audio, if gain or pan changes are made.
During playback, if text to speech is indicated in the TTML file, the Web Speech API is used.
### Associate with the `<video>` element

```javascript
        videoplayer = document.querySelector("video");
        vah = new VideoAudioHook(videoplayer);
        vah.setup();
```

### Load a TTML file

Three mechanisms are provided for loading a TTML file:
1. Via an `XMLHttpRequest` using `VideoAudioHook.getHttpTTML(ttmlUrl)`
2. From a local file using `VideoAudioHook.attachTTMLfromFile(ttmlFile)` passing in a `file` object
3. From a URL using `fetch` using `VideoAudioHook.attachTTMLfromURL(ttmlURL)`
### Play video

Use normal video controls to manage video playback.
### Reset

If you need to do this explicitly:

```javascript
        vah.clearTree();
```

# Development

Please raise pull requests with changes in rather than committing directly to `main`.

## Linting

Please make sure that all code is linted before it is committed to the repo
otherwise it will fail the Continuous delivery tests on the GOCD server.
Linting happens as part of the build script.

## Testing

Cucumber tests exist but the scripts to run them no longer exist.

Unit tests can be run using:
```Shell
npm run-script test
```

## Continuous Delivery

BBC provides a GoCD PR builder for this project.

For those with access, information about the previous builds can be found here
[MPAS Go CD](https://gocd.pas.tools.bbc.co.uk/go/tab/pipeline/history/adhere-lib-pr-build)

## Versioning

See [VERSIONING.md](VERSIONING.md)

We use [Semantic Versioning](https://semver.org/) for this repository

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

Please ensure you have run the test suite before submitting a Pull Request, and include a version bump in line with our [Versioning](#versioning) policy.

## License

See [LICENSE.md](LICENSE.md)

This is licensed under the Apache 2.0 License.

## Copyright

Copyright (c) 2021 BBC
