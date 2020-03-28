export enum Color {
    black,
    white,
    gray,
}

export type ImageDetails = {
    x: number;
    y: number;
    w: number;
    h: number;
};

export default class Canvas2D {
    ctx: CanvasRenderingContext2D;
    node: HTMLCanvasElement;

    constructor(id: string, font?: string) {
        const canvas = document.getElementById(id);
        if (canvas instanceof HTMLCanvasElement) {
            this.node = canvas;
            const context = this.node.getContext("2d");
            if (context) this.ctx = context;
            else throw new Error("Could not get canvas for " + id);
        } else throw new Error(id + " is not a valid canvas");

        if (font) {
            this.ctx.font = font;
        }
    }

    drawRect(x: number, y: number, w: number, h: number, c?: Color) {
        if (c) this.ctx.strokeStyle = Color[c];
        this.ctx.strokeRect(x, y, w, h);
    }

    fillRect(x: number, y: number, w: number, h: number, c?: Color) {
        if (c) this.ctx.fillStyle = Color[c];
        this.ctx.fillRect(x, y, w, h);
    }

    drawImage(img: CanvasImageSource, x: number, y: number) {
        this.ctx.drawImage(img, x, y);
    }

    drawImageTransformed(
        img: CanvasImageSource,
        dest: ImageDetails,
        src?: ImageDetails
    ) {
        const { x: dx, y: dy, w: dw, h: dh } = dest;
        if (src) {
            const { x: sx, y: sy, w: sw, h: sh } = src;
            this.ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
        } else {
            this.ctx.drawImage(img, dx, dy, dw, dh);
        }
    }

    setFont(font: string) {
        this.ctx.font = font;
    }

    drawText(text: string, x: number, y: number, c?: Color, maxwidth?: number) {
        if (c) this.ctx.fillStyle = Color[c];
        this.ctx.fillText(text, x, y, maxwidth);
    }

    onClick(callback: (e: MouseEvent) => void) {
        this.node.addEventListener("click", callback);
    }

    onClickRelative(callback: (x: number, y: number) => void) {
        this.onClick((e) => {
            const x = e.pageX - this.node.offsetLeft;
            const y = e.pageY - this.node.offsetTop;
            callback(x, y);
        });
    }
}
