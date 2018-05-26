var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sha256 = require('js-sha256');

var dimensions = {};
dimensions.width = 64;
dimensions.height = 64;
var minedensity = 0.15;

class Tile {
    constructor(x, y) {
        this.revealed = false;
        this.mine = false;
        this.adjacent = 0;
        this.flagged = false;
        this.position = new Position(x, y);
    }
}

class Position {
    constructor(x, y) {
        this.x = Math.round(x);
        this.y = Math.round(y);
    }
}

// generate the board
var tiles = [];
for (var x=0; x<dimensions.height; x++) {
    tiles[x] = [];
    for (var y=0; y<dimensions.width; y++) {
        tiles[x][y] = new Tile(x, y);
    }
}
// insert mines
for (var x=0; x<dimensions.width; x++) {
    for (var y=0; y<dimensions.height; y++) {
        if (Math.random() < minedensity) {
            tiles[x][y].mine = true;
            // update adjacent number for adjacent tiles
            for (var j=-1; j<=1; j++) {
                if (y+j < 0 || y+j >= dimensions.height) {
                    continue;
                }
                for (var i=-1; i<=1; i++) {
                    if (x+i < 0 || x+i >= dimensions.width) {
                        continue;
                    }
                    tiles[x+i][y+j].adjacent++;
                }
            }
        }
    }
}

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.use(express.static('public'));

var userRe = /^\w*$/;

var users = {};

io.on('connection', function(socket){
    console.log('a user connected');
    socket.emit('dimensions', JSON.stringify(dimensions));
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

    socket.loggedin = false;

    socket.on('tc', function(pos){
        tileClicked(socket, pos);
    });

    socket.on('fl', function(pos){
        tileFlagged(socket, pos);
    });

    socket.on('ready', function(){
        for (var x=0; x<dimensions.width; x++) {
            for (var y=0; y<dimensions.height; y++) {
                if (tiles[x][y].revealed || tiles[x][y].flagged) {
                    sendTile(new Position(x, y));
                }
            }
        }
    });

    socket.on('user', function(user){
        if (userRe.test(user) == false) {
            return;
        }
        socket.user = user;
        if (users[user] == null) {
            socket.newuser = true;
        } else {
            socket.newuser = false;
        }
    });

    socket.on('password', function(password){
        if (password.length < 4) {
            return;
        }
        var hash = sha256(password);
        if (socket.newuser) {
            users[socket.user] = {};
            users[socket.user].hash = hash;
            socket.emit('loginsuccess');
            socket.loggedin = true;
        }
        else {
            if (users[socket.user].hash == hash) {
                socket.emit('loginsuccess');
                socket.loggedin = true;
            }
            else {
                socket.emit('loginfail');
            }
        }
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});

function sendTile(pos) {
    var t = new Tile(pos.x, pos.y);
    t.flagged = tiles[pos.x][pos.y].flagged;
    if (tiles[pos.x][pos.y].revealed) {
        t = tiles[pos.x][pos.y];
    }
    io.emit('tile', t);
}

function tileClicked(socket, pos) {
    if (!socket.loggedin) return;
    if (typeof pos == "string") pos = JSON.parse(pos);
    var x = pos.x;
    var y = pos.y;
    console.log(x+' '+y);
    if (x < 0 || x >= dimensions.width || y < 0 || y >= dimensions.height) {
        return;
    }
    var tile = tiles[x][y];
    if (!tile.revealed) {
        tile.revealed = true;
        tile.flagged = false;
        sendTile(pos);
        if (tile.adjacent == 0) {
            console.log("brow");
            for (var i=-1; i<=1; i++) {
                for (var j=-1; j<=1; j++) {
                    tileClicked(socket, new Position(x+i, y+j));
                }
            }
        }
    }
}

function tileFlagged(socket, pos) {
    if (!socket.loggedin) return;
    if (typeof pos == "string") pos = JSON.parse(pos);
    var x = pos.x;
    var y = pos.y;
    console.log('flag '+x+' '+y);
    if (x < 0 || x >= dimensions.width || y < 0 || y >= dimensions.height) {
        return;
    }
    var tile = tiles[x][y];
    if (tile.flagged || tile.revealed) {
        tile.flagged = false;
    }
    else {
        tile.flagged = true;
    }
    sendTile(pos);
}