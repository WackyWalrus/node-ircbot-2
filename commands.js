'use strict';

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
 * echo command
 */
function echo(client, msg) {
    if (client.bot.functions.checkMsg(msg) && !client.bot.db.ignored.hasOwnProperty(msg.user)) {
        var string = String(msg.msg).replace('echo ', ''),
            command,
            regex = /[A-Za-z]/,
            match = String(string).substr(0, 1).match(regex);
        if (match === null ||
                match.length === 0) {
            return false;
        }
        if (string !== null && String(string).length !== 0 && String(string).substr(0, 1) !== '!') {
            command = 'PRIVMSG ' + msg.channel + ' :' + String(msg.msg).replace('echo ', '');
            client.bot.functions.send(command);
        }
    }
}

/**
 * join a channel
 */
function join(client, msg) {
    if (client.bot.functions.checkMsg(msg) && client.bot.db.admins.hasOwnProperty(msg.user)) {
        var channel = String(msg.msg).replace('join ', ''),
            command;
        if (channel !== null && String(channel).length !== 0) {
            command = 'JOIN ' + String(msg.msg).replace('join ', '');
            client.bot.functions.send(command);
        }
    }
}

/**
 * leave a channel
 */
function gtfo(client, msg) {
    if (client.bot.functions.checkMsg(msg) && client.bot.db.admins.hasOwnProperty(msg.user)) {
        var channel = String(msg.msg).replace('gtfo ', '');
        client.bot.functions.send('PRIVMSG ' + channel + ' :.ud timeshifter');
        client.bot.functions.send('PART ' + channel);
    }
}

/**
 * change nick
 */
function nick(client, msg) {
    if (client.bot.functions.checkMsg(msg) && client.bot.db.admins.hasOwnProperty(msg.user)) {
        var name = String(msg.msg).replace('nick ', '');
        if (name !== null && String(name).length !== 0) {
            client.bot.functions.send('NICK ' + name);
        }
    }
}

function admins(client, msg) {
    var admin,
        html = '',
        i = 0,
        length = Object.keys(client.bot.db.admins).length;
    if (String(msg.msg) === 'admins') {
        if (client.bot.functions.checkMsg(msg) && client.bot.functions.checkDB(client)) {
            for (admin in client.bot.db.admins) {
                if (client.bot.db.admins.hasOwnProperty(admin)) {
                    i += 1;
                    html += admin;
                    if (i !== length) {
                        html += ', ';
                    }
                }
            }
            client.bot.functions.send('PRIVMSG ' + msg.channel + ' :admins: ' + html);
        }
    }
}

function ignored(client, msg) {
    var ig,
        html = '',
        i = 0,
        length = Object.keys(client.bot.db.ignored).length;
    if (String(msg.msg) === 'ignored') {
        if (client.bot.functions.checkMsg(msg) && client.bot.functions.checkDB(client)) {
            for (ig in client.bot.db.ignored) {
                if (client.bot.db.ignored.hasOwnProperty(ig)) {
                    i += 1;
                    html += ig;
                    if (i !== length) {
                        html += ', ';
                    }
                }
            }
            client.bot.functions.send('PRIVMSG ' + msg.channel + ' :ignored: ' + html);
        }
    }
}

/**
 * make a user an admin
 */
