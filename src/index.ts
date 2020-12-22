import * as express from "express";
import * as path from "path";
import * as crypto from "crypto";

import tunnel from "./tunnel";

const app = express();
var bodyParser = require("body-parser");
app.use(bodyParser.json({ limit: "15mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "15mb",
    extended: true,
    parameterLimit: 15000,
  })
);
async function main(): Promise<any> {
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
    app.listen(app.get("port"), () =>
      console.log(`Angular Full Stack listening on port ${app.get("port")}`)
    );
  } catch (err) {
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

var clientLock: string[][];
var lock: string[][];

var onTunnel = (req, res) => {
  clientLock = tunnel.generateLock(tunnel.originalMap.length);
  dataLock = tunnel.generateLock(hashLen);
  lock = tunnel.generateLock(
    hashLen * 2 + tunnel.originalMap.length * tunnel.originalMap.length + 4000
  );

  var dataLock: string[][];

  var p1hashLocked = tunnel.lockMessage(getHash(p2, p1), dataLock);
  var p2hashLocked = tunnel.lockMessage(getHash(p3, p2), dataLock);
  var p3hashLocked = tunnel.lockMessage(getHash(p1, p3), dataLock);

  var message = tunnel.lockMessage(
    p2hashLocked + tunnel.toString(clientLock) + p3hashLocked,
    dataLock
  );
  tunnel.engraveKey(lock, p1hashLocked, message, true);

  res.send({
    tst: message,
    lock: tunnel.toString(lock),
    dataLock: tunnel.toString(dataLock),
  });
};

var onLockTunnel = (req, res) => {
  var finalLock = tunnel.fromString(req.body.finalLock);
  var dataLock = tunnel.fromString(req.body.dataLock);

  var p2hashLocked = tunnel.lockMessage(getHash(p3, p2), dataLock);
  var p3hashLocked = tunnel.lockMessage(getHash(p1, p3), dataLock);

  var lockedClientLockMessage = tunnel.unlock(
    finalLock,
    tunnel.lockMessage(tunnel.toString(clientLock), dataLock)
  );

  var p2hIndex = -1;
  var p3hIndex = -1;
  var unlockedClientLockMessage;

  while (p2hIndex < 0) {
    unlockedClientLockMessage = tunnel.unlockMessage(
      tunnel.unlockMessage(lockedClientLockMessage, dataLock),
      clientLock
    );
    p2hIndex = unlockedClientLockMessage.indexOf(p2hashLocked);
    p3hIndex = unlockedClientLockMessage.indexOf(p3hashLocked);

    lockedClientLockMessage = lockedClientLockMessage.substring(1);
  }
  var finalLockString = unlockedClientLockMessage.substring(
    p2hIndex + p2hashLocked.length,
    p3hIndex
  );
  var finalClientLock = tunnel.fromString(finalLockString);

  var encrypted = tunnel.lockMessage(
    "hi there, this message has been to hell and back :D!",
    finalClientLock
  );
  res.send({
    encrypted,
  });
};

main();
