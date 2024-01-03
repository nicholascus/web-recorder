# Web Data Recorder

## Description
This is a lightweight extendable tool which connects to your desktop browser session, and as you browse though the content it extracts and backups data following the logic defined in the parsers.
Parsers are developed with TypeScript and utilise Playwright library for access to the web session over DevTools protocol.

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
yarn pwb
```

...more detailed documentation is coming soon.

## Contributing
Feel free to ask questions, report problems and provide contributions.

## License
This project is licensed under the MIT License - see the LICENSE.md file for details.

