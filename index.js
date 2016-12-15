'use strict';

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
    requirements: {
        commands: './commands.js',
        custom: './custom.js'
    },
    required: {},
    json: json,
    functions: {
        send: function (command) {
            client.write(command + '\n');
        },
        checkDB: function (client) {
            if (client !== undefined) {
                if (client.bot !== undefined) {
                    if (client.bot.db !== undefined) {
                        return true;
                    }
                }
            }
            return false;
        },
        checkMsg: function (msg) {
            if (msg.msg !== undefined &&
                    String(msg.msg).length > 0 &&
                    msg.channel !== undefined &&
                    String(msg.channel).length > 0 &&
                    msg.user !== undefined &&
                    String(msg.user).length > 0) {
                return true;
            }
            return false;
        },
        removeDuplicates: function (arr) {
            var temp = arr.filter(function (elem, index, self) {
                return index === self.indexOf(elem);
            });
            return temp;
        },
        removeEmpty: function (arr) {
            var i,
                tempArray = [];
            for (i = 0; i < arr.length; i += 1) {
                arr[i] = String(arr[i]).trim();
                if (arr[i] !== ' ' && arr[i] !== '') {
                    tempArray.push(arr[i]);
                }
            }
            return tempArray;
        }
    }
};

/**
 * read db
 */
function readDB(callback) {
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
    for (i in client.bot.requirements) {
        if (client.bot.requirements.hasOwnProperty(i)) {
            client.bot.required[i] = require(String(client.bot.requirements[i]).replace('.js', ''));
        }
    }

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
         * Run module listeners
         */
        for (i in client.bot.required) {
            if (client.bot.required.hasOwnProperty(i)) {
                if (client.bot.required[i].hasOwnProperty('listener')) {
                    client.bot.required[i].listener(client, data);
                }
            }
        }

        /**
         * Handles MSGS
         * I'll need this: (\:.*\!).*(PRIVMSG).*(\#.* :)(.*)
         */
        if (data.indexOf('PRIVMSG') !== -1) {
            cache.privmsgRegex = /(\:.*\!).*(PRIVMSG .* :)(.*)/i;
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
                cache.currentMsg.channel = String(cache.found[2]).replace(' :', '').replace('PRIVMSG ', '');
                cache.currentMsg.msg = String(cache.found[3]);
                /**
                 * make sure this data isn't coming from the bot, that would be loopy
                 */
                if (cache.currentMsg.user !== bot.name) {
                    /**
                     * if this is just asking the bot to reload
                     */
                    if (cache.currentMsg.msg === bot.name + ' reload' &&
                            !client.bot.db.ignored.hasOwnProperty(cache.currentMsg.user) &&
                            client.bot.db.admins.hasOwnProperty(cache.currentMsg.user)) {
                        client.bot.required = {};
                        /**
                         * go through the 'require' module, find the required files a delete them from the cache
                         */
                        for (i in client.bot.requirements) {
                            if (client.bot.requirements.hasOwnProperty(i)) {
                                var r;
                                for (r in require.cache) {
                                    if (require.cache.hasOwnProperty(r)) {
                                        if (r.indexOf(i) !== -1) {
                                            delete require.cache[r];
                                        }
                                    }
                                }
                            }
                        }
                        /**
                         * require it again and send a message back
                         */
                        for (i in client.bot.requirements) {
                            if (client.bot.requirements.hasOwnProperty(i)) {
                                client.bot.required[i] = require(String(client.bot.requirements[i]).replace('.js', ''));
                            }
                        }
                        send('PRIVMSG ' + cache.currentMsg.channel + ' :reloaded, bruh');
                    }

                    /**
                     * go through the commands
                     */
                    for (i in client.bot.required) {
                        if (client.bot.required.hasOwnProperty(i)) {
                            var r;
                            for (r in client.bot.required[i]) {
                                if (client.bot.required[i].hasOwnProperty(r)) {
                                    if (cache.currentMsg.msg.indexOf(r) === 0) {
                                        client.bot.required[i][r](client, cache.currentMsg);
                                    }
                                }
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

                    /**
                     * Save the msg
                     */
                    cache.time = Date.now();
                    if (!client.bot.db.hasOwnProperty('messages')) {
                        client.bot.db.messages = {};
                    }
                    client.bot.db.messages[cache.time] = cache.currentMsg;
                    if (Object.keys(client.bot.db.messages).length > 50) {
                        for (var first in client.bot.db.messages) break;
                            delete client.bot.db.messages[first];
                    }
                    client.bot.json.writeFile(client.bot.path + 'db.json', client.bot.db);
                }
            }
        }
    }

    client.on('data', handleData);
});

