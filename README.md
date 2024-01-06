[![.github/workflows/main.yml](https://github.com/nicholascus/web-recorder/actions/workflows/main.yml/badge.svg)](https://github.com/nicholascus/web-recorder/actions/workflows/main.yml)

# Web Data Recorder
The Web Data Recorder tool offers a legal and ethically responsible solution for saving online data for future review and analysis. Designed for personal or small group use, it serves as a practical alternative to third-party scraping services. This tool is specifically tailored for the review and analysis of small to medium volumes of data that you or your team have access to on the web.

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

## Testing
Unit tests: `yarn test`
E2E tests:
- `yarn e2e`
or
- `F=e2e/docker-compose.yml; docker compose -f $F up -d && docker compose -f $F exec playwright yarn && docker compose -f $F exec playwright yarn e2e`

## Roadmap

1. **Data Collection to Local Server**: Implement the capability to collect and store data on a local network server. This will enable team level colloboration.

2. **Unique Data Recording Across Multiple Sessions**: This enhancement will enable the tool to recognize and record unique data across multiple web browsing sessions. The feature is specifically designed to ensure that the captured data is distinct, so the aggregated data becomes more compact and ready for further analysis.

3. **Integration with Cloud-Based Storage Service**: Expand the tool's functionality to allow teams to colloborate without need to setup their own storage. This will offer users the flexibility to store and access their data remotely, enhancing the tool's scalability and accessibility.

4. **Support of Historical Snapshot**: Develop the ability to capture and store historical snapshots of data. This feature will allow users to track changes over time and analyze trends.

## Contributing
Feel free to ask questions, report problems and provide contributions.

## License
This project is licensed under the MIT License - see the LICENSE.md file for details.

