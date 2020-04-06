/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
var handlebars = require("handlebars");
var fs = require("fs");

module.exports = {
  profilePage: (req, res) => {
    return res.view("profile/profile");
  },

  signupPage: (req, res) => {
    return res.view("user/signup");
  },

  homePage: (req, res) => {
    return res.view("user/home");
  },

  forgetPasswordVerifyPage: (req, res) => {
    return res.view("user/forgetPasswordVerify");
  },

  loginPage: (req, res) => {
    res.view("user/login");
  },

  forgetPasswordPage: (req, res) => {
    res.view("user/forgetPassword");
  },

  getProfile: (req, res) => {
    user.findOne({ _id: req.userData.id }).exec((err, result) => {
      if (err) {
        res.send(500, { err: err });
      }
      res.status(200).json(result);
    });
  },

  verifyAccount: async (req, res) => {
    data = {
      status: "verified",
    };
    await user.updateOne({ verifyToken: req.params.token }, data);
    return res.view("user/verifyAccount");
  },

  signup: async (req, res) => {
    var readHTMLFile = function (path, callback) {
      fs.readFile(path, { encoding: "utf-8" }, function (err, html) {
        if (err) {
          throw err;
        } else {
          callback(null, html);
        }
      });
    };

    const getUser = await user.findOne({ email: req.body.email });
    if (getUser)
      return res
        .status(200)
        .send({ status: false, message: "Email is already exists." });
    else
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
          return res.status(200).json({
            status: false,
            message: "Not found",
          });
        } else {
          var data = {
            name: req.body.name,
            email: req.body.email,
            password: hash,
            status: "pending",
            verifyToken: Math.random().toString(36).replace("0.", ""),
          };
          user.create(data).then(() => {
            const url = `${req.protocol}://${req.get("host")}/verify/${
              data.verifyToken
            }`;
            let transporter = nodemailer.createTransport({
              host: "smtp.gmail.com",
              port: 465,
              auth: {
                user: "subhamojha135@gmail.com",
                pass: "Bluesoft@99",
              },
            });
            readHTMLFile(
              __dirname + "../../email/verify/emailVerify.html",
              function (err, html) {
                var template = handlebars.compile(html);
                var replacements = {
                  url: url,
                };
                var htmlToSend = template(replacements);
                let info = transporter.sendMail({
                  to: req.body.email,
                  subject: "Account Verify",
                  html: htmlToSend,
                });
              }
            );
            transporter.verify(function (error, success) {
              if (error) {
                return res
                  .status(200)
                  .send({ status: false, message: "Email Id Not Found" });
              } else {
                return res.status(200).send({
                  status: true,
                  message:
                    "signup successful please Verify your Email to login.",
                });
              }
            });
          });
        }
      });
  },

  login: async (req, res) => {
    const getUser = await user.findOne({ email: req.body.email });
    if (!getUser)
      return res
        .status(200)
        .send({ status: false, message: "Email Id Not Found" });
    if (getUser.status === "pending")
      return res
        .status(200)
        .send({ status: false, message: "Email Id is Not verified" });
    else
      bcrypt.compare(req.body.password, getUser.password, (err, result) => {
        if (err) {
          return res.status(200).json({
            status: false,
            message: "Please Enter valid Password.",
          });
        }
        if (result) {
          const token = jwt.sign(
            { id: getUser.id, email: getUser.email },
            "SECRET_KEY",
            {
              expiresIn: 120000,
            }
          );
          return res.status(200).json({
            status: true,
            message: "Successful",
            token: token,
          });
        }
        res.status(200).json({
          status: false,
          message: "Please enter valid credentials.",
        });
      });
  },

  updateForgetPassword: async (req, res) => {
    const getUser = await user.findOne({
      forgetPasswordToken: req.params.token,
    });
    if (!getUser)
      return res.status(200).send({
        status: false,
        message: "Token is Invalid",
      });

    bcrypt.hash(req.body.password, 10, (err, hash) => {
      if (err) {
        return res.status(200).json({
          status: false,
          message: "Not found",
        });
      } else {
        var data = {
          password: hash,
          forgetPasswordToken: Math.random().toString(36).replace("0.", ""),
        };
        user.update({ _id: req.params.id }, data).exec((err, result) => {
          if (err) {
            res.send(500, { err: err });
          }
          return res.json({
            status: true,
            message: "Password updated successfully",
          });
        });
      }
    });
  },

  forgetPassword: async (req, res) => {
    var readHTMLFile = function (path, callback) {
      fs.readFile(path, { encoding: "utf-8" }, function (err, html) {
        if (err) {
          throw err;
        } else {
          callback(null, html);
        }
      });
    };
    const getUser = await user.findOne({ email: req.body.email });
    if (!getUser)
      return res
        .status(200)
        .send({ status: false, message: "Email is Not Found" });
    const data = {
      forgetPasswordToken: Math.random().toString(36).replace("0.", ""),
    };
    await user.updateOne({ email: req.body.email }, data);
    const url = `${req.protocol}://${req.get("host")}/forget-password/verify/${
      data.forgetPasswordToken
    }`;
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      auth: {
        user: "subhamojha135@gmail.com",
        pass: "Bluesoft@99",
      },
    });
    readHTMLFile(
      __dirname + "../../email/verify/forgetPassword.html",
      function (err, html) {
        var template = handlebars.compile(html);
        var replacements = {
          url: url,
        };
        var htmlToSend = template(replacements);
        let info = transporter.sendMail({
          to: req.body.email,
          subject: "Forget_Password",
          html: htmlToSend,
        });
      }
    );
    transporter.verify(function (error, success) {
      if (error) {
        return res
          .status(200)
          .send({ status: false, message: "Email Id Not Found" });
      } else {
        return res.status(200).send({
          status: true,
          message: "Forget password link sent to your email Id",
        });
      }
    });
  },

  changePassword: async (req, res) => {
    const getUser = await user.findOne({ _id: req.userData.id });
    if (!getUser)
      return res.status(200).send({ status: false, message: "User not found" });

    bcrypt.compare(
      req.body.currentPassword,
      getUser.password,
      (err, result) => {
        if (result) {
          bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
              return res
                .status(200)
                .json({ state: false, message: "Not found" });
            } else {
              var data = {
                password: hash,
              };
              user
                .update({ _id: req.userData.id }, data)
                .exec((err, result) => {
                  if (err) {
                    return res.send(500, { err: err });
                  } else {
                    return res.status(200).json({
                      status: true,
                      message: "Password updated successfully",
                    });
                  }
                });
            }
          });
        } else {
          return res.status(200).json({
            status: false,
            message: "your current password is Incorrect",
          });
        }
      }
    );
  },
};
