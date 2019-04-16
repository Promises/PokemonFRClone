export class Coord {
    x: number = 0;
    y: number = 0;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    getPixelX(){
        return 16*this.x;
    }
    getPixelY(){
        return 16*this.y;
    }

}