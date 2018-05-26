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

socket.on('dimensions', function(dim){
    dimensions = JSON.parse(dim);
    for (var x=0; x<dimensions.height; x++) {
        tiles.push([]);
        for (var y=0; y<dimensions.width; y++) {
            tiles[x].push(new Tile(x, y));
        }
    }
    socket.emit('ready');
});

// load the images
var images = {};

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

var center = new Position(64, 64);

function setup() {
    createCanvas(800, 600);
    document.getElementsByClassName('p5Canvas').oncontextmenu = function(e) {
        e.preventDefault();
        return false;
    }
}

function drawTile(x, y, pos, scale) {
    if (x < 0 || x > dimensions.width || y < 0 || y > dimensions.height) {
        return;
    }

    var t = tiles[x][y];
    var img;
    if (t.revealed) {
        if (t.mine) {
            img = images['clickedmine'];
        }
        else {
            img = images['adj'][t.adjacent];
        }
    }
    else {
        if (t.flag) {
            img = images['flag'];
        }
        else {
            img = images['unrevealed'];
        }
    }
    image(img, pos.x, pos.y, tilesize*tilescale, tilesize*tilescale);
}

function draw() {
    var width = 800;//window.innerWidth;
    var height = 600;//window.innerHeight;
    
    var leftmost  = Math.round(center.x - ((width /2)/tilesize + 1));
    var rightmost = Math.round(center.x + ((width /2)/tilesize + 1));
    var upmost    = Math.round(center.y - ((height/2)/tilesize + 1));
    var downmost  = Math.round(center.y + ((height/2)/tilesize + 1));
    //console.log(''+leftmost+' '+rightmost+' '+upmost+' '+downmost);

    var pos = {}
    pos.x = 0;
    pos.y = 0;

    for (var x=leftmost; x<=rightmost; x++) {
        pos.x = 0;
        for (var y=upmost; y<=downmost; y++) {
            drawTile(x, y, pos, tilescale);
            pos.x += 16;
        }
        pos.y += 16;
    }
    
}