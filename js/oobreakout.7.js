class Utility {
    static isBetween(value, minimum, maximum) {
        return minimum <= value && value <= maximum
    }
}

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
    get rightBottom() { return this.position.plus(this.size) }

    constructor(position, size) {
        this.position = position
        this.size     = size
    }

    isOn(position) {
        const rightBottom = this.rightBottom
        return Utility.isBetween(position.x, this.position.x, rightBottom.x) &&
               Utility.isBetween(position.y, this.position.y, rightBottom.y)
    }
}

class Canvas {
    get size() { return new Vector2(this.canvas.width, this.canvas.height) }

    constructor(canvasId) {
        this.canvas  = document.getElementById(canvasId)
        this.context = this.canvas.getContext('2d')
        this.onDraw  = (canvas) => {}

        const interval = 10
        this.timerId   = setInterval(() => this.draw(), interval)
    }

    stop() {
        clearInterval(this.timerId)
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

    isOn(position) {
        return Utility.isBetween(position.x, this.position, this.position + this.size.x)
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

class Bricks {
    constructor(canvas) {
        this.brickRowCount    =  3
        this.brickColumnCount =  8
        this.brickPadding     = 10

        const brickMargin     = 30
        this.brickOffset      = new Vector2(brickMargin, brickMargin)

        const brickHeight     = 20
        const brickWidth      = (canvas.size.x - brickMargin * 2 - this.brickPadding * (this.brickColumnCount - 1)) / this.brickColumnCount
        this.brickSize        = new Vector2(brickWidth, brickHeight)

        this.initializeBricks()
    }

    detectCollision(ballPosition) {
        for (let x = 0; x < this.brickColumnCount; x++) {
            for (let y = 0; y < this.brickRowCount; y++) {
                if (this.bricks[x][y].status &&
                    this.getBrick(new Vector2(x, y)).isOn(ballPosition)) {
                    this.bricks[x][y].status = false
                    return true
                }
            }
        }
        return false
    }

    draw(canvas) {
        const color = "#0095DD"
        for (let x = 0; x < this.brickColumnCount; x++) {
            for (let y = 0; y < this.brickRowCount; y++) {
                if (this.bricks[x][y].status)
                    canvas.fillRectangle(this.getBrick(new Vector2(x, y)), color)
            }
        }
    }

    getBrick(position) {
        return new Rectangle(this.bricks[position.x][position.y].position, this.brickSize)
    }

    initializeBricks() {
        this.bricks = []
        for (let x = 0; x < this.brickColumnCount; x++) {
            this.bricks[x] = []
            for (let y = 0; y < this.brickRowCount; y++)
                this.bricks[x][y] = { position: this.getBrickPosition(new Vector2(x, y)), status: true }
        }
    }

    getBrickPosition(position) {
        return this.brickOffset.plus(new Vector2((this.brickSize.x + this.brickPadding) * position.x,
                                                 (this.brickSize.y + this.brickPadding) * position.y))
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

    detectCollision(canvas, paddle, bricks) {
        if (!Utility.isBetween(this.position.x + this.velocity.x, this.radius, canvas.size.x - this.radius))
            this.velocity.x = -this.velocity.x

        if (this.position.y + this.velocity.y < this.radius ||
            bricks.detectCollision(this.position)) {
            this.velocity.y = -this.velocity.y
        } else if (this.position.y + this.velocity.y > canvas.size.y - this.radius) {
            if (paddle.isOn(this.position))
                this.velocity.y = -this.velocity.y
            else
                return false
        }
        return true
    }

    draw(canvas) {
        canvas.fillCircle(new Circle(this.position, this.radius), this.color)
        this.moveStep(canvas)
    }

    moveStep(canvas) {
        this.position.plusEqual(this.velocity)
    }
}

class Program {
    main() {
        this.createCanvas()

        const color = "#0095DD"
        this.createBall  (color)
        this.createPaddle(color)
        this.bricks = new Bricks(this.canvas)

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
        this.ball  .detectCollision(canvas, this.paddle, this.bricks) || this.gameOver()
        this.ball  .draw(canvas)
        this.paddle.draw(canvas)
        this.bricks.draw(canvas)
    }
    
    gameOver() {
        alert('GAME OVER')
        document.location.reload()
        this.canvas.stop()
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
