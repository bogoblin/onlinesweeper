var c = document.getElementById('canvas');
var canvas = c.getContext('2d');

var socket = io();

var tiles = [];
var dimensions;

var bbox = {};

class Position {
    constructor(x, y) {
        this.x = Math.round(x);
        this.y = Math.round(y);
    }
}

class Tile {
    constructor(x, y) {
        this.revealed = false;
        this.mine = false;
        this.adjacent = 0;
        this.flagged = false;
        this.position = new Position(x, y);
    }
}

var center;
var username;

socket.on('loginsuccess', function(usn){
    document.getElementById('loginform').hidden = true;
    document.getElementById('canvas').hidden = false;
    username = usn;
    console.log(usn);
});

socket.on('loginfail', function(){
    document.getElementById('loginerror').innerHTML = "A user with this name already exists and the password doesn't match.";
});

socket.on('stats', function(stats) {
    stats = JSON.parse(stats);
    console.log(username+' '+stats.name);
    if (stats.name == username) {
        console.log("hi");
        var statbox = document.getElementById('mystats');
        statbox.hidden = false;
        var tilestats = statbox.getElementsByClassName('tilestat');
        for (var i=0; i<=8; i++) {
            tilestats[i].innerHTML = stats.tilesfound[i];
        }
    }
})

socket.on('dimensions', function(dim){
    preload();
    dimensions = JSON.parse(dim);
    center = new Position(dimensions.width/2, dimensions.height/2);
    bbox.left = center.x;
    bbox.right = center.x;
    bbox.up = center.y;
    bbox.down = center.y;
    console.log(dimensions);
    for (var x=0; x<dimensions.width; x++) {
        tiles.push([]);
        for (var y=0; y<dimensions.height; y++) {
            tiles[x].push(new Tile(x, y));
        }
    }
    socket.emit('ready');
});

socket.on('tile', function(tile){
    var x = tile.position.x;
    var y = tile.position.y;
    tiles[x][y] = tile;
    bbox.left = Math.min(bbox.left, x);
    bbox.right = Math.max(bbox.right, x);
    bbox.up = Math.min(bbox.up, y);
    bbox.down = Math.max(bbox.down, y);
    draw();
});

var dead = false;
var respawntime = 0;

socket.on('dead', function(resptime){
    dead = true;
    respawntime = resptime;
    setTimeout(updateRespawnTimer, 1000);
});

function updateRespawnTimer() {
    respawntime--;
    draw();
    if (respawntime == 0) {
        dead = false;
        draw();
        return;
    }
    setTimeout(updateRespawnTimer, 1000);
}

function imgsloaded() {
    draw();
}

var userRe = /^\w*$/;
var loggedin = false;

function login() {
    var form = document.getElementById('login');
    var user = form.elements[0].value;
    if (userRe.test(user) == false) {
        document.getElementById('loginerror').innerHTML = 'Usernames can only contain alphanumeric characters and underscores.';
        return;
    }
    var password = form.elements[1].value;
    if (password.length < 4) {
        document.getElementById('loginerror').innerHTML = 'Your password must contain at least 4 characters.';
        return;
    }
    socket.emit('login', {usn:user, pass:password});
}

// load the images
var images = {};
var loadedimgs = 0;
var totalimgs = 0;

function loadImage(path) {
    totalimgs++;
    var img = new Image();
    img.onload = function() {
        loadedimgs++;
        if (loadedimgs == totalimgs) imgsloaded();
    }
    img.src = path;
    return img;
}

function preload() {
    images['adj'] = [];
    for (var i=0; i<=8; i++) {
        images['adj'].push(loadImage('tiles/'+i+'.png'));
    }
    images['unrevealed'] = loadImage('tiles/unrevealed.png');
    images['flag'] = loadImage('tiles/flag.png');
    images['clickedmine'] = loadImage('tiles/clickedmine.png');
}

var tilesize = 16;
var tilescale = 1;

//var hi = setInterval(draw(), 1000);

function drawTile(x, y, pos, scale) {

    if (x < 0 || y < 0 || x >= dimensions.width || y >= dimensions.height) return;
    
    var t = tiles[x][y];
    var img = images['unrevealed'];
    if (t.revealed) {
        if (t.mine) {
            img = images['clickedmine'];
        }
        else {
            img = images['adj'][t.adjacent];
        }
    }
    else {
        if (t.flagged) {
            img = images['flag'];
        }
        else {
            img = images['unrevealed'];
        }
    }
    //image(img, pos.x, pos.y, tilesize*tilescale, tilesize*tilescale);
    canvas.drawImage(img, pos.x, pos.y);
}

var leftmost, rightmost, upmost, downmost;


var width = 800;
var height = 800;

