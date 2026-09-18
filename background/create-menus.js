import { CONFIG_KEY, watchConfig } from '../shared/config.js';

/**
 * @typedef {(info: browser.menus.OnClickData, tab?: browser.tabs.Tab) => void} MenuOnClickListener
 */

/**
 * @typedef {Object} MenuState
 * @property {(string | number)[]} menuIds
 * @property {MenuOnClickListener} listener
 */

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
 * @param {string} value
 * @param {string} template
 */
function openTabForTemplate(value, template) {
  const url = template.replaceAll(/\{value\}/g, encodeURIComponent(value));

  browser.tabs.create({ url });
}

/**
 *
 * Creates menus and adds an event listener to handle menu clicks
 *
 * @param {import("../shared/config.js").MenuConfig[]} menus
 * @returns {Promise<MenuState>}
 */
async function initializeMenus(menus) {
  await browser.menus.removeAll();
  /** @type {(string | number)[]} */
  const menuIds = [];
  menus.forEach((menu) => {
    return browser.menus.create({
      id: menu.id,
      title: menu.title,
      contexts: [menu.context],
    });
  });
  /**
   * @type {MenuOnClickListener}
   */
  const listener = (info) => {
    const clickedMenu = menus.find((m) => m.id === info.menuItemId);
    if (!clickedMenu) {
      return;
    }

    let value;
    switch (clickedMenu.context) {
      case 'link':
        value = info.linkUrl;
        break;
      case 'selection':
        value = info.selectionText;
        break;
    }

    if (!value) {
      return;
    }

    openTabForTemplate(value, clickedMenu.urlTemplate);
  };

  return { menuIds, listener };
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
  const config = await getConfig();
  initialize(config);
});

browser.storage.local.onChanged.addListener(async (changes) => {
  if (changes[CONFIG_KEY]) {
    initialize(await getConfig());
  }
});

browser.menus.onClicked.addListener(async (info) => {
  const config = await getConfig();
  const clickedMenu = config.menus.find((m) => m.id === info.menuItemId);
  if (!clickedMenu) {
    return;
  }

  let value;
  switch (clickedMenu.context) {
    case 'link':
      value = info.linkUrl;
      break;
    case 'selection':
      value = info.selectionText;
      break;
  }

  if (!value) {
    return;
  }

  openTabForTemplate(value, clickedMenu.urlTemplate);
});
