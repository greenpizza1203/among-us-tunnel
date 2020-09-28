import {createSocket} from "dgram";

export function be_client(ip_str) {
    var split = ip_str.split(/:(?=[0-9]+$)/);
    if (split.length != 2) {
        console.error("Expected IP or hostname and port");
    }
    var ip = split[0];
    var port = +split[1];


    handleBroadcaster(port, ip);
    handleServer(ip, port);
}

function handleBroadcaster(port: number, ip: string) {
    var broadcaster = createSocket('udp4');
    broadcaster.bind(62446, () => {
        broadcaster.setBroadcast(true);
    });

    var broadcaster_connection = createSocket('udp4');
    broadcaster_connection.bind();

    broadcaster_connection.send(Buffer.from([0]), port, ip);
    setInterval(() => {
        console.log("Sending subscription keepalive");
        broadcaster_connection.send(Buffer.from([0]), port, ip);
    }, 5000);

    broadcaster_connection.on('message', msg => {
        console.log("Rebroadcasting: " + msg.toString('utf8'));
        if (msg[0] == 1) {
            broadcaster.send(msg, 1, msg.length - 1, 47777, "255.255.255.255");
        }
    });
}

function handleServer(ip, port: number) {
    var server = createSocket('udp4');
    server.bind(22023);

    var active_connections = new Map();

    server.on('message', (msg, rinfo) => {
        var key = rinfo.address + ":" + rinfo.port;
        if (!active_connections.has(key)) {
            var connection = be_server_for(rinfo.address, rinfo.port, ip, port, server);
            active_connections.set(key, connection);
            connection(msg);
        } else {
            active_connections.get(key)(msg, rinfo);
        }
    });
}


function be_server_for(ip, port, targetip, targetport, serversocket) {
    console.log("New connection from " + ip + ":" + port);
    var socket = createSocket('udp4');
    socket.bind();
    socket.on('message', msg => {
        if (msg[0] == 3) {
            serversocket.send(msg, 1, msg.length - 1, port, ip);
        }
    });
    return msg => {
        socket.send(Buffer.concat([Buffer.from([2]), msg]), targetport, targetip);
    };
}
