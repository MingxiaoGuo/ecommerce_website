var express = require("express");
var router = express.Router();
var http = require("http");
var server = require("../config/ServerConfig");
var async = require('async');
var request = require('request');

module.exports = function () {
  router.get("/", function (req, res) {
    http.get({
      host: server.host,
      port: server.port,
      path: '/db/cart/' + req.session.user.id
    }, function (response) {
      var cart = '';
      response.on('data', function (data) {
        cart += data;
      });
      response.on('end', function () {
        var parsed = JSON.parse(cart)[0];

        console.log(parsed);
        getProductList(req, res, parsed);
      });
      response.on('error', function (err) {
        console.log(err);
        throw err;
      });
    });
  })

  function getProductList(req, res, cart) {
    var arr = cart.product;
    var urlList = [];
    for (var i = 0; i < arr.length; i++) {
      var url = "http://" + server.host + ":" + server.port + "/db/product/id/" + arr[i];
      urlList.push(url)
    }
    console.log(urlList);

    async.map(urlList, function(url, done) {
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
      var productList = [];
      for (var i = 0; i < results.length; i++) {
        console.log("after", results[i][0])
        productList.push(results[i][0]);
      }


      console.log(productList);


      res.render('pages/userCart', {user: req.session.user,  productList : productList });
    });
  }


  return router;
}
