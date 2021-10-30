<h1 align="center">
	🔣 JSON-Crypto 🔢
</h1>

<p align="center">
  A simple way to encrypt and decrypt JSON, creating secure data transfer
</p>

<p align="center">
	<a href="#about">About</a> •
	<a href="#installation">Installation</a> •
	<a href="#usage">Usage</a> •
	<a href="#authors">Authors</a> •
	<a href="#license">License</a>
</p>

# About

Encrypt and decrypt JSON or Simple JavaScript objects. Designed to be used as middleware between the backend and the frontend to prevent web users from getting a human readable JSON, directly in the browser. Useful for frontend applications with logic and/or data processing.

# Restrictions

For now, JSON-Crypto can encrypt and decrypt any JSON. But for JavaScript Objects, the available key values must be of type: `Object`, `Array`, `String`, `Number`, `Boolean` or `null`. We're calling this a `Simple JavaScript Object`. In this case you cannot have a `new Date()` as a value, for example.

# Installation

Use your favorite JavaScript package manager!

```bash
$ npm install @danilo_pereira/json-crypto

$ yarn add @danilo_pereira/json-crypto
```

## Dependencies

Perhaps, the `crypto` dependency must be installed manually for the project to work.

```bash
$ npm install crypto

$ yarn add crypto
```

# Usage

Once installed, you can import `JSON-Crypto` into your JavaScript project, insert at the top of your file the following line:

```javascript
import jsonCrypto from '@danilo_pereira/json-crypto';
```

or

```javascript
var jsonCrypto = require('@danilo_pereira/json-crypto');
```

You also can import the methods one by one, using:

```javascript
import { encrypt, decrypt, decryptKey } from "@danilo_pereira/json-crypto";
```

In the latter case, you should not call `json-crypto` methods like `jsonCrypto.encrypt(...)` but use the method directly like `encrypt(...)`

## Encrypt

To encrypt a JSON or Simple JavaScript Object you should call `jsonCrypto.encrypt(json, encriptedKeys, secret, secret_2)`.

### Arguments:

1. json: <font size="1">_REQUIRED_</font> A input JSON or Object that should be encrypted. Should be of type `JSON` or `Object`.
2. encriptedKeys: <font size="1">_OPTIONAL_</font> Define if Object keys will be also encrypted. Should be of type `Boolean`. The default value is `false`.
3. secret: <font size="1">_OPTIONAL_</font> Secret string (with up to 32 chars), used as hash to encrypt. Should be of type `String`. We use a default hash if not informed.
4. secret_2: <font size="1">_OPTIONAL_</font> Secret string (with up to 16 chars), also used as hash to encrypt. Should be of type `String`. We use a default hash if not informed.

### Output

This should return a valid Simple JavaScript Object encrypted.

### Example

```javascript
import jsonCrypto from '@danilo_pereira/json-crypto';
...
// SIMPLE CASE:
jsonCrypto.encrypt({
    key_1: "value_1",
    key_2: 2,
    key_3: null,
    key_4: false,
    key_5: { key_5_1: "value_5" },
    key_6: ["value_6_1", "value_6_2"],
  });
/*
Output:
 {
   key_1: '126b1c3b908fc3',
   key_2: '1073002bd6be87660199ef1043',
   key_3: '1073002bd6be87670f',
   key_4: '1073002bd6b29d640f99fc444bb14f69ce5c',
   key_5: { key_5_1: '2c6b0326a3b19e7e06a3a8' },
   key_6: [ '126b1c3b908fc45452', '126b1c3b908fc45451' ]
 }
 */

// KEY ENCRYPT CASE:
jsonCrypto.encrypt({
    key_1: "value_1",
    key_2: 2,
    key_3: null,
    key_4: false,
    key_5: { key_5_1: "value_5" },
    key_6: ["value_6_1", "value_6_2"],
  }, true);
/*
Output:
{
  '0f6f0911c4': '126b1c3b908fc3',
  '0f6f0911c7': '1073002bd6be87660199ef1043',
  '0f6f0911c6': '1073002bd6be87670f',
  '0f6f0911c1': '1073002bd6b29d640f99fc444bb14f69ce5c',
  '0f6f0911c0': { '0f6f0911c08fc3': '2c6b0326a3b19e7e06a3a8' },
  '0f6f0911c3': [ '126b1c3b908fc45452', '126b1c3b908fc45451' ]
}
*/

// KEY ENCRYPT CASE, WITH OPTIONAL HASH:
jsonCrypto.encrypt({
    key_1: "value_1",
    key_2: 2,
    key_3: null,
    key_4: false,
    key_5: { key_5_1: "value_5" },
    key_6: ["value_6_1", "value_6_2"],
}, true, "StarWarsJedi", "RabbitsEatCarrotsInTheMorning");
/*
Output:
{
  '16de1fe44c': '0bda0ace187253',
  '16de1fe44f': '09c216de5e43174cbf5b8cd709',
  '16de1fe44e': '09c216de5e43174db1',
  '16de1fe449': '09c216de5e4f0d4eb15b9f830178d87bc7ff',
  '16de1fe448': { '16de1fe4487253': '35da15d32b4c0e54b861cb' },
  '16de1fe44b': [ '0bda0ace1872547eec', '0bda0ace1872547eef' ]
}
In this case, the secret was defined at: "StarWarsJedi####################" (32 chars) and secret_2 was defined at: "RabbitsEatCarrot" (16ch)
*/
```

