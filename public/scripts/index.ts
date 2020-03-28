import Canvas from "./Canvas2D.js";
import MineGrid from "./MineGrid.js";

const gridCanvas = new Canvas("canvas", "bold 25px sans-serif");
const mineGrid = new MineGrid(25, 25, 20, 100);

mineGrid.giveToHuman(gridCanvas);

mineGrid.draw(gridCanvas);
