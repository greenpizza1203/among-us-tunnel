import {createSocket} from "dgram";

let subscribe_connections = new Map();
let active_connections = new Map();

export function be_server(port) {
    console.log("When you click local, it will say 'Couldn't start local network listener'. This is NORMAL. Close that warning and create a game.");
    let server = createSocket('udp4');
    server.bind(port);
    let server_ip: string = null;


    server.on('message', (msg, rinfo) => {
        if (msg[0] == 0) {
            let key = `${rinfo.address}:${rinfo.port}`;
            if (!subscribe_connections.has(key)) {
                console.log(`New subscriber ${key}`);
                let conn = [
                    rinfo.address,
                    rinfo.port,
                    make_disconnect_timeout(key)
                ];
                subscribe_connections.set(key, conn);
            } else {
                console.log(`Continuing subscription ${key}`);
                let conn = subscribe_connections.get(key);
                clearTimeout(conn[2]);
                conn[2] = make_disconnect_timeout(key);
            }
        } else if ((msg[0] == 2 || msg[0] == 4) && server_ip != null) {
            let key = rinfo.address + ":" + rinfo.port;
            if (!active_connections.has(key)) {
                let connection = be_client_for(server_ip, 22023, active_connections, rinfo.address, rinfo.port, server);
                active_connections.set(key, connection);
                connection(msg);
            } else {
                active_connections.get(key)(msg, rinfo);
            }
        }
    });

    let broadcast_listener = createSocket('udp4');
    broadcast_listener.bind(47777);
    broadcast_listener.on('message', (msg, rinfo) => {
        if (!server_ip) {
            server_ip = rinfo.address;
            console.log(`Binding to ${server_ip}`);
        }
        if (server_ip != rinfo.address) {
            console.warn(`IGNORING Broadcast from ${rinfo.address}`, msg.toString('utf8'));
            return;
        }
        console.log(`Broadcast from ${rinfo.address}: `, msg.toString('utf8'));
        for (let [connip, connport] of subscribe_connections.values()) {
            //console.log(`Rebroadcasting to ${connip}:${connport}`);
            server.send(Buffer.concat([Buffer.from([1]), msg]), connport, connip);
        }
    });
}

function be_client_for(ip, port, active_connections, targetip, targetport, serversocket) {
    console.log("New connection from " + targetip + ":" + targetport);
    let socket = createSocket('udp4');
    socket.bind();
    let timeout;

    function refresh_timeout() {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            console.warn("Connection from " + targetip + ":" + targetport + " timed out");
            active_connections.delete(targetip + ":" + targetport);
            socket.close();
            return;
        }, 30000);
    }

    socket.on('message', msg => {
        serversocket.send(Buffer.concat([Buffer.from([3]), msg]), targetport, targetip);
    });
    return (msg) => {
        if (msg[0] == 2) {
            socket.send(msg, 1, msg.length - 1, port, ip);
        }
        refresh_timeout();
    };
}

function make_disconnect_timeout(key) {
    return setTimeout(() => {
        console.log(`Disconnect from ${key}`);
        subscribe_connections.delete(key);
    }, 30000);
}
