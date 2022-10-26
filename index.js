let wrong = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    
  </head>
  <body>
    <form>
      <input type="password" name="old" placeholder="Старый" />
      <input type="password" name="new" placeholder="Новый" />
      <input type="password" name="copyn" placeholder="Повтор" />
      <button type="submit">Подтвердить</button>
    </form>
    
  </body>
</html>`;
let secretWord = "ivan";
let usersKey = "";
const process = require("process");
const express = require("express");
const app = express();
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const jsonParser = express.json();
const { checkPassword } = require("./src/utils/validations.js");
// ======================================================
const crypto = require("crypto");
const { exit, off } = require("process");
let enterSecret = 0;

fs.stat("db.txt", (err, data) => {
  if (err) {
    createCryptoFile(secretWord);
  } else {
    console.log("yes");
  }
});
async function createCryptoFile(secretWord) {
  let code = `{
    "users": [
        {
            "name": "admin",
            "password": "",
            "blocked": 0,
            "passwordLimit": 0
        }
    ]
}`;
  salt = crypto.randomBytes(16);
  iv = crypto.randomBytes(16);
  key = crypto.pbkdf2Sync(secretWord, salt, 1, 256 / 8, "md4");
  cipher = crypto.createCipheriv("aes-256-cfb", key, iv);
  await cipher.write(`${code}`);
  cipher.end();
  let encrypted = cipher.read();
  // console.log({
  //   iv: iv.toString("base64"),
  //   salt: salt.toString("base64"),
  //   encrypted: encrypted.toString("base64"),
  //   concatenned: Buffer.concat([salt, iv, encrypted]).toString("base64"),
  // });
  // console.log(Buffer.concat([salt, iv, encrypted]).toString("base64"));
  (async () => {
    fs.writeFile(
      "db.txt",
      Buffer.concat([salt, iv, encrypted]).toString("base64"),
      () => {}
    );
  })();
}
async function decryptoFile(code, secretWord) {
  if (code.length % 4 !== 0) return "error";
  encrypted = Buffer.from(code, "base64");
  const salt_len = (iv_len = 16);
  salt = encrypted.slice(0, salt_len);
  iv = encrypted.slice(salt_len, salt_len + iv_len);
  key = crypto.pbkdf2Sync(secretWord, salt, 1, 256 / 8, "md4");
  decipher = crypto.createDecipheriv("aes-256-cfb", key, iv);
  // let ver = crypto.verify('aes-256-cfb', encrypted, key, signature)
  // console.log(ver)
  // decipher.setAAD(encrypted.slice(salt_len + iv_len));
  decipher.write(encrypted.slice(salt_len + iv_len));
  let test = decipher.end();

  decrypted = decipher.read();

  try {
    JSON.parse(decrypted);

    fs.writeFile(
      "passwords.json",
      decrypted.toString(),
      "utf8",
      function () {}
    );
  } catch (error) {
    console.log(error);
    return "error";
  }
}

async function cryptoFile(code, pass) {
  code = Buffer.from(code, "base64");
  const salt_len = (iv_len = 16);
  salt = code.slice(0, salt_len);
  iv = code.slice(0 + salt_len, salt_len + iv_len);
  key = crypto.pbkdf2Sync(secretWord, salt, 1, 256 / 8, "md4");
  cipher = crypto.createCipheriv("aes-256-cfb", key, iv);
  cipher.write(`${pass}`);
  cipher.end();
  let encrypted = cipher.read();
  console.log({
    iv: iv.toString("base64"),
    salt: salt.toString("base64"),
    encrypted: encrypted.toString("base64"),
    concatenned: Buffer.concat([salt, iv, encrypted]).toString("base64"),
  });
  let write = Buffer.concat([salt, iv, encrypted]).toString("base64");
  let flag = 0;
  let promise = new Promise(async (resolve, reject) => {
    console.log(`${write}`);
    fs.writeFile("db.txt", `${write}`, () => {
      console.log(write);
    });

    fs.unlink("passwords.json", (err) => {});
    flag = 1;
    resolve(flag);
  });
  flag = await promise;
  return flag;
}
// ======================================================
app.use(express.static("public"));
app.get("/kill", async (req, res) => {
  fs.readFile("db.txt", async function (err, data) {
    fs.readFile("passwords.json", async function (err, data2) {
      let flag;
      let promise = new Promise(async (resolve, reject) => {
        flag = await cryptoFile(String(data), String(data2));
        resolve(flag);
      });
      let result = await promise;
      setTimeout(() => {
        if (flag) exit(0);
      }, 2000);
    });
  });
  res.sendStatus(200);
});
app.get("/enterSecret", (req, res) => {
  if (enterSecret) res.status(200).send(`${enterSecret}`);
  else res.status(200).send(`${enterSecret}`);
});
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: __dirname });
});
app.get("/users", (req, res) => {
  let result = [];
  fs.readFile("passwords.json", function (err, data) {
    if (err) throw err;
    const names = JSON.parse(data);
    for (let i in names.users) {
      let obj = {};
      obj[`name`] = names.users[i][`name`];
      obj[`blocked`] = names.users[i][`blocked`];
      obj[`passwordLimit`] = names.users[i][`passwordLimit`];
      result.push(obj);
    }
    res.send(result);
  });
});
app.get("/getLength", (req, res) => {
  let result = [];
  fs.readFile("passwords.json", function (err, data) {
    if (err) throw err;
    const names = JSON.parse(data);
    result = names.users.length;
    res.send(`${result}`);
  });
});
app.post("/keyWord", jsonParser, (req, res) => {
  if (!req.body) return res.sendStatus(400);
  usersKey = req.body.keyWord;
  enterSecret = 1;
  fs.readFile("db.txt", async function (err, data) {
    let result = await decryptoFile(String(data), usersKey);
    console.log(result);
    if (result == "error") {
      res.status(400).send(`error`);
      setTimeout(() => {
        exit(0);
      }, 2000);
    } else res.status(200).send("ok");
  });
});
app.post("/checkBlocked", jsonParser, (req, res) => {
  if (!req.body) return res.sendStatus(400);
  const login = req.body.user[`name`];
  fs.readFile("passwords.json", function (err, data) {
    if (err) throw err;
    let result = JSON.parse(data);
    for (let i in result.users) {
      if (result.users[i][`name`] == login) {
        res.send(`${result.users[i][`blocked`]}`);
        break;
      }
    }
  });
});
app.post("/checkPasswordLimit", jsonParser, (req, res) => {
  if (!req.body) return res.sendStatus(400);
  const login = req.body.user[`name`];
  fs.readFile("passwords.json", function (err, data) {
    if (err) throw err;
    let result = JSON.parse(data);
    for (let i in result.users) {
      if (result.users[i][`name`] == login) {
        res.send(`${result.users[i][`passwordLimit`]}`);
        break;
      }
    }
  });
});
app.post("/checkPassword", jsonParser, (req, res) => {
  if (!req.body) return res.sendStatus(400);
  const login = req.body.user[`name`];
  fs.readFile("passwords.json", function (err, data) {
    if (err) throw err;
    let result = JSON.parse(data);
    for (let i in result.users) {
      if (result.users[i][`name`] == login) {
        const check = checkPassword(result.users[i][`password`]);
        if (check) res.send(`${1}`);
        else res.send(`${0}`);
      }
    }
  });
});
app.post("/saveChangeO", jsonParser, (req, res) => {
  if (!req.body) return res.sendStatus(400);
  fs.readFile("passwords.json", function (err, data) {
    if (err) throw err;
    let result = JSON.parse(data);
    for (let i in result.users) {
      if (req.body.login == result.users[i][`name`]) {
        result.users[i][`blocked`] = req.body.blocked;
        result.users[i][`passwordLimit`] = req.body.passwordLimit;
        let json = JSON.stringify(result);
        fs.writeFile("passwords.json", json, "utf8", function () {});
        res.status(200).send("success");
        break;
      }
    }
  });
});
app.post("/saveAll", jsonParser, (req, res) => {
  if (!req.body) return res.sendStatus(400);
  let usersData = req.body.data;
  fs.readFile("passwords.json", function (err, data) {
    if (err) throw err;
    let result = JSON.parse(data);
    for (let i = 0; i < usersData.length; i++) {
      result.users[i + 1][`name`] = usersData[i][`name`];
      result.users[i + 1][`blocked`] = usersData[i][`blocked`];
      result.users[i + 1][`passwordLimit`] = usersData[i][`passwordLimit`];
    }
    let json = JSON.stringify(result);
    fs.writeFile("passwords.json", json, "utf8", function () {});
  });
  res.status(200).send("success");
});
app.post("/reg", jsonParser, (req, res) => {
  if (!req.body) return res.sendStatus(400);
  fs.readFile("passwords.json", function (err, data) {
    if (err) throw err;
    let result = JSON.parse(data);
    let success = 0;
    for (let i in result.users) {
      if (req.body.login == result.users[i][`name`]) {
        success = 1;
        res.sendStatus(400);
        break;
      }
    }
    if (!success) {
      result.users.push({
        name: req.body.login,
        password: req.body.password,
        blocked: 0,
        passwordLimit: 0,
      });
      let json = JSON.stringify(result);
      fs.writeFile("passwords.json", json, "utf8", function () {});
      res.sendStatus(200);
    }
  });
});
app.post("/change", jsonParser, (req, res) => {
  if (!req.body) return res.sendStatus(400);
  fs.readFile("passwords.json", function (err, data) {
    if (err) throw err;
    console.log(req.body);
    let result = JSON.parse(data);
    for (let i in result.users) {
      if (req.body.login == result.users[i][`name`]) {
        if (req.body.old == result.users[i][`password`]) {
          if (result.users[i][`passwordLimit`] == 1) {
            const check = checkPassword(req.body.new);
            if (check) {
              result.users[i][`password`] = req.body.new;
              let json = JSON.stringify(result);
              fs.writeFile("passwords.json", json, "utf8", function () {});
              res.status(200).send("Пароль изменен");
            } else res.status(400).send("Пароль не соответствует требованию");
          } else {
            result.users[i][`password`] = req.body.new;
            let json = JSON.stringify(result);
            fs.writeFile("passwords.json", json, "utf8", function () {});
            res.status(200).send("Пароль изменен");
            break;
          }
        } else {
          res.status(400).send(`Старый пароль неверен`);
          break;
        }
      }
    }
  });
});
app.post("/getOne", jsonParser, (req, res) => {
  let result = [];
  fs.readFile("passwords.json", function (err, data) {
    if (err) throw err;
    const names = JSON.parse(data);
    for (let i in names.users) {
      if (req.body.id == i) {
        let obj = {};
        obj[`name`] = names.users[i][`name`];
        obj[`blocked`] = names.users[i][`blocked`];
        obj[`passwordLimit`] = names.users[i][`passwordLimit`];
        result.push(obj);
        res.status(200).send(result);
        break;
      }
    }
  });
});
app.post("/login", jsonParser, (req, res) => {
  if (!req.body) return res.sendStatus(400);
  fs.readFile("passwords.json", function (err, data) {
    if (err) throw err;
    const result = JSON.parse(data);

    if (req.body.name !== "admin") {
      let login = 0;
      for (let i in result.users) {
        if (result.users[i][`name`] == req.body.name) {
          login = 1;

          if (result.users[i][`password`] == req.body.password) {
            if (result.users[i][`password`] == "") {
              res.status(400).send(`${wrong}`);
            } else {
              if (result.users[i][`passwordLimit`]) {
                if (!checkPassword(result.users[i][`password`])) {
                  res.status(400).send(`${wrong}`);
                } else {
                  res.send(`<!DOCTYPE html>
                <html lang="en">
                  <head>
                    <meta charset="UTF-8" />
                    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <link rel="stylesheet" href="/styles/user.css" />
                    <title>User panel</title>
                  </head>
                  <body>
                    <h1>User panel</h1>
                    <p id="login">${req.body.name}</p>
                    <div class="controlPanel">
                      <button id="changeP" class="button">Сменить пароль</button>
                      <button id="quit" class="button">Выйти</button>
                    </div>
                  </body>
                </html>
                `);
                }
              } else {
                res.send(`<!DOCTYPE html>
              <html lang="en">
                <head>
                  <meta charset="UTF-8" />
                  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                  <link rel="stylesheet" href="/styles/user.css" />
                  <title>User panel</title>
                </head>
                <body>
                  <h1>User panel</h1>
                  <p id="login">${req.body.name}</p>
                  <div class="controlPanel">
                    <button id="changeP" class="button">Сменить пароль</button>
                    <button id="quit" class="button">Выйти</button>
                  </div>
                </body>
              </html>
              `);
              }
            }
            break;
          } else {
            res.send(`password`);
          }
        }
      }
      if (!login) {
        res.send(`login`);
      }
    } else {
      if (result.users[0][`password`] == "") {
        res.status(400).send(`${wrong}`);
      } else {
        if (req.body.password !== result.users[0][`password`]) {
          res.send(`password`);
        } else {
          res.send(
            `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link rel="stylesheet" href="/styles/admin.css" />
            <title>Admin panel</title>
          </head>
          <body>
            <h1>Admin panel</h1>
            <p id="login">${req.body.name}</p>
            <div class="controlPanel">
              <button id="changeP" class="button">Сменить пароль</button>
              <button id="showU" class="button">Показать пользователей</button>
              <button id="showOU" class="button">Показать пользователей по одному</button>
              <button id="createUser" class="button">Создать пользователя</button>
              <button id="quit" class="button">Выйти</button>
            </div>

          </body>
        </html>
        `
          );
        }
      }
    }
  });
});
const port = 5000;
app.listen(process.env.PORT || port, () => console.log(`${port}!`));
