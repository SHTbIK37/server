// добавить пользователям состояние блокировки
// и ограничения по паролю
const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const filePath = path.join(__dirname, "passwords.json");
// -----------------------------------------------------
// fs.readFile("passwords.json", function (err, data) {
// if (err) throw err;
// const result = JSON.parse(data);
// result.users.push({ name: "Ivan", password: "ivan2001" });
// let json = JSON.stringify(result);
// fs.writeFile("passwords.json", json, "utf8", function () {});
// console.log(result);
// });
const urlencodedParser = express.urlencoded({ extended: false });
app.use(express.static(__dirname));

// -----------------------------------------------------

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: __dirname });
});

// -----------------------------------------------------

app.post("/", urlencodedParser, (req, res) => {
  if (!req.body) return res.sendStatus(400);
  fs.readFile("passwords.json", function (err, data) {
    if (err) throw err;
    const result = JSON.parse(data);
    if (req.body.name !== "admin") {
      for (let i in result.users) {
        if (result.users[i][`name`] == req.body.name) {
          if (result.users[i][`password`] == req.body.password) {
            res.sendFile("user.html", { root: __dirname });
            break;
          } else {
            res.sendFile("index.html", { root: __dirname });
          }
        }
      }
      res.sendFile("index.html", { root: __dirname });
    } else {
      if (req.body.password !== result.users[0][`password`]) {
        res.sendFile("index.html", { root: __dirname });
      } else {
        res.sendFile("admin.html", { root: __dirname });
      }
    }
  });
});
const port = 5000;
app.listen(port, () => console.log(`${port}!`));
