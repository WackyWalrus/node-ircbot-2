function send(client, command) {
    'use strict';
    client.write(command + '\n');
}

function echo(client, msg) {
    'use strict';
    var command = 'PRIVMSG ' + msg.channel + ' :' + String(msg.msg).replace('echo ', '');
    console.log(command);
    send(client, command);
}

module.exports.echo = echo;