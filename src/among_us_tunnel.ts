#!/usr/bin/env node
import {be_server} from "./server";
import {be_client} from "./client";
//broadcaster.connect(47777, "255.255.255.255");

// This is a solid block of shitcode, I know. So is among us, so it's fair anyways.

/*

To advertise, UDP broadcast packet from port 62446 to 255.255.255.255:47777
during game, server uses 22023 always and client uses any port.
? -> 22023

*/
/*
Our protocol is very simple: 1 byte for header, and the rest is payload.
The first byte can be:
0 (client->server) - subscribe
1 (server->client) - advertise
2 (client->server) - gameplay
3 (server->client) - gameplay
4 (client->server) - gameplay keepalive

Subscribing and gameplay use separate sockets for sanity.
*/

// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
// });
//
// function q(question): Promise<string> {
//     return new Promise((resolve, reject) => {
//         rl.question(question, resolve);
//     });
// }


if (process.argv[0] == "h") {
    const port_answer = getPort(true)

    be_server(+port_answer);
} else {
    const port_answer = getPort(false)
    const ip = getIp(false)
    be_client()
}

function getPort(hosting) {
    let port_answer = process.argv[hosting ? 1 : 0] ?? 42069
    if (port_answer != +port_answer) {
        port_answer = 42069
        console.warn(`invalid port ${port_answer}`)
    }
    return port_answer

}

// (async () => {
//     try {
//         let hosting_answer;
//         do {
//             hosting_answer = (await q("Are you (h)osting or (c)onnecting to a game? ")).toLowerCase()[0];
//         } while (!"hc".includes(hosting_answer));
//         if (hosting_answer == "h") {
//             let port_answer = await q("What port? ");
//
//         } else {
//             let ip_answer = await q("Enter IP or hostname to connect to (include port): ");
//             if (!ip_answer) return;
//             be_client(ip_answer);
//         }
//     } finally {
//         rl.close();
//     }
// })();

