var express = require('express');
var router = express.Router();

module.exports = function () {
  router.get("/", function (req, res) {
    console.log("in demo");

    res.render("pages/demo");
  });

  return router;
}
