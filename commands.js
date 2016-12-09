function send(client, command) {
    'use strict';
    client.write(command + '\n');
}

function checkDB(client) {
    'use strict';
    if (client !== undefined) {
        if (client.bot !== undefined) {
            if (client.bot.db !== undefined) {
                return true;
            }
        }
    }
    return false;
}

function echo(client, msg) {
    'use strict';
    if (msg.msg !== undefined && msg.msg.length > 0 && msg.channel !== undefined && msg.channel.length > 0) {
        var command = 'PRIVMSG ' + msg.channel + ' :' + String(msg.msg).replace('echo ', '');
        send(client, command);
    }
}

function points(client, msg) {
    'use strict';
    var cache = {};
    msg.msg = String(msg.msg).trim();
    if (msg.msg === 'points') {
        // do nothing rn
    } else {
        cache.user = String(msg.msg).replace('points ', '');
        if (String(cache.user).length > 0) {
            if (checkDB(client)) {
                if (client.bot.db.points !== undefined) {
                    if (client.bot.db.points.hasOwnProperty(cache.user)) {
                        if (msg.channel !== undefined && msg.channel.length > 0) {
                            cache.command = 'PRIVMSG ' + msg.channel + ' :' + cache.user + ' has ' + client.bot.db.points[cache.user] + ' point';
                            if (client.bot.db.points[cache.user] !== 1) {
                                cache.command += 's';
                            }
                            send(client, cache.command);
                        }
                    }
                }
            }
        }
    }
}

module.exports.echo = echo;
module.exports.points = points;