export class Entity {
    id: string;
    x = 250;
    y = 250;
    spdX = 0;
    spdY = 0;


    update() {
        this.updatePostition();
    };

    updatePostition() {
        this.x += this.spdX;
        this.y += this.spdY;
    };

    getDistance(pt) {
        return Math.sqrt(Math.pow(this.x - pt.x, 2) + Math.pow(this.y - pt.y, 2));
    }
}