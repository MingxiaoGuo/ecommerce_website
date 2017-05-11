/**
 * Created by Mingxiao Guo on 5/7/2017.
 */
var http = require("http");
var server = require("./ServerConfig");

var getAWSConfig = function (callback) {
  var host = server.host;
  var port = server.port;
  // get data from db
  http.get({
    host: host,
    port: port,
    path: '/db/aws'
  }, function(response) {
    var body = '';
    response.on('data', function(d) {
      body += d;
    });

    response.on('end', function() {
      var parsed = JSON.parse(body);
      var info = parsed[0];
      console.log(info);
      callback(info);
      // return;
    });
  });

};

module.exports.getAWSConfig = getAWSConfig;
