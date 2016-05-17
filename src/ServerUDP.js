import {EventEmitter} from 'events';
import dgram from 'dgram';
import Q from 'q';

class ServerClient {
    construct(server, port, host) {
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

export class Server extends EventEmitter {
    construct(port) {
        this._port = port;
        this._clients = {};

        this._pingtries = 3;
        this._pingtimeout = 300;

        this.socket = dgram.createSocket('udp4');

        this.socket.on('error', (err) => {
            console.log(`server error:\n${err.stack}`);
            this.socket.close();
        });

        this.socket.on('message', (msg, rinfo) => {
            // topic:message
            let data = message.toString().split(/([^:]+):(.*)/);

            if (data[1] == 'hi') {
                let client = new ServerClient(this.socket, rinfo.port, rinfo.address);
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
            //
        });

        setTimeout(() => {
            if (this._pingtries) {
                let client;

                for (client of this._clients) {
                    client.send('ping');
                }
            }
        }, this._pingtimeout);
    }

    send(client, topic, ...message) {
        let d = Q.defer(),
            buffer = new Buffer(topic+':'+message.join('|'));

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
