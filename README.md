# adhere-lib
Javascript library for processing AD profile TTML2 and presenting with an HTML video element

adhere-lib is a reference implementation for the TTML2 Spec work it is to showcase
the use of audio attributes that can be controlled from a TTML2 document.

## Prerequisites
- [Node.js](https://nodejs.org/en/)
- [NVM](https://github.com/creationix/nvm)

## Basic build instructions

# Setup

```Shell
nvm install 12.12.0
nvm use 12.12.0
```
`cd` to project dir

```Shell
npm install
```

# Execution

```
npm run-script build # builds the project once.
npm run-script watch # builds the project and watches for changes, rebuilding when needed.
npm run-script start # runs local web server with development resources and opens the page.
```

The build artefacts are placed into the `dist` folder. Either serve `index.html`
from that folder yourself or use the webpack-dev-server to serve it.

When you have the page open in a browser window, then:
* select ttml such as `example.ttml` from the root of this project
* select video such as an mp4 you have lying around
* or serve your own video, TTML and resources referenced from the TTML, and choose by URL
* press play

## Testing

Cucumber tests exist but the scripts to run them no longer exist.

Unit tests can be run using:
```
npm run-script test
```

## Linting

Please make sure that all code is linted before it is committed to the repo 
otherwise it will fail the Continuous delivery tests on the GOCD server. 
Linting happens as part of the build script.

## Continuous Delivery

Information about the previous builds can be found here 
[MPAS Go CD](https://gocd.pas.tools.bbc.co.uk/go/tab/pipeline/history/adhere-build)

## Development

Please raise pull requests with changes in rather than committing directly to `main`.

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

Copyright (c) 2020 BBC
