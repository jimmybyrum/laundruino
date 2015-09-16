'use strict';

var fs = require('fs');
var Hapi = require('hapi');
var config = require('./config.json');
var dust = require('dustjs-linkedin');

var src = fs.readFileSync(__dirname + '/./index.dust', 'utf8');
var compiled = dust.compile(src, 'index');
dust.loadSource(compiled);

var data = {
  inUse: false,
  current: 0,
  threshold: 100,
  lastUsed: new Date()
};

var server = new Hapi.Server();
server.connection({
  host: config.HTTP.host,
  port: config.HTTP.port
});

server.route([{
  method: 'GET',
  path: '/set/{gyro}',
  config: {
    handler: setData
  }
}, {
  method: 'GET',
  path: '/',
  config: {
    handler: render
  }
}]);

server.start(function() {
  console.info('Server started at', 'http://' + config.HTTP.host + ':' + config.HTTP.port);
});

function render(request, reply) {
  dust.render('index', data, function(err, out) {
    reply(out);
  });
}

function setData(request, reply) {
  data.current = request.params.gyro;
  data.inUse = data.current >= data.threshold;
  if (data.inUse) {
    data.lastUsed = new Date();
  }
  reply(request.params.gyro || 'error');
}