function admin(client, msg) {
    var cache = {},
        i;
    if (String(msg.msg) !== 'admin' && String(msg.msg) !== 'admins') {
        msg.msg = String(msg.msg).replace('admin ', '');
        if (client.bot.functions.checkMsg(msg) && client.bot.functions.checkDB(client)) {
            if (client.bot.db.admins.hasOwnProperty(msg.user)) {
                cache.users = String(msg.msg).split(' ');
                cache.users = client.bot.functions.removeDuplicates(cache.users);
                cache.users = client.bot.functions.removeEmpty(cache.users);
                for (i = 0; i < cache.users.length; i += 1) {
                    if (client.bot.db.admins[cache.users[i]] === undefined &&
                            cache.users[i] !== 'admin' &&
                            cache.users[i] !== 'admins') {
                        client.bot.db.admins[cache.users[i]] = 1;
                    }
                }
                client.bot.json.writeFile(client.bot.path + 'db.json', client.bot.db);
                client.bot.functions.send('PRIVMSG ' + msg.channel + ' :saved');
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
    if (String(msg.msg) !== 'ignore' && String(msg.msg) !== 'ignored') {
        msg.msg = String(msg.msg).replace('ignore ', '');
        if (client.bot.functions.checkMsg(msg) && client.bot.functions.checkDB(client)) {
            if (client.bot.db.admins.hasOwnProperty(msg.user)) {
                cache.users = String(msg.msg).split(' ');
                cache.users = client.bot.functions.removeDuplicates(cache.users);
                cache.users = client.bot.functions.removeEmpty(cache.users);
                for (i = 0; i < cache.users.length; i += 1) {
                    if (client.bot.db.ignored[cache.users[i]] === undefined) {
                        client.bot.db.ignored[cache.users[i]] = 1;
                    }
                }
                client.bot.json.writeFile(client.bot.path + 'db.json', client.bot.db);
                client.bot.functions.send('PRIVMSG ' + msg.channel + ' :saved');
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
        if (client.bot.functions.checkMsg(msg) && client.bot.functions.checkDB(client)) {
            if (client.bot.db.admins.hasOwnProperty(msg.user)) {
                cache.users = String(msg.msg).split(' ');
                cache.users = client.bot.functions.removeDuplicates(cache.users);
                cache.users = client.bot.functions.removeEmpty(cache.users);
                for (i = 0; i < cache.users.length; i += 1) {
                    if (client.bot.db.admins.hasOwnProperty(cache.users[i])) {
                        delete client.bot.db.admins[cache.users[i]];
                    }
                }
                client.bot.json.writeFile(client.bot.path + 'db.json', client.bot.db);
                client.bot.functions.send('PRIVMSG ' + msg.channel + ' :saved');
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
        if (client.bot.functions.checkMsg(msg) && client.bot.functions.checkDB(client)) {
            if (client.bot.db.admins.hasOwnProperty(msg.user)) {
                cache.users = String(msg.msg).split(' ');
                cache.users = client.bot.functions.removeDuplicates(cache.users);
                cache.users = client.bot.functions.removeEmpty(cache.users);
                for (i = 0; i < cache.users.length; i += 1) {
                    if (client.bot.db.ignored.hasOwnProperty(cache.users[i])) {
                        delete client.bot.db.ignored[cache.users[i]];
                    }
                }
                client.bot.json.writeFile(client.bot.path + 'db.json', client.bot.db);
                client.bot.functions.send('PRIVMSG ' + msg.channel + ' :saved');
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
    if (client.bot.functions.checkMsg(msg)) {
        msg.msg = String(msg.msg).trim();
        if (client.bot.functions.checkDB(client)) {
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
                        client.bot.functions.send(cache.command);
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
                                    client.bot.functions.send(cache.command);
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

    if (client.bot.functions.checkDB(client) && client.bot.functions.checkMsg(msg)) {
        if (!client.bot.db.ignored.hasOwnProperty(msg.user)) {
            cache.users = String(msg.msg).replace('addpoint ', '');
            if (cache.users.length > 0) {
                cache.users = cache.users.split(' ');
                cache.users = client.bot.functions.removeDuplicates(cache.users);
                cache.users = client.bot.functions.removeEmpty(cache.users);
                if (cache.users.length > 0) {
                    for (i = 0; i < cache.users.length; i += 1) {
                        if (cache.users[i] !== 'addpoint' && cache.users[i] !== msg.user) {
                            cache.users[i] = String(cache.users[i]).toLowerCase();
                            cache.string = '';
                            if (client.bot.db.points[cache.users[i]] === undefined) {
                                client.bot.db.points[cache.users[i]] = 1;
                            } else {
                                client.bot.db.points[cache.users[i]] += 1;
                            }
                        }
                    }
                    if (cache.users.length === 1) {
                        cache.string = cache.users[0] + ' has ' + client.bot.db.points[cache.users[0]] + ' point';
                        if (client.bot.db.points[cache.users[0]] !== 1) {
                            cache.string += 's';
                        }
                    } else {
                        cache.string = 'Added points to ' + cache.users.length + ' users';
                    }
                    client.bot.functions.send("PRIVMSG " + msg.channel + " :" + cache.string);
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

    if (client.bot.functions.checkDB(client) && client.bot.functions.checkMsg(msg)) {
        if (!client.bot.db.ignored.hasOwnProperty(msg.user)) {
            cache.users = String(msg.msg).replace('rmpoint ', '');
            if (cache.users.length > 0) {
                cache.users = cache.users.split(' ');
                cache.users = client.bot.functions.removeDuplicates(cache.users);
                cache.users = client.bot.functions.removeEmpty(cache.users);
                if (cache.users.length > 0) {
                    for (i = 0; i < cache.users.length; i += 1) {
                        if (cache.users[i] !== 'rmpoint' && cache.users[i] !== msg.user) {
                            cache.users[i] = String(cache.users[i]).toLowerCase();
                            if (client.bot.db.points[cache.users[i]] === undefined) {
                                client.bot.db.points[cache.users[i]] = -1;
                            } else {
                                client.bot.db.points[cache.users[i]] -= 1;
                            }
                        }
                    }
                    if (cache.users.length === 1) {
                        cache.string = cache.users[0] + ' has ' + client.bot.db.points[cache.users[0]] + ' point';
                        if (client.bot.db.points[cache.users[0]] !== 1) {
                            cache.string += 's';
                        }
                    } else {
                        cache.string = 'Removed points from ' + cache.users.length + ' users';
                    }
                    client.bot.functions.send("PRIVMSG " + msg.channel + " :" + cache.string);
                    client.bot.json.writeFile(client.bot.path + 'db.json', client.bot.db);
                }
            }
        }
    }
}

function clearpoints(client, msg) {
    var usr;
    if (client.bot.functions.checkDB(client) && client.bot.functions.checkMsg(msg)) {
        if (client.bot.db.admins.hasOwnProperty(msg.user)) {
            msg.msg = String(msg.msg).trim();
            if (msg.msg === 'clearpoints') {
                client.bot.db.points = {};
                client.bot.functions.send("PRIVMSG " + msg.channel + ' :cleared points');
                client.bot.json.writeFile(client.bot.path + 'db.json', client.bot.db);
            } else {
                usr = String(msg.msg).replace('clearpoints ', '');
                if (client.bot.db.points.hasOwnProperty(usr)) {
                    delete client.bot.db.points[usr];
                    client.bot.functions.send("PRIVMSG " + msg.channel + ' :cleared points from ' + usr);
                    client.bot.json.writeFile(client.bot.path + 'db.json', client.bot.db);
                }
            }
        }
    }
}

function ud(client, msg) {
    var cache = {},
        urban = require('urban');
    if (client.bot.functions.checkDB(client) && client.bot.functions.checkMsg(msg)) {
        if (!client.bot.db.ignored.hasOwnProperty(msg.user)) {
            if (msg.msg !== 'ud') {
                cache.term = String(msg.msg).replace('ud ', '');
                if (cache.term !== null && String(cache.term).length !== 0 && cache.term !== msg.msg) {
                    cache.search = urban(cache.term);
                    cache.search.first(function (json) {
                        if (json !== undefined && json !== null) {
                            if (json.definition !== undefined && json.definition !== null) {
                                cache.definition = String(json.definition).split('\n');
                                if (cache.definition !== undefined && cache.definition !== null) {
                                    if (cache.definition[0] !== undefined && cache.definition[0] !== null) {
                                        client.bot.functions.send('PRIVMSG ' + msg.channel + ' :' + cache.definition[0]);
                                    } else {
                                        client.bot.functions.send('PRIVMSG ' + msg.channel + ' :no definition found');
                                    }
                                } else {
                                    client.bot.functions.send('PRIVMSG ' + msg.channel + ' :no definition found');
                                }
                            } else {
                                client.bot.functions.send('PRIVMSG ' + msg.channel + ' :no definition found');
                            }
                        } else {
                            client.bot.functions.send('PRIVMSG ' + msg.channel + ' :no definition found');
                        }
                    });
                }
            }
        }
    }
}

function seds(client, msg) {
    var cache = {};
    if (!client.bot.db.ignored.hasOwnProperty(msg.user) &&
            client.bot.db.admins.hasOwnProperty(msg.user)) {
        cache.opt = msg.msg.replace('seds ', '');
        if (cache.opt === 'on') {
            client.bot.seds = true;
            client.bot.functions.send('PRIVMSG ' + msg.channel + ' :seds on');
        } else if (cache.opt === 'off') {
            client.bot.seds = false;
            client.bot.functions.send('PRIVMSG ' + msg.channel + ' :seds off');
        }
    }
}

function sed(client, msg) {
    var split,
        i,
        k,
        keys,
        result;
    if (msg.msg.indexOf('s/') === 0) {
        split = msg.msg.split('/');
    }
    if (split !== undefined && split.length) {
        if (client.bot.functions.checkMsg(msg) && client.bot.functions.checkDB(client)) {
            if (client.bot.seds === true &&
                    !client.bot.db.ignored.hasOwnProperty(msg.user)) {
                keys = Object.keys(client.bot.db.messages).reverse();
                for (i = 0; i < keys.length; i += 1) {
                    k = keys[i];
                    if (client.bot.db.messages.hasOwnProperty(k)) {
                        if (client.bot.db.messages[k].user === client.bot.name) {
                            delete client.bot.db.messages[k];
                        } else {
                            if (client.bot.db.messages[k].msg.indexOf('s/') === -1 &&
                                    client.bot.db.messages[k].msg.indexOf('swap/') === -1) {
                                if (client.bot.db.messages[k].msg.indexOf(split[1]) !== -1) {
                                    result = "<" + client.bot.db.messages[k].user + ">: " + client.bot.db.messages[k].msg.replace(split[1], split[2]);
                                    client.bot.functions.send('PRIVMSG ' + msg.channel + ' :' + result);
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

function swap(client, msg) {
    var split,
        i,
        k,
        keys,
        newString = [],
        stringSplit,
        result;
    if (msg.msg.indexOf('swap/') === 0) {
        split = msg.msg.split('/');
    }
    if (split !== undefined && split.length) {
        if (client.bot.functions.checkMsg(msg) && client.bot.functions.checkDB(client)) {
            if (!client.bot.db.ignored.hasOwnProperty(msg.user)) {
                keys = Object.keys(client.bot.db.messages).reverse();
                for (i = 0; i < keys.length; i += 1) {
                    k = keys[i];
                    if (client.bot.db.messages.hasOwnProperty(k)) {
                        if (client.bot.db.messages[k].user === client.bot.name) {
                            delete client.bot.messages[k];
                        } else {
                            if (client.bot.db.messages[k].msg.indexOf('swap/') === -1 &&
                                    client.bot.db.messages[k].msg.indexOf('s/') === -1) {
                                if (client.bot.db.messages[k].msg.indexOf(split[1]) !== -1 &&
                                        client.bot.db.messages[k].msg.indexOf(split[2]) !== -1) {
                                    stringSplit = client.bot.db.messages[k].msg.split(split[1]);
                                    newString[0] = stringSplit[0];
                                    stringSplit = stringSplit[1].split(split[2]);
                                    newString[1] = split[2];
                                    newString[2] = stringSplit[0];
                                    newString[3] = split[1];
                                    newString[4] = stringSplit[1];
                                    result = "<" + client.bot.db.messages[k].user + ">: " + newString.join('');
                                    client.bot.functions.send('PRIVMSG ' + msg.channel + ' :' + result);
                                }
                            }
                        }
                    }
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
module.exports.admins = admins;
module.exports.ignored = ignored;
module.exports.ignore = ignore;
module.exports.unignore = unignore;
module.exports.admin = admin;
module.exports.unadmin = unadmin;
module.exports.ud = ud;
module.exports.clearpoints = clearpoints;
module.exports.seds = seds;
module.exports['s/'] = sed;
module.exports['swap/'] = swap;