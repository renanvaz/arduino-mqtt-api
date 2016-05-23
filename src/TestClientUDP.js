import Client from './ClientUDP';

var host = '107.170.148.84';
var port = 41234;

let c = new Client;

c.connect(port, host).then(() => {
    console.log('connected');
});

c.on('digitalRead', (callbackID, pin) => {
    console.log('digitalRead', callbackID, pin);

    c.send(callbackID, pin, 'LOW');
});
