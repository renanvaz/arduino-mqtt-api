import {EventEmitter} from 'events';
import dgram from 'dgram';
import Q from 'q';

export class Client extends EventEmitter {
    construct() {
        this.socket = dgram.createSocket('udp4');

        this.socket.on('error', (err) => {
            console.log(`client error:\n${err.stack}`);
            this.socket.close();
        });

        this.socket.on('message', (message, rinfo) => {
            // topic:message
            var data = message.toString().split(/([^:]+):(.*)/);

            this.emmit('message', data[1], data[2]);
            this.emmit(data[1], data[2]);
        });
    }

    send(...message) {
        let d = Q.defer(),
            buffer = new Buffer(message.join('|'));

        this.socket.send(buffer, 0, buffer.length, this._port, this._host, (err) => {
            if (err) d.reject(err);
            else d.resolve();
        });

        return d.promise;
    }

    close() {
        this.socket.close();
    }

    connect(host, port) {
        this._host = host;
        this._port = port;
    }

    get host() {
        return this._host;
    }

    get port() {
        return this._port;
    }
}
