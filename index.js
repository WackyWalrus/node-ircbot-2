var net = require('net');
var client = net.Socket();

var bot = {
    name: 'dogebot2',
    autojoin: [
        '#DogeTester'
    ]
};

var cache = {};

client.connect({
    port: 6667,
    host: 'chat.freenode.net'
}, function (data) {
    'use strict';
    console.log('connected');
});
client.setNoDelay(true);

var commands = require('./commands'),
    i;

function send(command) {
    'use strict';
    return client.write(command + '\n');
}

client.on('data', function (data) {
    'use strict';
    var i;

    console.log('Received: ' + data);

    /**
     * Handle long and autojoin
     */
    if (data.indexOf('Found your hostname') !== -1) {
        send('NICK ' + bot.name);
        send('USER ' + bot.name + ' 8 * : ' + bot.name);

        for (i = 0; i < bot.autojoin.length; i += 1) {
            send('JOIN ' + bot.autojoin[i]);
            send('PRIVMSG ' + bot.autojoin[i] + ' :sup cunts');
        }
    }

    /**
     * Prevent timeout
     */
    if (data.indexOf('PING :') !== -1) {
        cache.pingBackTo = String(data).replace('PING ', '');
        send('PONG ' + cache.pingBackTo);
    }

    /**
     * Handles MSGS
     * I'll need this: (\:.*\!).*(PRIVMSG).*(\#.* :)(.*)
     */
    if (data.indexOf('PRIVMSG') !== -1) {
        cache.privmsgRegex = /(\:.*\!).*(PRIVMSG).*(\#.* :)(.*)/i;
        cache.found = String(data).match(cache.privmsgRegex);
        cache.currentMsg = {};
        if (cache.found !== null) {
            cache.currentMsg.user = String(cache.found[1]).replace(':', '').replace('!', '');
            cache.currentMsg.channel = String(cache.found[3]).replace(' :', '');
            cache.currentMsg.msg = String(cache.found[4]);

            for(i in commands) {
                if (commands.hasOwnProperty(i)) {
                    if (cache.currentMsg.msg.indexOf(i) === 0) {
                        commands[i](client, cache.currentMsg);
                    }
                }
            }
        }
    }
});