'use strict';

var _ServerUDP = require('./ServerUDP');

var _ServerUDP2 = _interopRequireDefault(_ServerUDP);

var _BoardUDP = require('./BoardUDP');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var s = new _ServerUDP2.default(41234);

s.on('client', function (client) {
    var b = new _BoardUDP.Board(undefined, client);

    console.time('dbsave');
    b.digitalRead(10).then(function (message) {
        console.timeEnd('dbsave');
        console.log('digitalRead', message);
    });
});