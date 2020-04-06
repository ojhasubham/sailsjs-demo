module.exports.routes = {
  "/": "UserController.loginPage",
  "/login": "UserController.loginPage",
  "/signup": "UserController.signupPage",
  "/forgetpassword": "UserController.forgetPasswordPage",
  "/forget-password/verify/:id": "UserController.forgetPasswordVerifyPage",
  "/profile": "UserController.profilePage",
  "/home": "UserController.homePage",

  "GET /user-profile": "UserController.getProfile",
  "GET /verify/:token": "UserController.verifyAccount",
  "POST /login": "UserController.login",
  "POST /signup": "UserController.signup",
  "POST /forget-password/verify/:token": "UserController.updateForgetPassword",
  "POST /forget-password": "UserController.forgetPassword",
  "POST /changepassword": "UserController.changePassword",
};
