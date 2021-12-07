const express = require("express");
const router = express.Router();
const { User } = require("../models/user.js");
const { login } = require("../models/login");
const { Job } = require("../models/job");
const { Application } = require("../models/application");

User.hasMany(Application, {
  foreignKey: "userId",
});
Application.belongsTo(User, {
  foreignKey: "userId",
});
Job.hasMany(Application, {
  foreignKey: "jobId",
});
Application.belongsTo(Job, {
  foreignKey: "jobId",
});

router.get("/apply/:jobId", verifyToken, async (req, res) => {
  const userId = req.userId;
  const jobId = req.params.jobId;
  Application.create({
    userId,
    jobId,
    status: "pending",
  })
    .then((result) => {
      res.json({
        message: "Successfully applied",
      });
    })
    .catch((err) => {
      res.json({
        error: err.message,
      });
    });
});

router.get("/viewApplications", verifyToken, async (req, res) => {
  const userId = req.userId;
  Application.findAll({
    include: [
      {
        model: Job,
        required: true,
      },
    ],
    where: {
      userId,
    },
  })
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      console.log(err);
      res.json(err.message);
    });
});

router.post("/register", async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const phone = req.body.phone;
  User.create({
    name,
    email,
    password,
    phone,
  })
    .then((result) => {
      console.log(result);
      res.json({
        message: "successfull",
      });
    })
    .catch((err) => {
      res.json(err.message);
      console.log(err);
    });
});

router.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({
    where: {
      email: email,
    },
  })
    .then((user) => {
      if (!user) {
        res.json({
          error: "User not found",
        });
      } else {
        if (password === user.password) {
          const bearertoken = Math.floor(Math.random() * 10000001);
          login
            .create({
              secretkey: user.userId,
              bearertoken: bearertoken,
              category: "user",
            })
            .then((login) => {
              res.json({
                bearertoken,
              });
            })
            .catch((err) => {
              res.json({
                error: err.message,
              });
              console.log(err);
            });
        } else {
          res.json({
            error: "Invalid Password",
          });
        }
      }
    })
    .catch((error) => {
      res.json({
        error: error.message,
      });
    });
});

router.post("/logout", verifyToken, async (req, res) => {
  const token = req.token;
  login
    .destroy({
      where: {
        bearertoken: token,
      },
    })
    .then((result) => {
      console.log(result);
      res.json({
        message: "successfully logged out",
      });
    })
    .catch((err) => {
      console.log(err);
      res.json(err.message);
    });
});

router.get("/viewAllOpenings", async (req, res) => {
  Job.findAll()
    .then((result) => {
      if (result.length == 0) {
        res.json({
          message: "No openings found",
        });
      } else {
        res.json(result);
      }
    })
    .catch((err) => {
      console.log(err);
      res.json({
        error: err.message,
      });
    });
});

router.get("/viewOpening/:id", async (req, res) => {
  const jobId = req.params.id;
  Job.findOne({
    where: {
      jobId,
    },
  })
    .then((result) => {
      if (result) {
        res.json(result);
      } else {
        res.json({
          message: "job not found",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.json({
        error: err.message,
      });
    });
});

function randomName(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function verifyToken(req, res, next) {
  // Check if bearer is undefined
  const category = req.body.category;
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    const token = req.headers.authorization.split(" ")[1];

    login
      .findOne({
        where: {
          bearertoken: token,
          category: "user",
        },
      })
      .then((user) => {
        if (!user) {
          res.json({
            error: "invalid token",
          });
        } else {
          req.token = token;
          req.userId = user.secretkey;
          next();
        }
      })
      .catch((err) => {
        res.json(err.message);
      });
  } else {
    // Forbidden
    res.json({
      error: "Bearer Token is not found",
    });
  }
}

module.exports = router;
