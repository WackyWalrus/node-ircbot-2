'use strict';

/**
 * adds a new line so the data gets sent to the irc server
 */
function send(client, command) {
    client.write(command + '\n');
}

/**
 * checks to see if the db is actually set
 */
function checkDB(client) {
    if (client !== undefined) {
        if (client.bot !== undefined) {
            if (client.bot.db !== undefined) {
                return true;
            }
        }
    }
    return false;
}

/**
 * checks the incoming data to make sure it's complete
 */
function checkMsg(msg) {
    if (msg.msg !== undefined &&
            String(msg.msg).length > 0 &&
            msg.channel !== undefined &&
            String(msg.channel).length > 0 &&
            msg.user !== undefined &&
            String(msg.user).length > 0) {
        return true;
    }
    return false;
}

/**
 * this is how we'll sort arrays
 */
function sortKeyValueArr(a, b) {
    return a[1] < b[1] ? 1 : (a[1] > b[1] ? -1 : 0);
}

/**
 * Convert an object to an array
 */
function objToArr(obj) {
    var tempArr = [],
        key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            tempArr.push([key, obj[key]]);
        }
    }
    return tempArr;
}

/**
 * removes duplicates from array
 */
function removeDuplicates(array) {
    var temp = array.filter(function (elem, index, self) {
        return index === self.indexOf(elem);
    });
    return temp;
}

/**
 * echo command
 */
function echo(client, msg) {
    if (checkMsg(msg) && !client.bot.db.ignored.hasOwnProperty(msg.user)) {
        var string = String(msg.msg).replace('echo ', ''),
            command;
        if (string !== null && String(string).length !== 0) {
            command = 'PRIVMSG ' + msg.channel + ' :' + String(msg.msg).replace('echo ', '');
            send(client, command);
        }
    }
}

/**
 * join a channel
 */
function join(client, msg) {
    if (checkMsg(msg) && client.bot.db.admins.hasOwnProperty(msg.user)) {
        var channel = String(msg.msg).replace('join ', ''),
            command;
        if (channel !== null && String(channel).length !== 0) {
            command = 'JOIN ' + String(msg.msg).replace('join ', '');
            send(client, command);
        }
    }
}

/**
 * leave a channel
 */
function gtfo(client, msg) {
    if (checkMsg(msg) && client.bot.db.admins.hasOwnProperty(msg.user)) {
        var channel = String(msg.msg).replace('gtfo ', '');
        send(client, 'PRIVMSG ' + channel + ' :.ud timeshifter');
        send(client, 'PART ' + channel);
    }
}

/**
 * change nick
 */
function nick(client, msg) {
    if (checkMsg(msg) && client.bot.db.admins.hasOwnProperty(msg.user)) {
        var name = String(msg.msg).replace('nick ', '');
        if (name !== null && String(name).length !== 0) {
            send(client, 'NICK ' + name);
        }
    }
}

/**
 * make a user an admin
 */
function admin(client, msg) {
    var cache = {},
        i;
    if (String(msg.msg) !== 'admin') {
        msg.msg = String(msg.msg).replace('admin ', '');
        if (checkMsg(msg) && checkDB(client)) {
            if (client.bot.db.admins.hasOwnProperty(msg.user)) {
                cache.users = String(msg.msg).split(' ');
                cache.users = removeDuplicates(cache.users);
                for (i = 0; i < cache.users.length; i += 1) {
                    if (client.bot.db.admins[cache.users[i]] === undefined) {
                        client.bot.db.admins[cache.users[i]] = 1;
                    }
                }
                client.bot.json.writeFile(client.bot.path + 'db.json', client.bot.db);
            }
        }
    }
}

/**
 * ignore user
 */
function ignore(client, msg) {
    var cache = {},
        i;
    if (String(msg.msg) !== 'ignore') {
        msg.msg = String(msg.msg).replace('ignore ', '');
        if (checkMsg(msg) && checkDB(client)) {
            if (client.bot.db.admins.hasOwnProperty(msg.user)) {
                cache.users = String(msg.msg).split(' ');
                cache.users = removeDuplicates(cache.users);
                for (i = 0; i < cache.users.length; i += 1) {
                    if (client.bot.db.ignored[cache.users[i]] === undefined) {
                        client.bot.db.ignored[cache.users[i]] = 1;
                    }
                }
                client.bot.json.writeFile(client.bot.path + 'db.json', client.bot.db);
            }
        }
    }
}

/**
 * remove user from admin list
 */
function unadmin(client, msg) {
    var cache = {},
        i;
    if (String(msg.msg) !== 'unadmin') {
        msg.msg = String(msg.msg).replace('unadmin ', '');
        if (checkMsg(msg) && checkDB(client)) {
            if (client.bot.db.admins.hasOwnProperty(msg.user)) {
                cache.users = String(msg.msg).split(' ');
                cache.users = removeDuplicates(cache.users);
                for (i = 0; i < cache.users.length; i += 1) {
                    if (client.bot.db.admins.hasOwnProperty(cache.users[i])) {
                        delete client.bot.db.admins[cache.users[i]];
                    }
                }
                client.bot.json.writeFile(client.bot.path + 'db.json', client.bot.db);
            }
        }
    }
}

