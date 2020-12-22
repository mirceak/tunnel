"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const path = require("path");
const crypto = require("crypto");
const tunnel_1 = require("./tunnel");
const app = express();
var bodyParser = require("body-parser");
app.use(bodyParser.json({ limit: "15mb" }));
app.use(bodyParser.urlencoded({
    limit: "15mb",
    extended: true,
    parameterLimit: 15000,
}));
async function main() {
    try {
        app.set("port", 3000);
        app.use(express.json());
        app.use(express.urlencoded({ extended: false }));
        app.use("/", express.static(path.join(__dirname, "../app/dist/app")));
        app.get("/utils/tunnel", onTunnel);
        app.post("/utils/tunnel", onLockTunnel);
        app.get("/*", (req, res) => {
            res.sendFile(path.join(__dirname, "../app/dist/app/index.html"));
        });
        app.listen(app.get("port"), () => console.log(`Angular Full Stack listening on port ${app.get("port")}`));
    }
    catch (err) {
        console.error(err);
    }
}
var getHash = (key, msg) => {
    var hash = crypto.createHmac("sha512", key);
    hash.update(msg);
    return hash.digest("base64");
};
const hashLen = 88;
const p1 = "pass1";
const p2 = "pass2";
const p3 = "pass3";
var clientLock;
var lock;
var onTunnel = (req, res) => {
    clientLock = tunnel_1.default.generateLock(tunnel_1.default.originalMap.length);
    dataLock = tunnel_1.default.generateLock(hashLen);
    lock = tunnel_1.default.generateLock(hashLen * 2 + tunnel_1.default.originalMap.length * tunnel_1.default.originalMap.length + 4000);
    var dataLock;
    var p1hashLocked = tunnel_1.default.lockMessage(getHash(p2, p1), dataLock);
    var p2hashLocked = tunnel_1.default.lockMessage(getHash(p3, p2), dataLock);
    var p3hashLocked = tunnel_1.default.lockMessage(getHash(p1, p3), dataLock);
    var message = tunnel_1.default.lockMessage(p2hashLocked + tunnel_1.default.toString(clientLock) + p3hashLocked, dataLock);
    tunnel_1.default.engraveKey(lock, p1hashLocked, message, true);
    res.send({
        tst: message,
        lock: tunnel_1.default.toString(lock),
        dataLock: tunnel_1.default.toString(dataLock),
    });
};
var onLockTunnel = (req, res) => {
    var finalLock = tunnel_1.default.fromString(req.body.finalLock);
    var dataLock = tunnel_1.default.fromString(req.body.dataLock);
    var p2hashLocked = tunnel_1.default.lockMessage(getHash(p3, p2), dataLock);
    var p3hashLocked = tunnel_1.default.lockMessage(getHash(p1, p3), dataLock);
    var lockedClientLockMessage = tunnel_1.default.unlock(finalLock, tunnel_1.default.lockMessage(tunnel_1.default.toString(clientLock), dataLock));
    var p2hIndex = -1;
    var p3hIndex = -1;
    var unlockedClientLockMessage;
    while (p2hIndex < 0) {
        unlockedClientLockMessage = tunnel_1.default.unlockMessage(tunnel_1.default.unlockMessage(lockedClientLockMessage, dataLock), clientLock);
        p2hIndex = unlockedClientLockMessage.indexOf(p2hashLocked);
        p3hIndex = unlockedClientLockMessage.indexOf(p3hashLocked);
        lockedClientLockMessage = lockedClientLockMessage.substring(1);
    }
    var finalLockString = unlockedClientLockMessage.substring(p2hIndex + p2hashLocked.length, p3hIndex);
    var finalClientLock = tunnel_1.default.fromString(finalLockString);
    var encrypted = tunnel_1.default.lockMessage("hi there, this message has been to hell and back :D!", finalClientLock);
    res.send({
        encrypted,
    });
};
main();
//# sourceMappingURL=index.js.map