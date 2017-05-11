var express = require('express');
var router = express.Router();
var http = require("http");
var request = require("request");
var server = require("../config/ServerConfig");
var passport = require("passport");

module.exports = function () {
  router.get("/", function (req, res) {
    console.log("in userProfile");
    console.log(req.session.user);
    if (req.session.user == undefined) {
      console.log("no user");
      res.redirect("/login")
    } else {
      console.log("has user");
      res.render("pages/userProfile", {user: req.session.user});
    }
  });

  router.get("/edit", function (req, res) {
    if (req.session.user == undefined) {
      console.log("no user");
      res.redirect("/login")
    } else {
      console.log("has user");
      res.render("pages/userProfileEdit", {user: req.session.user});
    }
  });

  router.post("/edit", function (req, res) {
    console.log("in user profile edit");
    console.log(req.body);
    var parameter = req.body;
    //TODO: fix bug
    var updatedUser = {};

    updatedUser.id = req.session.user.id;
    //updatedUser.secondaryId = req.session.user.secondaryId;
    updatedUser.name = req.body.name;
    updatedUser.email = req.body.email;
    updatedUser.password = req.session.user.password;
    updatedUser.type = req.body.type;
    updatedUser.profilePhoto = req.session.user.profilePhoto;
    updatedUser.shippingInfo = {
      firstName: parameter.firstName,
      lastName: parameter.lastName,
      streetAddress: parameter.streetAddress,
      city: parameter.city,
      state: parameter.state,
      zip: parameter.zip,
      phoneNumber: parameter.phoneNumber
    };

    console.log("after update",updatedUser);
    var options = {
  	  hostname: server.host,
  	  port: server.port,
  	  path: '/db/user/save',
  	  method: 'POST',
  	  headers: {
  	    'Content-Type': 'application/json'
  	  }
  	};
  	var request = http.request(options, function(response) {
  	  response.setEncoding('utf8');
  	  var result = '';
  	  response.on('data', function(chunk)  {
  	    result += chunk;
  	  });
  	  response.on('end', () => {
        console.log("on end", result);
  	  	if (result == req.session.user.id) {
          req.session.user.password = updatedUser.password;
          req.session.user.shippingInfo = {
            firstName: parameter.firstName,
            lastName: parameter.lastName,
            streetAddress: parameter.streetAddress,
            city: parameter.city,
            state: parameter.state,
            zip: parameter.zip,
            phoneNumber: parameter.phoneNumber
          };
  	  		res.json({done: true, message: "profile updated!"})
  	  	} else {
  	  		res.json({done: false, message: "profile update failure!"});
  	  	}
  	  })
  	});
  	request.on('error', function(e)  {
  	  console.log(`problem with request: ${e.message}`);
  	});
  	request.write(JSON.stringify(updatedUser));
  	request.end();
    // var url = server.host + ":" + server.port + "/db/user/save";
    // console.log(url);
    // request({
    //   url: url,
    //   method: "POST",
    //   json: true,
    //   body: updatedUser
    // }, function(error, response, body) {
    //   if (!error && response.statusCode == 200) {
    //     console.log("200", body);
    //     // update session
    //     req.session.user = updatedUser;
    //     req.login(updatedUser, function(err) {
    //       if (err) return next(err)
    //       console.log("After relogin: "+ req.session.user)
    //     })
    //     // send response
    //     res.json({
    //       done: true,
    //       message: "Your profile is updated!"
    //     });
    //   } else {
    //     console.log("error in save new user");
    //     throw error
    //   }
    // });
  })



  return router;
}
