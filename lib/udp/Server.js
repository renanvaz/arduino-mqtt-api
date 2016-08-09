'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _dgram = require('dgram');

var _dgram2 = _interopRequireDefault(_dgram);

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ServerClient = function (_EventEmitter) {
  _inherits(ServerClient, _EventEmitter);

  function ServerClient(server, deviceID, port, host) {
    _classCallCheck(this, ServerClient);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ServerClient).call(this));

    _this._deviceID = deviceID;
    _this._host = host;
    _this._port = port;

    _this.server = server;
    return _this;
  }

  _createClass(ServerClient, [{
    key: 'send',
    value: function send(topic) {
      var _server;

      for (var _len = arguments.length, message = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        message[_key - 1] = arguments[_key];
      }

      return (_server = this.server).send.apply(_server, [this, topic].concat(message));
    }
  }, {
    key: 'host',
    get: function get() {
      return this._host;
    }
  }, {
    key: 'port',
    get: function get() {
      return this._port;
    }
  }]);

  return ServerClient;
}(_events.EventEmitter);

var Server = function (_EventEmitter2) {
  _inherits(Server, _EventEmitter2);

  function Server(port) {
    _classCallCheck(this, Server);

    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(Server).call(this));

    _this2._port = port;
    _this2._clients = {};

    _this2._pingtries = 3;
    _this2._pingtimeout = 300;

    _this2.socket = _dgram2.default.createSocket('udp4');

    _this2.socket.on('error', function (err) {
      console.log('server error:\n' + err.stack);
      _this2.socket.close();
    });

    _this2.socket.on('message', function (msg, rinfo) {
      // topic:message
      var data = msg.toString().split(/([^:]+):([^:]+):(.*)/),
          deviceID = data[1],
          topic = data[2],
          params = data[3].split('|');

      if (topic == 'hi') {
        var client = new ServerClient(_this2, deviceID, rinfo.port, rinfo.address);
        _this2._clients[deviceID] = client;
        _this2.emit('client', client);
      } else {
        var _client = _this2._clients[deviceID];

        _client.emit.apply(_client, [topic].concat(_toConsumableArray(params)));
        _client.emit.apply(_client, ['message', topic].concat(_toConsumableArray(params)));

        _this2.emit.apply(_this2, [topic].concat(_toConsumableArray(params)));
        _this2.emit.apply(_this2, ['message', topic].concat(_toConsumableArray(params)));
      }
    });

    _this2.socket.on('listening', function () {
      var address = _this2.socket.address();
      console.log('server listening ' + address.address + ':' + address.port);
    });

    _this2.socket.bind(_this2._port);

    // setTimeout(() => {
    //   if (this._pingtries) {
    //     let client;
    //
    //     for (client of this._clients) {
    //       client.send('ping');
    //     }
    //   }
    // }, this._pingtimeout);
    return _this2;
  }

  _createClass(Server, [{
    key: 'send',
    value: function send(client, topic) {
      for (var _len2 = arguments.length, message = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        message[_key2 - 2] = arguments[_key2];
      }

      var d = _q2.default.defer(),
          buffer = new Buffer(topic + ':' + message.join('|'));

      this.socket.send(buffer, 0, buffer.length, client.port, client.host, function (err) {
        if (err) d.reject(err);else d.resolve();
      });

      return d.promise;
    }
  }, {
    key: 'close',
    value: function close() {
      this.socket.close();
    }
  }, {
    key: 'host',
    get: function get() {
      return this._host;
    }
  }, {
    key: 'port',
    get: function get() {
      return this._port;
    }
  }]);

  return Server;
}(_events.EventEmitter);

exports.default = Server;