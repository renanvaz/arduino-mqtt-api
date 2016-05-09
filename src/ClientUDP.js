import {EventEmitter} from 'events';
import dgram from 'dgram';
import Q from 'q';

const message = new Buffer('Some bytes');
const client = dgram.createSocket('udp4');
client.on('message', (message, rinfo) => {
    var data = message.toString().split('|');

    if (data[0] == 'digitalRead') {
        let b = new Buffer(data[1]+'|PIN VALUE');
        client.send(b, 0, b.length, 41234, 'localhost');
    }
});

client.bind(43214, function(){
    client.send(message, 0, message.length, 41234, 'localhost', (err) => {
      client.close();
    });
});


export class Client extends EventEmitter {
    construct(host, port) {
        this._host = host;
        this._port = port;

        this.socket = dgram.createSocket('udp4');

        this.socket.on('message', (message, rinfo) => {
            // topic:message
            var data = message.toString().split(/([^:]+):(.*)/);

            this.emmit('message', data[1], data[2]);
            this.emmit(data[1], data[2]);
        });
    }

    send(...message) {
        let buffer = new Buffer(message.join('|'));

        this.socket.send(buffer, 0, buffer.length, this._port, this._host, (err) => {
            if (err) throw err;

          this.socket.close();
        });
    }

    get host() {
        return this._host;
    }

    get port() {
        return this._port;
    }
}
