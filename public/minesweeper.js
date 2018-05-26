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

function doDrag(e) {
    var pos = getRealMousePos(e);
    var diffx = pos.x - dragStart.x;
    var diffy = pos.y - dragStart.y;
    center.x = dragStartCenter.x - diffx/(tilesize*tilescale);
    center.y = dragStartCenter.y - diffy/(tilesize*tilescale);
    console.log(diffx/(tilesize*tilescale))
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