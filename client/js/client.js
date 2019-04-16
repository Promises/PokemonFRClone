var mapData; //(with path)
var socket = io();





function loadJSON(callback) {

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', '/client/js/worldMap.json', true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(JSON.parse(xobj.responseText));
        }
    };
    xobj.send(null);
}

function main(foo) {
    mapData = foo;
    var debug = false;
    var loggedIn = false;
    var signDiv = document.getElementById('signDiv');
    var gameDiv = document.getElementById('gameDiv');
    var signDivUsername = document.getElementById('signDiv-username');
    var signDivPassword = document.getElementById('signDiv-password');
    var signDivSignIn = document.getElementById('signDiv-signIn');
    var signDivSignUp = document.getElementById('signDiv-signUp');


    signDivSignIn.onclick = function () {
        socket.emit('signIn', {username: signDivUsername.value, password: signDivPassword.value});
    };

    signDivSignUp.onclick = function () {
        socket.emit('signUp', {username: signDivUsername.value, password: signDivPassword.value});
    };
    var player = null;

    var timeDiff = 0;

    var players = [];

    socket.on('timeUpdate', function (data) {
        timeDiff = data.time - Date.now();
    });

    socket.on('signInResponse', function (data) {
        if (data.success) {
            console.log(data);
            player = new Character();
            var playerdata = data.player;
            player.tileFrom = [playerdata.tileFrom.x, playerdata.tileFrom.y];
            player.tileTo = [playerdata.tileTo.x, playerdata.tileTo.y];
            player.timeMoved = playerdata.timeMoved;
            player.position = [playerdata.x, playerdata.y];
            player.id = playerdata.id;
            loggedIn = true;

            signDiv.style.display = 'none';
            gameDiv.style.display = 'inline-block';
        } else {
            alert('Username or password error')
        }
    });


// game
    var chatText = document.getElementById('chat-text');
    var chatInput = document.getElementById('chat-input');
    var chatForm = document.getElementById('chat-form');
    var ctx = document.getElementById('ctx').getContext('2d');


    var mapW = mapData.width;
    var mapH = mapData.height;
    var tileH = mapData.tileheight;
    var tileW = mapData.tilewidth;


    var currentSecond = 0, frameCount = 0, framesLastSecond = 0, lastFrameTime = 0;

    var tileset = 0, tilesetUrl = '/client/img/tiles.png', tilesetLoaded = false;

    var floorTypes = {
        solid: 0,
        path: 1,
        water: 2
    };

    var tiletypes = {
        25: {colour: "#685b48", floor: floorTypes.solid},
        26: {colour: "#685b48", floor: floorTypes.solid},
        45: {colour: "#685b48", floor: floorTypes.solid},
        46: {colour: "#685b48", floor: floorTypes.solid},
        297: {colour: "#685b48", floor: floorTypes.path},
        298: {colour: "#685b48", floor: floorTypes.path},
        812: {colour: "#e8bd7a", floor: floorTypes.path},
        813: {colour: "#e8bd7a", floor: floorTypes.path},
        814: {colour: "#e8bd7a", floor: floorTypes.path},
        810: {colour: "#e8bd7a", floor: floorTypes.path},
        18: {colour: "#5aa457", floor: floorTypes.path},
        19: {colour: "#5aa457", floor: floorTypes.path},
        20: {colour: "#5aa457", floor: floorTypes.path},
        21: {colour: "#5aa457", floor: floorTypes.path},
        40: {colour: "#5aa457", floor: floorTypes.path},
        41: {colour: "#5aa457", floor: floorTypes.path},
    };

    var gameMap = mapData.layers[0].data;
    var viewport = {
        screen: [0, 0],
        startTile: [0, 0],
        endTile: [0, 0],
        offset: [0, 0],
        update: function (px, py) {
            this.offset[0] = Math.floor((this.screen[0] / 2) - px);
            this.offset[1] = Math.floor((this.screen[1] / 2) - py);

            var tile = [
                Math.floor(px / tileW),
                Math.floor(py / tileH)
            ];
            this.startTile[0] = tile[0] - 1 - Math.ceil((this.screen[0] / 2) / tileW);
            this.startTile[1] = tile[1] - 1 - Math.ceil((this.screen[1] / 2) / tileH);

            if (this.startTile[0] < 0) {
                this.startTile[0] = 0;
            }
            if (this.startTile[1] < 0) {
                this.startTile[1] = 0;
            }

            this.endTile[0] = tile[0] + 1 + Math.ceil((this.screen[0] / 2 / tileW));
            this.endTile[1] = tile[1] + 1 + Math.ceil((this.screen[1] / 2 / tileH));


            if (this.endTile[0] >= mapW) {
                this.endTile[0] = mapW - 1;
            }
            if (this.endTile[1] >= mapH) {
                this.endTile[1] = mapH - 1;
            }
        }
    };


    function Character() {
        this.tileFrom = [];
        this.tileTo = [];
        this.timeMoved = 0;
        this.dimensions = [16, 16];
        this.position = [48, 48];
        this.delayMove = 267;
        this.id = "";

    }

    Character.prototype.placeAt = function (x, y) {
        this.tileFrom = [x, y];
        this.tileTo = [x, y];
        this.position = [((tileW * x) + ((tileW - this.dimensions[0]) / 2)),
            ((tileH * y) + ((tileH - this.dimensions[1]) / 2))]
    };

    Character.prototype.processMovement = function (t) {
        if (this.tileFrom[0] === this.tileTo[0] && this.tileFrom[1] === this.tileTo[1]) {
            return false;
        }
        if ((t - this.timeMoved) >= this.delayMove) {
            this.placeAt(this.tileTo[0], this.tileTo[1])
            console.log('forcemove');
        } else {
            this.position[0] = (this.tileFrom[0] * tileW);
            this.position[1] = (this.tileFrom[1] * tileH);
            if (this.tileTo[0] !== this.tileFrom[0]) {
                var diff = (tileW / this.delayMove) * (t - this.timeMoved);
                this.position[0] += (this.tileTo[0] < this.tileFrom[0] ? 0 - diff : diff);
            }
            if (this.tileTo[1] !== this.tileFrom[1]) {
                var diff = (tileH / this.delayMove) * (t - this.timeMoved);
                this.position[1] += (this.tileTo[1] < this.tileFrom[1] ? 0 - diff : diff);
            }

            this.position[0] = Math.round(this.position[0]);
            this.position[1] = Math.round(this.position[1]);


        }
        return true;
    };


    function toIndex(x, y) {
        return ((y * mapW) + x);
    }

    requestAnimationFrame(drawGame);
    ctx.font = 'bold 10pt Arial';

    viewport.screen = [
        document.getElementById('ctx').width,
        document.getElementById('ctx').height,

    ];

    tileset = new Image();

    tileset.onerror = function () {
        ctx = null;
        alert("failed loading tileset");
    };

    tileset.src = tilesetUrl;

    function getTileCoords(num) {
        tilesetWidth = 42;
        tilesetHeigh = 41;


        tileRow = Math.floor(num / tilesetWidth);

        tileCol = num % tilesetWidth;


        return [tileCol * 16, tileRow * 16]
    }


    function drawGame() {

        if (ctx == null) {
            return
        }

        if (!loggedIn || player === null) {
            requestAnimationFrame(drawGame);
            return;
        }

        var currentFrameTime = Date.now();
        var timeElapsed = currentFrameTime - lastFrameTime;

        var sec = Math.floor(Date.now() / 1000);
        if (sec != currentSecond) {
            currentSecond = sec;
            framesLastSecond = frameCount;
            frameCount = 1;
        } else {
            frameCount++;
        }
        if (!player.processMovement(currentFrameTime)) {
            if (player.tileFrom[0] !== player.tileTo[0] || player.tileTo[1] !== player.tileFrom[1]) {
                player.timeMoved = currentFrameTime;
            }
        }

        viewport.update(player.position[0] + (player.dimensions[0] / 2), player.position[1] + (player.dimensions[1] / 2));

        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, viewport.screen[0], viewport.screen[1]);


        for (var y = viewport.startTile[1]; y < viewport.endTile[1]; y++) {
            for (var x = viewport.startTile[0]; x < viewport.endTile[0]; x++) {
                var tileSpot = getTileCoords(gameMap[toIndex(x, y)] - 1);
                ctx.drawImage(tileset,
                    tileSpot[0], tileSpot[1], 16, 16,
                    viewport.offset[0] + (x * tileW), viewport.offset[1] + (y * tileH),
                    tileW, tileH);
            }
        }
        ctx.fillStyle = "#f000ff";
        for (var key in players) {
            //console.log("User " + players[key] + " is #" + key); // "User john is #234"
            var char = players[key];
            if (!char.processMovement(currentFrameTime)) {
                if (char.tileFrom[0] !== char.tileTo[0] || char.tileTo[1] !== char.tileFrom[1]) {
                    char.timeMoved = currentFrameTime;
                }
            }
            ctx.fillRect(viewport.offset[0] + char.position[0], viewport.offset[1] + char.position[1],
                16, 16);


        }
        ctx.fillStyle = "#0000ff";
        ctx.fillRect(viewport.offset[0] + player.position[0], viewport.offset[1] + player.position[1],
            player.dimensions[0], player.dimensions[1]);


        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, 130, 50);
        ctx.fillRect(0, 50, 75, 10);

        ctx.fillStyle = '#ff0000';
        ctx.fillText(`FPS: ${framesLastSecond}`, 10, 20);
        ctx.fillText(`Current Tile: ${gameMap[toIndex(player.tileTo[0], player.tileTo[1])]}`, 10, 35);
        ctx.fillText(`(${player.tileTo[0]}, ${player.tileTo[1]})`, 10, 50);


        lastFrameTime = currentFrameTime;
        requestAnimationFrame(drawGame);
    }

    socket.on('newPositions', function (data) {
        if (player === null) {
            return;
        }
        /**
         {
  "player": [
    {
      "tileFrom": {
        "x": 0,
        "y": 0
      },
      "tileTo": {
        "x": 0,
        "y": 0
      },
      "number": "3"
    }
  ],
  "bullet": []
}
         */
        //console.log(data.player[0]);
        //console.log(data);
        //ctx.clearRect(0, 0, 500, 500);
        if (data.player.length != 0) {
            //players = data.player;

            var recv = data.player[player.id];
            player.tileFrom = [recv.tileFrom.x, recv.tileFrom.y];
            player.tileTo = [recv.tileTo.x, recv.tileTo.y];
            player.timeMoved = recv.timeMoved;
            if (recv.force) {
                console.log('forcing');
                player.placeAt(recv.tileTo.x, recv.tileTo.y);
            }


            for (var key in data.player) {
                if (key !== player.id) {
                    //console.log("User " + players[key] + " is #" + key); // "User john is #234"
                    if (!(key in players)) {
                        players[key] = new Character();
                        players[key].position = [((16 * data.player[key].tileFrom.x) + ((16 - 16) / 2)),
                            ((16 * data.player[key].tileFrom.y) + ((16 - 16) / 2))];
                    }
                    var charData = data.player[key];
                    var char = players[key];
                    char.tileFrom = [charData.tileFrom.x, charData.tileFrom.y];
                    char.tileTo = [charData.tileTo.x, charData.tileTo.y];
                    char.timeMoved = charData.timeMoved;
                    char.id = charData.id;
                }
            }


            //player.position[0] = recv.x;
            //player.position[1] = recv.y;
        }

        //for (var i = 0; i < data.player.length; i++) {
        //ctx.fillText(data.player[i].number, data.player[i].x, data.player[i].y);
        //}
        //for (var i = 0; i < data.bullet.length; i++) {
        //ctx.fillRect(data.bullet[i].x - 5, data.bullet[i].y - 5, 10, 10);
        //}

    });

    socket.on('addToChat', function (data) {
        chatText.innerHTML += `<div>${data}</div>`
    });

    socket.on('evalAnswer', function (data) {
        console.log(data);
    });


    chatForm.onsubmit = function (event) {
        event.preventDefault();
        if (chatInput.value[0] === '/') {
            socket.emit('evalServer', chatInput.value.slice(1));
            debug = true;
        } else {
            socket.emit('sendMsgToServer', chatInput.value);

        }
        chatInput.value = '';
    };

    document.onkeydown = function (event) {
        if (event.key === 'd')
            socket.emit('keyPress', {inputId: 'right', state: true});
        if (event.key === 's')
            socket.emit('keyPress', {inputId: 'down', state: true});
        if (event.key === 'a')
            socket.emit('keyPress', {inputId: 'left', state: true});
        if (event.key === 'w')
            socket.emit('keyPress', {inputId: 'up', state: true});
    };
    document.onkeyup = function (event) {
        if (event.key === 'd')
            socket.emit('keyPress', {inputId: 'right', state: false});
        if (event.key === 's')
            socket.emit('keyPress', {inputId: 'down', state: false});
        if (event.key === 'a')
            socket.emit('keyPress', {inputId: 'left', state: false});
        if (event.key === 'w')
            socket.emit('keyPress', {inputId: 'up', state: false});
    };


    /*
    document.onmousedown = function (event) {
        socket.emit('keyPress', {inputId: 'attack', state: true});
    }

    document.onmouseup = function (event) {
        socket.emit('keyPress', {inputId: 'attack', state: false});
    }

    document.onmousemove = function (event) {
        var x = -250 + event.clientX - 8;
        var y = -250 + event.clientY - 8;
        var angle = Math.atan2(y, x) / Math.PI * 180;


        socket.emit('keyPress', {inputId: 'mouseAngle', state: angle});
    }
    */
}

loadJSON(main);
