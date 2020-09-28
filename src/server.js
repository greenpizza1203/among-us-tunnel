"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.be_server = void 0;
var dgram_1 = require("dgram");
var subscribe_connections = new Map();
var active_connections = new Map();
function be_server(port) {
    console.log("When you click local, it will say 'Couldn't start local network listener'. This is NORMAL. Close that warning and create a game.");
    var server = dgram_1.createSocket('udp4');
    server.bind(port);
    var server_ip = null;
    server.on('message', function (msg, rinfo) {
        if (msg[0] == 0) {
            var key = rinfo.address + ":" + rinfo.port;
            if (!subscribe_connections.has(key)) {
                console.log("New subscriber " + key);
                var conn = [
                    rinfo.address,
                    rinfo.port,
                    make_disconnect_timeout(key)
                ];
                subscribe_connections.set(key, conn);
            }
            else {
                console.log("Continuing subscription " + key);
                var conn = subscribe_connections.get(key);
                clearTimeout(conn[2]);
                conn[2] = make_disconnect_timeout(key);
            }
        }
        else if ((msg[0] == 2 || msg[0] == 4) && server_ip != null) {
            var key = rinfo.address + ":" + rinfo.port;
            if (!active_connections.has(key)) {
                var connection = be_client_for(server_ip, 22023, active_connections, rinfo.address, rinfo.port, server);
                active_connections.set(key, connection);
                connection(msg);
            }
            else {
                active_connections.get(key)(msg, rinfo);
            }
        }
    });
    var broadcast_listener = dgram_1.createSocket('udp4');
    broadcast_listener.bind(47777);
    broadcast_listener.on('message', function (msg, rinfo) {
        var e_1, _a;
        if (!server_ip) {
            server_ip = rinfo.address;
            console.log("Binding to " + server_ip);
        }
        if (server_ip != rinfo.address) {
            console.warn("IGNORING Broadcast from " + rinfo.address, msg.toString('utf8'));
            return;
        }
        console.log("Broadcast from " + rinfo.address + ": ", msg.toString('utf8'));
        try {
            for (var _b = __values(subscribe_connections.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), connip = _d[0], connport = _d[1];
                //console.log(`Rebroadcasting to ${connip}:${connport}`);
                server.send(Buffer.concat([Buffer.from([1]), msg]), connport, connip);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    });
}
exports.be_server = be_server;
function be_client_for(ip, port, active_connections, targetip, targetport, serversocket) {
    console.log("New connection from " + targetip + ":" + targetport);
    var socket = dgram_1.createSocket('udp4');
    socket.bind();
    var timeout;
    function refresh_timeout() {
        if (timeout)
            clearTimeout(timeout);
        timeout = setTimeout(function () {
            console.warn("Connection from " + targetip + ":" + targetport + " timed out");
            active_connections.delete(targetip + ":" + targetport);
            socket.close();
            return;
        }, 30000);
    }
    socket.on('message', function (msg) {
        serversocket.send(Buffer.concat([Buffer.from([3]), msg]), targetport, targetip);
    });
    return function (msg) {
        if (msg[0] == 2) {
            socket.send(msg, 1, msg.length - 1, port, ip);
        }
        refresh_timeout();
    };
}
function make_disconnect_timeout(key) {
    return setTimeout(function () {
        console.log("Disconnect from " + key);
        subscribe_connections.delete(key);
    }, 30000);
}
//# sourceMappingURL=server.js.map