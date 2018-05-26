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

class User {
    constructor(name, socket) {
        this.name = name;
        this.socket = socket;
        this.stats = {
            name: this.name,
            tilesfound: [0, 0, 0, 0, 0, 0, 0, 0, 0],
            total: 0,
            deaths: 0,
            currentstreak: 0,
            beststreak: 0
        };
        this.dead = false;
        this.respawntime = 6000;
    }

    setpass(password) {
        this.hash = sha256(password);
    }

    checkpass(password) {
        return this.hash == sha256(password);
    }

    died() {
        this.stats.deaths++;
        this.dead = true;
        if (this.stats.currentstreak > this.stats.beststreak) {
            this.stats.beststreak = this.stats.currentstreak;
        }
        this.stats.currentstreak = 0;
        setTimeout(this.respawn, this.respawntime, this);
        if (this.socket != null) {
            this.socket.emit('dead', this.respawntime/1000);
        }
    }

    respawn(user) {
        user.dead = false;
        user.socket.dead = false;
        if (user.socket != null) {
            user.socket.emit('respawn');
        }
    }
    
    addstat(adj) {
        this.stats.tilesfound[adj]++;
        this.stats.total++;
        this.stats.currentstreak++;
    }

    isBetterThan(user) {
        if (this.stats.beststreak > user.stats.beststreak) return true;
        return false;
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
        setInterval(function(){
            io.emit('stats', JSON.stringify(socket.user.stats));
        }, 10000);
    });

    // TODO rewrite the password system so that the password can come before the username
    socket.on('login', function(login){
        var user = login.usn;
        var password = login.pass;
        if (userRe.test(user) == false) {
            return;
        }
        socket.username = user;
        if (users[user] == null) {
            socket.newuser = true;
        } else {
            socket.newuser = false;
            socket.user = users[user];
        }
        if (password.length < 4) {
            return;
        }
        if (socket.newuser) {
            users[socket.username] = new User(user, socket);
            socket.user = users[socket.username];
            socket.user.setpass(password);
            socket.emit('loginsuccess', socket.username);
            socket.emit('dimensions', JSON.stringify(dimensions));
            socket.loggedin = true;
        }
        else {
            if (users[socket.username].checkpass(password)) {
                socket.emit('loginsuccess');
                socket.emit('dimensions', JSON.stringify(dimensions));
                socket.loggedin = true;
                socket.user = users[socket.username];
                socket.user.socket = socket;
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
    if (!socket.loggedin || socket.user.dead) {
        //console.log(socket.user.dead);
        return;
    }
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
        if (tile.mine) {
            socket.user.died();
        }
        else {
            socket.user.addstat(tile.adjacent);
        }
        sendTile(pos);
        if (tile.adjacent == 0 && !tile.mine) {
            for (var i=-1; i<=1; i++) {
                for (var j=-1; j<=1; j++) {
                    tileClicked(socket, new Position(x+i, y+j));
                }
            }
        }
    }
}

function tileFlagged(socket, pos) {
    if (!socket.loggedin || socket.user.dead) return;
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