function updateDrawBox() {
    leftmost  = Math.round(center.x - ((width /2)/(tilesize*tilescale) ));
    rightmost = Math.round(center.x + ((width /2)/(tilesize*tilescale) ));
    upmost    = Math.round(center.y - ((height/2)/(tilesize*tilescale) ));
    downmost  = Math.round(center.y + ((height/2)/(tilesize*tilescale) ));
}

function draw() {

    canvas.fillStyle = "black";
    canvas.fillRect(0, 0, width, height);
    
    updateDrawBox();

    var pos = {}
    pos.x = 0;
    pos.y = 0;

    for (var x=leftmost; x<=rightmost; x++) {
        pos.y = 0;
        for (var y=upmost; y<=downmost; y++) {
            drawTile(x, y, pos, tilescale);
            pos.y += 16;
        }
        pos.x += 16;
    }

    if (dead) {
        canvas.fillStyle = "#00000088";
        canvas.fillRect(0, 0, width, height);
        canvas.font = "100px courier";
        canvas.textAlign = "center";
        canvas.fillText(respawntime, width/2, height/2);
    }
    
}

function clickTile(pos) {
    var x = pos.x;
    var y = pos.y;
    if (x < 0 || x >= dimensions.width || y < 0 || y >= dimensions.height) {
        return;
    }
    if (!tiles[x][y].revealed) {
        socket.emit('tc', JSON.stringify(pos));
    }
}

function flagTile(pos) {
    var x = pos.x;
    var y = pos.y;
    if (x < 0 || x >= dimensions.width || y < 0 || y >= dimensions.height) {
        return;
    }
    if (!tiles[x][y].revealed) {
        socket.emit('fl', JSON.stringify(pos));
    }
}

function chordTile(pos) {
    var x = pos.x;
    var y = pos.y;
    if (x < 0 || x >= dimensions.width || y < 0 || y >= dimensions.height) {
        return;
    }
    var t = tiles[x][y];
    if (t.adjacent == 0) {
        return;
    }
    var adjacentMinesAndFlags = 0;
    for (var i=-1; i<=1; i++) {
        for (var j=-1; j<=1; j++) {
            if (tiles[x+i][y+j].flagged || tiles[x+i][y+j].mine) {
                adjacentMinesAndFlags++;
            }
        }
    }
    if (adjacentMinesAndFlags == t.adjacent) {
        for (var i=-1; i<=1; i++) {
            for (var j=-1; j<=1; j++) {
                if (!tiles[x+i][y+j].flagged && !tiles[x+i][y+j].revealed) {
                    clickTile(new Position(x+i, y+j));
                }
            }
        }
    }
}

var drag;
var dragStart;
var dragStartCenter = new Position(0, 0);

function startDrag(pos) {
    drag = true;
    dragStart = pos;
    dragStartCenter.x = center.x;
    dragStartCenter.y = center.y;
    c.addEventListener("mousemove", doDrag);
}

function stopDrag(pos) {
    drag = false;
    c.removeEventListener("mousemove", doDrag);
}

var margin = 4;

function doDrag(e) {
    var pos = getRealMousePos(e);
    var diffx = pos.x - dragStart.x;
    var diffy = pos.y - dragStart.y;
    center.x = dragStartCenter.x - diffx/(tilesize*tilescale);
    center.y = dragStartCenter.y - diffy/(tilesize*tilescale);
    var w = width/(tilescale*tilesize);
    var h = height/(tilescale*tilesize);
    draw();
}

function getRealMousePos(e) {
    var rect = c.getBoundingClientRect();
    var mouseX = e.clientX - rect.left;
    var mouseY = e.clientY - rect.top;
    return new Position(mouseX, mouseY);
}

function getMousePos(e) {
    var mouse = getRealMousePos(e);
    var x = Math.floor(mouse.x/(tilesize*tilescale)) + leftmost;
    var y = Math.floor(mouse.y/(tilesize*tilescale)) + upmost;
    var pos = new Position(x, y);
    return pos;
}

var mouse = [false, false, false];

function canvasClicked(e) {
    var pos = getMousePos(e);
    if (e.button == 2) {
        flagTile(pos);
    }
    else if (!drag && e.button == 1) {
        var pos = getRealMousePos(e);
        startDrag(pos);
    }
    mouse[e.button] = true;
}
c.addEventListener("mousedown", canvasClicked);

function canvasReleased(e) {
    var pos = getMousePos(e);
    if (drag && e.button == 1) {
        stopDrag();
    }
    else if (mouse[0] && e.button == 0) {
        clickTile(pos);
    }
    if (e.button == 0 && mouse[2]) {
        chordTile(pos);
    }
    mouse[e.button] = false;
}
c.addEventListener("mouseup", canvasReleased);

c.addEventListener("contextmenu", function(e){return false;});