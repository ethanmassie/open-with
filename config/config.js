import { getConfig, setConfig, watchConfig } from '../shared/config.js';

function initializeImport() {
  const filePicker = document.getElementById('import-file-picker');
  if (!filePicker || !(filePicker instanceof HTMLInputElement)) {
    return;
  }

  const importButton = document.getElementById('import-button');
  if (!importButton) {
    return;
  }

  importButton.addEventListener('click', () => {
    filePicker.click();
  });

  filePicker.addEventListener('change', async () => {
    const files = filePicker.files;
    if (!files || files.length === 0) {
      return;
    }
    const file = files[0];
    const text = await file.text();
    let config;
    try {
      config = JSON.parse(text);
    } catch {
      console.error('Invalid JSON');
    }

    try {
      setConfig(config);
    } catch {
      console.error('Invalid Config');
    }
  });
}

function initializeExport() {
  document
    .getElementById('export-button')
    ?.addEventListener('click', async () => {
      const config = await getConfig();
      const configJson = JSON.stringify(config, undefined, 2);
      const url = window.URL.createObjectURL(new Blob([configJson]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'open-with-config.json';
      a.click();

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 5000);
    });
}

function initializeForm() {
  const form = document.getElementById('menus-form');
  if (!form || !(form instanceof HTMLFormElement)) {
    return;
  }

  document.body.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.classList.contains('add-button')) {
      form.append(createMenuFieldset());

      return;
    }

    if (target.classList.contains('remove-field-button')) {
      target.closest('fieldset')?.remove();

      return;
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = collectFormData(form);
    try {
      setConfig(data);
    } catch (e) {
      // TODO: add visual feedback
      console.error(e);
    }
  });

  watchConfig((config) => {
    const menuFieldsets =
      config.menus.length === 0
        ? [createMenuFieldset()]
        : config.menus.map((menu) => createMenuFieldset(menu));
    form.innerHTML = '';
    form.append(...menuFieldsets);
  });
}

/**
 *
 * @param {HTMLFormElement} form
 * @returns {import("../shared/config.js").ConfigData}
 */
function collectFormData(form) {
  /** @type {import("../shared/config.js").MenuConfig[]} */
  const menus = [];
  form.querySelectorAll('fieldset').forEach((fieldset) => {
    /** @type {any} */
    const menu = {};
    fieldset.querySelectorAll('[data-field]').forEach((fieldElement) => {
      if (
        !(fieldElement instanceof HTMLInputElement) &&
        !(fieldElement instanceof HTMLSelectElement)
      ) {
        return;
      }

      const field = fieldElement.getAttribute('data-field');
      if (!field) {
        return;
      }
      menu[field] = fieldElement.value;
    });

    menu.id = crypto.randomUUID();
    menus.push(menu);
  });

  return { menus };
}

/**
 *
 * Creates a menu fieldset for the form based on the template and returns the element
 *
 * @param {import("../shared/config.js").MenuConfig=} menu
 */
function createMenuFieldset(menu = undefined) {
  const template = document.getElementById('menu-form-set-template');
  if (!template || !(template instanceof HTMLTemplateElement)) {
    throw new Error('Missing essential template');
  }
  const clone = document.importNode(template.content, true);

  if (menu) {
    Object.entries(menu).forEach(([field, value]) => {
      const fieldElement = clone.querySelector(`[data-field=${field}]`);
      if (
        !(fieldElement instanceof HTMLInputElement) &&
        !(fieldElement instanceof HTMLSelectElement)
      ) {
        return;
      }

      fieldElement.value = value;
    });
  }

  return clone;
}

initializeForm();
initializeExport();
initializeImport();
