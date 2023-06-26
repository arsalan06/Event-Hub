require("dotenv").config();
const db = require("./models");
const app = require("./index");
(async () => {
  await db.sequelize.sync().then((res) => {
    console.log("connect");
  });
})();
app.listen(process.env.PORT, () => {
  console.log(`server is live now on port ${process.env.PORT}`);
});
