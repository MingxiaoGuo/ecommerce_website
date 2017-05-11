var express = require('express');
var router = express.Router();

module.exports = function () {
  router.get('/', function(req, res, next) {
    if (req.session.user != undefined) {
      res.render('pages/index', { user : req.session.user });
    } else {
      res.render('pages/index');
    }
  });

  router.get("/adminLogin", function (req, res) {
    res.render("pages/adminLogin");
  });

  router.get('/logout', function(req, res) {
  	req.session.destroy(function (err) {
  		if (err) throw err;
  		res.redirect('/');
  	});
  });

  return router;
}
