class Vector2 {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    plus(vector) {
        return new Vector2(this.x + vector.x, this.y + vector.y)
    }

    plusEqual(vector) {
        this.x += vector.x
        this.y += vector.y
    }
}

class Circle {
    constructor(position, radius) {
        this.position = position
        this.radius   = radius
    }
}

class Canvas {
    get width () { return this.canvas.width  }
    get height() { return this.canvas.height }

    constructor(canvasId) {
        this.canvas  = document.getElementById(canvasId)
        this.context = this.canvas.getContext('2d')
        this.onDraw  = (canvas) => {}

        const interval = 10
        setInterval(() => this.draw(), interval)
    }

    fillCircle(circle, color) {
        this.context.beginPath()
        this.context.arc(circle.position.x, circle.position.y, circle.radius, 0, Math.PI * 2, false)
        this.context.fillStyle = color
        this.context.fill()
        this.context.closePath()
    }

    draw() {
        this.clear()
        this.onDraw(this)
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
}

class Ball {
    constructor(position, velocity, color) {
        const radius  = 10
        this.position = position
        this.radius   = radius 
        this.velocity = velocity
        this.color    = color
    }

    draw(canvas) {
        console.log('Ball.draw: ' + canvas)
        canvas.fillCircle(new Circle(this.position, this.radius), this.color)
        this.moveStep()
    }

    moveStep() {
        this.position.plusEqual(this.velocity)
    }
}

class Program {
    main() {
        this.canvas = new Canvas('canvas')
        this.ball = new Ball(new Vector2(canvas.width / 2, canvas.height - 30), new Vector2(2, -2), "#0095DD")
        this.canvas.onDraw = (canvas) => this.ball.draw(canvas)
    }
}

window.onload = () => new Program().main()
