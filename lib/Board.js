var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var q_1 = require('q');
var events_1 = require('events');
exports.INPUT = 'INPUT';
exports.OUTPUT = 'OUTPUT';
// export const INPUT_PULLUP   = 'INPUT_PULLUP';
exports.HIGH = 'HIGH';
exports.LOW = 'LOW';
exports.CONNECTED = 'CONNECTED';
exports.DISCONNECTED = 'DISCONNECTED';
exports.DEFAULT = 'DEFAULT';
exports.EXTERNAL = 'EXTERNAL';
exports.INTERNAL = 'INTERNAL';
var MAX_MESSAGE_ID = 999999;
var MESSAGE_ID = 0;
var Board = (function (_super) {
    __extends(Board, _super);
    // Construct
    /**
     * Constructor
     * @param  {string} IP
     * @return {void}
     */
    function Board(client) {
        _super.call(this);
        this._client = client;
        this._status = exports.DISCONNECTED;
        this._valuesPinMode = [exports.INPUT, exports.OUTPUT];
        this._valuesDigitalLevel = [exports.HIGH, exports.LOW];
        this._valuesAnalogReference = [exports.DEFAULT, exports.EXTERNAL, exports.INTERNAL];
        this._client.on('message', function (topic, message) {
            this.emit(topic, message);
        });
        // Communication
        this.Serial = {};
        this.Stream = {};
    }
    Object.defineProperty(Board.prototype, "client", {
        /**
         * Get instance of the client MQTT
         * @return {Client} MQTT Client instance
         */
        get: function () {
            return this._client;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Genherate a message ID
     * @return {int} Message ID
     */
    Board.prototype.genMessageID = function () {
        MESSAGE_ID = ++MESSAGE_ID;
        MESSAGE_ID = MESSAGE_ID > MAX_MESSAGE_ID ? 0 : MESSAGE_ID;
        return MESSAGE_ID;
    };
    /**
     * Wait for a return to an action that requires response
     * @param  {string}   topic
     * @param  {function} cb
     * @return {void}
     */
    Board.prototype.await = function (topic, cb) {
        var _this = this;
        this.client.subscribe(topic, function (err) {
            if (err)
                throw err;
        });
        this.once(topic, function (message) {
            _this.client.unsubscribe(topic, function (err) {
                if (err)
                    throw err;
            });
            cb(message);
        });
    };
    // Digital I/O
    /**
     * Configures the specified pin to behave either as an input or an output.
     * @param  {integer} pin
     * @param  {[INPUT, OUTPUT]} mode
     * @return {Promise}
     */
    Board.prototype.pinMode = function (pin, mode) {
        if (typeof pin !== 'number') {
            throw new TypeError('The param "pin" must be a number');
        }
        if (this._valuesPinMode.indexOf(mode) === -1) {
            throw new Error('Invalid value of param "mode": ' + mode);
        }
        if (this._status !== exports.CONNECTED) {
        }
    };
    /**
     * Write a HIGH or a LOW value to a digital pin.
     * @param  {integer} pin
     * @param  {[HIGH, LOW]} level
     * @return {Promise}
     */
    Board.prototype.digitalWrite = function (pin, level) {
        if (typeof pin !== 'number') {
            throw new TypeError('The param "pin" must be a number');
        }
        if (this._valuesDigitalLevel.indexOf(level) === -1) {
            throw new Error('Invalid value of param "level": ' + level);
        }
        if (this._status == exports.CONNECTED) {
            this.client.publish('digitalWrite', pin + '|' + level);
        }
        else {
        }
    };
    /**
     * [digitalRead description]
     * @param  {integer} pin
     * @return {Promise}
     */
    Board.prototype.digitalRead = function (pin) {
        var d = q_1.default.defer(), messageID = this.genMessageID();
        if (typeof pin !== 'number') {
            throw new TypeError('The param "pin" must be a number');
        }
        if (this._status == exports.CONNECTED) {
            this.client.publish('digitalRead', messageID + '|' + pin);
            this.await(id, cb);
            d.resolve(exports.LOW);
        }
        else {
            setTimeout(function () { d.reject(); }, 0);
        }
        return d.promise;
    };
    // Analog I/O
    /**
     * @param  {[DEFAULT, EXTERNAL, INTERNAL]} type
     * @return {Promise}
     */
    Board.prototype.analogReference = function (type) {
        var d = q_1.default.defer();
        if (this._valuesAnalogReference.indexOf(mode) === -1) {
            throw new Error('Invalid value of param "type": ' + type);
        }
        if (this._status == exports.CONNECTED) {
            setTimeout(function () { d.resolve(); }, 0);
        }
        else {
            setTimeout(function () { d.reject(); }, 0);
        }
        return d.promise;
    };
    /**
     * @param  {integer} pin
     * @return {Promise} int (0 to 1023)
     */
    Board.prototype.analogRead = function (pin) {
        var d = q_1.default.defer();
        if (typeof pin !== 'number') {
            throw new TypeError('The param "pin" must be a number');
        }
        if (this._status == exports.CONNECTED) {
            setTimeout(function () { d.resolve(); }, 0);
        }
        else {
            setTimeout(function () { d.reject(); }, 0);
        }
        return d.promise;
    };
    /**
     * Writes an analog value (PWM wave) to a pin.
     * @param  {integer} pin
     * @param  {integer} value
     * @return {Promise}
     */
    Board.prototype.analogWrite = function (pin, value) {
        var d = q_1.default.defer();
        if (typeof pin !== 'number') {
            throw new TypeError('The param "pin" must be a number');
        }
        if (this._status == exports.CONNECTED) {
            setTimeout(function () { d.resolve(); }, 0);
        }
        else {
            setTimeout(function () { d.reject(); }, 0);
        }
        return d.promise;
    };
    // Advanced I/O
    Board.prototype.tone = function () {
        var d = q_1.default.defer();
        if (this._status == exports.CONNECTED) {
            setTimeout(function () { d.resolve(); }, 0);
        }
        else {
            setTimeout(function () { d.reject(); }, 0);
        }
        return d.promise;
    };
    Board.prototype.noTone = function () {
        var d = q_1.default.defer();
        if (this._status == exports.CONNECTED) {
            setTimeout(function () { d.resolve(); }, 0);
        }
        else {
            setTimeout(function () { d.reject(); }, 0);
        }
        return d.promise;
    };
    Board.prototype.shiftOut = function () {
        var d = q_1.default.defer();
        if (this._status == exports.CONNECTED) {
            setTimeout(function () { d.resolve(); }, 0);
        }
        else {
            setTimeout(function () { d.reject(); }, 0);
        }
        return d.promise;
    };
    Board.prototype.shiftIn = function () {
        var d = q_1.default.defer();
        if (this._status == exports.CONNECTED) {
            setTimeout(function () { d.resolve(); }, 0);
        }
        else {
            setTimeout(function () { d.reject(); }, 0);
        }
        return d.promise;
    };
    Board.prototype.pulseIn = function () {
        var d = q_1.default.defer();
        if (this._status == exports.CONNECTED) {
            setTimeout(function () { d.resolve(); }, 0);
        }
        else {
            setTimeout(function () { d.reject(); }, 0);
        }
        return d.promise;
    };
    // Time
    Board.prototype.millis = function () {
        var d = q_1.default.defer();
        if (this._status == exports.CONNECTED) {
            setTimeout(function () { d.resolve(); }, 0);
        }
        else {
            setTimeout(function () { d.reject(); }, 0);
        }
        return d.promise;
    };
    Board.prototype.micros = function () {
        var d = q_1.default.defer();
        if (this._status == exports.CONNECTED) {
            setTimeout(function () { d.resolve(); }, 0);
        }
        else {
            setTimeout(function () { d.reject(); }, 0);
        }
        return d.promise;
    };
    Board.prototype.delay = function () {
        var d = q_1.default.defer();
        if (this._status == exports.CONNECTED) {
            setTimeout(function () { d.resolve(); }, 0);
        }
        else {
            setTimeout(function () { d.reject(); }, 0);
        }
        return d.promise;
    };
    Board.prototype.delayMicroseconds = function () {
        var d = q_1.default.defer();
        if (this._status == exports.CONNECTED) {
            setTimeout(function () { d.resolve(); }, 0);
        }
        else {
            setTimeout(function () { d.reject(); }, 0);
        }
        return d.promise;
    };
    // Bits and Bytes
    Board.prototype.lowByte = function () {
        var d = q_1.default.defer();
        if (this._status == exports.CONNECTED) {
            setTimeout(function () { d.resolve(); }, 0);
        }
        else {
            setTimeout(function () { d.reject(); }, 0);
        }
        return d.promise;
    };
    Board.prototype.highByte = function () {
        var d = q_1.default.defer();
        if (this._status == exports.CONNECTED) {
            setTimeout(function () { d.resolve(); }, 0);
        }
        else {
            setTimeout(function () { d.reject(); }, 0);
        }
        return d.promise;
    };
    Board.prototype.bitRead = function () {
        var d = q_1.default.defer();
        if (this._status == exports.CONNECTED) {
            setTimeout(function () { d.resolve(); }, 0);
        }
        else {
            setTimeout(function () { d.reject(); }, 0);
        }
        return d.promise;
    };
    Board.prototype.bitWrite = function () {
        var d = q_1.default.defer();
        if (this._status == exports.CONNECTED) {
            setTimeout(function () { d.resolve(); }, 0);
        }
        else {
            setTimeout(function () { d.reject(); }, 0);
        }
        return d.promise;
    };
    Board.prototype.bitSet = function () {
        var d = q_1.default.defer();
        if (this._status == exports.CONNECTED) {
            setTimeout(function () { d.resolve(); }, 0);
        }
        else {
            setTimeout(function () { d.reject(); }, 0);
        }
        return d.promise;
    };
    Board.prototype.bitClear = function () {
        var d = q_1.default.defer();
        if (this._status == exports.CONNECTED) {
            setTimeout(function () { d.resolve(); }, 0);
        }
        else {
            setTimeout(function () { d.reject(); }, 0);
        }
        return d.promise;
    };
    Board.prototype.bit = function () {
        var d = q_1.default.defer();
        if (this._status == exports.CONNECTED) {
            setTimeout(function () { d.resolve(); }, 0);
        }
        else {
            setTimeout(function () { d.reject(); }, 0);
        }
        return d.promise;
    };
    // External Interrupts
    Board.prototype.attachInterrupt = function () {
        var d = q_1.default.defer();
        if (this._status == exports.CONNECTED) {
            setTimeout(function () { d.resolve(); }, 0);
        }
        else {
            setTimeout(function () { d.reject(); }, 0);
        }
        return d.promise;
    };
    Board.prototype.detachInterrupt = function () {
        var d = q_1.default.defer();
        if (this._status == exports.CONNECTED) {
            setTimeout(function () { d.resolve(); }, 0);
        }
        else {
            setTimeout(function () { d.reject(); }, 0);
        }
        return d.promise;
    };
    // Interrupts
    Board.prototype.interrupts = function () {
        var d = q_1.default.defer();
        if (this._status == exports.CONNECTED) {
            setTimeout(function () { d.resolve(); }, 0);
        }
        else {
            setTimeout(function () { d.reject(); }, 0);
        }
        return d.promise;
    };
    Board.prototype.noInterrupts = function () {
        var d = q_1.default.defer();
        if (this._status == exports.CONNECTED) {
            setTimeout(function () { d.resolve(); }, 0);
        }
        else {
            setTimeout(function () { d.reject(); }, 0);
        }
        return d.promise;
    };
    return Board;
}(events_1.EventEmitter));
exports.Board = Board;
