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

var username;

socket.on('loginsuccess', function(usn){
    document.getElementById('loginform').hidden = true;
    document.getElementById('canvas').hidden = false;
    username = usn;
    console.log('logged in as:'+ usn);
});

socket.on('loginfail', function(){
    document.getElementById('loginerror').innerHTML = "A user with this name already exists and the password doesn't match.";
});

var mystat;
var userstats = {};
var onlineusers = new Set();
socket.on('stats', function(stats) {
    console.log(stats);
    stats = JSON.parse(stats);
    if (stats.name == username) {
        mystat = stats;
    }
    userstats[stats.name] = stats;
    onlineusers.add(stats.name);
    console.log(onlineusers);
})

socket.on('dimensions', function(dim){
    preload();
    dimensions = JSON.parse(dim);
    console.log(dimensions);
    for (var x=0; x<dimensions.width; x++) {
        tiles.push([]);
        for (var y=0; y<dimensions.height; y++) {
            tiles[x].push(new Tile(x, y));
        }
    }
    socket.emit('ready');
});

var bbox;
var topLeft = new Position(-1, -1);
var initialLoadDone = false;
socket.on('tile', function(tile){
    tile = JSON.parse(tile);
    var x = tile.position.x;
    var y = tile.position.y;
    tiles[x][y] = tile;
    if (bbox == null) {
        console.log("hey"+x+' '+y);
        bbox = {
            left: x,
            right: x,
            up: y,
            down: y
        };
        topLeft = new Position(x, y);
    }
    bbox.left = Math.min(bbox.left, x);
    bbox.right = Math.max(bbox.right, x);
    bbox.up = Math.min(bbox.up, y);
    bbox.down = Math.max(bbox.down, y);
    //if (initialLoadDone) draw();
});

socket.on('doneload', function(){
    initialLoadDone = true;
    if (bbox==null) {
        topLeft.x = dimensions.width/2;
        topLeft.y = dimensions.height/2;
        bbox = {};
        bbox.left = topLeft.x;
        bbox.right = topLeft.x;
        bbox.up = topLeft.y;
        bbox.down = topLeft.y;
    }
    draw();
});

class Cursor {
    constructor(user, pos) {
        this.user = user;
        this.pos = pos;
    }

    move(pos) {
        this.tpos = pos;
        this.intv = setInterval(function(cursor){
            cursor.pos.x = (cursor.pos.x + cursor.tpos.x)/2;
            cursor.pos.y = (cursor.pos.y + cursor.tpos.y)/2;
            if (cursor.pos.x == cursor.tpos.x && cursor.pos.y == cursor.tpos.y) {
                clearInterval(cursor.intv);
            }
            if (cursor.pos.x > leftmost - 50 && cursor.pos.x < rightmost && cursor.pos.y > upmost - 50 && cursor.pos.y < downmost) {
                draw();
            }
        }, 50, this);
        
    }

    draw() {
        if (cursor.pos.x > leftmost - 50 && cursor.pos.x < rightmost && cursor.pos.y > upmost - 50 && cursor.pos.y < downmost) {
            canvas.drawImage(images['cursor'], (cursor.pos.x-leftmost+0.5)*(tilesize*tilescale), (cursor.pos.y-upmost+0.5)*(tilesize*tilescale));
        }
    }
}

// var cursors = {};
// socket.on('cursor', function(cursor){
//     cursor = JSON.parse(cursor);
//     var user = cursor.user;
//     var pos = cursor.pos;
//     if (cursors[user] == null) {
//         cursors[user] = new Cursor(user, pos);
//     }
//     cursors[user].move(pos);
// })

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
    resizeWindow();
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
    images['cursor'] = loadImage('cursor.png');
}

var tilesize = 16;
var tilescale = 1;

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
var margin = 4;

function updateDrawBox() {
    var w = width/(tilesize*tilescale);
    var h = height/(tilesize*tilescale);
    leftmost  = Math.round(topLeft.x);
    rightmost = Math.round(topLeft.x + width/(tilesize*tilescale));
    upmost    = Math.round(topLeft.y);
    downmost  = Math.round(topLeft.y + height/(tilesize*tilescale));

    // if (rightmost > bbox.right + margin) {
    //     topLeft.x = bbox.right + margin - w;
    //     leftmost  = Math.round(topLeft.x);
    //     rightmost = Math.round(topLeft.x + width/(tilesize*tilescale));
    // } if (downmost > bbox.down + margin) {
    //     topLeft.y = bbox.down + margin - h;
    //     upmost    = Math.round(topLeft.y);
    //     downmost  = Math.round(topLeft.y + height/(tilesize*tilescale));
    // }
    // if (leftmost < bbox.left - margin) {
    //     topLeft.x = bbox.left - margin;
    //     leftmost  = Math.round(topLeft.x);
    //     rightmost = Math.round(topLeft.x + width/(tilesize*tilescale));
    // } if (upmost < bbox.up - margin) {
    //     topLeft.y = bbox.up - margin;
    //     upmost    = Math.round(topLeft.y);
    //     downmost  = Math.round(topLeft.y + height/(tilesize*tilescale));
    // }
    // if (bbox.right - bbox.left < w) {
    //     topLeft.x = (bbox.right+bbox.left)/2;
    // }
    // if (bbox.down - bbox.up < h) {
    //     topLeft.y = (bbox.down+bbox.left)/2;
    // }
}

window.addEventListener("resize", resizeWindow);
document.addEventListener('webkitfullscreenchange', resizeWindow);
document.addEventListener('mozfullscreenchange', resizeWindow);
document.addEventListener('fullscreenchange', resizeWindow);

