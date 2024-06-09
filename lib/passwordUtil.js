const bcrypt = require("bcryptjs");

// Encrypts a password with the given string.
async function generatePassword(password) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return hashedPassword;
}

// Compares and validates a given password with the user password.
async function validatePassword(passwordGiven, userPassword) {
  const result = bcrypt.compare(passwordGiven, userPassword);

  return result;
}

module.exports.generatePassword = generatePassword;
module.exports.validatePassword = validatePassword;
