# Open With

Define custom context menus that use simple template strings to generate URLs and open new tabs based on either the current selection or the selected link.

For example:

- A selection menu with template `https://jisho.org/search/{value}` would search any highlighted text on jisho.
- Populate a tracking number in the URL for you package tracking app of choice
- Open a site in your private ladder instance

Features:

- Selection context menus
- Link context menus
- Simple moustache like template syntax
- An HTML configuration UI
- Import/Export Configuration as JSON
- Manifest V3
- 0 Runtime Dependencies

Browser Testing:

- [x] Firefox
- [ ] Ladybird (will test after release)
- [ ] Chrome (will likely never test)
- [ ] Safari (will likely never test)
