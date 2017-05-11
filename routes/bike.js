var express = require("express");
var router = express.Router();
var http = require("http");
var server = require("../config/ServerConfig");

module.exports = function () {
  router.get("/", function (req, res) {
    console.log("in bike");
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
        if (req.session.user != undefined) {
          res.render("pages/bike", {user: req.session.user, productList : parsed});
        } else {
          res.render("pages/bike", {productList : parsed});
        }
      });
      response.on('error', function (err) {
        console.log(err);
        throw err;
      });
    });
  });

  router.get("/detail/:id", function (req, res) {
    console.log("in bike detail");
    console.log(req.params.id);
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

        console.log(typeof parsed.description);
        var arr = parsed.description.split("\n");
        parsed.description = arr;
        console.log(arr);
        if (req.session.user != undefined) {
          res.render("pages/bikeDetail", {user: req.session.user, product : parsed});
        } else {
          res.render("pages/bikeDetail", {product : parsed});
        }
      });
      response.on('error', function (err) {
        console.log(err);
        throw err;
      });
    });
  });

  return router;
}
