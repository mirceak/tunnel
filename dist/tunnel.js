"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class tunnel {
    constructor() {
        this.letters = [
            "a",
            "b",
            "c",
            "d",
            "e",
            "f",
            "g",
            "h",
            "i",
            "j",
            "k",
            "l",
            "m",
            "n",
            "o",
            "p",
            "q",
            "r",
            "s",
            "t",
            "u",
            "v",
            "w",
            "x",
            "y",
            "z",
            "A",
            "B",
            "C",
            "D",
            "E",
            "F",
            "G",
            "H",
            "I",
            "J",
            "K",
            "L",
            "M",
            "N",
            "O",
            "P",
            "Q",
            "R",
            "S",
            "T",
            "U",
            "V",
            "W",
            "X",
            "Y",
            "Z",
        ];
        this.numbers = [
            "0",
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
        ];
        this.characters = [
            "~",
            "`",
            "!",
            "@",
            "#",
            "$",
            "%",
            "^",
            "&",
            "*",
            "(",
            ")",
            "_",
            "+",
            "-",
            "=",
            ",",
            "<",
            ">",
            ".",
            "/",
            "?",
            "[",
            "]",
            "{",
            "}",
            ";",
            ":",
            "\\",
            "|",
            '"',
            "'",
            " "
        ];
        this.originalMap = [
            ...this.letters,
            ...this.numbers,
            ...this.characters,
        ];
        this.scrambledMap = () => {
            var tmp = this.originalMap.slice(0);
            var res = [];
            var current = null;
            while (res.length != this.originalMap.length) {
                current = tmp.splice(Math.floor(Math.random() * tmp.length), 1)[0];
                res.push(current);
            }
            return res;
        };
        this.generateLock = (size) => {
            var lock = [];
            for (var i = 0; i < size; i++) {
                lock.push(this.scrambledMap());
            }
            return lock;
        };
        this.engraveKey = (lock, key, message, _offset = false) => {
            if (message.length > lock.length) {
                console.log(lock.length, message.length);
                throw new Error("Lock must be bigger than message");
            }
            var offset = _offset == false ? 0 : Math.floor(Math.random() * 4000);
            for (var i = 0; i < message.length; i++) {
                var row = lock[i + offset];
                var input = key[(i + offset) % key.length];
                var originalInputIdex = this.originalMap.indexOf(input);
                var output = row[originalInputIdex];
                var messageChar = message[i];
                if (output != messageChar) {
                    row[row.indexOf(messageChar)] = output;
                    row[originalInputIdex] = messageChar;
                }
            }
        };
        this.unlock = (lock, password) => {
            var unlocked = '';
            for (var i = 0; i < lock.length; i++) {
                var originalInputIdex = this.originalMap.indexOf(password[i % password.length]);
                unlocked += lock[i][originalInputIdex];
            }
            return unlocked;
        };
        this.lockMessage = (message, lock) => {
            var locked = "";
            for (var i = 0; i < message.length; i++) {
                locked += lock[i % lock.length][this.originalMap.indexOf(message[i])];
            }
            return locked;
        };
        this.unlockMessage = (message, lock) => {
            var unlocked = "";
            for (var i = 0; i < message.length; i++) {
                unlocked += this.originalMap[lock[i % lock.length].indexOf(message[i])];
            }
            return unlocked;
        };
        this.toString = (lock) => {
            var result = lock.reduce((total, current) => {
                total += current.join("");
                return total;
            }, "");
            return result;
        };
        this.fromString = (string) => {
            var result = [];
            for (var i = 0; i < string.length / this.originalMap.length; i++) {
                result.push([
                    ...string.substring(i * (this.originalMap.length), (this.originalMap.length) * (i + 1)),
                ]);
            }
            return result;
        };
    }
}
let instance = new tunnel();
exports.default = instance;
//# sourceMappingURL=tunnel.js.map