import Canvas from "./Canvas2D.js";
import MineGrid from "./MineGrid.js";

const gridCanvas = new Canvas("canvas", "sans-serif");
const mineGrid = new MineGrid(25, 25, 10, 100);


mineGrid.giveToHuman(gridCanvas);


while (true) mineGrid.draw(gridCanvas);
