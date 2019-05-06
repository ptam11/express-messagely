/** Common config for message.ly */

// read .env files and make environmental variables

require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY || "secret";
const BCRYPT_WORK_ROUNDS = 10;

let DB_URI; 

if (process.env.NODE_ENV === "test") {
  DB_URI = "postgresql:///messagely_test"
} else {
  DB_URI = "postgresql:///messagely"
}

module.exports = {
  DB_URI,
  SECRET_KEY,
  BCRYPT_WORK_ROUNDS,
};