function resizeWindow() {
    c.width = window.innerWidth;
    c.height = window.innerHeight-5;
    width = c.width;
    height = c.height;
}

var t = tilesize * tilescale;

function drawStats(name, pos, corner) {
    
    rect = {
        tl: new Position(pos.x + t/2, pos.y + t/2)
    }
    canvas.fillStyle = "white";
    canvas.fillRect(
        rect.tl.x,
        rect.tl.y,
        17*t,
        7*t
    );
    canvas.fillStyle = "black";
    canvas.textAlign = "left";
    canvas.font = "16px courier";
    canvas.fillText(name, rect.tl.x + t/2, rect.tl.y + t*1.5);
    for (var i = 1; i <= 8; i++) {
        if (userstats[name].tilesfound[i] == 0) continue;
        canvas.drawImage(images.adj[i], rect.tl.x+(t/2)+t*4*(i-1)%4, rect.tl.y+(t*1.5)+t*Math.floor(i/4));
    }
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

    drawStats(username, new Position(0, 0), "topLeft");

    // var statsw = 96; var statsh = 256;
    // canvas.fillStyle = "#00000088";
    // canvas.fillRect(0+8+4, 0+8+4, statsw, statsh);
    // canvas.fillStyle = "white";
    // canvas.fillRect(0+8, 0+8, statsw, statsh);
    // canvas.font = "16px courier";
    // canvas.textAlign = "left";


    // var xbasei = 16;
    // var ybasei = 16;
    // var xbaset = 36;
    // var ybaset = 30;
    // var i = 1;
    // canvas.fillStyle = "#0000ff";
    // canvas.drawImage(images.adj[i], xbasei, ybasei);
    // canvas.fillText(mystat.tilesfound[i], xbaset, ybaset);

    // ybasei+=16;
    // ybaset+=16;
    // i++;
    // canvas.fillStyle = "#008000";
    // canvas.drawImage(images.adj[i], xbasei, ybasei);
    // canvas.fillText(mystat.tilesfound[i], xbaset, ybaset);

    // ybasei+=16;
    // ybaset+=16;
    // i++;
    // canvas.fillStyle = "#800000";
    // canvas.drawImage(images.adj[i], xbasei, ybasei);
    // canvas.fillText(mystat.tilesfound[i], xbaset, ybaset);

    // ybasei+=16;
    // ybaset+=16;
    // i++;
    // canvas.fillStyle = "#000080";
    // canvas.drawImage(images.adj[i], xbasei, ybasei);
    // canvas.fillText(mystat.tilesfound[i], xbaset, ybaset);

    // ybasei+=16;
    // ybaset+=16;
    // i++;
    // canvas.fillStyle = "#800000";
    // canvas.drawImage(images.adj[i], xbasei, ybasei);
    // canvas.fillText(mystat.tilesfound[i], xbaset, ybaset);

    // ybasei+=16;
    // ybaset+=16;
    // i++;
    // canvas.fillStyle = "#008080";
    // canvas.drawImage(images.adj[i], xbasei, ybasei);
    // canvas.fillText(mystat.tilesfound[i], xbaset, ybaset);

    // ybasei+=16;
    // ybaset+=16;
    // i++;
    // canvas.fillStyle = "#000000";
    // canvas.drawImage(images.adj[i], xbasei, ybasei);
    // canvas.fillText(mystat.tilesfound[i], xbaset, ybaset);

    // ybasei+=16;
    // ybaset+=16;
    // i++;
    // canvas.fillStyle = "#808080";
    // canvas.drawImage(images.adj[i], xbasei, ybasei);
    // canvas.fillText(mystat.tilesfound[i], xbaset, ybaset);
    // for (var i=1; i<=4; i++) {
    //     canvas.drawImage(images.adj[i], 16, ypos);
    //     canvas.fillText
    //     ypos += 16;
    // }
    // var ypos = 16;
    // for (var i=5; i<=8; i++) {
    //     canvas.drawImage(images.adj[i], 96, ypos);
    //     ypos += 16;
    // }
    console.log(onlineusers.keys());
    onlineusers.forEach( function(user, _a, _b) {
        var pos = worldToScreenCoords(userstats[user].cursor);
        console.log(pos);
        canvas.drawImage(
            images.cursor, 
            pos.x+(tilesize*tilescale)/2, 
            pos.y+(tilesize*tilescale)/2);
    });

    if (dead) {
        canvas.fillStyle = "#00000088";
        canvas.fillRect(0, 0, width, height);
        canvas.font = "100px courier";
        canvas.textAlign = "center";
        canvas.fillText(respawntime, width/2, height/2);
    }
    
}

function worldToScreenCoords(pos) {
    return new Position(
        (pos.x - topLeft.x)*(tilesize*tilescale),
        (pos.y - topLeft.y)*(tilesize*tilescale)
    );
}

function screenToWorldCoords(pos) {
    return new Position(
        pos.x/(tilesize*tilescale) + topLeft.x,
        pos.y/(tilesize*tilescale) + topLeft.y
    );
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
var dragStartTL = new Position(0, 0);

function startDrag(pos) {
    drag = true;
    dragStart = pos;
    dragStartTL.x = topLeft.x;
    dragStartTL.y = topLeft.y;
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
    topLeft.x = dragStartTL.x - diffx/(tilesize*tilescale);
    topLeft.y = dragStartTL.y - diffy/(tilesize*tilescale);
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