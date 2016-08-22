import {EventEmitter} from 'events';
import dgram from 'dgram';
import Q from 'q';

class ServerClient extends EventEmitter {
  constructor(server, host, port) {
    super();

    this._host = host;
    this._port = port;

    this._lastTalkTime = Date.now();

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

    this._port    = port;
    this._clients = {};

    this._pingDelay   = 50;
    this._pingTimeOut = 250;

    this.socket = dgram.createSocket('udp4');

    this.socket.on('error', (err) => {
      console.log(`server error:\n${err.stack}`);
      this.socket.close();
    });

    this.socket.on('message', (buffer, rinfo) => {
      // topic:message
      let data   = buffer.toString().split(/([^:]+):(.*)/),
          topic  = data[1] ? data[1] : buffer.toString(),
          params = data[2] ? data[2].split('|') : [];

      let client = this.getClient(rinfo.address, rinfo.port);

      if (!!client) {
        client.lastTalkTime = Date.now();

        if (topic == '.') {
          // Do nothing
        } else if (topic == '-') {
          this.rmClient(client.instance.host, client.instance.port);
        } else {
          client.instance.emit(topic, ...params);
          client.instance.emit('*', topic, ...params);
          // this.emit(topic, ...params);
        }
      } else {
        if (topic == '+') {
          this.newClient(rinfo.address, rinfo.port);
        }
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

        if (now - client.lastTalkTime > this._pingDelay) {
          if (now - client.lastTalkTime < this._pingTimeOut) {
            client.instance.send('.');
          } else {
            this.rmClient(client.instance.host, client.instance.port);
          }
        }
      }
    }, 1000/30);
  }

  newClient(host, port) {
    let client = {
      instance: new ServerClient(this, host, port),
      lastTalkTime: Date.now()
    };

    this._clients[host+':'+port] = client;

    client.instance.send('+');
    this.emit('connection', client.instance);
  }

  getClient(host, port) {
    return this._clients[host+':'+port];
  }

  rmClient(host, port) {
    let client = this._clients[host+':'+port];

    client.instance.send('-');
    client.instance.emit('disconected');

    delete this._clients[host+':'+port];
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
