import { CONFIG_KEY, getConfiguredMenu } from '../shared/config.js';

/**
 * @type {import("../shared/config.js").ConfigData}
 */
const EMPTY_CONFIG = {
  menus: [],
};

/**
 *
 * Finds the config in storage
 *
 * @returns {Promise<import("../shared/config.js").ConfigData>}
 */
async function getConfig() {
  const value = await browser.storage.local.get(CONFIG_KEY);
  return value[CONFIG_KEY] || EMPTY_CONFIG;
}

/**
 *
 * Replace placeholders in the template with either the value or URI encoded value then create a new tab
 *
 * Template supports
 * - {value}: the encoded URI value
 * - {raw_value}: the value exactly as is
 *
 * @param {string} value
 * @param {string} template
 */
function openTabForTemplate(value, template) {
  const url = template
    .replaceAll(/\{value\}/g, encodeURIComponent(value))
    .replaceAll(/\{raw_value\}/g, value);

  browser.tabs.create({ url });
}

/**
 *
 * Creates menus and adds an event listener to handle menu clicks
 *
 * @param {import("../shared/config.js").MenuConfig[]} menus
 * @returns {Promise<(string | number)[]>}
 */
async function initializeMenus(menus) {
  await browser.menus.removeAll();
  return menus.map((menu) => {
    return browser.menus.create({
      id: menu.id,
      title: menu.title,
      contexts: [menu.context],
    });
  });
}

/**
 * Creates menus for the currently persisted config
 * @param {import("../shared/config.js").ConfigData} config
 * @returns
 */
async function initialize(config) {
  return initializeMenus(config.menus);
}

browser.runtime.onInstalled.addListener(async () => {
  initialize(await getConfig());
});

browser.storage.local.onChanged.addListener(async (changes) => {
  if (changes[CONFIG_KEY]) {
    initialize(await getConfig());
  }
});

browser.menus.onClicked.addListener(async (info) => {
  const clickedMenu = await getConfiguredMenu(info.menuItemId.toString());
  if (!clickedMenu) {
    console.warn(`Potential stray menu ${info.menuItemId}`);
    return;
  }

  const value = (() => {
    switch (clickedMenu.context) {
      case 'link':
        return info.linkUrl;
      case 'selection':
        return info.selectionText;
      default:
        return undefined;
    }
  })();

  if (!value) {
    return;
  }

  openTabForTemplate(value, clickedMenu.urlTemplate);
});
