import { isBrowser, isWebWorker } from "browser-or-node";
const defaultKeys = {
  short: "9cc2a04b3d747db7",
  long: "c5e4e12974acfd0fcaffb10b04d91f4d",
};
const cast = (any) => {
  if (typeof any === "number") {
    return `type#number:${any}`;
  } else if (typeof any === "boolean") {
    return `type#boolean:${any}`;
  } else if (any === null) {
    return "type#null";
  } else if (typeof any === "string") {
    if (any.includes("type#number:")) {
      return parseFloat(any.split("type#number:")[1]);
    } else if (any.includes("type#boolean:")) {
      return any.split("type#boolean:")[1] === "true" ? true : false;
    } else if (any.includes("type#null")) {
      return null;
    } else return any;
  }
};

if (isBrowser || isWebWorker) {
  const CryptoJS = require("crypto-js");

  const e = (text, secretKey, iv) => {
    const options = {
      mode: CryptoJS.mode.CTR,
      iv: CryptoJS.enc.Utf8.parse(iv),
      padding: CryptoJS.pad.NoPadding,
    };
    const cipher = CryptoJS.AES.encrypt(
      cast(text),
      CryptoJS.enc.Utf8.parse(secretKey),
      options
    );
    return cipher.ciphertext.toString();
  };

  const d = (hash, secretKey, iv) => {
    const options = {
      mode: CryptoJS.mode.CTR,
      iv: CryptoJS.enc.Utf8.parse(iv),
      padding: CryptoJS.pad.NoPadding,
    };
    const cipher = CryptoJS.AES.decrypt(
      {
        ciphertext: CryptoJS.enc.Hex.parse(hash),
      },
      CryptoJS.enc.Utf8.parse(secretKey),
      options
    );
    return cast(cipher.toString(CryptoJS.enc.Utf8));
  };

  const run = (
    json,
    encriptedKeys = false,
    operation = "encrypt",
    secret = defaultKeys.long,
    secret_2 = defaultKeys.short
  ) => {
    let secretKey = secret;
    if (secretKey.length >= 32) {
      secretKey = secretKey.substring(0, 32);
    } else {
      while (secretKey.length < 32) {
        secretKey = `${secretKey}#`;
      }
    }

    let iv = secret_2;

    if (iv.length >= 16) {
      iv = iv.substring(0, 16);
    } else {
      while (iv.length < 16) {
        iv = `${iv}#`;
      }
    }

    const walkOnJson = (object) => {
      const type = typeof object;
      let newJSON = {};
      if (type === "object") {
        if (object === null || object === undefined) {
          return object;
        } else if (Array.isArray(object)) {
          newJSON = object.map((i) => walkOnJson(i));
          return newJSON;
        } else {
          const keys = Object.keys(object);
          newJSON = object;
          keys?.forEach((i) => {
            const newValue =
              typeof object[i] === "object" &&
              object[i] !== null &&
              object[i] !== undefined
                ? walkOnJson(object[i])
                : operation === "encrypt"
                ? e(object[i], secretKey, iv)
                : d(object[i], secretKey, iv);
            if (encriptedKeys) {
              const newKey =
                operation === "encrypt"
                  ? e(i, secretKey, iv)
                  : d(i, secretKey, iv);
              newJSON[newKey] = newValue;
              delete newJSON[i];
            } else {
              newJSON[i] = newValue;
            }
          });
          return newJSON;
        }
      } else
        return operation === "encrypt"
          ? e(object, secretKey, iv)
          : d(object, secretKey, iv);
    };

    try {
      json = JSON.parse(json);
    } catch (error) {}

    return walkOnJson(json);
  };

  /**
   * [encrypt Create a new encrypted Object]
   * @param {JSON | Object} json A input JSON or Object that should be encrypted
   * @param {Boolean} encriptedKeys OPTIONAL. Define if Object keys will be also encrypted. Default is false.
   * @param {String} secret OPTIONAL. A 32 secret chars, used as hash to encrypt
   * @param {String} secret_2 OPTIONAL. A 16 secret chars, also used as hash to encrypt
   * @returns {Object} Return a Simple JavaScript Object;
   */
  function encrypt(json, encriptedKeys, secret, secret_2) {
    return run(json, encriptedKeys, "encrypt", secret, secret_2);
  }

  /**
   * [decrypt Return a decrypted Object based on Input Object]
   * @param {JSON | Object} json A input JSON or Object that should be decrypted
   * @param {Boolean} encriptedKeys OPTIONAL. Define if Object keys will be also decrypted. Default is false.
   * @param {String} secret OPTIONAL. A 32 secret chars, used as hash to encrypt
   * @param {String} secret_2 OPTIONAL. A 16 secret chars, also used as hash to encrypt
   * @returns {Object} Return a Simple JavaScript Object;
   */
  function decrypt(json, encriptedKeys, secret, secret_2) {
    return run(json, encriptedKeys, "decrypt", secret, secret_2);
  }

  /**
   * [decryptKey Return a decrypted {Any} based on Input String]
   * @param {String} string A input string that should be decrypted
   * @param {String} secret OPTIONAL. A 32 secret chars, used as hash to decrypt
   * @param {String} secret_2 OPTIONAL. A 16 secret chars, also used as hash to decrypt
   * @returns {String} Return a string;
   */
  function decryptKey(string, secret, secret_2) {
    return d(string, secret, secret_2);
  }

  function encryptKey(string, secret, secret_2) {
    return e(string, secret, secret_2);
  }
  export {
    encrypt, decrypt, encryptKey, decryptKey
  }
} else {
  const { ObjectID } = require("bson");
  const { createCipheriv, createDecipheriv } = require("crypto");

  const algorithm = "aes-256-ctr";

  const e = (text, secretKey, iv) => {
    if (typeof text === "object" && ObjectID.isValid(text)) {
      text = text.toHexString();
    }
    const cipher = createCipheriv(algorithm, secretKey, iv);
    const encrypted = Buffer.concat([
      cipher.update(cast(text)),
      cipher.final(),
    ]);
    return encrypted.toString("hex");
  };

  const d = (hash, secretKey, iv) => {
    const decipher = createDecipheriv(algorithm, secretKey, iv);
    const decrpyted = Buffer.concat([
      decipher.update(Buffer.from(hash, "hex")),
      decipher.final(),
    ]);
    return cast(decrpyted.toString());
  };

  const run = (
    json,
    encriptedKeys = false,
    operation = "encrypt",
    secret = defaultKeys.long,
    secret_2 = defaultKeys.short
  ) => {
    let secretKey = secret;
    if (secretKey.length >= 32) {
      secretKey = secretKey.substring(0, 32);
    } else {
      while (secretKey.length < 32) {
        secretKey = `${secretKey}#`;
      }
    }

    let iv = secret_2;

    if (iv.length >= 16) {
      iv = iv.substring(0, 16);
    } else {
      while (iv.length < 32) {
        iv = `${iv}#`;
      }
    }

    const walkOnJson = (object) => {
      const type = typeof object;
      let newJSON = {};
      if (type === "object") {
        if (object === null || object === undefined) {
          return object;
        } else if (Array.isArray(object)) {
          newJSON = object.map((i) => walkOnJson(i));
          return newJSON;
        } else {
          const keys = Object.keys(object);
          newJSON = object;
          keys?.forEach((i) => {
            const newValue =
              typeof object[i] === "object" &&
              object[i] !== null &&
              object[i] !== undefined &&
              !ObjectID.isValid(object[i])
                ? walkOnJson(object[i])
                : operation === "encrypt"
                ? e(object[i], secretKey, iv)
                : d(object[i], secretKey, iv);
            if (encriptedKeys) {
              const newKey =
                operation === "encrypt"
                  ? e(i, secretKey, iv)
                  : d(i.toString(), secretKey, iv);
              newJSON[newKey] = newValue;
              delete newJSON[i];
            } else {
              newJSON[i] = newValue;
            }
          });
          return newJSON;
        }
      } else
        return operation === "encrypt"
          ? e(object, secretKey, iv)
          : d(object, secretKey, iv);
    };

    try {
      json = JSON.parse(json);
    } catch (error) {}

    return walkOnJson(json);
  };

  /**
   * [encrypt Create a new encrypted Object]
   * @param {JSON | Object} json A input JSON or Object that should be encrypted
   * @param {Boolean} encriptedKeys OPTIONAL. Define if Object keys will be also encrypted. Default is false.
   * @param {String} secret OPTIONAL. A 32 secret chars, used as hash to encrypt
   * @param {String} secret_2 OPTIONAL. A 16 secret chars, also used as hash to encrypt
   * @returns {Object} Return a Simple JavaScript Object;
   */
  function encrypt(json, encriptedKeys, secret, secret_2) {
    return run(json, encriptedKeys, "encrypt", secret, secret_2);
  }

  /**
   * [decrypt Return a decrypted Object based on Input Object]
   * @param {JSON | Object} json A input JSON or Object that should be decrypted
   * @param {Boolean} encriptedKeys OPTIONAL. Define if Object keys will be also decrypted. Default is false.
   * @param {String} secret OPTIONAL. A 32 secret chars, used as hash to encrypt
   * @param {String} secret_2 OPTIONAL. A 16 secret chars, also used as hash to encrypt
   * @returns {Object} Return a Simple JavaScript Object;
   */
  function decrypt(json, encriptedKeys, secret, secret_2) {
    return run(json, encriptedKeys, "decrypt", secret, secret_2);
  }

  /**
   * [decryptKey Return a decrypted {Any} based on Input String]
   * @param {String} string A input string that should be decrypted
   * @param {String} secret OPTIONAL. A 32 secret chars, used as hash to decrypt
   * @param {String} secret_2 OPTIONAL. A 16 secret chars, also used as hash to decrypt
   * @returns {String} Return a string;
   */
  function decryptKey(string, secret, secret_2) {
    return d(string, secret, secret_2);
  }

  function encryptKey(string, secret, secret_2) {
    return e(string, secret, secret_2);
  }

  export {
    encrypt, decrypt, encryptKey, decryptKey
  }
}
