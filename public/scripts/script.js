(async () => {
  await checkSecret();

  let namee, passs;
  function changeIm(login) {
    linkScript("sample");
    let form = document.getElementsByTagName("form")[0];

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (form.new.value == form.copyn.value) {
        let response = await fetch("/change", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            login: login,
            old: form.old.value,
            new: form.new.value,
          }),
        });
        if (!response.ok) {
          if (document.getElementById("passwordError")) {
            document.getElementById("passwordError").innerHTML =
              await response.text();
          } else {
            const div = document.createElement("div");
            div.setAttribute("id", "passwordError");
            div.innerHTML = await response.text();
            document.body.appendChild(div);
          }
        } else {
          console.log(0);
          window.location = "/";
        }
      } else {
        form.new.value = "";
        form.copyn.value = "";
        form.old.value = "";
      }
    });
  }
  const created = document.getElementById("createdBy");
  created.addEventListener("click", getInfo);
  const form = document.getElementById("form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    namee = form.name.value;
    passs = form.password.value;
    const result = await fetch("/login", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.name.value,
        password: form.password.value,
      }),
    });
    let text = await result.text();
    if (!result.ok) {
      document.documentElement.innerHTML = text;
      changeIm(namee);
    } else {
      if (text !== "login") {
        if (text !== "password") {
          failedTry = 0;
          document.documentElement.innerHTML = text;
          linkScript("user");
          if (form.name.value == "admin") {
            linkScript("admin");
          }
        } else {
          if (failedTry == 3) {
            document.documentElement.innerHTML = `<h1>Превышено кол-во попыток входа</h1>`;
          } else {
            let error = document.createElement("div");
            error.setAttribute("class", "error");
            error.innerHTML = "Неверный пароль";
            failedTry++;
            document.body.appendChild(error);
          }
        }
      } else {
        let error = document.createElement("div");
        error.setAttribute("class", "error");
        error.innerHTML = "Пользователь не существует";
        document.body.appendChild(error);
      }
    }
  });
  const reg = document.getElementById("reg");
  reg.addEventListener("click", registration);
  let failedTry = 1;
  //--------------------------------------------------
  const buttonKill = document.getElementById("kill");
  buttonKill.addEventListener("click", killNode);
  async function killNode() {
    document.documentElement.innerHTML =
      "<h2>Работа завершена, перезапустите node.js и обновите страницу</h2>";
    await fetch("/kill", { method: "GET" });
  }

  async function checkSecret() {
    const enter = await fetch("/enterSecret", { method: "GET" });
    let secret = await enter.text();
    if (secret == "0") {
      console.log(0);
      let allhtml = document.documentElement.innerHTML;
      document.documentElement.innerHTML = "";
      // let keyWord = prompt("Введите секретное слово");
      let formSec = document.createElement("form");
      let inputSec = document.createElement("input");
      let buttonSec = document.createElement("button");
      let message = document.createElement("h2");
      message.innerHTML = "Введите кодовую фразу";
      buttonSec.setAttribute("type", "submit");
      buttonSec.innerHTML = "Отправить";
      inputSec.setAttribute("name", "sec");
      inputSec.setAttribute("type", "password");
      formSec.appendChild(message);
      formSec.appendChild(inputSec);
      formSec.appendChild(buttonSec);
      document.body.appendChild(formSec);
      formSec.addEventListener("submit", async (e) => {
        e.preventDefault();
        let keyWord = formSec.sec.value;
        const response = await fetch("/keyWord", {
          method: "post",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            keyWord,
          }),
        });
        if (!response.ok) {
          document.documentElement.innerHTML =
            "<h1>Некоректная фраза</h1><br><h2>Работа завершена, перезапустите node.js и обновите страницу</h2>";
        } else {
          window.location = "/";
        }
      });
    }
  }
  function linkScript(name) {
    let script = document.createElement("script");
    script.type = "text/javascript";
    script.src = `/scripts/${name}.js`;
    document.body.appendChild(script);
  }
  async function registration() {
    const form = createForm();
    if (document.getElementById("errorReg"))
      document.getElementById("errorReg").remove();
    if (document.getElementById("successReg"))
      document.getElementById("successReg").remove();
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const result = await fetch("/reg", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login: form.login.value,
          password: form.password.value,
        }),
      });

      if (!result.ok) {
        if (!document.getElementById("errorReg")) {
          createError();
        }
      } else {
        if (!document.getElementById("successReg")) {
          createSuccess();
        }
      }
      form.remove();
    });
  }
  function createSuccess() {
    let success = document.createElement("div");
    success.setAttribute("id", "successReg");
    success.innerHTML = "Пользователь успешно создан";
    document.body.appendChild(success);
  }
  function createError() {
    let error = document.createElement("div");
    error.setAttribute("id", "errorReg");
    error.innerHTML = "Пользователь уже существует!";
    document.body.appendChild(error);
  }
  function createForm() {
    const form = document.createElement("form");
    let inputLogin = document.createElement("input");
    let inputPassword = document.createElement("input");
    let buttonSub = document.createElement("button");
    inputLogin.setAttribute("name", "login");
    inputLogin.setAttribute("class", "input");
    inputLogin.setAttribute("placeholder", "Login");
    inputPassword.setAttribute("name", "password");
    inputPassword.setAttribute("class", "input");
    inputPassword.setAttribute("placeholder", "Password");
    buttonSub.setAttribute("type", "submit");
    buttonSub.innerHTML = "Создать пользователя";
    form.innerHTML = "<br>";
    form.appendChild(inputLogin);
    form.innerHTML += "<br><br>";
    form.appendChild(inputPassword);
    form.innerHTML += "<br><br>";
    form.appendChild(buttonSub);
    document.body.appendChild(form);
    return form;
  }
  function getInfo() {
    alert(
      "Выполнил студент 4 курса Штыков Иван\nВаринт 24 'Чередование цифр, знаков препинания и снова цифр.'"
    );
  }
})();
