const secretWord = "ivan";
const express = require("express");
const app = express();
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const filePath = path.join(__dirname, "passwords.json");
const jsonParser = express.json();
const { checkPassword } = require("./src/utils/validations.js");
// ======================================================
const crypto = require("crypto");
salt = crypto.randomBytes(16);
iv = crypto.randomBytes(16);
key = crypto.pbkdf2Sync(secretWord, salt, 100000, 256 / 8, "md4");
function cryptoFile() {
  cipher = crypto.createCipheriv("aes-256-cfb", key, iv);

  cipher.write(`{
    "users": [
        {
            "name": "admin",
            "password": "IvaN2001",
            "blocked": 0,
            "passwordLimit": 0
        },
        {
            "name": "1",
            "password": "11.11",
            "blocked": "1",
            "passwordLimit": "1"
        },
        {
            "name": "123",
            "password": "2.2",
            "blocked": "1",
            "passwordLimit": "1"
        },
        {
            "name": "1234",
            "password": "1.1",
            "blocked": "0",
            "passwordLimit": "0"
        },
        {
            "name": "asd",
            "password": "asd",
            "blocked": "0",
            "passwordLimit": "0"
        },
        {
            "name": "qwerty",
            "password": "qwerty",
            "blocked": "0",
            "passwordLimit": "0"
        },
        {
            "name": "122",
            "password": "12",
            "blocked": "0",
            "passwordLimit": "0"
        }
    ]
}`);
  cipher.end();

  encrypted = cipher.read();
  console.log({
    iv: iv.toString("base64"),
    salt: salt.toString("base64"),
    encrypted: encrypted.toString("base64"),
    concatenned: Buffer.concat([salt, iv, encrypted]).toString("base64"),
  });
  fs.writeFile(
    "db.txt",
    Buffer.concat([salt, iv, encrypted]).toString("base64"),
    () => {}
  );
  fs.readFile("db.txt", function (err, data) {
    console.log(String(data));
    decryptoFile(String(data));
  });
}
function decryptoFile(code) {
  encrypted = Buffer.from(code, "base64");
  const salt_len = (iv_len = 16);

  salt = encrypted.slice(0, salt_len);
  iv = encrypted.slice(0 + salt_len, salt_len + iv_len);
  key = crypto.pbkdf2Sync(secretWord, salt, 100000, 256 / 8, "md4");

  decipher = crypto.createDecipheriv("aes-256-cfb", key, iv);

  decipher.write(encrypted.slice(salt_len + iv_len));
  decipher.end();

  decrypted = decipher.read();
  console.log(decrypted.toString());
}
cryptoFile();
