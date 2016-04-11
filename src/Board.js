import Q from 'q';
import {EventEmitter} from 'events';

export const INPUT          = 'INPUT';
export const OUTPUT         = 'OUTPUT';
// export const INPUT_PULLUP   = 'INPUT_PULLUP';
export const HIGH           = 'HIGH';
export const LOW            = 'LOW';
export const CONNECTED      = 'CONNECTED';
export const DISCONNECTED   = 'DISCONNECTED';
export const DEFAULT        = 'DEFAULT';
export const EXTERNAL       = 'EXTERNAL';
export const INTERNAL       = 'INTERNAL';

const MAX_MESSAGE_ID = 999999;
const MESSAGE_ID = 0;

export class Board extends EventEmitter {
    // Construct
    /**
     * Constructor
     * @param  {string} IP
     * @return {void}
     */
    constructor(client) {
        super();

        this._client = client;
        this._status = DISCONNECTED;

        this._valuesPinMode         = [INPUT, OUTPUT];
        this._valuesDigitalLevel    = [HIGH, LOW];
        this._valuesAnalogReference = [DEFAULT, EXTERNAL, INTERNAL];

        this._client.on('message', function (topic, message) {
            this.emit(topic, message);
        });

        // Communication
        this.Serial = {};
        this.Stream = {};
    }

    /**
     * Get instance of the client MQTT
     * @return {Client} MQTT Client instance
     */
    get client() {
        return this._client;
    }

