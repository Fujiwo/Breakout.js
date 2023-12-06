class Canvas {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId)
        this.context = this.canvas.getContext('2d')
    }

    fillRectangle(x, y, width, height, color) {
        this.context.beginPath()
        this.context.rect(x, y, width, height)
        this.context.fillStyle = color
        this.context.fill()
        this.context.closePath()
    }

    strokeRectangle(x, y, width, height, color) {
        this.context.beginPath()
        this.context.rect(x, y, width, height)
        this.context.strokeStyle = color
        this.context.stroke()
        this.context.closePath()
    }

    fillCircle(x, y, radius, color) {
        this.context.beginPath()
        this.context.arc(x, y, radius, 0, Math.PI * 2, false)
        this.context.fillStyle = color
        this.context.fill()
        this.context.closePath()
    }
}

class Program {
    main() {
        this.canvas = new Canvas('canvas')
        this.canvas.fillRectangle(20, 40, 50, 50, "#FF0000")
        this.canvas.fillCircle(240, 160, 20, "green")
        this.canvas.strokeRectangle(160, 10, 100, 40, "rgba(0, 0, 255, 0.5)")
    }
}

window.onload = () => new Program().main()
