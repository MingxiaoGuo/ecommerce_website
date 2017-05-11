/**
 * Created by Mingxiao Guo on 5/7/2017.
 */
var express = require("express");
var router = express.Router();
var http = require("http");
var aws = require("../config/AWSConfig");
var server = require("../config/ServerConfig");
var request = require('request');
var async = require('async');

module.exports = function () {
  router.get("/", function (req, res) {
    console.log("in admin");
    console.log(req.session.user);
    if (req.session.user == undefined || req.session.user.type != "admin") {
      res.redirect("/adminLogin")
    } else {
      res.render("pages/admin", {user : req.session.user});
    }
  });

  router.post("/login", function (req, res) {
    console.log("in admin login");
    console.log(req.body);
    http.get({
      host: server.host,
      port: server.port,
      path: '/db/user/' + req.body.email + "/" + req.body.password
    }, function (response) {
			var user = '';
			response.on('data', function (data) {
				user += data;
			});
			response.on('end', function () {
				var parsed = JSON.parse(user)[0];
        console.log(parsed);
        if (parsed != null && parsed.type == "admin") {
          console.log("in admin", parsed);
          req.session.user = parsed;
          return res.json({done: true});
        } else {
          console.log("nothing")
        }
			});
			response.on('error', function (err) {
				console.log(err);
        throw err;
			});
		});
  })

  router.get("/server", function (req, res) {
    console.log("in server");
    if (req.session.user == undefined || req.session.user.type != "admin") {
      res.redirect("/adminLogin")
    } else {
      /**
       * this is a callback function for getting aws info
       * @param  {Object} result the object that contains infomation about dns and arn
       */
      var callback = function (result) {
        req.session.awsData = result;
        getOverallInfoAsync(result, req, res);
      };
      var awsConfig = aws.getAWSConfig(callback);
    }
  });

  router.get("/server/detail/:instanceId", function (req, res) {
    if (req.session.user == undefined || req.session.user.type != "admin") {
      res.redirect("/adminLogin")
    } else {
      console.log("in server detail");
      var id = req.params.instanceId
      //TODO: http call
      res.render("pages/serverDetail", {user: req.session.user});
    }
  });

  router.get("/server/loadInstanceChart/:instanceId", function (req, res) {
    if (req.session.user == undefined || req.session.user.type != "admin") {
      res.redirect("/adminLogin")
    } else {
      var data = {
        labels: ['05/01', '05/02', '05/03', '05/04', '05/05', '05/06', '05/07', '05/08', '05/09', '05/10'],
        series: [
          [542, 543, 520, 680, 653, 753, 326, 434, 568, 610],
          [230, 293, 380, 480, 503, 553, 600, 664, 698, 710]
        ]
      };
      console.log(data);
      res.json(data);
    }
  })

  // --- product ---
  router.get("/product", function(req, res) {
    if (req.session.user == undefined || req.session.user.type != "admin") {
      res.redirect("/adminLogin")
    } else {
      http.get({
        host: server.host,
        port: server.port,
        path: '/db/product/all'
      }, function (response) {
        var productList = '';
        response.on('data', function (data) {
          productList += data;
        });
        response.on('end', function () {
          var parsed = JSON.parse(productList);

          console.log(parsed)
          res.render("pages/adminProduct", {user: req.session.user, productList : parsed});
        });
        response.on('error', function (err) {
          console.log(err);
          throw err;
        });
      });
    }
  });

  router.get("/product/create", function (req, res) {
    if (req.session.user == undefined || req.session.user.type != "admin") {
      res.redirect("/adminLogin")
    } else {
      res.render("pages/adminProductCreate", {user: req.session.user});
    }
  })

  /**
   * send POST request to server application
   */
  router.post("/product/create", function (req, res) {
    var product = {
      name: req.body.name,
      category: req.body.category,
      price: req.body.price,
      inventory: req.body.inventory,
      productPhotos: [
        req.body.productPhotos
      ],
      description: req.body.description
    }
    var options = {
  	  hostname: server.host,
  	  port: server.port,
  	  path: '/db/product/save',
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
  	  	var parsed = JSON.parse(result);
        console.log(parsed);
  	  	if (parsed == 0) {
  	  		res.json({done: true})
  	  	} else {
  	  		res.json({done: false, message: "product create failure!"});
  	  	}
  	  })
  	});
  	request.on('error', function(e)  {
  	  console.log(`problem with request: ${e.message}`);
  	});
  	request.write(JSON.stringify(product));
  	request.end();
  });

  router.get("/product/detail/:id", function (req, res) {
    console.log("in product detail ", req.params);
    var id = req.params.id;

    http.get({
      host: server.host,
      port: server.port,
      path: '/db/product/id/' + id
    }, function (response) {
			var product = '';
			response.on('data', function (data) {
				product += data;
			});
			response.on('end', function () {
				var parsed = JSON.parse(product)[0];

				console.log(parsed)
        res.render("pages/adminProductModify", {user: req.session.user, product : parsed});
			});
			response.on('error', function (err) {
				console.log(err);
        throw err;
			});
		});
  });

  router.post("/product/modify", function (req, res) {
    console.log("in admin product modify ", req.body);
    // POST to /db/product/save
    var product = {
      name: req.body.name,
      category: req.body.category,
      price: req.body.price,
      inventory: req.body.inventory,
      productPhotos: [
        req.body.productPhotos
      ],
      description: req.body.description
    }
    var options = {
  	  hostname: server.host,
  	  port: server.port,
  	  path: '/db/product/save',
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
  	  	var parsed = JSON.parse(result);
        console.log(parsed);
  	  	if (parsed == 0) {
  	  		res.json({done: true, message: "update success!"})
  	  	} else {
  	  		res.json({done: false, message: "update fail!"});
  	  	}
  	  })
  	});
  	request.on('error', function(e)  {
  	  console.log(`problem with request: ${e.message}`);
  	});
  	request.write(JSON.stringify(product));
  	request.end();
  });

  /**
   * get user list
   */
  router.get("/user", function (req, res) {
    if (req.session.user == undefined || req.session.user.type != "admin") {
      res.redirect("/adminLogin")
    } else {
      http.get({
        host: server.host,
        port: server.port,
        path: '/db/user/all'
      }, function (response) {
  			var userList = '';
  			response.on('data', function (data) {
  				userList += data;
  			});
  			response.on('end', function () {
  				var parsed = JSON.parse(userList);

  				console.log(parsed)
          res.render("pages/adminUser", {user: req.session.user, userList : parsed});
  			});
  			response.on('error', function (err) {
  				console.log(err);
          throw err;
  			});
  		});
    }
  });

  router.get("/user/detail/:id", function (req, res) {
    if (req.session.user == undefined || req.session.user.type != "admin") {
      res.redirect("/adminLogin")
    } else {
      console.log("params", req.params.id);
      var id = req.params.id;
      http.get({
        host: server.host,
        port: server.port,
        path: '/db/user/' + id
      }, function (response) {
  			var user = '';
        if (user == undefined) {
          console.log("user is undefined");
        }
  			response.on('data', function (data) {
  				user += data;
  			});
  			response.on('end', function () {
          console.log("before parse", user);
          var parsed = JSON.parse(user)[0];
          console.log("after parse", parsed);
          res.render("pages/demo", {user : req.session.user, userProfile : parsed});
  			});
  			response.on('error', function (err) {
          console.log("in response error")
  				console.log(err);
          throw err;
  			});
  		});
    }
  });

  return router;
};