/**
 * remove user from ignore list
 */
function unignore(client, msg) {
    var cache = {},
        i;
    if (String(msg.msg) !== 'unignore') {
        msg.msg = String(msg.msg).replace('unignore ', '');
        if (checkMsg(msg) && checkDB(client)) {
            if (client.bot.db.admins.hasOwnProperty(msg.user)) {
                cache.users = String(msg.msg).split(' ');
                cache.users = removeDuplicates(cache.users);
                for (i = 0; i < cache.users.length; i += 1) {
                    if (client.bot.db.ignored.hasOwnProperty(cache.users[i])) {
                        delete client.bot.db.ignored[cache.users[i]];
                    }
                }
                client.bot.json.writeFile(client.bot.path + 'db.json', client.bot.db);
            }
        }
    }
}

/** 
 * prints out points
 */
function points(client, msg) {
    var cache = {},
        i;
    if (checkMsg(msg)) {
        msg.msg = String(msg.msg).trim();
        if (checkDB(client)) {
            if (!client.bot.db.ignored.hasOwnProperty(msg.user)) {
                if (msg.msg === 'points') {
                    if (client.bot.db.points !== undefined && Object.keys(client.bot.db.points).length) {
                        cache.string = '';
                        cache.tempArr = objToArr(client.bot.db.points);
                        cache.tempArr.sort(sortKeyValueArr);
                        for (i = 0; i < cache.tempArr.length; i += 1) {
                            if (i === 6) { break; }
                            cache.string += cache.tempArr[i][0] + ' has ' + cache.tempArr[i][1] + ' point';
                            if (cache.tempArr[i][1] !== 1 && cache.tempArr[i][1] !== -1) {
                                cache.string += 's';
                            }
                            if (i < 6 && i < (cache.tempArr.length - 1)) {
                                cache.string += ' || ';
                            }
                        }
                        cache.command = 'PRIVMSG ' + msg.channel + ' :' + cache.string;
                        send(client, cache.command);
                    }
                } else {
                    cache.user = String(msg.msg).replace('points ', '');
                    if (String(cache.user).length > 0) {
                        if (client.bot.db.points !== undefined) {
                            cache.points = client.bot.db.points;
                            if (cache.points.hasOwnProperty(cache.user)) {
                                if (msg.channel !== undefined && msg.channel.length > 0) {
                                    cache.command = 'PRIVMSG ' + msg.channel + ' :' + cache.user + ' has ' + cache.points[cache.user] + ' point';
                                    if (cache.points[cache.user] !== 1 && cache.points[cache.user] !== -1) {
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
    }
}

/**
 * give user/users a point
 */
function addpoint(client, msg) {
    var cache = {},
        i;

    if (checkDB(client) && checkMsg(msg)) {
        if (!client.bot.db.ignored.hasOwnProperty(msg.user)) {
            cache.users = String(msg.msg).replace('addpoint ', '');
            if (cache.users.length > 0) {
                cache.users = cache.users.split(' ');
                cache.users = removeDuplicates(cache.users);
                if (cache.users.length > 0) {
                    for (i = 0; i < cache.users.length; i += 1) {
                        if (client.bot.db.points[cache.users[i]] === undefined) {
                            client.bot.db.points[cache.users[i]] = 1;
                        } else {
                            client.bot.db.points[cache.users[i]] += 1;
                        }
                    }
                    client.bot.json.writeFile(client.bot.path + 'db.json', client.bot.db);
                }
            }
        }
    }
}

/**
 * remove points from users
 */
function rmpoint(client, msg) {
    var cache = {},
        i;

    if (checkDB(client) && checkMsg(msg)) {
        if (!client.bot.db.ignored.hasOwnProperty(msg.user)) {
            cache.users = String(msg.msg).replace('rmpoint ', '');
            if (cache.users.length > 0) {
                cache.users = cache.users.split(' ');
                cache.users = removeDuplicates(cache.users);
                if (cache.users.length > 0) {
                    for (i = 0; i < cache.users.length; i += 1) {
                        if (client.bot.db.points[cache.users[i]] === undefined) {
                            client.bot.db.points[cache.users[i]] = -1;
                        } else {
                            client.bot.db.points[cache.users[i]] -= 1;
                        }
                    }
                    client.bot.json.writeFile(client.bot.path + 'db.json', client.bot.db);
                }
            }
        }
    }
}

module.exports.echo = echo;
module.exports.join = join;
module.exports.gtfo = gtfo;
module.exports.nick = nick;
module.exports.points = points;
module.exports.addpoint = addpoint;
module.exports.rmpoint = rmpoint;
module.exports.ignore = ignore;
module.exports.unignore = unignore;
module.exports.admin = admin;
module.exports.unadmin = unadmin;