'use strict';

var _mqtt = require('mqtt');

var mqtt = _interopRequireWildcard(_mqtt);

var _Board = require('./Board');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var clients = {};

var server = new mqtt.Server(function (client) {
    client.on('connect', function (packet) {
        // console.log("CONNECT(%s): %j", packet.clientId, packet);

        client.connack({ returnCode: 0 });
        client.id = packet.clientId;

        clients[client.id] = client;

        var b = new _Board.Board(server, client);

        console.time('dbsave');
        b.digitalRead(10).then(function (message) {
            console.timeEnd('dbsave');
            console.log('digitalRead', message);
        });
    });

    client.on('publish', function (packet) {
        // console.log("PUBLISH(%s): %j", client.id, packet);

        for (var k in clients) {
            clients[k].publish({ topic: packet.topic, payload: packet.payload });
        }
    });

    client.on('subscribe', function (packet) {
        // console.log("SUBSCRIBE(%s): %j", client.id, packet);

        var granted = [];
        for (var i = 0, l = packet.subscriptions.length; i < l; i++) {
            granted.push(packet.subscriptions[i].qos);
        }

        client.suback({ granted: granted, messageId: packet.messageId });
    });

    client.on('pingreq', function (packet) {
        console.log('PINGREQ(%s)', client.id);

        client.pingresp();
    });

    client.on('disconnect', function (packet) {
        client.stream.end();
    });

    client.on('close', function (err) {
        delete clients[client.id];
    });

    client.on('error', function (err) {
        console.log('error!', err);

        if (!clients[client.id]) return;

        client.stream.end();
    });
}).listen(1883);