import Server from './ServerUDP';
import {Board} from './BoardUDP';

let s = new Server(41234);

s.on('client', (client) => {
    let b = new Board(this, client);

    console.time('dbsave');
    b.digitalRead(10).then((message) => {
        console.timeEnd('dbsave');
        console.log('digitalRead', message);
    });
});
