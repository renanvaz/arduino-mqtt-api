import * as mqtt from 'mqtt';
import {Board} from './Board';

let clients = {};

var server = new mqtt.Server((client) => {
    client.on('connect', (packet) => {
        // console.log("CONNECT(%s): %j", packet.clientId, packet);

        client.connack({returnCode: 0});
        client.id = packet.clientId;

        clients[client.id] = client;

        let b = new Board(server, client);

        console.time('dbsave');
        b.digitalRead(10).then(function(message){
            console.timeEnd('dbsave');
            console.log('digitalRead', message);
        });
    });

    client.on('publish', (packet) => {
        // console.log("PUBLISH(%s): %j", client.id, packet);

        for (let k in clients) {
            clients[k].publish({topic: packet.topic, payload: packet.payload});
        }
    });

    client.on('subscribe', (packet) => {
        // console.log("SUBSCRIBE(%s): %j", client.id, packet);

        let granted = [];
        for (let i = 0, l = packet.subscriptions.length; i < l; i++) {
            granted.push(packet.subscriptions[i].qos);
        }

        client.suback({granted: granted, messageId: packet.messageId});
    });

    client.on('pingreq', (packet) => {
        console.log('PINGREQ(%s)', client.id);

        client.pingresp();
    });

    client.on('disconnect', (packet) => {
        client.stream.end();
    });

    client.on('close', (err) => {
        delete clients[client.id];
    });

    client.on('error', (err) => {
        console.log('error!', err);

        if (!clients[client.id]) return;

        client.stream.end();
    });
}).listen(1883);
