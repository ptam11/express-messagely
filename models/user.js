/** User class for message.ly */
const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_ROUNDS } =  require("../config");
const Message = require("./message")


/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {
    let hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_ROUNDS) 
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;

    let response = await db.query(`
      INSERT INTO users (username, password, first_name, last_name, phone, join_at) 
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING username, password, first_name, last_name, phone
    `, [username, hashedPassword, first_name, last_name, phone, dateTime]);

    return response.rows[0];
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    let userRow = await db.query(`
      SELECT password
      FROM users
      WHERE username = $1
    `, [username]);
    
    let hashedPassword = userRow.rows[0].password;

    return bcrypt.compare(password, hashedPassword)
   }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;

    let response = await db.query(`
      UPDATE users
      SET last_login_at=$1
      WHERE username=$2
      RETURNING username, last_login_at
    `, [dateTime, username])

    return response.rows[0]
   }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { 
    let response = await db.query(`
      SELECT username, first_name, last_name, phone
      FROM users 
    `)
    return response.rows
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) { 
    let response = await db.query(`
      SELECT username, first_name, last_name, phone,last_login_at
      FROM users 
      WHERE username=$1
    `, [username])
    return response.rows[0]
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { 
    let response = await db.query(`
      SELECT m.id
      FROM messages m 
      WHERE from_username=$1
    `, [username]);

    return response.rows.map(function(msg) {
      let currentMessage = Message.get(msg.id);
      delete currentMessage.from_user;
      return currentMessage;
    });
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) { 
    let response = await db.query(`
      SELECT m.id
      FROM messages m 
      WHERE to_username=$1
    `, [username]);

    return response.rows.map(function(msg) {
      let currentMessage = Message.get(msg.id);
      delete currentMessage.to_user;
      return currentMessage;
    });    
  }
}


module.exports = User;