    /**
     * Genherate a message ID
     * @return {int} Message ID
     */
    genMessageID() {
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
    await(topic, cb) {
        this.client.subscribe(topic, (err) => {
            if (err) throw err;
        });

        this.once(topic, (message) => {
            this.client.unsubscribe(topic, (err) => {
                if (err) throw err;
            });

            cb(message);
        });
    }

    // Digital I/O
    /**
     * Configures the specified pin to behave either as an input or an output.
     * @param  {integer} pin
     * @param  {[INPUT, OUTPUT]} mode
     * @return {Promise}
     */
    pinMode(pin, mode) {
        if (typeof pin !== 'number') { throw new TypeError('The param "pin" must be a number'); }
        if (this._valuesPinMode.indexOf(mode) === -1) { throw new Error('Invalid value of param "mode": ' + mode); }

        if (this._status !== CONNECTED) {
            // Error
        }
    }

    /**
     * Write a HIGH or a LOW value to a digital pin.
     * @param  {integer} pin
     * @param  {[HIGH, LOW]} level
     * @return {Promise}
     */
    digitalWrite(pin, level) {
        if (typeof pin !== 'number') { throw new TypeError('The param "pin" must be a number'); }
        if (this._valuesDigitalLevel.indexOf(level) === -1) { throw new Error('Invalid value of param "level": ' + level); }

        if (this._status == CONNECTED) {
            this.client.publish('digitalWrite', pin+'|'+level);
        } else {

        }
    }

    /**
     * [digitalRead description]
     * @param  {integer} pin
     * @return {Promise}
     */
    digitalRead(pin) {
        let d = Q.defer(),
            messageID = this.genMessageID();

        if (typeof pin !== 'number') { throw new TypeError('The param "pin" must be a number'); }

        if (this._status == CONNECTED) {
            this.client.publish('digitalRead', messageID+'|'+pin);
            this.await(id, cb);
            d.resolve(LOW);
        } else {
            setTimeout(() => { d.reject(); }, 0);
        }

        return d.promise;
    }

    // Analog I/O
    /**
     * @param  {[DEFAULT, EXTERNAL, INTERNAL]} type
     * @return {Promise}
     */
    analogReference(type) {
        let d = Q.defer();

        if (this._valuesAnalogReference.indexOf(mode) === -1) { throw new Error('Invalid value of param "type": ' + type); }

        if (this._status == CONNECTED) {
            setTimeout(() => { d.resolve(); }, 0);
        } else {
            setTimeout(() => { d.reject(); }, 0);
        }

        return d.promise;
    }

    /**
     * @param  {integer} pin
     * @return {Promise} int (0 to 1023)
     */
    analogRead(pin) {
        let d = Q.defer();

        if (typeof pin !== 'number') { throw new TypeError('The param "pin" must be a number'); }

        if (this._status == CONNECTED) {
            setTimeout(() => { d.resolve(); }, 0);
        } else {
            setTimeout(() => { d.reject(); }, 0);
        }

        return d.promise;
    }

    /**
     * Writes an analog value (PWM wave) to a pin.
     * @param  {integer} pin
     * @param  {integer} value
     * @return {Promise}
     */
    analogWrite(pin, value) {
        let d = Q.defer();

        if (typeof pin !== 'number') { throw new TypeError('The param "pin" must be a number'); }

        if (this._status == CONNECTED) {
            setTimeout(() => { d.resolve(); }, 0);
        } else {
            setTimeout(() => { d.reject(); }, 0);
        }

        return d.promise;
    }

    // Advanced I/O
    tone() {
        let d = Q.defer();

        if (this._status == CONNECTED) {
            setTimeout(() => { d.resolve(); }, 0);
        } else {
            setTimeout(() => { d.reject(); }, 0);
        }

        return d.promise;
    }

    noTone() {
        let d = Q.defer();

        if (this._status == CONNECTED) {
            setTimeout(() => { d.resolve(); }, 0);
        } else {
            setTimeout(() => { d.reject(); }, 0);
        }

        return d.promise;
    }

    shiftOut() {
        let d = Q.defer();

        if (this._status == CONNECTED) {
            setTimeout(() => { d.resolve(); }, 0);
        } else {
            setTimeout(() => { d.reject(); }, 0);
        }

        return d.promise;
    }

    shiftIn() {
        let d = Q.defer();

        if (this._status == CONNECTED) {
            setTimeout(() => { d.resolve(); }, 0);
        } else {
            setTimeout(() => { d.reject(); }, 0);
        }

        return d.promise;
    }

    pulseIn() {
        let d = Q.defer();

        if (this._status == CONNECTED) {
            setTimeout(() => { d.resolve(); }, 0);
        } else {
            setTimeout(() => { d.reject(); }, 0);
        }

        return d.promise;
    }

    // Time
    millis() {
        let d = Q.defer();

        if (this._status == CONNECTED) {
            setTimeout(() => { d.resolve(); }, 0);
        } else {
            setTimeout(() => { d.reject(); }, 0);
        }

        return d.promise;
    }

    micros() {
        let d = Q.defer();

        if (this._status == CONNECTED) {
            setTimeout(() => { d.resolve(); }, 0);
        } else {
            setTimeout(() => { d.reject(); }, 0);
        }

        return d.promise;
    }

    delay() {
        let d = Q.defer();

        if (this._status == CONNECTED) {
            setTimeout(() => { d.resolve(); }, 0);
        } else {
            setTimeout(() => { d.reject(); }, 0);
        }

        return d.promise;
    }

    delayMicroseconds() {
        let d = Q.defer();

        if (this._status == CONNECTED) {
            setTimeout(() => { d.resolve(); }, 0);
        } else {
            setTimeout(() => { d.reject(); }, 0);
        }

        return d.promise;
    }

    // Bits and Bytes
    lowByte() {
        let d = Q.defer();

        if (this._status == CONNECTED) {
            setTimeout(() => { d.resolve(); }, 0);
        } else {
            setTimeout(() => { d.reject(); }, 0);
        }

        return d.promise;
    }

    highByte() {
        let d = Q.defer();

        if (this._status == CONNECTED) {
            setTimeout(() => { d.resolve(); }, 0);
        } else {
            setTimeout(() => { d.reject(); }, 0);
        }

        return d.promise;
    }

    bitRead() {
        let d = Q.defer();

        if (this._status == CONNECTED) {
            setTimeout(() => { d.resolve(); }, 0);
        } else {
            setTimeout(() => { d.reject(); }, 0);
        }

        return d.promise;
    }

    bitWrite() {
        let d = Q.defer();

        if (this._status == CONNECTED) {
            setTimeout(() => { d.resolve(); }, 0);
        } else {
            setTimeout(() => { d.reject(); }, 0);
        }

        return d.promise;
    }

    bitSet() {
        let d = Q.defer();

        if (this._status == CONNECTED) {
            setTimeout(() => { d.resolve(); }, 0);
        } else {
            setTimeout(() => { d.reject(); }, 0);
        }

        return d.promise;
    }

    bitClear() {
        let d = Q.defer();

        if (this._status == CONNECTED) {
            setTimeout(() => { d.resolve(); }, 0);
        } else {
            setTimeout(() => { d.reject(); }, 0);
        }

        return d.promise;
    }

    bit() {
        let d = Q.defer();

        if (this._status == CONNECTED) {
            setTimeout(() => { d.resolve(); }, 0);
        } else {
            setTimeout(() => { d.reject(); }, 0);
        }

        return d.promise;
    }

    // External Interrupts
    attachInterrupt() {
        let d = Q.defer();

        if (this._status == CONNECTED) {
            setTimeout(() => { d.resolve(); }, 0);
        } else {
            setTimeout(() => { d.reject(); }, 0);
        }

        return d.promise;
    }

    detachInterrupt() {
        let d = Q.defer();

        if (this._status == CONNECTED) {
            setTimeout(() => { d.resolve(); }, 0);
        } else {
            setTimeout(() => { d.reject(); }, 0);
        }

        return d.promise;
    }


    // Interrupts
    interrupts() {
        let d = Q.defer();

        if (this._status == CONNECTED) {
            setTimeout(() => { d.resolve(); }, 0);
        } else {
            setTimeout(() => { d.reject(); }, 0);
        }

        return d.promise;
    }

    noInterrupts() {
        let d = Q.defer();

        if (this._status == CONNECTED) {
            setTimeout(() => { d.resolve(); }, 0);
        } else {
            setTimeout(() => { d.reject(); }, 0);
        }

        return d.promise;
    }
}
