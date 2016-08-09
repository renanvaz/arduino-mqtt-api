'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LSBFIRST = exports.MSBFIRST = exports.INTERNAL = exports.EXTERNAL = exports.DEFAULT = exports.DISCONNECTED = exports.CONNECTED = exports.LOW = exports.HIGH = exports.OUTPUT = exports.INPUT = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

var _events = require('events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var INPUT = exports.INPUT = 'INPUT';
var OUTPUT = exports.OUTPUT = 'OUTPUT';
// export const INPUT_PULLUP   = 'INPUT_PULLUP';
var HIGH = exports.HIGH = 'HIGH';
var LOW = exports.LOW = 'LOW';
var CONNECTED = exports.CONNECTED = 'CONNECTED';
var DISCONNECTED = exports.DISCONNECTED = 'DISCONNECTED';
var DEFAULT = exports.DEFAULT = 'DEFAULT';
var EXTERNAL = exports.EXTERNAL = 'EXTERNAL';
var INTERNAL = exports.INTERNAL = 'INTERNAL';
var MSBFIRST = exports.MSBFIRST = 'MSBFIRST';
var LSBFIRST = exports.LSBFIRST = 'LSBFIRST';

var MAX_MESSAGE_ID = 999999;
var MESSAGE_ID = 0;

var Board = function (_EventEmitter) {
  _inherits(Board, _EventEmitter);

  // Construct
  /**
  * Constructor
  * @param  {string} IP
  * @return {void}
  */

  function Board(client) {
    _classCallCheck(this, Board);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Board).call(this));

    _this._client = client;

    _this._valuesPinMode = [INPUT, OUTPUT];
    _this._valuesDigitalLevel = [HIGH, LOW];
    _this._valuesAnalogReference = [DEFAULT, EXTERNAL, INTERNAL];
    _this._valuesBitOrder = [MSBFIRST, LSBFIRST];

    _this._client.on('message', function (topic) {
      for (var _len = arguments.length, message = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        message[_key - 1] = arguments[_key];
      }

      _this.emit.apply(_this, [topic].concat(message));
    });

    // Communication
    _this.Serial = {};
    _this.Stream = {};
    return _this;
  }

  /**
  * Get instance of the client
  * @return {Client} Client instance
  */


  _createClass(Board, [{
    key: '_send',
    value: function _send(topic) {
      var _client;

      for (var _len2 = arguments.length, message = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        message[_key2 - 1] = arguments[_key2];
      }

      (_client = this.client).send.apply(_client, [topic].concat(message));
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

    // Digital I/O
    /**
    * Configures the specified pin to behave either as an input or an output.
    * @param  {integer} pin
    * @param  {[INPUT, OUTPUT]} mode
    * @return {void}
    */

  }, {
    key: 'pinMode',
    value: function pinMode(pin, mode) {
      if (typeof pin !== 'number') {
        throw new TypeError('The param "pin" must be a number');
      }
      if (this._valuesPinMode.indexOf(mode) === -1) {
        throw new Error('Invalid value of param "mode": ' + mode);
      }

      this._send('pinMode', pin, mode);
    }

    /**
    * Write a HIGH or a LOW value to a digital pin.
    * @param  {integer} pin
    * @param  {[HIGH, LOW]} level
    * @return {void}
    */

  }, {
    key: 'digitalWrite',
    value: function digitalWrite(pin, level) {
      if (typeof pin !== 'number') {
        throw new TypeError('The param "pin" must be a number');
      }
      if (this._valuesDigitalLevel.indexOf(level) === -1) {
        throw new Error('Invalid value of param "level": ' + level);
      }

      this._send('digitalWrite', pin, level);
    }

    /**
    * Reads the value from a specified digital pin, either HIGH or LOW.
    * @param  {integer} pin
    * @return {Promise}
    */

  }, {
    key: 'digitalRead',
    value: function digitalRead(pin) {
      var d = _q2.default.defer(),
          messageID = void 0;

      if (typeof pin !== 'number') {
        throw new TypeError('The param "pin" must be a number');
      }

      this._ask('digitalRead', pin).then(function () {
        d.resolve.apply(d, arguments);
      });

      return d.promise;
    }

    // Analog I/O
    /**
    * Configures the reference voltage used for analog input (i.e. the value used as the top of the input range).
    * @param  {[DEFAULT, EXTERNAL, INTERNAL]} type
    * @return {void}
    */

  }, {
    key: 'analogReference',
    value: function analogReference(value) {
      if (this._valuesAnalogReference.indexOf(mode) === -1) {
        throw new Error('Invalid value of param "value": ' + value);
      }

      this._send('digitalWrite', value);
    }

    /**
    * Reads the value from the specified analog pin.
    * @param  {integer} pin
    * @return {Promise} int (0 to 1023)
    */

  }, {
    key: 'analogRead',
    value: function analogRead(pin) {
      var d = _q2.default.defer();

      if (typeof pin !== 'number') {
        throw new TypeError('The param "pin" must be a number');
      }

      this._ask('analogRead', pin).then(function () {
        d.resolve.apply(d, arguments);
      });

      return d.promise;
    }

    /**
    * Writes an analog value (PWM wave) to a pin.
    * @param  {integer} pin
    * @param  {integer} value
    * @return {void}
    */

  }, {
    key: 'analogWrite',
    value: function analogWrite(pin, value) {
      if (typeof pin !== 'number') {
        throw new TypeError('The param "pin" must be a number');
      }

      this._send('analogWrite', pin, value);
    }

    // Advanced I/O
    /**
    * Generates a square wave of the specified frequency (and 50% duty cycle) on a pin.
    * A duration can be specified, otherwise the wave continues until a call to noTone(). The pin can be connected to a piezo buzzer or other speaker to play tones.
    * @param  {integer} pin
    * @param  {integer} frequency
    * @param  {long} [duration]     the duration of the tone in milliseconds (optional)
    * @return {void}
    */

  }, {
    key: 'tone',
    value: function tone(pin, frequency, duration) {
      if (typeof pin !== 'number') {
        throw new TypeError('The param "pin" must be a number');
      }

      this._send('tone', pin, frequency, duration);
    }

    /**
    * Stops the generation of a square wave triggered by tone(). Has no effect if no tone is being generated.
    * @param  {integer} pin
    * @return {void}
    */

  }, {
    key: 'noTone',
    value: function noTone(pin) {
      if (typeof pin !== 'number') {
        throw new TypeError('The param "pin" must be a number');
      }

      this._send('noTone', pin);
    }

    /**
    * Shifts out a byte of data one bit at a time.
    * @param  {integer} dataPin
    * @param  {integer} clockPin
    * @param  {[MSBFIRST, LSBFIRST]} bitOrder
    * @param  {byte} value
    * @return {void}
    */

  }, {
    key: 'shiftOut',
    value: function shiftOut(dataPin, clockPin, bitOrder, value) {
      if (typeof dataPin !== 'number') {
        throw new TypeError('The param "dataPin" must be a number');
      }
      if (typeof clockPin !== 'number') {
        throw new TypeError('The param "clockPin" must be a number');
      }
      if (this._valuesBitOrder.indexOf(bitOrder) === -1) {
        throw new Error('Invalid value of param "bitOrder": ' + bitOrder);
      }

      this._send('shiftOut', dataPin, clockPin, bitOrder, value);
    }

    /**
    * Shifts in a byte of data one bit at a time.
    * @param  {integer} dataPin
    * @param  {integer} clockPin
    * @param  {[MSBFIRST, LSBFIRST]} bitOrder
    * @return {Promise}
    */

  }, {
    key: 'shiftIn',
    value: function shiftIn(dataPin, clockPin, bitOrder) {
      var d = _q2.default.defer();

      if (typeof dataPin !== 'number') {
        throw new TypeError('The param "dataPin" must be a number');
      }
      if (typeof clockPin !== 'number') {
        throw new TypeError('The param "clockPin" must be a number');
      }
      if (this._valuesBitOrder.indexOf(bitOrder) === -1) {
        throw new Error('Invalid value of param "bitOrder": ' + bitOrder);
      }

      this._ask('shiftIn', dataPin, clockPin, bitOrder).then(function () {
        d.resolve.apply(d, arguments);
      });

      return d.promise;
    }

    /**
    * Reads a pulse (either HIGH or LOW) on a pin.
    * @param  {integer} pin
    * @param  {[HIGH, LOW]} value
    * @param  {long} [timeout]     the number of microseconds to wait for the pulse to be completed
    * @return {Promise}
    */

  }, {
    key: 'pulseIn',
    value: function pulseIn(pin, value, timeout) {
      var d = _q2.default.defer();

      if (typeof pin !== 'number') {
        throw new TypeError('The param "pin" must be a number');
      }
      if (this._valuesDigitalLevel.indexOf(value) === -1) {
        throw new Error('Invalid value of param "value": ' + value);
      }

      this._ask('pulseIn', pin, value, timeout).then(function () {
        d.resolve.apply(d, arguments);
      });

      return d.promise;
    }

    // Implements
    // External Interrupts

  }, {
    key: 'attachInterrupt',
    value: function attachInterrupt() {
      var d = _q2.default.defer();

      if (this._status == CONNECTED) {
        setTimeout(function () {
          d.resolve();
        }, 0);
      } else {
        setTimeout(function () {
          d.reject();
        }, 0);
      }

      return d.promise;
    }
  }, {
    key: 'detachInterrupt',
    value: function detachInterrupt() {
      var d = _q2.default.defer();

      if (this._status == CONNECTED) {
        setTimeout(function () {
          d.resolve();
        }, 0);
      } else {
        setTimeout(function () {
          d.reject();
        }, 0);
      }

      return d.promise;
    }

    // Interrupts

  }, {
    key: 'interrupts',
    value: function interrupts() {
      var d = _q2.default.defer();

      if (this._status == CONNECTED) {
        setTimeout(function () {
          d.resolve();
        }, 0);
      } else {
        setTimeout(function () {
          d.reject();
        }, 0);
      }

      return d.promise;
    }
  }, {
    key: 'noInterrupts',
    value: function noInterrupts() {
      var d = _q2.default.defer();

      if (this._status == CONNECTED) {
        setTimeout(function () {
          d.resolve();
        }, 0);
      } else {
        setTimeout(function () {
          d.reject();
        }, 0);
      }

      return d.promise;
    }
  }, {
    key: 'client',
    get: function get() {
      return this._client;
    }
  }]);

  return Board;
}(_events.EventEmitter);

exports.default = Board;