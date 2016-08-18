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

    $.repeat(5, 1000, () => {
      b.digitalWrite(D2, (state = !state) ? HIGH : LOW);
    });

    $.repeat(5, 1500, () => {
      console.time('read');
      b.digitalRead(D2).then((v) => {
        console.log(v);
        console.timeEnd('read');
      });
    });
  });
});
