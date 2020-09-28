"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = require("./server");
var client_1 = require("./client");
var readline = require('readline');
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
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
function q(question) {
    return new Promise(function (resolve, reject) {
        rl.question(question, resolve);
    });
}
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var hosting_answer, port_answer, ip_answer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, , 9, 10]);
                hosting_answer = void 0;
                _a.label = 1;
            case 1: return [4 /*yield*/, q("Are you (h)osting or (c)onnecting to a game? ")];
            case 2:
                hosting_answer = (_a.sent()).toLowerCase()[0];
                _a.label = 3;
            case 3:
                if (!"hc".includes(hosting_answer)) return [3 /*break*/, 1];
                _a.label = 4;
            case 4:
                if (!(hosting_answer == "h")) return [3 /*break*/, 6];
                return [4 /*yield*/, q("What port? ")];
            case 5:
                port_answer = _a.sent();
                if (+port_answer != +port_answer) {
                    console.log("Not a valid port");
                }
                else {
                    server_1.be_server(+port_answer);
                }
                return [3 /*break*/, 8];
            case 6: return [4 /*yield*/, q("Enter IP or hostname to connect to (include port): ")];
            case 7:
                ip_answer = _a.sent();
                if (!ip_answer)
                    return [2 /*return*/];
                client_1.be_client(ip_answer);
                _a.label = 8;
            case 8: return [3 /*break*/, 10];
            case 9:
                rl.close();
                return [7 /*endfinally*/];
            case 10: return [2 /*return*/];
        }
    });
}); })();
//# sourceMappingURL=among_us_tunnel.js.map