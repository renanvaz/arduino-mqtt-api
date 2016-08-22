'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

var _events = require('events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MAX_MESSAGE_ID = 255;
var MESSAGE_ID = 0;

var ModuleCore = function (_EventEmitter) {
  _inherits(ModuleCore, _EventEmitter);

  /**
  * Constructor
  * @param  {string} IP
  * @return {void}
  */

  function ModuleCore(id, type, version, client) {
    _classCallCheck(this, ModuleCore);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ModuleCore).call(this));

    _this._id = id;
    _this._type = type;
    _this._version = version;
    _this._client = client;

    _this._client.on('*', function (topic) {
      for (var _len = arguments.length, message = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        message[_key - 1] = arguments[_key];
      }

      _this.emit.apply(_this, [topic].concat(message));
    });
    return _this;
  }

  /**
  * Get instance of the client
  * @return {Client} Client instance
  */


  _createClass(ModuleCore, [{
    key: '_send',
    value: function _send(topic) {
      var _client;

      for (var _len2 = arguments.length, message = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        message[_key2 - 1] = arguments[_key2];
      }

      return (_client = this.client).send.apply(_client, [topic].concat(message));
    }
  }, {
    key: '_ask',
    value: function _ask(topic) {
      var _client2;

      for (var _len3 = arguments.length, message = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        message[_key3 - 1] = arguments[_key3];
      }

      var d = _q2.default.defer(),
          messageID = this._genMessageID();

      this._await(messageID, function () {
        d.resolve.apply(d, arguments);
      });

      (_client2 = this.client).send.apply(_client2, [topic, messageID].concat(message));

      return d.promise;
    }

    /**
    * Genherate a message ID
    * @return {int} Message ID
    */

  }, {
    key: '_genMessageID',
    value: function _genMessageID() {
      MESSAGE_ID = ++MESSAGE_ID;
      MESSAGE_ID = MESSAGE_ID > MAX_MESSAGE_ID ? 0 : MESSAGE_ID;

      return MESSAGE_ID;
    }

    /**
    * Wait for a return to an action that requires response
    * @param  {string}   topic
    * @param  {function} cb
    * @return {void}
    */

  }, {
    key: '_await',
    value: function _await(topic, cb) {
      this.once(topic, function (message) {
        cb(message);
      });
    }
  }, {
    key: 'client',
    get: function get() {
      return this._client;
    }
  }, {
    key: 'id',
    get: function get() {
      return this._id;
    }
  }, {
    key: 'type',
    get: function get() {
      return this._type;
    }
  }, {
    key: 'version',
    get: function get() {
      return this._version;
    }
  }]);

  return ModuleCore;
}(_events.EventEmitter);

exports.default = ModuleCore;