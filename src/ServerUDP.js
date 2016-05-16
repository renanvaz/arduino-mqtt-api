import {EventEmitter} from 'events';
import dgram from 'dgram';
import Q from 'q';

const server = dgram.createSocket('udp4');

let Board = require('./BoardUDP').Board;

server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

server.on('message', (msg, rinfo) => {
  console.log(msg, rinfo);
  console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
});

server.on('listening', () => {
  var address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(41234, () => {
  let b = new Board(client);

  console.time('dbsave');
  b.digitalRead(10).then(function(message){
      console.timeEnd('dbsave');
      console.log('digitalRead', message);
  });
});

class ServerClient {
    construct(server, host, port) {
        this._host = host;
        this._port = port;

        this.server = server;
    }

    send(...message) {
        return this.server.send(this, ...message);
    }

    get host() {
        return this._host;
    }

    get port() {
        return this._port;
    }
}

export class Server extends EventEmitter {
    construct(port) {
        this._port = port;
        this._clients = {};

        this.socket = dgram.createSocket('udp4');

        this.socket.on('error', (err) => {
            console.log(`server error:\n${err.stack}`);
            this.socket.close();
        });

        this.socket.on('message', (msg, rinfo) => {
            // topic:message
            let data = message.toString().split(/([^:]+):(.*)/);

            if (data[1] == 'hi') {
                let client = new ServerClient(this.socket, rinfo.address, rinfo.port);
                this._clients[rinfo.address+':'+rinfo.port] = client;
                this.emmit('connected', client);
            } else {
                this.emmit('message', data[1], data[2]);
                this.emmit(data[1], data[2]);
            }
        });

        this.socket.on('listening', () => {
              let address = this.socket.address();
              console.log(`server listening ${address.address}:${address.port}`);
        });

        this.socket.bind(this._port, () => {
            let b = new Board(client);

            console.time('dbsave');
            b.digitalRead(10).then(function(message){
                console.timeEnd('dbsave');
                console.log('digitalRead', message);
            });
        });
    }

    send(client, ...message) {
        let buffer = new Buffer(message.join('|'));

        this.socket.send(buffer, 0, buffer.length, client.port, client.host (err) => {
            if (err) d.reject(err);
            else d.resolve();
        });
    }

    close() {
        this.socket.close();
    }

    get host() {
        return this._host;
    }

    get port() {
        return this._port;
    }
}
