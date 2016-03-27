import mqtt from 'mqtt';

let client = mqtt.connect('mqtt://localhost:1883');

client.on('connect', () => {
    client.subscribe('presence');
    client.publish('presence', 'Hello mqtt');
});

client.on('message', (topic, message) => {
    console.log(message.toString());
});
