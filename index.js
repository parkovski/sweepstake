const WebSocket = require('ws');
const readline = require('readline');
let rl = null;

const Msg = {};
const Cmd = {};

function log() {
  process.stdout.write('\033[90mlog\033[m ');
  console.log.apply(console, arguments);
}

function printCommands() {
  console.log('Commands:');
  console.log('  join <id> <stake:number/dai>');
  console.log('  commit <id> <move:0|1|2>');
  console.log('  fake <id> <move:0|1|2>');
  console.log('  sim <time:ms> <actions:int>');
  console.log('  addplayers <count:int>');
  console.log('  rm <id>');
  console.log('  ls');
}

if (process.argv[2] == '-h') {
  console.log('Switches:');
  console.log('  -i    Interactive mode');
  console.log('  -h    Help');
  console.log('Environment variables:');
  console.log('  PORT  WebSocket server port (default 8080)');
  printCommands();
  process.exit(0);
} else if (process.argv[2] == '-i') {
  // 32 = green
  console.log('\033[32mINTERACTIVE\033[m');
  printCommands();
  rl = readline.createInterface({ input: process.stdin, output: process.stdout });
} else {
  // 33 = yellow
  console.log('\033[33mNON-INTERACTIVE\033[m (pass -i for interactive mode)');
  process.on('SIGINT', () => {
    console.log('Bye, I\'ll miss you! ♥');
    process.exit(0);
  });
}

const port = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port });

let players = {};

function pushMessage() {
  let m = arguments[0];
  let args = Array.prototype.slice.call(arguments, 1);

  if (args.length) {
    m = JSON.stringify({ msg: m, args });
  }
  log('pushing message', m);
  wss.clients.forEach(c => c.readyState == WebSocket.OPEN && c.send(m));
}

Msg.playerJoined = function(p, stake) {
  stake = parseFloat(stake);
  log('recv playerJoined:', p, '$'+stake.toFixed(2));
  players[p] = {
    stake,
    ws: this,
    fake: -1,
    eligible: true,
  };

  pushMessage('playerJoined', p, stake);
};

Msg.gameStateChanged = function(state) {
  log('recv gameStateChanged', state);
};

Msg.playerCommittedMove = function(p, m) {
  m = parseInt(m);
  log('recv playerCommittedMove:', p, m);
};

Msg.playerDeclaredMove = function(p, m) {
  m = parseInt(m);
  log('recv playerDeclaredMove:', p, m);

  let player = players[p];
  if (!player) {
    log('Player not defined:', p);
    return;
  }
  if (!~[0, 1, 2].indexOf(m)) {
    log('Invalid move, expected from [0,1,2].');
    return;
  }
  if (player.fake === m) {
    log('Declared move didn\'t change, won\'t send events.');
    return;
  }
  player.fake = m;
  pushMessage('playerDeclaredMove', p, m);
};

Msg.eligibilityChanged = function(p, e) {
  e = !!e;
  log('recv eligibilityChanged:', p, e);

  let player = players[p];
  if (!player) {
    log('Player not defined:', p);
    return;
  }
  player.eligible = e;
};

Cmd.join = (p, stake) => Msg.playerJoined(p, stake);
Cmd.commit = Msg.playerCommittedMove;
Cmd.fake = Msg.playerDeclaredMove;
Cmd.addplayers = amount => {
  amount = +amount;
  for (let i = 0; i < amount; i++) {
    const id = (function() {
      var s = '';
      for (var i = 0; i < 8; i++) {
        s += 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/='[
          Math.floor(Math.random() * 64)
        ];
      }
      return s;
    })();
    const stake = 100 + Math.floor(Math.random() * 1000)
    Msg.playerJoined(id, stake);
  }
};
Cmd.rm = id => Msg.eligibilityChanged(id, false);
Cmd.ls = () => {
  console.log(players);
};
Cmd.sim = (time, count) => {
  time = +time;
  count = +count;
  process.stdout.write('Simulating player actions for ' + time + 'ms');
  const playerKeys = Object.keys(players);
  for (let i = 0; i < count; i++) {
    const k = playerKeys[Math.floor(Math.random() * playerKeys.length)];
    setTimeout(() => Msg.playerDeclaredMove(k, Math.floor(Math.random() * 3)),
               Math.random() * time);
  }
};

wss.on('connection', ws => {
  ws.on('message', data => {
    try {
      data = JSON.parse(data);
    } catch (e) {
      return;
    }
    let f = Msg[data[0]];
    if (!f) {
      ws.send('no function');
    } else {
      f.apply(ws, data.slice(1));
    }
  });
});

console.log();
log('WebSocket server started on port', port);

if (rl) {
  process.stdout.write('> ');
  rl.on('line', line => {
    let args = line.trim().split(/[ \t]+/g).map(s => s.trim());
    let cmd = args[0];
    args = args.slice(1);
    let f = Cmd[cmd];
    if (!f) {
      console.log('dawg omg that is not a real thing');
    } else {
      f.apply(null, args);
    }
    process.stdout.write('> ');
  });
  rl.on('SIGINT', () => {
    rl.question('Ouch, my SIGINT! Really quit? ', answer => {
      if (answer.trim().match(/^y(?:es)?$/i)) {
        console.log('You can\'t fire me, I quit!');
        process.exit(0);
      }
    });
  });
}
