const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

//Sequelize
const sequelize = require("./util/database.js");

//Express obj
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello");
});

const adminRoutes = require("./controllers/admin");
app.use("/admin", adminRoutes);
const userRoutes = require("./controllers/user");
app.use("/user", userRoutes);

sequelize
  .sync()
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
