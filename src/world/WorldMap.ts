import * as mapData from '../worldMap.json';
import {Coord} from "../shared/models";

export default class WorldMap {
    mapWidth = mapData.width;
    mapHeight = mapData.height;
    tileHeight = mapData.tileheight;
    tileWidth = mapData.tilewidth;

    tiles = mapData.layers[0].data;
    walls = [
        59,
        53,
        46,
        45,
        24,
        44,
        26,
        32,
        119,
        118,
        24,
        1459,
        1457,
        120,
        380,

        510, 1491, 1492, 513, 1489, 1488, 1487, 1486, 1485, 1480, 1481, 1482, 1478, 1477, 1476, 121,
        1, 347, 1504, 516, 1527, 347, 212, 58, 43, 57, 58, 259, 351, 58, 1516, 1517, 1518, 1520, 1521, 1522, 1515, 1514, 1513, 1512, 1511, 1510, 1509, 1505, 1506, 1507, 1508, 1502, 1501, 1500, 1499,

    ];


    watertiles = [
        65, 1531, 55, 1532, 68, 85, 55, 157
    ];

    constructor() {
    }

    toIndex(x, y) {
        return ((y * this.mapWidth) + x);
    }

    getTileFromCoord(tile: Coord) {
        return this.tiles[this.toIndex(tile.x, tile.y)];
    }

    isValidMove(from: Coord, to: Coord): boolean {
        // TODO: implement checks
        return true;
    }

    canWalkOn(tile: Coord) {
        return !(this.walls.indexOf(this.getTileFromCoord(tile)) >= 0) && !(this.watertiles.indexOf(this.getTileFromCoord(tile)) >= 0);
    }

}