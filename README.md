# Web Data Recorder
[![.github/workflows/main.yml](https://github.com/nicholascus/web-recorder/actions/workflows/main.yml/badge.svg)](https://github.com/nicholascus/web-recorder/actions/workflows/main.yml)

## Description
"Web Recorder" is a lightweight extendable tool which connects to your desktop browser, and as you browse though the web it extracts and backups data using the logic defined in the parsers.

Parsers are developed with TypeScript and utilise Playwright library for access to the web session over DevTools protocol.

Currently two parsers are available, one for Twitter feeds and one for LinkedIn job collections.

## Installation

```bash
git clone https://github.com/nicholascus/web-recorder.git
cd web-recorder
yarn

# start mongo storage
yarn mongo
# start your desktop browser with DevTools listening to local connections 
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
# start web recorder
yarn wr
```

...more detailed documentation is coming soon.

## Contributing
Feel free to ask questions, report problems and provide contributions.

## License
This project is licensed under the MIT License - see the LICENSE.md file for details.

