import {EventEmitter} from 'events';
import dgram from 'dgram';
import Q from 'q';

class ServerClient extends EventEmitter {
  constructor(server, port, host) {
    super();

    this._host = host;
    this._port = port;

    this._lastTalkTime = Date.now();

    this.server = server;

    this.on('ping', () => {
      this._lastTalkTime = Date.now();
    });
  }

  send(topic, ...message) {
    return this.server.send(this, topic, ...message);
  }

  ping() {
    this.send('ping');
  }

  disconnect() {
    console.log(`Client disconnected ${this.host}:${this.port}`);
    this.send('bye');
    this.emit('disconnect');
  }

  get lastTalkTime() {
    return this._lastTalkTime;
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

    this._port    = port;
    this._clients = {};

    this._pingDelay   = 50;
    this._pingTimeOut = 250;

    this.socket = dgram.createSocket('udp4');

    this.socket.on('error', (err) => {
      console.log(`server error:\n${err.stack}`);
      this.socket.close();
    });

    this.socket.on('message', (msg, rinfo) => {
      // topic:message
      let data   = msg.toString().split(/([^:]+):(.*)/),
        topic    = data[1] ? data[1] : msg.toString(),
        params   = data[2] ? data[2].split('|') : [];

      if (topic == 'hi') {
        let client = new ServerClient(this, rinfo.port, rinfo.address);
        this._clients[rinfo.address+':'+rinfo.port] = client;
        client.send('hi');
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

    setInterval(() => {
      let client, name;
      let now = Date.now();

      for (name in this._clients) {
        client = this._clients[name];

        if (now - client.lastTalkTime < this._pingTimeOut) {
          client.ping();
        } else {
          client.disconnect();
          delete this._clients[client.host+':'+client.port];
        }
      }
    }, this._pingDelay);
  }

  send(client, topic, ...message) {
    let d = Q.defer(),
    buffer = new Buffer(topic+(message.length ? ':'+message.join('|') : ''));

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
