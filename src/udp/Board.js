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
export const MSBFIRST       = 'MSBFIRST';
export const LSBFIRST       = 'LSBFIRST';

const MAX_MESSAGE_ID = 999999;
let MESSAGE_ID = 0;

export default class Board extends EventEmitter {
  /**
  * Constructor
  * @param  {string} IP
  * @return {void}
  */
  constructor(client) {
    super();

    this._client = client;

    this._valuesPinMode         = [INPUT, OUTPUT];
    this._valuesDigitalLevel    = [HIGH, LOW];
    this._valuesAnalogReference = [DEFAULT, EXTERNAL, INTERNAL];
    this._valuesBitOrder        = [MSBFIRST, LSBFIRST];

    this._client.on('message', (topic, ...message) => {
      this.emit(topic, ...message);
    });

    // Communication
    this.Serial = {};
    this.Stream = {};
  }

  /**
  * Get instance of the client
  * @return {Client} Client instance
  */
  get client() {
    return this._client;
  }

  _send(topic, ...message) {
    this.client.send(topic, ...message);
  }

  _ask(topic, ...message) {
    let d = Q.defer(),
    messageID = this._genMessageID();

    this._await(messageID, (...message) => {
      d.resolve(...message);
    });

    this.client.send(topic, messageID, ...message);

    return d.promise;
  }

  /**
  * Genherate a message ID
  * @return {int} Message ID
  */
  _genMessageID() {
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
  _await(topic, cb) {
    this.once(topic, (message) => {
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
  pinMode(pin, mode) {
    if (typeof pin !== 'number') { throw new TypeError('The param "pin" must be a number'); }
    if (this._valuesPinMode.indexOf(mode) === -1) { throw new Error('Invalid value of param "mode": ' + mode); }

    this._send('pinMode', pin, mode);
  }

  /**
  * Write a HIGH or a LOW value to a digital pin.
  * @param  {integer} pin
  * @param  {[HIGH, LOW]} level
  * @return {void}
  */
  digitalWrite(pin, level) {
    if (typeof pin !== 'number') { throw new TypeError('The param "pin" must be a number'); }
    if (this._valuesDigitalLevel.indexOf(level) === -1) { throw new Error('Invalid value of param "level": ' + level); }

    this._send('digitalWrite', pin, level);
  }

  /**
  * Reads the value from a specified digital pin, either HIGH or LOW.
  * @param  {integer} pin
  * @return {Promise}
  */
  digitalRead(pin) {
    let d = Q.defer(),
    messageID;

    if (typeof pin !== 'number') { throw new TypeError('The param "pin" must be a number'); }

    this._ask('digitalRead', pin).then((...message) => {
      d.resolve(...message);
    });

    return d.promise;
  }

  // Analog I/O
  /**
  * Configures the reference voltage used for analog input (i.e. the value used as the top of the input range).
  * @param  {[DEFAULT, EXTERNAL, INTERNAL]} type
  * @return {void}
  */
  analogReference(value) {
    if (this._valuesAnalogReference.indexOf(mode) === -1) { throw new Error('Invalid value of param "value": ' + value); }

    this._send('digitalWrite', value);
  }

  /**
  * Reads the value from the specified analog pin.
  * @param  {integer} pin
  * @return {Promise} int (0 to 1023)
  */
  analogRead(pin) {
    let d = Q.defer();

    if (typeof pin !== 'number') { throw new TypeError('The param "pin" must be a number'); }

    this._ask('analogRead', pin).then((...message) => {
      d.resolve(...message);
    });

    return d.promise;
  }

  /**
  * Writes an analog value (PWM wave) to a pin.
  * @param  {integer} pin
  * @param  {integer} value
  * @return {void}
  */
  analogWrite(pin, value) {
    if (typeof pin !== 'number') { throw new TypeError('The param "pin" must be a number'); }

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
  tone(pin, frequency, duration) {
    if (typeof pin !== 'number') { throw new TypeError('The param "pin" must be a number'); }

    this._send('tone', pin, frequency, duration);
  }

  /**
  * Stops the generation of a square wave triggered by tone(). Has no effect if no tone is being generated.
  * @param  {integer} pin
  * @return {void}
  */
  noTone(pin) {
    if (typeof pin !== 'number') { throw new TypeError('The param "pin" must be a number'); }

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
  shiftOut(dataPin, clockPin, bitOrder, value) {
    if (typeof dataPin !== 'number') { throw new TypeError('The param "dataPin" must be a number'); }
    if (typeof clockPin !== 'number') { throw new TypeError('The param "clockPin" must be a number'); }
    if (this._valuesBitOrder.indexOf(bitOrder) === -1) { throw new Error('Invalid value of param "bitOrder": ' + bitOrder); }

    this._send('shiftOut', dataPin, clockPin, bitOrder, value);
  }

  /**
  * Shifts in a byte of data one bit at a time.
  * @param  {integer} dataPin
  * @param  {integer} clockPin
  * @param  {[MSBFIRST, LSBFIRST]} bitOrder
  * @return {Promise}
  */
  shiftIn(dataPin, clockPin, bitOrder) {
    let d = Q.defer();

    if (typeof dataPin !== 'number') { throw new TypeError('The param "dataPin" must be a number'); }
    if (typeof clockPin !== 'number') { throw new TypeError('The param "clockPin" must be a number'); }
    if (this._valuesBitOrder.indexOf(bitOrder) === -1) { throw new Error('Invalid value of param "bitOrder": ' + bitOrder); }

    this._ask('shiftIn', dataPin, clockPin, bitOrder).then((...message) => {
      d.resolve(...message);
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
  pulseIn(pin, value, timeout) {
    let d = Q.defer();

    if (typeof pin !== 'number') { throw new TypeError('The param "pin" must be a number'); }
    if (this._valuesDigitalLevel.indexOf(value) === -1) { throw new Error('Invalid value of param "value": ' + value); }

    this._ask('pulseIn', pin, value, timeout).then((...message) => {
      d.resolve(...message);
    });

    return d.promise;
  }

  // Implements
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
