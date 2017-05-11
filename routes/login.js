var express = require('express');
var router = express.Router();
var http = require("http");
var server = require("../config/ServerConfig")

module.exports = function () {
  router.get("/", function (req, res) {
    console.log("in login");
    res.render("pages/login");
  });

  router.post("/", function (req, res) {
    console.log(req.body);
    var loginData = {
      email : req.body.email,
      password : req.body.password,
      type: "local"
    };
    console.log("login dtaa", loginData);

    http.get({
      host: server.host,
      port: server.port,
      path: '/db/user/' + loginData.email + "/local"
    }, function (response) {
			var temp = '';
			response.on('data', function (data) {
				temp += data;
			});
			response.on('end', function () {
				console.log(temp);
        var user = JSON.parse(temp)[0];
        console.log(user);
        if (user == null) {
          // 2. save user
          console.log("no such user, please register")
          return res.json({done: false, message: "no such user, please register"});
        } else {
          console.log("found user")
          // check password
          console.log(user.password);
          console.log(loginData.password);
          if (user.password == loginData.password) {
            req.session.user = user;
            console.log(req.session.user);
            return res.json({done: true, message: "logged in"});
          } else {
            return res.json({done: false, message: "password doesn't match"});
          }
        }
			});
			response.on('error', function (err) {
				console.log("error: ", err);
        throw err;
			});
		});
  });

  return router;
}
