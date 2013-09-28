var io = require('socket.io').listen(8081);
var fs = require('fs');

// /// map
 var map;

fs.readFile( __dirname + '/maps/map1.json', 'utf8', function(err, data) {
		if (err) {
			throw err;
		}
		map = JSON.parse(data);
		console.log(map);
	})

var players = [];

/// client
var Player = function (socket) {
	this.socket = socket;
	this.createDisconnectCallback(this);
	this.createKeyDownCallback(this);

	this.xPos = 1;
	this.yPos = 1;
};
Player.prototype.createDisconnectCallback = function(player) {
	player.socket.on('disconnect', function() {
		console.log('Client disconnected.');

		for (var i = 0; i < players.length; i++) {
			if (players[i].socket.id == player.socket.id) {
				players.splice(i, 1);
			}
		}

		player.socket.broadcast.emit('playerDisconnected', { id : player.socket.id });
	});
}
Player.prototype.createKeyDownCallback = function(player) {
	// movement
	player.socket.on('keyDown', function(data, fn) {

		switch(data.keyCode) {
			case 37: // left
				if (player.xPos > 0 && map.map[player.yPos][player.xPos - 1] != 0)
					player.xPos--;
			break;
			
			case 38: // up
				if (player.yPos > 0 && map.map[player.yPos - 1][player.xPos] != 0)
					player.yPos--;
			break;
			
			case 39: // right
				if (player.xPos < map.map[player.yPos].length - 1 && map.map[player.yPos][player.xPos + 1] != 0)
					player.xPos++;
			break;
			
			case 40: // down
				if (player.yPos < map.map.length - 1 && map.map[player.yPos + 1][player.xPos] != 0)
					player.yPos++;
			break;
				
		}

		// update the client on the new player position
		fn({ x : player.xPos, y : player.yPos });

		// update other clients on this players position
		player.socket.broadcast.emit('updatePlayer', { id : player.socket.id, x : player.xPos, y : player.yPos });
	})
}
Player.prototype.notifyPeersConnected = function() {
	this.socket.broadcast.emit('playerConnected', { id : this.socket.id, x : this.xPos, y : this.yPos });
}

/// sockets
io.sockets.on('connection', function(socket) {
	console.log('Client connected.');

	socket.emit('updateMap', { map : map });

	// inform the player that connected of all connected peers
	for (var i = 0; i < players.length; i++) {
		var peer = players[i];
		socket.emit('playerConnected', { id : peer.socket.id, x : peer.xPos, y : peer.yPos })
	}

	// add the player to the connected peers
	var player = new Player(socket);
	players.push(player);

	// notify peers that this player connected
	player.notifyPeersConnected();
});