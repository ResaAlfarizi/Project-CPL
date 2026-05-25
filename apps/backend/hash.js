const bcrypt = require("bcrypt");

const password = process.argv[2] || "password123";

bcrypt.hash(password, 10).then((hash) => {
  console.log("Password:", password);
  console.log("Hash:", hash);
});