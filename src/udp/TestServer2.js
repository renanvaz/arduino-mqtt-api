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

    b.pinMode(pin, OUTPUT);

    b.digitalWrite(pin, (state = !state) ? HIGH : LOW);

    $.loop(1000, () => {
      b.digitalWrite(pin, (state = !state) ? HIGH : LOW);
    });

    let consoleName = 'dbsave'+(index++);

    $.loop(1500, () => {
      console.time(consoleName);
      b.digitalRead(D2).then((value) => {
        console.timeEnd(consoleName);
        console.log('digitalRead', value);
      });
    });
  });
});
