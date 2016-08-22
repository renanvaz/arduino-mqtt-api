import SocketIO from 'socket.io';
import Server from './Server';
import Module, {INPUT, OUTPUT, HIGH, LOW} from './Module';
import {D2} from '../utils/NodeMCU';
import $ from '../utils/Helpers';

var io = new SocketIO();
let s = new Server(4123);
let pin = D2;
let state = false;
let b;

s.on('connection', (client) => {
  console.log('new client');

  client.on('setDevice', (ID, TYPE, VERSION) => {
    console.log(ID, TYPE, VERSION);

    b = new Module(ID, TYPE, VERSION, client);

    b.pinMode(pin, OUTPUT);
    b.digitalWrite(pin, state ? HIGH : LOW);
  });
});

io.on('connection', (client) => {
  client.on('toggle', () => {
    state = !state;
    b.digitalWrite(pin, state ? HIGH : LOW).then(() => {
      client.emit('response');
    });
  });
});
io.listen(3000);
