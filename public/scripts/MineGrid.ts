import Canvas2D, { Color } from "./Canvas2D.js";

export default class MineGrid {
    tileSize: number;
    numBombs: number;

    #width: number;
    #height: number;
    // x * height + y
    #grid: Array<number>;
    #revealed: Array<boolean>;
    #gameLost: boolean;
    #gameWon: boolean;

    constructor(
        rows: number,
        cols: number,
        tileSize: number,
        numBombs: number
    ) {
        this.tileSize = tileSize;
        this.numBombs = numBombs;
        this.#gameLost = false;
        this.#gameWon = false;

        const totalTiles = rows * cols;
        let remainingBombs = numBombs;

        this.#height = rows;
        this.#width = cols;
        this.#grid = new Array(totalTiles);
        this.#revealed = new Array(totalTiles);

        for (let i = 0; i < this.#grid.length; i++) {
            if (
                remainingBombs > 0 &&
                Math.random() < remainingBombs / totalTiles
            )
                // A bomb
                this.#grid[i] = -1;
            else this.#grid[i] = 0; // A blank

            this.#revealed[i] = false;
        }

        const countNeighborBombs = (x: number, y: number) => {
            let count = 0;
            for (let i = -1; i <= 1; i++)
                for (let j = 0; j <= 1; j++) {
                    const xn = x + i;
                    const yn = y + j;
                    if (xn == x && yn == y) continue;
                    if (xn >= 0 && xn < rows && yn >= 0 && yn < cols) {
                        if (this.#grid[xn * this.#height + yn] == -1) count++;
                    }
                }

            return count;
        };
        for (let i = 0; i < this.#width; i++) {
            for (let j = 0; j < this.#height; j++) {
                this.#grid[i * this.#height + j] = countNeighborBombs(i, j);
            }
        }
    }

    validTilePos(x: number, y: number) {
        return x < this.#width && x >= 0 && y < this.#height && y >= 0;
    }

    lost() { return this.#gameLost }
    won() { return this.#gameWon }
    done() { return this.won() || this.lost() }

    tileAt(x: number, y: number) {
        // All positions outside the grid are unrevealed
        if (!this.validTilePos(x, y)) return -10;
        // All tiles become invalid if the game is lost
        if(this.lost()) return -10;

        // consult the revealing matrix
        if (!this.#revealed[x * this.#height + y]) return -1;
        else return this.#grid[x * this.#height + y]; // -1 here is a mine
    }

    clickTile(x: number, y: number) {
        if (!this.validTilePos(x, y)) return true;

        this.#revealed[x * this.#height + y] = true;
        if (this.tileAt(x, y) == -1) {
            this.#gameLost = true;
        }
        return !this.lost()
    }

    draw(canvas: Canvas2D) {
        const { width, height } = canvas.node.getBoundingClientRect();

        for (let x = 0; x < width; x += this.tileSize)
            for (let y = 0; y < height; y += this.tileSize) {
                const tile = this.tileAt(x / this.tileSize, y / this.tileSize);
                switch (tile) {
                    case -1:
                        canvas.drawRect(
                            x,
                            y,
                            this.tileSize,
                            this.tileSize,
                            Color.gray
                        );
                        break;
                    case 0:
                        canvas.fillRect(
                            x,
                            y,
                            this.tileSize,
                            this.tileSize,
                            Color.gray
                        );
                        break;
                    default:
                        canvas.fillRect(
                            x,
                            y,
                            this.tileSize,
                            this.tileSize,
                            Color.gray
                        );
                        canvas.drawText(`${tile}`, x, y, this.tileSize);
                        break;
                }
            }
    }

    giveToHuman(canvas: Canvas2D) {
        canvas.onClickRelative((x, y) => {
            if(!this.clickTile(x / this.tileSize, y / this.tileSize)){
                canvas.setFont("bold 50px monospace");
                canvas.drawText("Hit a bomb", 100, 225, 300);
            }
        });
    }
}
