import * as mqtt from 'mqtt';
import {EventEmitter} from 'events';
import Board, {INPUT, OUTPUT, HIGH, LOW} from './Board';
import {D2} from '../utils/NodeMCU';
import $ from '../utils/Helpers';

let clients = {};


class ServerClient extends EventEmitter {
  constructor(server, port, host) {
    super();

    this._host = host;
    this._port = port;

    this.server = server;
  }

  send(topic, ...message) {
    return this.server.send(this, topic, ...message);
  }

  get host() {
    return this._host;
  }

  get port() {
    return this._port;
  }
}

var server = new mqtt.Server((client) => {
    client.on('connect', (packet) => {
        console.log("CONNECT(%s): %j", packet.clientId, packet);

        client.connack({returnCode: 0});
        client.id = packet.clientId;

        clients[client.id] = client;

        let pin   = D2;
        let b = new Board(client);
        let state = false;

        b.pinMode(pin, OUTPUT);

        b.digitalWrite(pin, (state = !state) ? HIGH : LOW);

        $.loop(1000, () => {
          b.digitalWrite(pin, (state = !state) ? HIGH : LOW);
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
}).listen(4123);
