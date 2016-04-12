var mqtt_1 = require('mqtt');
var client = mqtt_1.default.connect('mqtt://localhost:1883');
client.on('connect', function () {
    client.subscribe('presence');
    client.publish('presence', 'Hello mqtt');
});
client.on('message', function (topic, message) {
    console.log(message.toString());
});
