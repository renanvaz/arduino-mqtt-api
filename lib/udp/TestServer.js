'use strict';

var _Server = require('./Server');

var _Server2 = _interopRequireDefault(_Server);

var _Board = require('./Board');

var _Board2 = _interopRequireDefault(_Board);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var $ = {
  wait: function wait(time, fn) {
    return setTimeout(fn, time);
  }
};

var s = new _Server2.default(4123);

s.on('client', function (client) {
  console.log('new client');

  var pin = 4;
  var state = false;
  var b = new _Board2.default(client);

  b.pinMode(pin, _Board.OUTPUT);

  setInterval(function () {
    state = !state;

    console.log(state, state ? _Board.HIGH : _Board.LOW);

    b.digitalWrite(pin, state ? _Board.HIGH : _Board.LOW);
  }, 1000);

  // console.time('dbsave');
  // b.digitalRead(10).then((message) => {
  //   console.timeEnd('dbsave');
  //   console.log('digitalRead', message);
  // });
});