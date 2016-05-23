'use strict';

var _ClientUDP = require('./ClientUDP');

var _ClientUDP2 = _interopRequireDefault(_ClientUDP);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var host = '107.170.148.84';
var port = 41234;

var c = new _ClientUDP2.default();

c.connect(port, host).then(function () {
    console.log('connected');
});

c.on('digitalRead', function (callbackID, pin) {
    console.log('digitalRead', callbackID, pin);

    c.send(callbackID, pin, 'LOW');
});