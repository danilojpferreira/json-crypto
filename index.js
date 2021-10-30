const { createCipheriv, createDecipheriv } = require("crypto");

const algorithm = "aes-256-ctr";

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

const e = (text, secretKey, iv) => {
  const cipher = createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(cast(text)), cipher.final()]);
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
  secret = "vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3",
  secret_2 = "YesILoveCupcakes"
) => {
  let secretKey = secret;
  if (secretKey.length >= 32) {
    secretKey = secretKey.substring(0, 32);
  } else {
    while (secretKey.length < 32) {
      secretKey = `${secretKey}#`;
    }
  }

  console.log(secretKey);

  let iv = secret_2;

  if (iv.length >= 16) {
    iv = iv.substring(0, 16);
  } else {
    while (iv.length < 32) {
      iv = `${iv}#`;
    }
  }

  console.log(iv);

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

  newJSON = walkOnJson(json);
  return newJSON;
};

/**
 * [encrypt Create a new encrypted Object]
 * @param {JSON | Object} json A input JSON or Object that should be encrypted
 * @param {Boolean} [encriptedKeys = false] Define if Object keys will be also encrypted
 * @param {String} [secret] A 32 secret chars, used as hash to encrypt
 * @param {String} [secret_2] A 16 secret chars, also used as hash to encrypt
 * @returns {Object}
 */
const encrypt = (json, encriptedKeys, secret, secret_2) => {
  return run(json, encriptedKeys, "encrypt", secret, secret_2);
};

/**
 * [decrypt Return a decrypted Object based on Input Object]
 * @param {JSON | Object} json A input JSON or Object that should be decrypted
 * @param {Boolean} [encriptedKeys = false] Define if Object keys will be also decrypted
 * @param {String} [secret] A 32 secret chars, used as hash to encrypt
 * @param {String} [secret_2] A 16 secret chars, also used as hash to encrypt
 * @returns {Object}
 */
const decrypt = (json, encriptedKeys, secret, secret_2) => {
  return run(json, encriptedKeys, "decrypt", secret, secret_2);
};

/**
 * [decryptKey Return a decrypted {Any} based on Input String]
 * @param {String} string A input string that should be decrypted
 * @param {String} [secret] A 32 secret chars, used as hash to decrypt
 * @param {String} [secret_2] A 16 secret chars, also used as hash to decrypt
 * @returns {Any}
 */
const decryptKey = (string, secret, secret_2) => {
  return d(string, secret, secret_2);
};

module.exports = {
  encrypt: encrypt,
  decrypt: decrypt,
  decryptKey: decryptKey,
};