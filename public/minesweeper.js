var c = document.getElementById('canvas');
var canvas = c.getContext('2d');

var socket = io();

var tiles = [];
var dimensions;

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

socket.on('dimensions', function(dim){
    preload();
    dimensions = JSON.parse(dim);
    center = new Position(dimensions.width/2, dimensions.height/2);
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
    draw();
});

function imgsloaded() {
    draw();
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

function draw() {
    var width = 800;//window.innerWidth;
    var height = 800;//window.innerHeight;
    
    leftmost  = Math.round(center.x - ((width /2)/(tilesize*tilescale) + 1));
    rightmost = Math.round(center.x + ((width /2)/(tilesize*tilescale) + 1));
    upmost    = Math.round(center.y - ((height/2)/(tilesize*tilescale) + 1));
    downmost  = Math.round(center.y + ((height/2)/(tilesize*tilescale) + 1));
    console.log(''+leftmost+' '+rightmost+' '+upmost+' '+downmost);

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
    
}

function clickTile(pos) {
    var x = pos.x;
    var y = pos.y;
    if (x < 0 || x >= dimensions.width || y < 0 || y >= dimensions.height) {
        return;
    }
    socket.emit('tc', JSON.stringify(pos));
}

function flagTile(pos) {
    var x = pos.x;
    var y = pos.y;
    if (x < 0 || x >= dimensions.width || y < 0 || y >= dimensions.height) {
        return;
    }
    socket.emit('fl', JSON.stringify(pos));
}

function getMousePos(e) {
    var rect = c.getBoundingClientRect();
    var mouseX = e.clientX - rect.left;
    var mouseY = e.clientY - rect.top;
    var x = Math.floor(mouseX/(tilesize*tilescale)) + leftmost;
    var y = Math.floor(mouseY/(tilesize*tilescale)) + upmost;
    var pos = new Position(x, y);
    return pos;
}

var mouse = [false, false, false];

function canvasClicked(e) {
    var pos = getMousePos(e)
    clickTile(pos);
}
c.addEventListener("click", canvasClicked);

function canvasRightClicked(e) {
    var pos = getMousePos(e);
    flagTile(pos);
    return false;
}
c.addEventListener("contextmenu", canvasRightClicked);