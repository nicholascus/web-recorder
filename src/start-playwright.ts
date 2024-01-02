/**
 * Design
 * - cli
 * - runner
 *   - loads all parsers
 *   - error logging and parsers debugging
 *   - connect to browser / start browser
 *   - setup all browser tabs with the right parsers => all pages should have page.on('domcontentloaded', ...) attaching parser in them
 *   - see if the active window is new ? (intiate / reinitiate parser if requried) => context.on('page', ...)
 * - browser manager
 *   -
 * - site parser interface
 * - writers for local percistense
 * - server sync
 *   - authentication
 *   - data download
 *
 * - parser implementations
 *   - linkedin job
 *   - twitter
 *
 * DevExp
 * - how to unit test
 * - how to integration test
 * - how to component test parsers
 * - how to format
 *
 *
 */

import { Bootstrap } from './engine/Bootstrap';
(async () => {
    //?? is that actually required ??
    await new Bootstrap().run();
})();

// profile  ~/Library/Application Support/Google/Chrome
// binary  /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
