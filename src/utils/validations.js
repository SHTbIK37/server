function checkPassword(password) {
  let passArray = Array.from(password);
  let firstPass = [];
  let secondPass = [];
  let thirdPass = [];
  let symbols = [".", ",", ":", ";", "!", "?", "[", "]", "(", ")", "-", '"'];
  while (passArray.length !== 0) {
    if (!isNaN(passArray[0])) firstPass.push(passArray.shift());
    else break;
  }
  while (passArray.length !== 0) {
    if (symbols.indexOf(passArray[0]) > -1) secondPass.push(passArray.shift());
    else break;
  }
  while (passArray.length !== 0) {
    if (!isNaN(passArray[0])) thirdPass.push(passArray.shift());
    else break;
  }
  if (
    passArray.length !== 0 ||
    firstPass == 0 ||
    secondPass == 0 ||
    thirdPass == 0
  ) {
    return 0;
  } else {
    return 1;
  }
}
module.exports = { checkPassword };
