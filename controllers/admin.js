const express = require("express");
const router = express.Router();
const { Admin } = require("../models/admin.js");
const { login } = require("../models/login");
const { Job } = require("../models/job");
const { Application } = require("../models/application.js");
const { User } = require("../models/user.js");

router.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  Admin.findOne({
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
              secretkey: user.id,
              bearertoken: bearertoken,
              category: "admin",
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

router.post("/newAdmin", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  Admin.create({
    email: email,
    password: password,
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

router.post("/createOpening", verifyToken, async (req, res) => {
  const jobProfile = req.body.jobProfile;
  const location = req.body.location;
  const jobDescription = req.body.jobDescription;
  const jobResponsibilities = req.body.jobResponsibilities;
  const qualifications = req.body.qualifications;
  const minExp = req.body.minExp;
  Job.create({
    jobProfile,
    location,
    jobDescription,
    jobResponsibilities,
    qualifications,
    minExp,
  })
    .then((result) => {
      console.log(result);
      res.json({
        message: "successfull",
      });
    })
    .catch((err) => {
      console.log(err);
      res.json(err.message);
    });
});

router.get("/viewAllOpenings", verifyToken, async (req, res) => {
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

router.get("/viewAllApplications", verifyToken, (req, res) => {
  Application.findAll({
    include: [
      {
        model: Job,
        required: true,
      },
      {
        model: User,
        required: true,
      },
    ],
  })
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      console.log(err);
      res.json(err.message);
    });
});

router.post("/updateApplication", verifyToken, (req, res) => {
  const appId = req.body.appId;
  const status = req.body.status;
  Application.update(
    {
      status,
    },
    {
      where: {
        appId,
      },
    }
  )
    .then((result) => {
      res.json(result);
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
          category: "admin",
        },
      })
      .then((user) => {
        if (!user) {
          res.json({
            error: "invalid token",
          });
        } else {
          req.token = token;
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
