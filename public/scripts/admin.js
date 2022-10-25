(async () => {
  const getU = document.getElementById("showU");
  getU.addEventListener("click", showAllF);
  const getOU = document.getElementById("showOU");
  getOU.addEventListener("click", showOUF);
  const quitB = document.getElementById("quit");
  quitB.addEventListener("click", quit);
  const buttonCreate = document.getElementById("createUser");
  buttonCreate.addEventListener("click", registration);
  const formAll = document.createElement("form");
  formAll.setAttribute("id", "users");
  formAll.style.marginTop = "20px";
  const form = document.createElement("form");
  form.setAttribute("id", "user");
  form.style.marginTop = "20px";
  document.body.appendChild(formAll);
  document.body.appendChild(form);
  let position = 1;
  let length = await fetch("/getLength", { method: "GET" });
  length = await length.text();
  length = Number(length);

  // =========================================================
  async function registration() {
    const form = createForm();
    if (document.getElementById("errorReg"))
      document.getElementById("errorReg").remove();
    if (document.getElementById("successReg"))
      document.getElementById("successReg").remove();
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log(form.login.value);
      const result = await fetch("/reg", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login: form.login.value,
          password: "",
        }),
      });

      if (!result.ok) {
        if (!document.getElementById("errorReg")) {
          createError();
        }
      } else {
        if (!document.getElementById("successReg")) {
          createSuccess();
          length++;
        }
      }
      form.remove();
    });
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
    let buttonSub = document.createElement("button");
    inputLogin.setAttribute("name", "login");
    inputLogin.setAttribute("class", "input");
    inputLogin.setAttribute("placeholder", "Login");
    buttonSub.setAttribute("type", "submit");
    buttonSub.innerHTML = "Создать пользователя";
    form.innerHTML = "<br>";
    form.appendChild(inputLogin);
    form.innerHTML += "<br><br>";
    form.appendChild(buttonSub);
    document.body.appendChild(form);
    return form;
  }
  function showOUF() {
    formAll.innerHTML = "";
    deleteButtons();
    const buttonUp = document.createElement("button");
    const buttonDown = document.createElement("button");
    buttonUp.style.marginTop = "20px";
    buttonDown.style.marginRight = "20px";
    buttonDown.style.marginTop = "20px";
    buttonUp.setAttribute("id", "buttonUp");
    buttonUp.innerHTML = "следующий";
    buttonDown.innerHTML = "предыдущий";
    buttonDown.setAttribute("id", "buttonDown");
    buttonUp.addEventListener("click", nextF);
    buttonDown.addEventListener("click", backF);
    document.body.appendChild(buttonDown);
    document.body.appendChild(buttonUp);
    putOUF();
  }
  async function putOUF() {
    let result = await fetch("/getOne", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: position,
      }),
    });
    let user = await result.json();
    const form = document.getElementById("user");
    form.innerHTML = "";
    const div = document.createElement("div");
    div.setAttribute("id", "formEl");
    const span = document.createElement("span");
    span.innerHTML = user[0][`name`];
    span.setAttribute("id", "loginUser");
    const inputBlocked = document.createElement("input");
    inputBlocked.setAttribute("name", `blocked`);
    inputBlocked.value = user[0][`blocked`];
    const inputPasswordLimit = document.createElement("input");
    inputPasswordLimit.setAttribute("name", `passwordLimit`);
    inputPasswordLimit.value = user[0][`passwordLimit`];
    inputBlocked.addEventListener("input", createSubmit);
    inputPasswordLimit.addEventListener("input", createSubmit);
    div.appendChild(span);
    div.appendChild(inputBlocked);
    div.appendChild(inputPasswordLimit);
    form.appendChild(div);
  }
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const result = await fetch("/saveChangeO", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        login: document.getElementById("loginUser").innerHTML,
        blocked: form.blocked.value,
        passwordLimit: form.passwordLimit.value,
      }),
    });
    if (result.ok) {
      form.appendChild(createSuccess());
    }
  });
  formAll.addEventListener("submit", async (e) => {
    e.preventDefault();
    let data = [];
    for (let i = 0; i < length - 1; i++) {
      const elem = document.getElementById(`elem${i}`).children;
      let obj = {};
      obj[`name`] = elem[0].innerHTML;
      obj[`blocked`] = elem[1].value;
      obj[`passwordLimit`] = elem[2].value;
      data.push(obj);
    }
    let response = await fetch("/saveAll", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data,
      }),
    });
    if (response.ok) {
      formAll.appendChild(createSuccess());
    }
  });
  function createSuccess() {
    const success = document.createElement("div");
    success.innerHTML = "Изменения сохранены";
    success.setAttribute("id", "saveChange");
    return success;
  }
  function createSubmit() {
    if (!document.getElementById("changeAccept")) {
      const div = document.getElementById("formEl");
      const buttonSubmit = document.createElement("button");
      buttonSubmit.setAttribute("id", "changeAccept");
      buttonSubmit.setAttribute("type", "submit");
      buttonSubmit.innerHTML = "Сохранить изменения";
      div.appendChild(buttonSubmit);
    }
  }
  function deleteSubmit() {
    if (document.getElementById("changeAccept"))
      document.getElementById("changeAccept").remove();
  }
  function createSubmitAll() {
    if (!document.getElementById("changeAcceptAll")) {
      const buttonSubmit = document.createElement("button");
      buttonSubmit.setAttribute("id", "changeAcceptAll");
      buttonSubmit.setAttribute("type", "submit");
      buttonSubmit.innerHTML = "Сохранить изменения";
      formAll.appendChild(buttonSubmit);
    }
  }
  function deleteSaveChange() {
    if (document.getElementById("saveChange"))
      document.getElementById("saveChange").remove();
  }
  function nextF() {
    if (position > length - 2) {
    } else {
      deleteSaveChange();
      position++;
      putOUF();
    }
  }
  function backF() {
    if (position == 1) {
    } else {
      deleteSaveChange();
      position--;
      putOUF();
    }
  }
  async function showAllF() {
    formAll.innerHTML = "";
    deleteButtons();
    deleteSubmit();
    form.innerHTML = "";
    let result = await fetch("http://localhost:5000/users", {
      method: "get",
    });
    result = await result.json();
    result.shift();
    for (let i = 0; i < result.length; i++) {
      createFormElem(result[i], i);
    }
  }
  function createFormElem(elem, i) {
    const formEl = document.createElement("div");
    formEl.setAttribute("id", `elem${i}`);
    let span = document.createElement("span");
    let inputBlocked = document.createElement("input");
    let inputPasswordLimit = document.createElement("input");
    span.innerHTML = elem[`name`];
    span.style.display = "inline-block";
    span.style.minWidth = "100px";
    span.style.width = "fit-content";
    inputBlocked.value = elem[`blocked`];
    inputBlocked.setAttribute("name", "blocked");
    inputPasswordLimit.value = elem[`passwordLimit`];
    inputPasswordLimit.setAttribute("name", "passwordLimit");
    inputBlocked.addEventListener("input", createSubmitAll);
    inputPasswordLimit.addEventListener("input", createSubmitAll);
    formEl.appendChild(span);
    formEl.appendChild(inputBlocked);
    formEl.appendChild(inputPasswordLimit);
    formAll.appendChild(formEl);
  }
  function deleteButtons() {
    if (document.getElementById("buttonUp"))
      document.getElementById("buttonUp").remove();
    if (document.getElementById("buttonDown"))
      document.getElementById("buttonDown").remove();
  }
})();
