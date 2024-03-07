const fs = require("fs");

/**
 * flat json
 * @param {any} obj
 * @param {string} separator
 * @returns {Record<string, string | number>} flat json
 */
function flatJSON(obj, separator) {
  let root = {};

  /**
   * @param {any} o
   * @param {string[]} h
   */
  function n(o, h) {
    if (Array.isArray(o)) {
      o.map((v, i) => {
        n(v, [...h, i]);
      });
    } else if (typeof o === "object") {
      Object.entries(o).map(([k, v]) => {
        n(v, [...h, k]);
      });
    } else if (typeof o === "string" || typeof o === "number") {
      root[h.join(separator)] = o;
    }
  }

  n(obj, []);

  return root;
}

/**
 * @param {string} path
 * @param {string} separator
 * @returns {Record<string, string | number>} flat json
 */
function parse(path, separator) {
  return flatJSON(JSON.parse(fs.readFileSync(path).toString()), separator);
}

/**
 *
 * @param {{ [key: string]: string | number }} processEnv
 * @param {Record<string, string|number>} parsed
 * @param {{ debug: boolean; override: boolean }} options
 */
function populate(processEnv, parsed, options) {
  // Set process.env
  for (const key of Object.keys(parsed)) {
    if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
      if (options.override === true) {
        processEnv[key] = parsed[key];
      }

      if (options.debug) {
        if (options.override === true) {
          console.log(`"${key}" is already defined and WAS overwritten`);
        } else {
          console.log(`"${key}" is already defined and was NOT overwritten`);
        }
      }
    } else {
      processEnv[key] = parsed[key];
    }
  }
}

const JSONEnvModule = {
  parse,
  populate,
};

module.exports.parse = JSONEnvModule.parse;
module.exports.populate = JSONEnvModule.populate;
module.exports = JSONEnvModule;
