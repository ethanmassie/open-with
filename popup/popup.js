import { watchConfig } from '../shared/config.js';

/**
 *
 * @param {import("../shared/config.js").ConfigData} config
 * @returns
 */
async function populateLoadedMenusList(config) {
  const menuItems = config.menus.map((menu) => {
    const li = document.createElement('li');
    li.innerText = menu.title;

    return li;
  });

  const list = document.getElementById('loaded-menus-list');
  if (!list) {
    return;
  }
  list.innerHTML = '';
  list.append(...menuItems);
}

function initializeOpenConfigButton() {
  document
    .getElementById('open-config-button')
    ?.addEventListener('click', () => browser.runtime.openOptionsPage());
}

(async () => {
  initializeOpenConfigButton();

  watchConfig((config) => {
    populateLoadedMenusList(config);
  });
})();
