function send(client, command) {
	client.write(command + '\n');
}

function echo(client, msg) {
	var command = 'PRIVMSG ' + msg.channel + ' :' + String(msg.msg).replace('echo ', '');
	console.log(command);
	send(client, command);
}

module.exports.echo = echo;