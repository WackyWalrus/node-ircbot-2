/**
 * get requirements and setup client
 */
var json = require('jsonfile');
var scrape = require("scrape-url");
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
    var cache = {},
        i;

    cache.getURL = new RegExp("(^|[ \t\r\n])((http|https):(([A-Za-z0-9$_.+!*(),;/?:@&~=-])|%[A-Fa-f0-9]{2}){2,}(#([a-zA-Z0-9][a-zA-Z0-9$_.+!*(),;/?:@&~=%-]*))?([A-Za-z0-9$_+!*();/?:~-]))", "g");

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


    /**
     * require commands
     */
    var commands = require('./commands');

    /**
     * just adds a newline to make sure the command gets sent to the server
     */
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
            /**
             * if there's data for this msg
             */
            if (cache.found !== null) {
                /**
                 * setup data
                 */
                cache.currentMsg.user = String(cache.found[1]).replace(':', '').replace('!', '');
                cache.currentMsg.channel = String(cache.found[3]).replace(' :', '');
                cache.currentMsg.msg = String(cache.found[4]);
                /**
                 * make sure this data isn't coming from the bot, that would be loopy
                 */
                if (cache.currentMsg.user !== bot.name) {
                    /**
                     * if this is just asking the bot to reload
                     */
                    if (cache.currentMsg.msg === bot.name + ' reload the thing') {
                        /**
                         * go through the 'require' module, find the commands.js file a delete it from the cache
                         */
                        for (i in require.cache) {
                            if (require.cache.hasOwnProperty(i)) {
                                if (i.indexOf('commands.js') > -1) {
                                    delete require.cache[i];
                                }
                            }
                        }
                        /**
                         * require it again and send a message back
                         */
                        commands = require('./commands');
                        send('PRIVMSG ' + cache.currentMsg.channel + ' :reloaded, bruh');
                    }

                    /**
                     * go through the commands
                     */
                    for (i in commands) {
                        if (commands.hasOwnProperty(i)) {
                            /**
                             * if this command is being called
                             */
                            if (cache.currentMsg.msg.indexOf(i) === 0) {
                                /**
                                 * call it
                                 */
                                commands[i](client, cache.currentMsg);
                            }
                        }
                    }

                    /**
                     * check if it's a url
                     */
                    if (cache.currentMsg.msg.indexOf('http://') !== -1 || cache.currentMsg.msg.indexOf('https://') !== -1) {
                        cache.match = cache.currentMsg.msg.match(cache.getURL);
                        if (cache.match !== null) {
                            cache.match = cache.match[0].trim();
                            if (cache.match !== null && cache.match !== undefined && cache.match !== 0) {
                                scrape(cache.match, 'head title', function (error, titles) {
                                    if (!error) {
                                        if (titles[0] !== undefined && titles[0] !== null && titles[0].length) {
                                            cache.string = titles[0].text();
                                            cache.string = String(cache.string).replace(/\r?\n|\r/g, '');
                                            cache.string = String(cache.string).trim();
                                            send('PRIVMSG ' + cache.currentMsg.channel + ' :' + cache.string);
                                        }
                                    }
                                });
                            }
                        }
                        delete cache.match;
                        delete cache.string;
                    }

                }
            }
        }
    }

    client.on('data', handleData);
});

