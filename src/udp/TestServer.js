import Server from './Server';
import Board, {INPUT, OUTPUT, HIGH, LOW} from './Board';
import {D2} from '../utils/NodeMCU';
import $ from '../utils/Helpers';

let s = new Server(4123);

s.on('client', (client) => {
  console.log('new client');

  let pin   = D2;
  let state = false;
  let b     = new Board(client);

  b.pinMode(pin, OUTPUT);

  $.loop(1000, () => {
    b.digitalWrite(pin, (state = !state) ? HIGH : LOW);
  });

  console.time('dbsave');
  b.digitalRead(10).then((value) => {
    console.timeEnd('dbsave');
    console.log('digitalRead', value);
  });
});