/**
 * get overall infomation in back-end
 * @return
 */
var getOverallInfoAsync = function (data, req, res) {
  // 1. get ec2 list
  // 2. get elb
  // 3. get as
  var partialPath = "http://" + server.host + ":" + server.port + "/";
  var URLS = [
    partialPath + "listec2instance", // get list of instance id
    partialPath + "getelbstatsall?elbarn=" + data.arn, // get all elb stats
    partialPath + "listtg?elbarn=" + data.arn // get all target group stats
  ];

  console.log("in getAllInfoAsync", URLS);

  async.map(URLS, function(url, done) {
    request(url, function (err, response, body) {
      console.log(url + " " + err);
      if (err || response.statusCode !== 200) {
        return done(err || new Error());
      }
      return done(null, JSON.parse(body));
    });
  }, function(err, results) {
    if (err) {
      return res.sendStatus(500);
    }
    var ec2List = results[0];
    var elbstatsOrginal = results[1];
    var targetGroupList = results[2];
    // var elbstats = [
    //   elbstatsOrginal.targetGroupList[0],
    //   elbstatsOrginal.targetGroupList[1]
    // ]
    var firstTG = targetGroupList[0];
    var secondTG = targetGroupList[1];

    console.log(elbstatsOrginal/*[firstTG][0]*/);
    console.log("after finishing: ", ec2List);
    // console.log("after finishing: ", elbstats);
    console.log("after finishing: ", elbstatsOrginal);

    res.render('pages/adminServer', {user: req.session.user,  ec2List : ec2List, elbstats : elbstatsOrginal, targetGroupList : targetGroupList });
  });
}
