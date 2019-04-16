import {Entity} from "../Entity";
import {PlayerList} from "./WorldPlayer";
import {Bullet} from "../Bullet";
import {worldMap} from "../../../globals";
import {Coord} from "../../../shared/models";

export class Player extends Entity {
    number = "" + Math.floor(10 * Math.random());
    pressingRight = false;
    pressingLeft = false;
    pressingUp = false;
    pressingDown = false;
    pressingAttack = false;
    mouseAngle = 0;
    maxSpd = 10;
    tileFrom = new Coord(70, 269);
    tileTo = new Coord(70, 269);
    timeMoved = 0;
    dimensions = [16, 16];
    position = [70 * 16, 269 * 16];
    delayMove = 267;
    forceUpdate = false;
    NOCLIP = false;

    constructor(id) {
        super();
        this.id = id;
        PlayerList[id] = this;
    }

    isMoving(): boolean {
        return (this.pressingUp || this.pressingDown || this.pressingRight || this.pressingLeft);
    }

    update() {
        //this.updateSpd();
        super.update();

        var currentFrameTime = Date.now();

        if (!this.processMovement(currentFrameTime)) {
            if (this.pressingUp) {
                this.walkUp();
            } else if (this.pressingDown) {
                this.walkDown();
            }

            else if (this.pressingRight) {
                this.walkRight();

            } else if (this.pressingLeft) {
                this.walkLeft();
            }
            if (Math.abs(this.tileFrom.x - this.tileTo.x) == 1 || Math.abs(this.tileFrom.y - this.tileTo.y) == 1) {
                this.timeMoved = currentFrameTime;

            }

        }

        if (this.pressingAttack) {
            this.shootBullet(this.mouseAngle);
        }
    }

    shootBullet(angle) {
        var b = new Bullet(this.id, angle);
        b.x = this.x;
        b.y = this.y;
    };

    walkUp() {
        if (worldMap.canWalkOn(new Coord(this.tileTo.x, this.tileTo.y - 1)) || this.NOCLIP) {
            this.tileTo.y -= 1;
        }

    }

    walkDown() {
        if (worldMap.canWalkOn(new Coord(this.tileTo.x, this.tileTo.y + 1)) || this.NOCLIP) {

            this.tileTo.y += 1;
        }
    }

    walkLeft() {
        if (worldMap.canWalkOn(new Coord(this.tileTo.x - 1, this.tileTo.y)) || this.NOCLIP) {
            this.tileTo.x -= 1;

        }

    }

    walkRight() {
        if (worldMap.canWalkOn(new Coord(this.tileTo.x + 1, this.tileTo.y)) || this.NOCLIP) {
            this.tileTo.x += 1;
        }

    }


    updateSpd() {
        if (this.pressingRight)
            this.spdX = this.maxSpd;
        else if (this.pressingLeft)
            this.spdX = -this.maxSpd;
        else
            this.spdX = 0;

        if (this.pressingUp)
            this.spdY = -this.maxSpd;
        else if (this.pressingDown)
            this.spdY = this.maxSpd;
        else
            this.spdY = 0;

    };

    placeAt(x, y) {
        this.tileFrom = new Coord(x, y);
        this.tileTo = new Coord(x, y);
        this.position = [((worldMap.tileWidth * x) + ((worldMap.tileWidth - this.dimensions[0]) / 2)),
            ((worldMap.tileHeight * y) + ((worldMap.tileHeight - this.dimensions[1]) / 2))];
    }

    processMovement(t) {
        if (this.tileFrom.x === this.tileTo.x && this.tileFrom.y === this.tileTo.y) {
            return false;
        }


        if ((t - this.timeMoved) >= this.delayMove) {
            this.placeAt(this.tileTo.x, this.tileTo.y);
        } else {
            this.position[0] = (this.tileFrom.x * worldMap.tileWidth);
            this.position[1] = (this.tileFrom.y * worldMap.tileHeight);
            if (this.tileTo.x !== this.tileFrom.x) {
                var diff = (worldMap.tileWidth / this.delayMove) * (t - this.timeMoved);
                this.position[0] += (this.tileTo.x < this.tileFrom.x ? 0 - diff : diff);
            }
            if (this.tileTo.y !== this.tileFrom.y) {
                var diff = (worldMap.tileHeight / this.delayMove) * (t - this.timeMoved);
                this.position[1] += (this.tileTo.y < this.tileFrom.y ? 0 - diff : diff);
            }

            this.position[0] = Math.round(this.position[0]);
            this.position[1] = Math.round(this.position[1]);


        }
        return true;

    }


    command(data: string, socket) {
        if (data.startsWith('tp')) {
            let input = data.split(' ');
            if (input.length == 3) {
                this.placeAt(input[1], input[2]);
                this.forceUpdate = true;
            }
        } else if (data.startsWith('noclip')) {
            this.NOCLIP = !this.NOCLIP;
        } else {
            socket.emit('evalAnswer', 'Not a command');
        }


    }
}