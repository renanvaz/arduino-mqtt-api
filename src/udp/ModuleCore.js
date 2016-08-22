import Q from 'q';
import {EventEmitter} from 'events';

const MAX_MESSAGE_ID = 255;
let MESSAGE_ID = 0;

export default class ModuleCore extends EventEmitter {
  /**
  * Constructor
  * @param  {string} IP
  * @return {void}
  */
  constructor(id, type, version, client) {
    super();

    this._id      = id;
    this._type    = type;
    this._version = version;
    this._client  = client;

    this._client.on('*', (topic, ...message) => {
      this.emit(topic, ...message);
    });
  }

  /**
  * Get instance of the client
  * @return {Client} Client instance
  */
  get client() {
    return this._client;
  }

  get id() {
    return this._id;
  }

  get type() {
    return this._type;
  }

  get version() {
    return this._version;
  }

  _send(topic, ...message) {
    return this.client.send(topic, ...message);
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
}
