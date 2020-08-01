const crypto = require("crypto");

const crashHash =
  "6889f1588ac4e6be03ccd1d3658ce19cf772738ce6e579067ea671080d4c3fdc";
// Hash from bitcoin block #610546. Public seed event: https://twitter.com/Roobet/status/1211800855223123968
const salt = "0000000000000000000fa3b65e43e4240d71762a5bf397d5304b2596d116859c";

function saltHash(hash) {
  return crypto
    .createHmac("sha256", hash)
    .update(salt)
    .digest("hex");
}

function generateHash(seed) {
  return crypto
    .createHash("sha256")
    .update(seed)
    .digest("hex");
}

function divisible(hash, mod) {
  // We will read in 4 hex at a time, but the first chunk might be a bit smaller
  // So ABCDEFGHIJ should be chunked like  AB CDEF GHIJ
  var val = 0;

  var o = hash.length % 4;
  for (var i = o > 0 ? o - 4 : 0; i < hash.length; i += 4) {
    val = ((val << 16) + parseInt(hash.substring(i, i + 4), 16)) % mod;
  }

  return val === 0;
}

function crashPointFromHash(serverSeed) {
  const hash = crypto
    .createHmac("sha256", serverSeed)
    .update(salt)
    .digest("hex");

  const hs = parseInt(100 / 4);
  if (divisible(hash, hs)) {
    return 1;
  }

  const h = parseInt(hash.slice(0, 52 / 4), 16);
  const e = Math.pow(2, 52);

  return Math.floor((100 * e - h) / (e - h)) / 100.0;
}

function getPreviousGames() {
  const previousGames = [];
  let gameHash = generateHash(crashHash);

  for (let i = 0; i < 9999; i++) {
    const gameResult = crashPointFromHash(gameHash);
    previousGames.push({ gameHash, gameResult });
    gameHash = generateHash(gameHash);
  }

  return previousGames;
}

function verifyCrash() {
  const gameResult = crashPointFromHash(crashHash);
  const previousHundredGames = getPreviousGames();

  return { gameResult, previousHundredGames };
}

console.log(verifyCrash());

//snippet that may work for output
var a = window.document.createElement("a");
a.href = window.URL.createObjectURL(
  new Blob(["verifyCrash"], { type: "text/csv" })
);
a.download = "test.csv";

// Append anchor to body.
document.body.appendChild(a);
a.click();

// Remove anchor from body
document.body.removeChild(a);
