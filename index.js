/**
 * get requirements and setup client
 */
var json = require('jsonfile');
var net = require('net');
var client = net.Socket();

/**
 * make some bot config
 */
var bot = {
    path: String(__dirname + '/'),
    name: 'dogebot2',
    autojoin: [
        '#DogeTester'
    ],
    json: json
};

/**
 * read db
 */
function readDB(callback) {
    'use strict';
    json.readFile(bot.path + 'db.json', function (err, obj) {
        if (obj) {
            bot.db = obj;
        } else {
            bot.db = {};
        }
        callback();
    });
}

readDB(function () {
    'use strict';
    var cache = {};

    /**
     * connect to freenode
     */
    client.connect({
        port: 6667,
        host: 'chat.freenode.net'
    }, function (data) {
        console.log('connected');
    });
    client.setNoDelay(true);

    client.bot = bot;


    var commands = require('./commands'),
        i;

    function send(command) {
        return client.write(command + '\n');
    }

    function handleData(data) {
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
                if (cache.currentMsg.user !== bot.name) {
                    if (cache.currentMsg.msg === 'dogebot2 reload the thing') {
                        for (i in require.cache) {
                            if (require.cache.hasOwnProperty(i)) {
                                if (i.indexOf('commands.js') > -1) {
                                    delete require.cache[i];
                                }
                            }
                        }
                        commands = require('./commands');
                        send('PRIVMSG ' + cache.currentMsg.channel + ' :reloaded, bruh');
                    }

                    for (i in commands) {
                        if (commands.hasOwnProperty(i)) {
                            if (cache.currentMsg.msg.indexOf(i) === 0) {
                                commands[i](client, cache.currentMsg);
                            }
                        }
                    }
                }
            }
        }
    }

    client.on('data', handleData);
});

