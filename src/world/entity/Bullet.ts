import {Entity} from "./Entity";
import {PlayerList} from "./player/WorldPlayer";

export var BulletList = {};

export class Bullet extends Entity {
    timer = 0;
    toRemove = false;

    parent: number;

    constructor(parent, angle) {
        super();
        this.parent = parent;
        this.id = '' + Math.random();
        this.spdX = Math.cos(angle / 180 * Math.PI) * 10;
        this.spdY = Math.sin(angle / 180 * Math.PI) * 10;
        BulletList[this.id] = this;
    }

    update() {
        if (this.timer++ > 100)
            this.toRemove = true;
        if (this.toRemove) {
            delete BulletList[this.id];
        }
        for (var i in PlayerList) {
            var p = PlayerList[i];
            if (this.parent !== p.id) {

                console.log(this.getDistance(p));
                if (Number(this.getDistance(p)) < 32) {
                    console.log('collision detected');
                    this.toRemove = true;
                }
            }
        }
        super.update();
    };
}

export function updateBullets() {

    var pack = [];
    for (var i in BulletList) {
        var bullet: Bullet = BulletList[i];
        bullet.update();
        pack.push({
            x: bullet.x,
            y: bullet.y,
        })
    }
    return pack;
}
