const db = require("../config/database");

for (let i = 0; i < 300; i++) {
  db.query("select pg_sleep(1);");
}
