'use strict';

var _Server = require('./Server');

var _Server2 = _interopRequireDefault(_Server);

var _Board = require('./Board');

var _Board2 = _interopRequireDefault(_Board);

var _NodeMCU = require('../utils/NodeMCU');

var _Helpers = require('../utils/Helpers');

var _Helpers2 = _interopRequireDefault(_Helpers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var s = new _Server2.default(4123);

var index = 0;

s.on('client', function (client) {
  console.log('new client');

  client.on('setDevice', function (ID, TYPE, VERSION) {
    var pin = _NodeMCU.D2;
    var state = false;
    var b = new _Board2.default(client);

    console.log(ID, TYPE, VERSION);

    b.pinMode(pin, _Board.OUTPUT);

    console.time('send');
    pin = 50;
    b.digitalWrite(pin++, (state = !state) ? _Board.HIGH : _Board.LOW);
    b.digitalWrite(pin++, (state = !state) ? _Board.HIGH : _Board.LOW);
    b.digitalWrite(pin++, (state = !state) ? _Board.HIGH : _Board.LOW);
    b.digitalWrite(pin++, (state = !state) ? _Board.HIGH : _Board.LOW);
    b.digitalWrite(pin++, (state = !state) ? _Board.HIGH : _Board.LOW);
    b.digitalWrite(pin++, (state = !state) ? _Board.HIGH : _Board.LOW);
    b.digitalWrite(pin++, (state = !state) ? _Board.HIGH : _Board.LOW);
    b.digitalWrite(pin++, (state = !state) ? _Board.HIGH : _Board.LOW);
    b.digitalWrite(pin++, (state = !state) ? _Board.HIGH : _Board.LOW);
    b.digitalWrite(pin++, (state = !state) ? _Board.HIGH : _Board.LOW);
    b.digitalWrite(pin++, (state = !state) ? _Board.HIGH : _Board.LOW);
    b.digitalWrite(pin++, (state = !state) ? _Board.HIGH : _Board.LOW);
    b.digitalWrite(pin++, (state = !state) ? _Board.HIGH : _Board.LOW);
    b.digitalWrite(pin++, (state = !state) ? _Board.HIGH : _Board.LOW);
    b.digitalWrite(pin++, (state = !state) ? _Board.HIGH : _Board.LOW);
    console.timeEnd('send');
  });
});