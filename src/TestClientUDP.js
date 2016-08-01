import Client from './ClientUDP';

var host = '192.168.15.19';
var port = 12345;

let c = new Client;

c.connect(port, host).then(() => {
    console.log('connected');
});

c.send('teste', 'LOW');
