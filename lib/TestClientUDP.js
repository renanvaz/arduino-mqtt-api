'use strict';

var _ClientUDP = require('./ClientUDP');

var _ClientUDP2 = _interopRequireDefault(_ClientUDP);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var host = '192.168.15.10';
var port = 4123;

var c = new _ClientUDP2.default();

c.connect(port, host).then(function () {
    console.log('connected');
});

c.send('teste de pacote com mais de 24 caracteres e 124567812345678912345678912345678912345678941235784564', 'LOW');
