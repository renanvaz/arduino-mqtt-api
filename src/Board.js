import Q from 'q';

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

export class Board {
    // Construct
    /**
     * Constructor
     * @param  {string} IP
     * @return {void}
     */
    constructor(IP) {
        this._ip = IP;
        this._status = DISCONNECTED;

        this._valuesPinMode         = [INPUT, OUTPUT];
        this._valuesDigitalLevel    = [HIGH, LOW];
        this._valuesAnalogReference = [DEFAULT, EXTERNAL, INTERNAL];

        // Communication
        this.Serial = {};
        this.Stream = {};
    }

    get IP() {
      return this._ip;
    }

    // Digital I/O
    /**
     * Configures the specified pin to behave either as an input or an output.
     * @param  {integer} pin
     * @param  {[INPUT, OUTPUT]} mode
     * @return {Promise}
     */
    pinMode(pin, mode) {
        let d = Q.defer();

        if (typeof pin !== 'number') { throw new TypeError('The param "pin" must be a number'); }
        if (this._valuesPinMode.indexOf(mode) === -1) { throw new Error('Invalid value of param "mode": ' + mode); }

        if (this._status == CONNECTED) {
            setTimeout(() => { d.resolve(); }, 0);
        } else {
            setTimeout(() => { d.reject(); }, 0);
        }

        return d.promise;
    }

    /**
     * Write a HIGH or a LOW value to a digital pin.
     * @param  {integer} pin
     * @param  {[HIGH, LOW]} level
     * @return {Promise}
     */
    digitalWrite(pin, level) {
        let d = Q.defer();

        if (typeof pin !== 'number') { throw new TypeError('The param "pin" must be a number'); }
        if (this._valuesDigitalLevel.indexOf(level) === -1) { throw new Error('Invalid value of param "level": ' + level); }

        if (this._status == CONNECTED) {
            setTimeout(() => { d.resolve(); }, 0);
        } else {
            setTimeout(() => { d.reject(); }, 0);
        }

        return d.promise;
    }

    /**
     * [digitalRead description]
     * @param  {integer} pin
     * @return {Promise}
     */
    digitalRead(pin) {
        let d = Q.defer();

        if (typeof pin !== 'number') { throw new TypeError('The param "pin" must be a number'); }

        if (this._status == CONNECTED) {
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
     *
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
