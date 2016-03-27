'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Board = exports.INTERNAL = exports.EXTERNAL = exports.DEFAULT = exports.DISCONNECTED = exports.CONNECTED = exports.LOW = exports.HIGH = exports.OUTPUT = exports.INPUT = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

var Board = exports.Board = function () {
    // Construct
    /**
     * Constructor
     * @param  {string} IP
     * @return {void}
     */

    function Board(IP) {
        _classCallCheck(this, Board);

        this._ip = IP;
        this._status = DISCONNECTED;

        this._valuesPinMode = [INPUT, OUTPUT];
        this._valuesDigitalLevel = [HIGH, LOW];
        this._valuesAnalogReference = [DEFAULT, EXTERNAL, INTERNAL];

        // Communication
        this.Serial = {};
        this.Stream = {};
    }

    _createClass(Board, [{
        key: 'pinMode',


        // Digital I/O
        /**
         * Configures the specified pin to behave either as an input or an output.
         * @param  {integer} pin
         * @param  {[INPUT, OUTPUT]} mode
         * @return {Promise}
         */
        value: function pinMode(pin, mode) {
            var d = _q2.default.defer();

            if (typeof pin !== 'number') {
                throw new TypeError('The param "pin" must be a number');
            }
            if (this._valuesPinMode.indexOf(mode) === -1) {
                throw new Error('Invalid value of param "mode": ' + mode);
            }

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

        /**
         * Write a HIGH or a LOW value to a digital pin.
         * @param  {integer} pin
         * @param  {[HIGH, LOW]} level
         * @return {Promise}
         */

    }, {
        key: 'digitalWrite',
        value: function digitalWrite(pin, level) {
            var d = _q2.default.defer();

            if (typeof pin !== 'number') {
                throw new TypeError('The param "pin" must be a number');
            }
            if (this._valuesDigitalLevel.indexOf(level) === -1) {
                throw new Error('Invalid value of param "level": ' + level);
            }

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

        /**
         * [digitalRead description]
         * @param  {integer} pin
         * @return {Promise}
         */

    }, {
        key: 'digitalRead',
        value: function digitalRead(pin) {
            var d = _q2.default.defer();

            if (typeof pin !== 'number') {
                throw new TypeError('The param "pin" must be a number');
            }

            if (this._status == CONNECTED) {
                d.resolve(LOW);
            } else {
                setTimeout(function () {
                    d.reject();
                }, 0);
            }

            return d.promise;
        }

        // Analog I/O
        /**
         * @param  {[DEFAULT, EXTERNAL, INTERNAL]} type
         * @return {Promise}
         */

    }, {
        key: 'analogReference',
        value: function analogReference(type) {
            var d = _q2.default.defer();

            if (this._valuesAnalogReference.indexOf(mode) === -1) {
                throw new Error('Invalid value of param "type": ' + type);
            }

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

        /**
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

        /**
         * Writes an analog value (PWM wave) to a pin.
         *
         * @param  {integer} pin
         * @param  {integer} value
         * @return {Promise}
         */

    }, {
        key: 'analogWrite',
        value: function analogWrite(pin, value) {
            var d = _q2.default.defer();

            if (typeof pin !== 'number') {
                throw new TypeError('The param "pin" must be a number');
            }

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

        // Advanced I/O

    }, {
        key: 'tone',
        value: function tone() {
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
        key: 'noTone',
        value: function noTone() {
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
        key: 'shiftOut',
        value: function shiftOut() {
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
        key: 'shiftIn',
        value: function shiftIn() {
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
        key: 'pulseIn',
        value: function pulseIn() {
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

        // Time

    }, {
        key: 'millis',
        value: function millis() {
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
        key: 'micros',
        value: function micros() {
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
        key: 'delay',
        value: function delay() {
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
        key: 'delayMicroseconds',
        value: function delayMicroseconds() {
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

        // Bits and Bytes

    }, {
        key: 'lowByte',
        value: function lowByte() {
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
        key: 'highByte',
        value: function highByte() {
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
        key: 'bitRead',
        value: function bitRead() {
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
        key: 'bitWrite',
        value: function bitWrite() {
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
        key: 'bitSet',
        value: function bitSet() {
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
        key: 'bitClear',
        value: function bitClear() {
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
        key: 'bit',
        value: function bit() {
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
        key: 'IP',
        get: function get() {
            return this._ip;
        }
    }]);

    return Board;
}();