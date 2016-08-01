'use strict';

var _ClientUDP = require('./ClientUDP');

var _ClientUDP2 = _interopRequireDefault(_ClientUDP);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var host = '192.168.15.19';
var port = 12345;

var c = new _ClientUDP2.default();

c.connect(port, host).then(function () {
    console.log('connected');
});

c.send('teste', 'LOW');