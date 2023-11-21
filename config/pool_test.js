const db = require("../config/database");

const test = () => {
  return new Promise((resolve, reject) => {
    resolve(db.query("select pg_sleep(1);"));
  });
};

const some = async () => {
  const t1 = Date.now();

  try {
    for (let i = 0; i < 300; i++) {
      await test();
      console.log(i);
    }
  } catch (err) {
    const t2 = Date.now();
    console.log(t2 - t1);
  }
};

some()
  .then(() => {})
  .catch((e) => {
    console.log(e);
  });

// for (let i = 0; i < 300; i++) {
//   db.query("select pg_sleep(1);");
// }
