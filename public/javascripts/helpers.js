"use strict"

function validatePhoneNumber(phoneNumber) {
  let numbersOnly = phoneNumber.replace(/\D/g, "");
  let tenDigitsLong = new RegExp("^\\d{10}$");

  return tenDigitsLong.test(numbersOnly);
}

function validateEmail(email) {
  email = email.trim();
  if (email.includes(" ")) {
    return false;
  }

  let emailRegExp = new RegExp("(^\\w+|\\d+)\\@(\\w+|\\d+).\\w{3}$");  // Not very good

  return emailRegExp.test(email);
}

function validateName(name) {
  if (!name.trim().length) {
    return false;
  }
  return true;
}

export { validateEmail, validatePhoneNumber, validateName }