## Decrypt

To decrypt a JSON or Simple JavaScript Object you should call `jsonCrypto.decrypt(json, encriptedKeys, secret, secret_2)`.

### Arguments:

1. json: <font size="1">_REQUIRED_</font> A input JSON or Object that should be decrypted. Should be of type `JSON` or `Object`.
2. encriptedKeys: <font size="1">_OPTIONAL_</font> Define if Object keys will be also decrypted. Should be of type `Boolean`. The default value is `false`.
3. secret: <font size="1">_OPTIONAL_</font> Secret string (with up to 32 chars). Needs to be the same secret hash used to encrypt. Should be of type `String`. We use a default hash if not informed.
4. secret_2: <font size="1">_OPTIONAL_</font> Secret string (with up to 16 chars). Needs to be the same secret hash used to encrypt. Should be of type `String`. We use a default hash if not informed.

### Output

This should return a valid Simple JavaScript Object decrypted.

### Example

```javascript
import jsonCrypto from '@danilo_pereira/json-crypto';
...
// SIMPLE CASE:
jsonCrypto.decrypt(
  {
   key_1: '126b1c3b908fc3',
   key_2: '1073002bd6be87660199ef1043',
   key_3: '1073002bd6be87670f',
   key_4: '1073002bd6b29d640f99fc444bb14f69ce5c',
   key_5: { key_5_1: '2c6b0326a3b19e7e06a3a8' },
   key_6: [ '126b1c3b908fc45452', '126b1c3b908fc45451' ]
 });
/*
Output:
 {
    key_1: "value_1",
    key_2: 2,
    key_3: null,
    key_4: false,
    key_5: { key_5_1: "value_5" },
    key_6: ["value_6_1", "value_6_2"],
  }
 */

// KEY ENCRYPT CASE:
jsonCrypto.decrypt(
  {
  '0f6f0911c4': '126b1c3b908fc3',
  '0f6f0911c7': '1073002bd6be87660199ef1043',
  '0f6f0911c6': '1073002bd6be87670f',
  '0f6f0911c1': '1073002bd6b29d640f99fc444bb14f69ce5c',
  '0f6f0911c0': { '0f6f0911c08fc3': '2c6b0326a3b19e7e06a3a8' },
  '0f6f0911c3': [ '126b1c3b908fc45452', '126b1c3b908fc45451' ]
}, true);
/*
Output:
{
    key_1: "value_1",
    key_2: 2,
    key_3: null,
    key_4: false,
    key_5: { key_5_1: "value_5" },
    key_6: ["value_6_1", "value_6_2"],
  }
*/


// KEY ENCRYPT CASE, WITH OPTIONAL HASH:
jsonCrypto.decrypt({
  '16de1fe44c': '0bda0ace187253',
  '16de1fe44f': '09c216de5e43174cbf5b8cd709',
  '16de1fe44e': '09c216de5e43174db1',
  '16de1fe449': '09c216de5e4f0d4eb15b9f830178d87bc7ff',
  '16de1fe448': { '16de1fe4487253': '35da15d32b4c0e54b861cb' },
  '16de1fe44b': [ '0bda0ace1872547eec', '0bda0ace1872547eef' ]
}, true, "StarWarsJedi", "RabbitsEatCarrotsInTheMorning");
/*
Output:
{
    key_1: "value_1",
    key_2: 2,
    key_3: null,
    key_4: false,
    key_5: { key_5_1: "value_5" },
    key_6: ["value_6_1", "value_6_2"],
}
In this case, the secret was defined at: "StarWarsJedi####################" (32 chars) and secret_2 was defined at: "RabbitsEatCarrot" (16ch)
*/
```

## Decrypt Syngle Key

To decrypt a `String` you should call `jsonCrypto.decryptKey(string, secret, secret_2)`.

### Arguments:

1. string: <font size="1">_REQUIRED_</font> A input string that should be decrypted. Should be of type `string`.
2. secret: <font size="1">_OPTIONAL_</font> Secret string (with up to 32 chars). Needs to be the same secret hash used to encrypt. Should be of type `String`. We use a default hash if not informed.
3. secret_2: <font size="1">_OPTIONAL_</font> Secret string (with up to 16 chars). Needs to be the same secret hash used to encrypt. Should be of type `String`. We use a default hash if not informed.

### Output

This should return a `String`, `Number`, `Boolean` or `null` decrypted.

### Example

```javascript
import jsonCrypto from '@danilo_pereira/json-crypto';
...
// SIMPLE CASE:
jsonCrypto.decrypt("126b1c3b908fc3");
/*
Output:
"value_1"
 */

```

# Authors

<table>
  <tr>
    <td align="center"><a href="https://www.linkedin.com/in/danilojpferreira/"><img style="border-radius: 50%;" height="auto" width="100px" src="https://avatars.githubusercontent.com/u/43321038"><br /><p><b>Danilo Pereira</b></p></a><p>Author</p></td>
  </tr>
</table>

# License

This project is under the [GNU General Public License](./LICENSE).

---

Documentation Template made by:

<table>
  <tr>
    <td align="center"><a href="https://www.linkedin.com/in/leticia-vigna/"><img style="border-radius: 50%;" height="auto" width="100px" src="https://avatars.githubusercontent.com/u/41032355"><br /><p><b>Letícia Vigna</b></p></a><p>Documentation template author</p></td>
  </tr>
</table>
