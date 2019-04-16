import * as socketio from 'socket.io'
import {Socket} from 'socket.io'
import {SERVERNAME, SOCKET_LIST} from "../globals";
import WorldPlayer from "../world/entity/player/WorldPlayer";
import {updateBullets} from "../world/entity/Bullet";

export default class ioSocket {
    private io;

    private mainLoop: any;

    private Players: WorldPlayer;

    tick = 0;

    constructor(app: any) {
        this.io = socketio(app, {});
        this.setupSocket();
        this.Players = new WorldPlayer();
        this.mainLoop = setInterval(() => this.sendUpdatePack(), 1000 / 50);
    }

    private sendUpdatePack() {
        this.tick += 1;
        var pack = {
            player: this.Players.update(),
            bullet: updateBullets(),
            timeNow: Date.now(),
        };


        if (this.tick % 2 === 0) {


            for (var i in SOCKET_LIST) {
                var socket = SOCKET_LIST[i];

                pack['yourid'] = i;
                socket.emit('newPositions', pack);
            }
        }
        return
    }

    private setupSocket(): void {
        this.io.sockets.on('connection', (socket: Socket) => this.newConnection(socket));
    }

    private newConnection(socket: Socket) {
        socket.emit('timeUpdate', {time: Date.now()});
        SOCKET_LIST[socket.id] = socket;

        var Players = this.Players;
        socket.on('signIn', function (data) {
            if (Players.isValidPassword(data)) {
                Players.onConnect(socket);
            } else {
                socket.emit('signInResponse', {'success': false})

            }
        });
        socket.on('signUp', function (data) {
            console.log('signup', data);
            if (Players.signUp(data)) {
                Players.onConnect(socket);
            } else {
                socket.emit('signInResponse', {'success': false})
            }
        });


        socket.emit('addToChat', `SERVER: Welcome to ${SERVERNAME}, there are currently ${Object.keys(SOCKET_LIST).length} player(s) online!`);
        socket.on('disconnect', function () {
            delete SOCKET_LIST[socket.id];
            Players.onDisconnect(socket);
        });

        socket.on('sendMsgToServer', (data) => this.sendMSgToServerListener(data, socket));

        socket.on('help', function (data) {
            console.log('recieved')
        })
    }

    private sendMSgToServerListener(data, socket) {
        var playerName = ("" + socket.id).slice(2, 7);
        for (var i in SOCKET_LIST) {
            SOCKET_LIST[i].emit('addToChat', playerName + ': ' + data);
        }
    }
}


