// 10. Finishing up (仕上げ)

class Utility {
    static isBetween(value, minimum, maximum) {
        return minimum <= value && value <= maximum
    }

    static some2D(array2D, exists) {
        return array2D.some(array => array.some(exists))
    }

    static filter2D(array2D, selector) {
        return array2D.flat().filter(selector)
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

    clone() {
        return new Vector2(this.x, this.y)
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
    get offset() { return new Vector2(this.canvas.offsetLeft, this.canvas.offsetTop) }

    constructor(canvasId) {
        this.canvas  = document.getElementById(canvasId)
        this.context = this.canvas.getContext('2d')
        this.onDraw  = (canvas) => {}

        this.draw()
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

    fillText(position, text, color, font) {
        this.context.font      = font
        this.context.fillStyle = color
        this.context.fillText(text, position.x, position.y)
    }

    draw() {
        this.clear()
        this.onDraw(this)
        requestAnimationFrame(() => this.draw())
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
}

class Paddle {
    constructor(position, size, color) {
        this.originalPosition = position
        this.position         = position
        this.size             = size
        this.color            = color
        this.rightPressed     =
        this.leftPressed      = false
    }

    draw(canvas) {
        canvas.fillRectangle(new Rectangle(new Vector2(this.position, canvas.size.y - this.size.y), this.size), this.color)
        this.moveStep(canvas)
    }

    isOn(position) {
        return Utility.isBetween(position.x, this.position, this.position + this.size.x)
    }

    reset() {
        this.position = this.originalPosition
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

class Brick {
    constructor(position, status) {
        this.position = position
        this.status   = status
    }
}

class BrickSet {
    get brickCount() { return this.rowCount * this.columnCount }

    constructor(canvas) {
        this.rowCount     =  3
        this.columnCount  =  8
        this.padding      = 10

        const margin      = 30
        this.brickOffset  = new Vector2(margin, margin)

        const brickHeight = 20
        const brickWidth  = (canvas.size.x - margin * 2 - this.padding * (this.columnCount - 1)) / this.columnCount
        this.brickSize    = new Vector2(brickWidth, brickHeight)

        this.initializeBricks()
    }

    detectCollision(ballPosition) {
        let exists = brick => {
            if (brick.status && new Rectangle(brick.position, this.brickSize).isOn(ballPosition)) {
                brick.status = false
                return true
            }
            return false
        }
        return Utility.some2D(this.bricks, exists)
    }

    draw(canvas) {
        const color  = "#0095DD"
        const bricks = Utility.filter2D(this.bricks, brick => brick.status)
        bricks.forEach(brick => canvas.fillRectangle(new Rectangle(brick.position, this.brickSize), color))
    }

    initializeBricks() {
        this.bricks = []
        for (let x = 0; x < this.columnCount; x++) {
            this.bricks[x] = []
            for (let y = 0; y < this.rowCount; y++)
                this.bricks[x][y] = new Brick(this.getBrickPosition(new Vector2(x, y)), true)
        }
    }

    getBrickPosition(position) {
        return this.brickOffset.plus(new Vector2((this.brickSize.x + this.padding) * position.x,
                                                 (this.brickSize.y + this.padding) * position.y))
    }
}

const gameStatus = Object.freeze({
    normal:  { value:  0 },
    scored:  { value:  1 },
    over  :  { value: -1 }
})

class Ball {
    constructor(position, velocity, color) {
        const radius          = 10
        this.originalPosition = position.clone()
        this.position         = position
        this.radius           = radius 
        this.originalVelocity = velocity.clone()
        this.velocity         = velocity
        this.color            = color
    }

    detectCollision(canvas, paddle, bricks) {
        if (!Utility.isBetween(this.position.x + this.velocity.x, this.radius, canvas.size.x - this.radius))
            this.velocity.x = -this.velocity.x

        if (this.position.y + this.velocity.y < this.radius) {
            this.velocity.y = -this.velocity.y
        } else if (bricks.detectCollision(this.position)) {
            this.velocity.y = -this.velocity.y
            return gameStatus.scored
        } else if (this.position.y + this.velocity.y > canvas.size.y - this.radius) {
            if (paddle.isOn(this.position))
                this.velocity.y = -this.velocity.y
            else
                return gameStatus.over
        }
        return gameStatus.normal
    }

    reset() {
        this.position = this.originalPosition
        this.velocity = this.originalVelocity
    }

    draw(canvas) {
        canvas.fillCircle(new Circle(this.position, this.radius), this.color)
        this.moveStep()
    }

    moveStep() {
        this.position.plusEqual(this.velocity)
    }
}

class Game {
    get scoreText() {
        return `Score: ${this.score}`
    }

    constructor() {
        const liveCount = 3
        this.lives      = liveCount
        this.score      = 0
    }

    run() {
        this.createCanvas()

        const color = "#0095DD"
        this.createBall  (color)
        this.createPaddle(color)
        this.bricks = new BrickSet(this.canvas)
    }

    pressRight(on) {
        this.paddle.rightPressed = on
    }

    pressLeft(on) {
        this.paddle.leftPressed = on
    }

    createCanvas() {
        this.canvas        = new Canvas('canvas')
        this.canvas.onDraw = (canvas) => this.draw(canvas)
    }

    createBall(color) {
        const velocitySize = 5
        const velocity     = new Vector2(velocitySize, -velocitySize)
        this.ball          = new Ball(new Vector2(canvas.width / 2, canvas.height - 30), velocity, color)
    }

    createPaddle(color) {
        const paddleHeight = 10
        const paddleWidth  = 75
        this.paddle = new Paddle((canvas.width - paddleWidth) / 2, new Vector2(paddleWidth, paddleHeight), color)
    }

    reset() {
        this.paddle.reset()
        this.ball  .reset()
    }

    draw(canvas) {
        switch (this.ball.detectCollision(canvas, this.paddle, this.bricks).value) {
            case gameStatus.scored.value:
                this.countUpScore()
                break
            case gameStatus.over  .value:
                this.countDownLives()
                break
            default:
                break
        }
        this.drawAll(canvas)
    }

    countUpScore() {
        this.score++
        if (this.score == this.bricks.brickCount)
            this.gameWin()
    }
    
    countDownLives() {
        this.lives--
        if (!this.lives)
            this.gameOver()
        else
            this.reset()
    }

    drawAll(canvas) {
        this.ball  .draw(canvas)
        this.paddle.draw(canvas)
        this.bricks.draw(canvas)
        this.drawScore  (canvas)
        this.drawLives  (canvas)
    }

    drawScore(canvas) {
        this.fillText(canvas, 8, this.scoreText)
    }

    drawLives(canvas) {
        this.fillText(canvas, canvas.size.x - 65, `Lives: ${this.lives}`)
    }

    fillText(canvas, x, text) {
        const y     = 20
        const color = '#0095DD'
        const font  = '16px Arial'
        canvas.fillText(new Vector2(x, y), text, color, font)
    }

    gameOver() {
        const message = 'GAME OVER'
        this.showMessage(message)
    }
    
    gameWin() {
        const message = 'YOU WIN, CONGRATS!'
        this.showMessage(message)
    }

    showMessage(message) {
        alert(`${message} - ${this.scoreText}`)
        document.location.reload()
        this.canvas.stop()
    }
}

class Program {
    main() {
        this.game = new Game()
        this.initilizeHandlers()
        this.game.run()
    }

    initilizeHandlers() {
        document.addEventListener('keydown'  , e => this.onKeyDown  (e), false)
        document.addEventListener('keyup'    , e => this.onKeyUp    (e), false)
        document.addEventListener("mousemove", e => this.onMouseMove(e), false)
    }

    onKeyDown(e) {
        if      (e.key == "Right" || e.key == "ArrowRight")
            this.game.pressRight(true)
        else if (e.key == "Left"  || e.key == "ArrowLeft" )
            this.game.pressLeft(true)
    }
    
    onKeyUp(e) {
        if      (e.key == "Right" || e.key == "ArrowRight")
            this.game.pressRight(false)
        else if (e.key == "Left"  || e.key == "ArrowLeft" )
            this.game.pressLeft(false)
    }

    onMouseMove(e) {
        const relativeX = e.clientX - this.game.canvas.offset.x
        if (Utility.isBetween(relativeX, 0, this.game.canvas.size.x))
            this.game.paddle.position = relativeX - this.game.paddle.size.x / 2
    }
}

window.onload = () => new Program().main()
