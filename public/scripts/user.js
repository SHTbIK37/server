(async () => {
  const quitB = document.getElementById("quit");
  quitB.addEventListener("click", quit);
  const passB = document.getElementById("changeP");
  passB.addEventListener("click", changeP);
  let block = await checkBlock();
  if (!block) checkPasswordLimit();

  // ==========================================
  async function checkBlock() {
    const user = { name: document.getElementById("login").innerHTML };
    let response = await fetch("/checkBlocked", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user,
      }),
    });
    if (response.ok) {
      if (Number(await response.text())) {
        document.body.innerHTML = `<h1>Пользователь заблокирован!</h1>
        <p>Ваш аккаунт заблокирован, свяжитесь с админитратором</p>
        <button id="blockedQuit">Выйти</button>`;
        const buttonBlocked = document.getElementById("blockedQuit");
        buttonBlocked.addEventListener("click", quit);
        return 1;
      } else return 0;
    }
  }
  async function checkPasswordLimit() {
    const user = { name: document.getElementById("login").innerHTML };
    let response = await fetch("/checkPasswordLimit", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user,
      }),
    });
    if (response.ok) {
      if (Number(await response.text())) checkPassword(user);
    }
  }
  async function checkPassword(user) {
    let response = await fetch("/checkPassword", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user,
      }),
    });
    if (response.ok) {
      if (!Number(await response.text())) {
        quitB.setAttribute("disabled", "disabled");
        const alertM = document.createElement("h2");
        alertM.setAttribute("id", "warning");
        alertM.innerHTML =
          "Ваш пароль не соответствует требованием, все действия кроме смены пароля заблокированы";
        document.body.appendChild(alertM);
      }
    }
  }
  async function changeP() {
    const loginEl = document.getElementById("login");
    login = loginEl.innerHTML;
    const form = createForm();
    if (document.getElementById("wrongPasswords"))
      document.getElementById("wrongPasswords").remove();
    if (form.new.value == form.copy.value) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const result = await fetch("/change", {
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
        const check = document.getElementById("result");
        if (result.ok) {
          console.log("ok");
          form.innerHTML = "";
          if (document.getElementById("warning")) {
            document.getElementById("warning").remove();
            quitB.removeAttribute("disabled");
          }
        } else {
          if (check) {
            check.innerHTML = await result.text();
          } else {
            let elem = document.createElement("div");
            elem.setAttribute("id", "result");
            elem.innerHTML = await result.text();
            form.appendChild(elem);
          }
          form.old.value = "";
          form.new.value = "";
          form.copy.value = "";
        }
      });
    } else {
      let div = document.createElement("div");
      div.setAttribute("id", "wrongPasswords");
      div.innerHTML = "Введен новые пароли не совпадают";
      form.old.value = "";
      form.new.value = "";
      form.copy.value = "";
      document.body.appendChild(div);
    }
  }
  function createForm() {
    const form = document.createElement("form");
    let inputOld = document.createElement("input");
    let inputNew = document.createElement("input");
    let inputCopy = document.createElement("input");
    let buttonSub = document.createElement("button");
    inputOld.setAttribute("name", "old");
    inputOld.setAttribute("type", "password");
    inputOld.setAttribute("placeholder", "Старый пароль");
    inputNew.setAttribute("name", "new");
    inputNew.setAttribute("type", "password");
    inputNew.setAttribute("placeholder", "Новый пароль");
    inputCopy.setAttribute("name", "copy");
    inputCopy.setAttribute("type", "password");
    inputCopy.setAttribute("placeholder", "Подтвердите пароль");
    buttonSub.setAttribute("type", "submit");
    buttonSub.innerHTML = "Подтвердить";
    form.appendChild(inputOld);
    form.innerHTML += "<br>";
    form.appendChild(inputNew);
    form.innerHTML += "<br>";
    form.appendChild(inputCopy);
    form.innerHTML += "<br>";
    form.appendChild(buttonSub);
    document.body.appendChild(form);
    return form;
  }
  function quit() {
    window.location = "/";
  }
})();
