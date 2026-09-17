/**
 *
 * @typedef {(value: any) => boolean} Rule
 */

/**
 * @typedef {(value: any[]) => boolean} ArrayRule
 */

/**
 * @template T
 * @typedef {Record<keyof T, Rule>} Schema<T>
 */

/**
 *
 * @type {Rule}
 */
export function isRequired(value) {
  return !!value;
}

/**
 *
 * @param {Array} set
 * @returns {Rule}
 */
export function isEnum(set) {
  return (value) => set.some((s) => s === value);
}

/**
 *
 * @param {string} type
 * @returns {Rule}
 */
export function isType(type) {
  return (value) => typeof value === type;
}

/** @type {Rule} */
export function isArray(value) {
  return Array.isArray(value);
}

/**
 *
 * @param {Rule[]} rules
 * @returns {Rule}
 */
export function isEvery(...rules) {
  return (value) => rules.every((rule) => rule(value));
}

/**
 *
 * @param {Rule[]} rules
 * @returns {Rule}
 */
export function isSome(...rules) {
  return (value) => rules.some((rule) => rule(value));
}

/**
 *
 * @param {Schema<any>} schema
 * @returns {Rule}
 */
export function validate(schema) {
  return (value) => {
    if (!value) {
      return false;
    }

    for (let [key, rule] of Object.entries(schema)) {
      if (!rule(value[key])) {
        return false;
      }
    }

    return true;
  };
}

/**
 *
 * @param {Rule} validator
 * @returns {Rule}
 */
export function validateArray(validator) {
  return (value) => {
    if (!Array.isArray(value)) {
      return false;
    }

    return value.every(validator);
  };
}
