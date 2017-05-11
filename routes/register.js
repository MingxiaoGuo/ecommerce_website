var express = require('express');
var router = express.Router();
var server = require("../config/ServerConfig")
var http = require("http");

module.exports = function () {
  router.get("/", function (req, res) {
    console.log("in register");
    res.render("pages/register");
  });

  router.post("/", function (req, res) {
    console.log("in register post, ", req.body);
    var temp = {
      email : req.body.email,
      password : req.body.password,
      type: "local"
    };

    //1. find duplicate user email
    http.get({
      host: server.host,
      port: server.port,
      path: '/db/user/' + temp.email + "/local"
    }, function (response) {
			var user = '';
			response.on('data', function (data) {
				user += data;
			});
			response.on('end', function () {
				// var parsed = JSON.parse(user);

				console.log( user == "")
        if (user == "") {
          // 2. save user
          console.log("no duplicate email")
          return saveUser(temp, res);
        } else {
          console.log("found duplicate email")
          return res.json({done: false, message: "email is taken"});
        }
        //res.render("pages/adminProductModify", {user : parsed});
			});
			response.on('error', function (err) {
				console.log("error: ", err);
        throw err;
			});
		});
  });

  function saveUser(data, res) {
    var user = {
      name: "username",
      type: data.type,
      email: data.email,
      password: data.password,
      profilePhoto: "../images/default_profile_pic.png",
      shippingInfo: {
        firstName : " ",
        lastName : " ",
        streetAddress : " ",
        city : " ",
        state : " ",
        zip : " ",
        phoneNumber : " "
      }
    }
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
  	  	//var parsed = JSON.parse(result);
        console.log(result);
  	  	if (result) {
  	  		return res.json({done: true})
  	  	} else {
  	  		return res.json({done: false, message: "register fail!"});
  	  	}
  	  })
  	});
  	request.on('error', function(e)  {
  	  console.log(`problem with request: ${e.message}`);
  	});
  	request.write(JSON.stringify(user));
  	request.end();
  }

  return router;
}
