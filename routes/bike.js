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

  router.post("/addToCart", function (req, res) {
    console.log("in add to cart");
    updateCart(req, res, req.body.id);
  });

  function updateCart(req, res, p_id) {
    console.log(p_id);
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
        parsed.product.push(p_id);
        console.log(parsed);
        saveCart(req, res, parsed);
      });
      response.on('error', function (err) {
        console.log(err);
        throw err;
      });
    });
  }
  //
  // function getProductById(req, res, id) {
  //   http.get({
  //     host: server.host,
  //     port: server.port,
  //     path: '/db/product/id/' + id
  //   }, function (response) {
  //     var product = '';
  //     response.on('data', function (data) {
  //       product += data;
  //     });
  //     response.on('end', function () {
  //       var parsed = JSON.parse(product)[0];
  //
  //       console.log(parsed);
  //
  //       updateCart(req, res, parsed);
  //     });
  //     response.on('error', function (err) {
  //       console.log(err);
  //       throw err;
  //     });
  //   });
  // }

  function saveCart(req, res, cart) {
    // var currentCart = {
    //   id: cart.id,
    //   userId: cart.userId,
    //   product: []
    // };
    // currentCart.product.push(cart.product);
    // console.log(currentCart);
    var options = {
      hostname: server.host,
      port: server.port,
      path: '/db/cart/save',
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
        console.log(result);
        if (result == "0") {
          res.json({done: true, message: "added to cart"})
        } else {
          res.json({done: false, message: "adding fail!"});
        }
      })
    });
    request.on('error', function(e)  {
      console.log(`problem with request: ${e.message}`);
    });
    console.log("in cart", typeof cart);
    request.write(JSON.stringify(cart));
    request.end();
  }

  return router;
}
