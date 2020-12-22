class tunnel {
  private letters: Array<string> = [
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
  private numbers: Array<string> = [
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
  private characters: Array<string> = [
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
  public originalMap: string[] = [
    ...this.letters,
    ...this.numbers,
    ...this.characters,
  ];
  private scrambledMap = (): string[] => {
    var tmp: string[] = this.originalMap.slice(0);
    var res: string[] = [];
    var current: string = null;
    while (res.length != this.originalMap.length) {
      current = tmp.splice(Math.floor(Math.random() * tmp.length), 1)[0];
      res.push(current);
    }
    return res;
  };
  public generateLock = (size): string[][] => {
    var lock: string[][] = [];
    for (var i = 0; i < size; i++) {
      lock.push(this.scrambledMap());
    }
    return lock;
  };
  public engraveKey = (lock, key, message, _offset = false) => {
    if (message.length > lock.length){
      console.log(lock.length, message.length)
      throw new Error("Lock must be bigger than message")
    }
    var offset = _offset == false ? 0 : Math.floor(Math.random() * 4000);
    for (var i = 0; i < message.length; i++) {
      var row: string[] = lock[i + offset];
      var input: string = key[(i + offset) % key.length];
      var originalInputIdex: number = this.originalMap.indexOf(input);
      var output: string = row[originalInputIdex];
      var messageChar: string = message[i];
      if (output != messageChar) {
        row[row.indexOf(messageChar)] = output;
        row[originalInputIdex] = messageChar;
      }
    }
  };
  public unlock = (lock: string[][], password: string): string =>{
    var unlocked = '';
    for (var i = 0; i < lock.length; i++) {
      var originalInputIdex = this.originalMap.indexOf(
        password[i % password.length]
      );
      unlocked += lock[i][originalInputIdex];
    }

    return unlocked;
  }
  public lockMessage = (message: string, lock: string[][]): string => {
    var locked = "";
    for (var i = 0; i < message.length; i++) {
      locked += lock[i % lock.length][this.originalMap.indexOf(message[i])];
    }
    return locked;
  };
  public unlockMessage = (message: string, lock: string[][]): string => {
    var unlocked = "";
    for (var i = 0; i < message.length; i++) {
      unlocked += this.originalMap[lock[i % lock.length].indexOf(message[i])];
    }
    return unlocked;
  };
  public toString = (lock: string[][]): string => {
    var result = lock.reduce((total, current) => {
      total += current.join("");
      return total;
    }, "");

    return result;
  };
  public fromString = (string: string): string[][] => {
    var result = [];
    for (var i = 0; i < string.length / this.originalMap.length; i++) {
      result.push([
        ...string.substring(
          i * (this.originalMap.length),
          (this.originalMap.length) * (i + 1)
        ),
      ]);
    }
    return result;
  };
}

let instance = new tunnel();

export default instance;
