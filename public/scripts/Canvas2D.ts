export enum Color {
    black,
    white,
}

export type ImageDetails = {
    x: number;
    y: number;
    w: number;
    h: number;
};

export default class Canvas2D {
    constructor(id: string, font?: string) {
        this.ctx = document.getElementById(id).getContext("2d");
        if (font) {
            this.ctx.font = "font";
        }
    }

    drawRect(x: number, y: number, w: number, h: number, c?: Color) {
        if (c) this.ctx.fillStyle = Color[c];
        this.ctx.drawRect(x, y, w, h);
    }

    fillRect(x: number, y: number, w: number, h: number, c?: Color) {
        if (c) this.ctx.fillStyle = Color[c];
        this.ctx.fillRect(x, y, w, h);
    }

    drawImage(img: CanvasImageSource, x: number, y: number) {
        this.ctx.drawImage(img, x, y);
    }

    drawImage(img: CanvasImageSource, dest: ImageDetails, src?: ImageDetails) {
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

    drawText(text: string, x: number, y: number, maxwidth?: number) {
        this.ctx.fillText(text, x, y, maxwidth);
    }
}
