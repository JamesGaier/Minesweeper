import Canvas2D, { Color } from "./Canvas2D.js";

export default class MineGrid {
    readonly invalid_tile = -10;
    readonly bomb_tile = -2;
    readonly unrevealed = -1;

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
                this.#grid[i] = this.bomb_tile;
            else this.#grid[i] = 0; // A blank

            this.#revealed[i] = false;
        }

        const countNeighborBombs = (x: number, y: number) => {
            let count = 0;
            for (let i = -1; i <= 1; i++)
                for (let j = -1; j <= 1; j++) {
                    const xn = x + i;
                    const yn = y + j;
                    if (xn == x && yn == y) continue;
                    if (
                        this.validTilePos(xn, yn) &&
                        this.#grid[xn * this.#height + yn] == this.bomb_tile
                    )
                        count++;
                }

            return count;
        };
        for (let i = 0; i < this.#width; i++) {
            for (let j = 0; j < this.#height; j++) {
                if (this.#grid[i * this.#height + j] == 0)
                    this.#grid[i * this.#height + j] = countNeighborBombs(i, j);
            }
        }
    }

    validTilePos(x: number, y: number) {
        return x < this.#width && x >= 0 && y < this.#height && y >= 0;
    }

    lost() {
        return this.#gameLost;
    }
    won() {
        return this.#gameWon;
    }
    done() {
        return this.won() || this.lost();
    }

    tileAt(x: number, y: number) {
        // All positions outside the grid are unrevealed
        if (!this.validTilePos(x, y)) return this.invalid_tile;
        // All tiles become invalid if the game is lost
        if (this.lost()) return this.invalid_tile;

        // consult the revealing matrix
        if (!this.#revealed[x * this.#height + y]) return this.unrevealed;
        else return this.#grid[x * this.#height + y];
    }

    clickTile(x: number, y: number) {
        if (!this.validTilePos(x, y)) return true;

        this.#revealed[x * this.#height + y] = true;

        const floodClick = (startX: number, startY: number) => {
            type TilePos = { x: number; y: number };
            let queue: Array<TilePos> = [];
            let processed: Array<TilePos> = [];
            queue.push({ x: startX, y: startY });

            let tile = queue.shift();
            while (tile !== undefined) {
                const { x, y } = tile;
                console.log(`Clicked on ${x}, ${y}`);
                this.#revealed[x * this.#height + y] = true;
                processed.push(tile);

                // Check neighbors if we are blank
                if (this.#grid[x * this.#height + y] == 0)
                    for (let i = -1; i <= 1; i++)
                        for (let j = -1; j <= 1; j++) {
                            const tX = x + i;
                            const tY = y + j;
                            const inQueue = queue.some(
                                (t) => t.x === tX && t.y === tY
                            );
                            const inProcessed = processed.some(
                                (t) => t.x === tX && t.y === tY
                            );
                            if (
                                this.validTilePos(tX, tY) &&
                                !inQueue &&
                                !inProcessed &&
                                !this.#revealed[tX * this.#height + tY]
                            )
                                queue.push({ x: tX, y: tY });
                        }

                tile = queue.shift();
            }
        };

        // blank tiles cause a "flood fill" algorithm to be used
        if (this.#grid[x * this.#height + y] == 0) floodClick(x, y);

        if (this.tileAt(x, y) == this.bomb_tile) {
            this.#gameLost = true;
        } else if (this.unrevealedTileCount() == this.numBombs) {
            this.#gameWon = true;
        }
        return !this.lost();
    }

    unrevealedTileCount() {
        return this.#revealed.filter((x) => x == false).length;
    }

    draw(canvas: Canvas2D) {
        const { width, height } = canvas.node.getBoundingClientRect();

        for (let tileX = 0; tileX < this.#width; tileX++)
            for (let tileY = 0; tileY < this.#height; tileY++) {
                const x = tileX * this.tileSize;
                const y = tileY * this.tileSize;
                if (x >= width || y >= height) break;
                const tile = this.tileAt(tileX, tileY);
                if (tile != -10)
                    switch (tile) {
                        case this.unrevealed:
                            canvas.fillRect(
                                x,
                                y,
                                this.tileSize,
                                this.tileSize,
                                Color.gray
                            );
                            canvas.drawRect(
                                x,
                                y,
                                this.tileSize,
                                this.tileSize,
                                Color.black
                            );
                            break;
                        case 0:
                            canvas.fillRect(
                                x,
                                y,
                                this.tileSize,
                                this.tileSize,
                                Color.white
                            );
                            canvas.drawRect(
                                x,
                                y,
                                this.tileSize,
                                this.tileSize,
                                Color.black
                            );
                            break;
                        case this.bomb_tile:
                            canvas.fillRect(
                                x,
                                y,
                                this.tileSize,
                                this.tileSize,
                                Color.black
                            );
                            break;
                        case this.invalid_tile:
                            break;
                        default:
                            canvas.fillRect(
                                x,
                                y,
                                this.tileSize,
                                this.tileSize,
                                Color.gray
                            );
                            canvas.drawText(
                                `${tile}`,
                                x,
                                y + this.tileSize,
                                Color.green
                            );
                            break;
                    }
            }
    }

    giveToHuman(canvas: Canvas2D) {
        canvas.onClickRelative((x, y) => {
            const tileX = Math.floor(x / this.tileSize);
            const tileY = Math.floor(y / this.tileSize);
            if (!this.done()) this.clickTile(tileX, tileY);
            else return;

            canvas.ctx.clearRect(0, 0, canvas.node.width, canvas.node.height);
            this.draw(canvas);

            if (this.lost()) {
                canvas.setFont("bold 50px monospace");
                canvas.drawText("Hit a bomb", 100, 225, Color.red);
                console.log("Game lost");
            } else if (this.won()) {
                canvas.setFont("bold 50px monospace");
                canvas.drawText("You won", 100, 225, Color.red);
                console.log("Game won");
            }
        });
    }
}
