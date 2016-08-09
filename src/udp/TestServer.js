import Server from './Server';
import Board, {INPUT, OUTPUT, HIGH, LOW} from './Board';

const $ = {
  wait: function(time, fn) {
    return setTimeout(fn, time);
  }
};

let s = new Server(4123);

s.on('client', (client) => {
  console.log('new client');

  let pin = 4;
  let state = false;
  let b = new Board(client);

  b.pinMode(pin, OUTPUT);

  setInterval(() => {
    state = !state;

    console.log(state, state ? HIGH : LOW);

    b.digitalWrite(pin, state ? HIGH : LOW);
  }, 1000);

  // console.time('dbsave');
  // b.digitalRead(10).then((message) => {
  //   console.timeEnd('dbsave');
  //   console.log('digitalRead', message);
  // });
});
