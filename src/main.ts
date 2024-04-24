import "./styles.css";
import { startingTiles, tiles } from "./data";
import { Tile, WildLife } from "./interfaces";
const turnsLeft = 20;
const wildlife = ["bear", "fox", "elk", "hawk", "samlon"];
const tokenNums: Record<WildLife, number> = {
        bear: 20,
        salmon: 20,
        hawk: 20,
        elk: 20,
        fox: 20,
};

const allTiles: any[] = [];
const allTokens: any[] = [];
const initialTiles: any[] = [];
const initialTokens: any[] = [];
const dispalyedTokens: any[] = [];
const mapData: any[] = [];

const mapRowsColumnsIndexes = {
        rows: {},
        column: {},
};

const mapLimits = { up: 10, down: 30, left: 10, right: 30 };

const mapMoveAmount = {
        tilePos: {
                top: 0,
                left: 0,
        },
        view: {
                desktop: {
                        incs: {
                                vertical: 85,
                                horizontal: 100,
                        },
                        unit: "px",
                },
        },
};

const mapRowRange = mapLimits.down - mapLimits.up; // 22
const mapColumnRange = mapLimits.right - mapLimits.left; //22

class Board {}
