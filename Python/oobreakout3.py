import tkinter as tk
from tkinter import Canvas, ttk

# Utility functions
class Utility:
    @staticmethod
    def is_between(value, minimum, maximum):
        return minimum <= value <= maximum

    @staticmethod
    def some2d(array2d, exists):
        for array in array2d:
            if any(exists(element) for element in array):
                return True
        return False

    @staticmethod
    def filter2d(array2d, selector):
        return [element for array in array2d for element in array if selector(element)]

# Vector2 class
class Vector2:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def plus(self, other):
        return Vector2(self.x + other.x, self.y + other.y)

    def plus_equal(self, other):
        self.x += other.x
        self.y += other.y

    def clone(self):
        return Vector2(self.x, self.y)

# Circle class
class Circle:
    def __init__(self, position, radius):
        self.position = position
        self.radius = radius

# Rectangle class
class Rectangle:
    @property
    def right_bottom(self):
        return self.position.plus(self.size)

    def __init__(self, position, size):
        self.position = position
        self.size = size

    def is_on(self, position):
        right_bottom = self.right_bottom
        return Utility.is_between(position.x, self.position.x, right_bottom.x) \
            and Utility.is_between(position.y, self.position.y, right_bottom.y)

# Canvas class
class Canvas:
    @property
    def size(self):
        return Vector2(self.canvas.winfo_width(), self.canvas.winfo_height())

    @property
    def offset(self):
        return Vector2(self.canvas.winfo_x(), self.canvas.winfo_y())

    def __init__(self, canvas_id):
        self.canvas = tk.Canvas(master=None, width=640, height=480, background="#ddd")
        self.canvas.pack()
        self.context = self.canvas.create_oval(0, 0, 0, 0)
        self.on_draw = lambda canvas: None

        self.draw()

    def stop(self):
        self.canvas.destroy()

    def fill_circle(self, circle, color):
        self.canvas.delete(self.context)
        self.context = self.canvas.create_oval(
            circle.position.x - circle.radius,
            circle.position.y - circle.radius,
            circle.position.x + circle.radius,
            circle.position.y + circle.radius,
            fill=color)

    def fill_rectangle(self, rectangle, color):
        self.canvas.delete(self.context)
        self.context = self.canvas.create_rectangle(
            rectangle.position.x,
            rectangle.position.y,
            rectangle.position.x + rectangle.size.x,
            rectangle.position.y + rectangle.size.y,
            fill=color)

    def fill_text(self, position, text, color, font):
        self.canvas.create_text(position.x, position.y, text=text, fill=color, font=font)

    def draw(self):
        self.clear()
        self.on_draw(self)
        self.canvas.after(16, self.draw)

    def clear(self):
        self.canvas.delete(tk.ALL)

# Paddle class
class Paddle:
    def __init__(self, position, size, color):
        self.original_position = position
        self.position = position
        self.size = size
        self.color = color
        self.right_pressed = False
        self.left_pressed = False

    def draw(self, canvas):
        canvas.fill_rectangle(Rectangle(self.position, self.size), self.color)
        self.move_step(canvas)

    def is_on(self, position):
        return Utility.is_between(position.x, self.position, self.position + self.size.x)

    def reset():
        self.position = self.original_position

    def move_step(self, canvas):
        step_size = 7

        if self.right_pressed:
            self.position += step_size
            if self.position + self.size.x > canvas.size.x:
                self.position = canvas.size.x - self.size.x

        if self.left_pressed:
            self.position -= step_size
            if self.position < 0:
                self.position = 0

class Brick:
    def __init__(self, position, status):
        self.position = position
        self.status = status

class BrickSet:
    def __init__(self, canvas):
        self.row_count = 3
        self.column_count = 8
        self.padding = 10

        margin = 30
        self.brick_offset = Vector2(margin, margin)

        brick_height = 20
        brick_width = (canvas.size.x - margin * 2 - self.padding * (self.column_count - 1)) / self.column_count
        self.brick_size = Vector2(brick_width, brick_height)

        self.initialize_bricks()

    def initialize_bricks(self):
        self.bricks = []
        for x in range(self.column_count):
            self.bricks.append([])
            for y in range(self.row_count):
                self.bricks[x].append(Brick(self.get_brick_position(Vector2(x, y)), True))

    def get_brick_position(self, position):
        return self.brick_offset.plus(Vector2((self.brick_size.x + self.padding) * position.x,
                                                    (self.brick_size.y + self.padding) * position.y))

    def detect_collision(self, ball_position):
        return Utility.some2d(self.bricks, brick => brick.status and brick.is_on(ball_position))

    def draw(self, canvas):
        color = "#0095DD"
        bricks = Utility.filter2d(self.bricks, brick => brick.status)
        bricks.forEach(brick => canvas.fill_rectangle(Rectangle(brick.position, self.brick_size), color))

class Ball:
    def __init__(self, position, velocity, color):
        self.original_position = position.clone()
        self.position = position
        self.velocity = velocity
        self.radius = 10
        self.color = color

    def detect_collision(self, canvas, paddle, brick_set):
        if not Utility.is_between(self.position.x + self.velocity.x, self.radius, canvas.size.x - self.radius):
            self.velocity.x = -self.velocity.x

        if self.position.y + self.velocity.y < self.radius:
            self.velocity.y = -self.velocity.y
            if paddle.is_on(self.position):
                self.velocity.y = -self.velocity.y
            else:
                return game

class Game:
    def __init__(self):
        self.canvas = Canvas('canvas')
        self.paddle = Paddle(Vector2(canvas.size.x / 2, canvas.size.y - 30), Vector2(100, 20), "#0095DD")
        self.ball = Ball(Vector2(canvas.size.x / 2, canvas.size.y - 50), Vector2(5, -5), "#0095DD")
        self.brick_set = BrickSet(self.canvas)

    def run(self):
        self.canvas.on_draw = self.draw
        self.canvas.start()

    def draw(self, canvas):
        self.canvas.clear()
        self.paddle.draw(canvas)
        self.ball.draw(canvas)
        self.brick_set.draw(canvas)

    def score(self):
        return self.brick_set.brickCount - len(list(filter(lambda brick: not brick.status, self.brick_set.bricks)))

    def game_over(self):
        self.canvas.fill_text(Vector2(100, 100), "Game Over", "#ff0000", 20)

    def on_key_down(self, event):
        if event.key == "Right" or event.key == "ArrowRight":
            self.paddle.right_pressed = True
        elif event.key == "Left" or event.key == "ArrowLeft":
            self.paddle.left_pressed = True

    def on_key_up(self, event):
        if event.key == "Right" or event.key == "ArrowRight":
            self.paddle.right_pressed = False
        elif event.key == "Left" or event.key == "ArrowLeft":
            self.paddle.left_pressed = False

    def update(self):
        self.ball.move_step(self.canvas)
        collision_status = self.ball.detect_collision(self.canvas, self.paddle, self.brick_set)
        if collision_status == game.GameStatus.scored:
            self.score += 1
        elif collision_status == game.GameStatus.over:
            self.game_over()

    def mainloop(self):
        while True:
            self.update()
            self.canvas.after(16, self.mainloop)

if __name__ == "__main__":
    game = Game()
    game.mainloop()
