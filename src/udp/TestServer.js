import Server from './Server';
import Board, {INPUT, OUTPUT, HIGH, LOW} from './Board';
import {D2} from '../utils/NodeMCU';
import $ from '../utils/Helpers';

let s = new Server(4123);

var index = 0;

s.on('client', (client) => {
  console.log('new client');

  client.on('setDevice', (ID, TYPE, VERSION) => {
    let pin   = D2;
    let state = false;
    let b     = new Board(client);

    console.log(ID, TYPE, VERSION);

    b.pinMode(pin, OUTPUT);

    console.time('send');
    pin = 50;
    b.digitalWrite(pin++, (state = !state) ? HIGH : LOW);
    b.digitalWrite(pin++, (state = !state) ? HIGH : LOW);
    b.digitalWrite(pin++, (state = !state) ? HIGH : LOW);
    b.digitalWrite(pin++, (state = !state) ? HIGH : LOW);
    b.digitalWrite(pin++, (state = !state) ? HIGH : LOW);
    b.digitalWrite(pin++, (state = !state) ? HIGH : LOW);
    b.digitalWrite(pin++, (state = !state) ? HIGH : LOW);
    b.digitalWrite(pin++, (state = !state) ? HIGH : LOW);
    b.digitalWrite(pin++, (state = !state) ? HIGH : LOW);
    b.digitalWrite(pin++, (state = !state) ? HIGH : LOW);
    b.digitalWrite(pin++, (state = !state) ? HIGH : LOW);
    b.digitalWrite(pin++, (state = !state) ? HIGH : LOW);
    b.digitalWrite(pin++, (state = !state) ? HIGH : LOW);
    b.digitalWrite(pin++, (state = !state) ? HIGH : LOW);
    b.digitalWrite(pin++, (state = !state) ? HIGH : LOW);
    console.timeEnd('send');
  });
});
