import {Player} from "./Player";
import {Socket} from "socket.io";

export var PlayerList = {};


export default class WorldPlayer {
    USERS = {
        'bob': 'bob',
        'bob1': 'bob',
        'bob2': 'bob',
    };

    DEBUG = true;

    public update() {
        var pack = {};
        for (var i in PlayerList) {
            var player: Player = PlayerList[i];
            player.update();
            pack[player.id] = {
                tileFrom: player.tileFrom,
                tileTo: player.tileTo,
                number: player.number,
                timeMoved: player.timeMoved,
                force: player.forceUpdate
            };
            if (player.forceUpdate) {
                player.forceUpdate = false;
            }
        }
        return pack;
    };


    public isValidPassword(data) {
        return this.USERS[data.username] === data.password
    }

    public signUp(data): boolean {
        if (!this.USERS[data.username]) {
            this.USERS[data.username] = data.password;
            return true;
        }
        return false;
    }

    public onConnect(socket: Socket) {
        var player = new Player(socket.id);

        socket.emit('signInResponse',
            {
                'success': true,
                'player': {
                    tileFrom: player.tileFrom,
                    tileTo: player.tileTo,
                    x: player.position[0],
                    y: player.position[1],
                    number: player.number,
                    timeMoved: player.timeMoved,
                    id: player.id

                }
            });

        socket.on('keyPress', function (data) {
            console.log(data);
            socket.emit('timeUpdate', {time: Date.now()});

            if (data.inputId === 'left')
                player.pressingLeft = data.state;
            else if (data.inputId === 'right')
                player.pressingRight = data.state;
            else if (data.inputId === 'up')
                player.pressingUp = data.state;
            else if (data.inputId === 'down')
                player.pressingDown = data.state;
            //else if (data.inputId === 'attack')
            //   player.pressingAttack = data.state;
            //else if (data.inputId === 'mouseAngle')
            //   player.mouseAngle = data.state;
        });
        if (this.DEBUG) {
            socket.on('evalServer', function (data) {
                player.command(data, socket);
            });
        }
    }


    public onDisconnect(socket) {
        delete PlayerList[socket.id];
    };
}