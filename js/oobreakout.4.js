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

class Rectangle {
    constructor(position, size) {
        this.position = position
        this.size     = size
    }
}

class Canvas {
    get size() { return new Vector2(this.canvas.width, this.canvas.height) }

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

    fillRectangle(rectangle, color) {
        this.context.beginPath()
        this.context.rect(rectangle.position.x, rectangle.position.y, rectangle.size.x, rectangle.size.y)
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
        canvas.fillCircle(new Circle(this.position, this.radius), this.color)
        this.moveStep(canvas)
    }

    moveStep(canvas) {
        this.detectCollision(canvas)
        this.position.plusEqual(this.velocity)
    }

    detectCollision(canvas) {
        if (!Ball.isBetween(this.position.x + this.velocity.x, this.radius, canvas.size.x - this.radius))
            this.velocity.x = -this.velocity.x
        if (!Ball.isBetween(this.position.y + this.velocity.y, this.radius, canvas.size.y - this.radius))
            this.velocity.y = -this.velocity.y
    }

    static isBetween(value, minimum, maximum) {
        return minimum <= value && value <= maximum
    }
}

class Paddle {
    constructor(position, size, color) {
        this.position     = position
        this.size         = size
        this.color        = color
        this.rightPressed =
        this.leftPressed  = false
    }

    draw(canvas) {
        canvas.fillRectangle(new Rectangle(new Vector2(this.position, canvas.size.y - this.size.y), this.size), this.color)
        this.moveStep(canvas)
    }

    moveStep(canvas) {
        const stepSize = 7

        if (this.rightPressed) {
            this.position += stepSize
            if (this.position + this.size.x > canvas.size.x)
                this.position = canvas.size.x - this.size.x
        } else if (this.leftPressed) {
            this.position -= stepSize
            if (this.position < 0)
                this.position = 0
        }
    }
}

class Program {
    main() {
        this.createCanvas()

        const color = "#0095DD"
        this.createBall  (color)
        this.createPaddle(color)

        this.initilizeHandlers()
    }

    createCanvas() {
        this.canvas        = new Canvas('canvas')
        this.canvas.onDraw = (canvas) => this.draw(canvas)
    }

    createBall(color) {
        const velocity = new Vector2(2, -2)
        this.ball      = new Ball(new Vector2(canvas.width / 2, canvas.height - 30), velocity, color)
    }

    createPaddle(color) {
        const paddleHeight = 10
        const paddleWidth  = 75
        this.paddle = new Paddle((canvas.width - paddleWidth) / 2, new Vector2(paddleWidth, paddleHeight), color)
    }

    initilizeHandlers() {
        document.addEventListener('keydown', e => this.onKeyDown(e), false)
        document.addEventListener('keyup'  , e => this.onKeyUp  (e), false)
    }

    draw(canvas) {
        this.ball  .draw(canvas)
        this.paddle.draw(canvas)
    }
    
    onKeyDown(e) {
        if      (e.key == "Right" || e.key == "ArrowRight")
            this.paddle.rightPressed = true
        else if (e.key == "Left"  || e.key == "ArrowLeft" )
            this.paddle.leftPressed  = true
    }
    
    onKeyUp(e) {
        if      (e.key == "Right" || e.key == "ArrowRight")
            this.paddle.rightPressed = false
        else if (e.key == "Left"  || e.key == "ArrowLeft" )
            this.paddle.leftPressed  = false
    }
}

window.onload = () => new Program().main()
