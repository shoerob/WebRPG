var canvas;
var ctx;

/// map
var map = [];
var players = [];

var tileSize = 16;

/// Player
var Player = function(data) {
	this.id = data.id;
	this.xPos = data.x;
	this.yPos = data.y;
};
Player.prototype.update = function(data) {
	this.xPos = data.x;
	this.yPos = data.y;
}

// character
var socket;
var charX = 1;
var charY = 1;

var Engine = function(canvas) {
	canvas = canvas;
	ctx = canvas.getContext('2d');

}
Engine.prototype.start = function() {

	// connect to socket.io
	socket = io.connect('http://localhost:8081');

	// update movement of another player
	socket.on('updatePlayer', function(data) {
		for (var i = 0; i < players.length; i++) {
			if (players[i].id == data.id) {
				players[i].update(data);
			}
		}
	});

	// another player connected
	socket.on('playerConnected', function(data) {
		console.log('Player connected.');
		players.push(new Player(data));
	});

	// another player disconnected
	socket.on('playerDisconnected', function(data) {
		console.log('Player disconnected.');
		for (var i = 0; i < players.length; i++) {
			if (players[i].id == data.id) {
				players.splice(i, 1);
			}
		}
	});

	// a new map was loaded
	socket.on('updateMap', function(data) {
		map = data.map;
		console.log(map);
	});

	// start the update/render loop
	setInterval(this.render, 60);
}

Engine.prototype.render = function() {
	ctx.clearRect(0,0,640,480);

	// render map
	for (var i = 0; i < map.map.length; i++) {
		for (var j = 0; j < map.map[i].length; j++) {
			if (map.map[i][j] == 0)
				ctx.fillStyle = "rgb(200,200,200)";
				
			if (map.map[i][j] == 1)
				ctx.fillStyle = "rgb(200,0,0)";

			if (map.map[i][j] == 2)
				ctx.fillStyle = "rgb(200,200,0)";

			ctx.fillRect (j * tileSize, i * tileSize, tileSize, tileSize);
		}
	}

	// render character
	ctx.fillStyle = "rgb(0,200,0)";
	ctx.fillRect (charX * tileSize, charY * tileSize, tileSize, tileSize);

	// render peers
	for (var i = 0; i < players.length; i++) {
		var player = players[i];
		ctx.fillStyle = "rgb(0,200,0)";
		ctx.fillRect (player.xPos * tileSize, player.yPos * tileSize, tileSize, tileSize);
	}
}

function onKeyDown(event) {
	socket.emit('keyDown', { keyCode : event.keyCode }, function(position) {
		charX = position.x;
		charY = position.y;
	});
}

function onKeyUp(event) {
	
}