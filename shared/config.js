import {
  isEnum,
  isEvery,
  isRequired,
  isType,
  validate,
  validateArray,
} from "./validate.js";

export const CONFIG_KEY = "config";
export const VALID_CONTEXTS = ["link", "selection"];

/**
 * @type {import("./validate").Schema<MenuConfig>}
 */
const MENU_CONFIG_SCHEMA = {
  id: isEvery(isRequired, isType("string")),
  title: isEvery(isRequired, isType("string")),
  context: isEvery(isRequired, isEnum(VALID_CONTEXTS)),
  urlTemplate: isEvery(isRequired, isType("string")),
};

export const isValidMenu = validate(MENU_CONFIG_SCHEMA);

/**
 * @type {import("./validate").Schema<ConfigData>}
 */
const CONFIG_SCHEMA = {
  menus: validateArray(isValidMenu),
};

export const isValidConfig = validate(CONFIG_SCHEMA);

/**
 * @typedef {Object} MenuConfig
 * @property {string} id
 * @property {string} title
 * @property {('link' | 'selection')} context
 * @property {string} urlTemplate
 */

/**
 * @typedef {Object} ConfigData
 * @property {MenuConfig[]} menus
 */

const EMPTY_CONFIG = {
  menus: [],
};

/**
 *
 * @returns {Promise<ConfigData>}
 */
export async function getConfig() {
  const storage = await browser.storage.local.get(CONFIG_KEY);
  const config = storage[CONFIG_KEY];

  if (!isValidConfig(config)) {
    return EMPTY_CONFIG;
  }

  return config;
}

/**
 * Initially calls fn with the current value of config then calls again whenever config changes.
 *
 * @param {(config: ConfigData) => void} fn
 * @returns {Promise<() => void>} stops watching for config changes
 */
export async function watchConfig(fn) {
  const currentConfig = await getConfig();
  fn(currentConfig);

  /**
   *
   * @param {Record<string, browser.storage.StorageChange>} changes
   */
  const listener = (changes) => {
    if (changes[CONFIG_KEY]) {
      getConfig().then(fn);
    }
  };
  browser.storage.local.onChanged.addListener(listener);

  return () => {
    browser.storage.local.onChanged.removeListener(listener);
  };
}

/**
 *
 * @param {ConfigData} config
 */
export function setConfig(config) {
  if (!isValidConfig(config)) {
    throw Error("Attempted to store invalid config", { cause: config });
  }

  browser.storage.local.set({ [CONFIG_KEY]: config });
}
