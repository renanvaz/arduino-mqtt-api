import {EventEmitter} from 'events';
import dgram from 'dgram';
import Q from 'q';

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

export default class Server extends EventEmitter {
    constructor(port) {
        super();

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
            let data = msg.toString().split(/([^:]+):(.*)/),
                topic = data[1],
                params = data[2].split('|');

            if (topic == 'hi') {
                let client = new ServerClient(this, rinfo.port, rinfo.address);
                this._clients[rinfo.address+':'+rinfo.port] = client;
                this.emit('client', client);
            } else {
                let client = this._clients[rinfo.address+':'+rinfo.port];

                client.emit(topic, ...params);
                client.emit('message', topic, ...params);

                this.emit(topic, ...params);
                this.emit('message', topic, ...params);
            }
        });

        this.socket.on('listening', () => {
            let address = this.socket.address();
            console.log(`server listening ${address.address}:${address.port}`);
        });

        this.socket.bind(this._port);

        /**setTimeout(() => {
            if (this._pingtries) {
                let client;

                for (client of this._clients) {
                    client.send('ping');
                }
            }
        }, this._pingtimeout);*/
    }

    send(client, topic, ...message) {
        let d = Q.defer(),
            buffer = new Buffer(topic+':'+message.join('|'));

        console.log(client);

        this.socket.send(buffer, 0, buffer.length, client.port, client.host, (err) => {
            if (err) d.reject(err);
            else d.resolve();
        });

        return d.promise;
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
