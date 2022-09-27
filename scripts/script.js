(() => {
  const created = document.getElementById("createdBy");
  created.addEventListener("click", getInfo);
  //--------------------------------------------------
  function getInfo() {
    alert(
      "Выполнил студент 4 курса Штыков Иван\nВаринт 24 'Чередование цифр, знаков препинания и снова цифр.'"
    );
  }
})();
