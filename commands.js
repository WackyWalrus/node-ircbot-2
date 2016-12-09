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

function checkMsg(msg) {
    'use strict';
    if (msg.msg !== undefined && msg.msg.length > 0 && msg.channel !== undefined && msg.channel.length > 0) {
        return true;
    }
    return false;
}

function sortKeyValueArr(a, b) {
    'use strict';
    return a[1] < b[1] ? 1 : (a[1] > b[1] ? -1 : 0);
}

function objToArr(obj) {
    'use strict';
    var tempArr = [],
        key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            tempArr.push([key, obj[key]]);
        }
    }
    return tempArr;
}

function echo(client, msg) {
    'use strict';
    if (checkMsg(msg) && !client.bot.db.ignored.hasOwnProperty(msg.user)) {
        var command = 'PRIVMSG ' + msg.channel + ' :' + String(msg.msg).replace('echo ', '');
        send(client, command);
    }
}

function admin(client, msg) {
    'use strict';
    var cache = {},
        i;
    if (String(msg.msg) !== 'admin') {
        msg.msg = String(msg.msg).replace('admin ', '');
        if (checkMsg(msg) && checkDB(client)) {
            if (client.bot.db.admins.hasOwnProperty(msg.user)) {
                cache.users = String(msg.msg).split(' ');
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

function ignore(client, msg) {
    'use strict';
    var cache = {},
        i;
    if (String(msg.msg) !== 'ignore') {
        msg.msg = String(msg.msg).replace('ignore ', '');
        if (checkMsg(msg) && checkDB(client)) {
            if (client.bot.db.admins.hasOwnProperty(msg.user)){
                cache.users = String(msg.msg).split(' ');
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

function unadmin(client, msg) {
    'use strict';
    var cache = {},
        i;
    if (String(msg.msg) !== 'unadmin') {
        msg.msg = String(msg.msg).replace('unadmin ', '');
        if (checkMsg(msg) && checkDB(client)) {
            if (client.bot.db.admins.hasOwnProperty(msg.user)) {
                cache.users = String(msg.msg).split(' ');
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

function unignore(client, msg) {
    'use strict';
    var cache = {},
        i;
    if (String(msg.msg) !== 'unignore') {
        msg.msg = String(msg.msg).replace('unignore ', '');
        if (checkMsg(msg) && checkDB(client)) {
            if (client.bot.db.admins.hasOwnProperty(msg.user)) {
                cache.users = String(msg.msg).split(' ');
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

function points(client, msg) {
    'use strict';
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

function addpoint(client, msg) {
    'use strict';
    var cache = {},
        i;

    if (checkDB(client) && checkMsg(msg)) {
        if (!client.bot.db.ignored(msg.user)) {
            cache.users = String(msg.msg).replace('addpoint ', '');
            if (cache.users.length > 0) {
                cache.users = cache.users.split(' ');
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

function rmpoint(client, msg) {
    'use strict';
    var cache = {},
        i;

    if (checkDB(client) && checkMsg(msg)) {
        if (!client.bot.db.ignored(msg.user)) {
            cache.users = String(msg.msg).replace('rmpoint ', '');
            if (cache.users.length > 0) {
                cache.users = cache.users.split(' ');
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
module.exports.points = points;
module.exports.addpoint = addpoint;
module.exports.rmpoint = rmpoint;
module.exports.ignore = ignore;
module.exports.unignore = unignore;
module.exports.admin = admin;
module.exports.unadmin = unadmin;