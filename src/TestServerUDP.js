import Server from './ServerUDP';
import {Board} from './BoardUDP';

let s = new Server(4123);

s.on('client', (client) => {
    console.log('new client');

    let b = new Board(client);

    // console.time('dbsave');
    // b.digitalRead(10).then((message) => {
    //     console.timeEnd('dbsave');
    //     console.log('digitalRead', message);
    // });

    b._send('pinMode', '4', 'OUTPUT');
    b._send('digitalWrite', '4', '1');

    setTimeout(function(){
        b._send('digitalWrite', '4', '0');
    }, 1000);

    setTimeout(function(){
        b._send('digitalWrite', '4', '1');
    }, 2000);
});
