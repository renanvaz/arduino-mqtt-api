import Server from './ServerUDP';
import {Board} from './BoardUDP';

let s = new Server(4123);

s.on('client', (client) => {
    console.log('new client');

    let b = new Board(s, client);

    // console.time('dbsave');
    // b.digitalRead(10).then((message) => {
    //     console.timeEnd('dbsave');
    //     console.log('digitalRead', message);
    // });

    b._send('teste', 'param1', 'param2', 'param3');
});
