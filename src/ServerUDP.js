const dgram = require('dgram');
const server = dgram.createSocket('udp4');

let Board = require('./BoardUDP').Board;

server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

server.on('message', (msg, rinfo) => {
  console.log(msg, rinfo);
  console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
});

server.on('listening', () => {
  var address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(41234, () => {
  let b = new Board(client);

  console.time('dbsave');
  b.digitalRead(10).then(function(message){
      console.timeEnd('dbsave');
      console.log('digitalRead', message);
  });
});
