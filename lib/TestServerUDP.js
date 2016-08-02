'use strict';

var _ServerUDP = require('./ServerUDP');

var _ServerUDP2 = _interopRequireDefault(_ServerUDP);

var _BoardUDP = require('./BoardUDP');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var s = new _ServerUDP2.default(4123);

s.on('client', function (client) {
    console.log('new client');

    var b = new _BoardUDP.Board(client);

    // console.time('dbsave');
    // b.digitalRead(10).then((message) => {
    //     console.timeEnd('dbsave');
    //     console.log('digitalRead', message);
    // });

    b._send('pinMode', '4', 'OUTPUT');
    b._send('digitalWrite', '4', '1');

    setTimeout(function(){
        b._send('digitalWrite', '4', '0');
    }, 1000);

    setTimeout(function(){
        b._send('digitalWrite', '4', '1');
    }, 2000);
});
