import math
from enum import Enum

class Utility:

    def is_between(self, value, minimum, maximum):
        return minimum <= value <= maximum

    def some2d(self, array2d, exists):
        for item in array2d:
            if exists(item):
                return True
        return False

    def filter2d(self, array2d, selector):
        return [item for item in array2d if selector(item)]

class Vector2:

    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, other):
        return Vector2(self.x + other.x, self.y + other.y)

    def __iadd__(self, other):
        self.x += other.x
        self.y += other.y
        return self

    def __sub__(self, other):
        return Vector2(self.x - other.x, self.y - other.y)

    def __isub__(self, other):
        self.x -= other.x
        self.y -= other.y
        return self

    def __mul__(self, other):
        if isinstance(other, Vector2):
            return Vector2(self.x * other.x, self.y * other.y)
        else:
            return Vector2(self.x * other, self.y * other)

    def __imul__(self, other):
        if isinstance(other, Vector2):
            self.x *= other.x
            self.y *= other.y
        else:
            self.x *= other
            self.y *= other
        return self

    def __truediv__(self, other):
        if isinstance(other, Vector2):
            return Vector2(self.x / other.x, self.y / other.y)
        else:
            return Vector2(self.x / other, self.y / other)

    def __itruediv__(self, other):
        if isinstance(other, Vector2):
            self.x /= other.x
            self.y /= other.y
        else:
            self.x /= other
            self.y /= other
        return self

    def __repr__(self):
        return f"Vector2({self.x}, {self.y})"

class Circle:

    def __init__(self, position, radius):
        self.position = position
        self.radius = radius

class Rectangle:

    def __init__(self, position, size):
        self.position = position
        self.size = size

    def right_bottom(self):
        return Vector2(self.position.x + self.size.x, self.position.y + self.size.y)

    def is_on(self, position):
        return self.right_bottom().x >= position.x >= self.position.x and self.right_bottom().y >= position.y >= self.position.y

class Canvas:

    def __init__(self, canvas_id):
        self.canvas = document.getElementById(canvas_id)
        self.context = self.canvas.getContext("2d")

    def stop(self):
        self.canvas.removeEventListener("draw", self.on_draw)

    def fill_circle(self, circle, color):
        self.context.beginPath()
        self.context.arc(circle.position.x, circle.position.y, circle.radius, 0, 2 * math.pi)
        self.context.fillStyle = color
        self.context.fill()

    def fill_rectangle(self, rectangle, color):
        self.context.beginPath()
        self.context.rect(rectangle.position.x, rectangle.position.y, rectangle.size.x, rectangle.size.y)
        self.context.fillStyle = color
        self.context.fill()

    def fill_text(self, position, text, color, font):
        self.context.fillStyle = color
        self.context.font = font
        self.context.fillText(text, position.x, position.y)

class Paddle:

    def __init__(self, position, size, color):
        self.position = position
        self.size = size
        self.color = color

    def draw(self, canvas):
        canvas.fill_rectangle(self, self.color)

    def is_on(self, position):
        return self.position.x <= position.x <= self.position.x + self.size.x and self.position.y <= position.y <= self.position.y + self.size.y

    def reset(self):
        self.position.x = self.size.x / 2

    def move_step(self, canvas):
        self.position += self.velocity
        if self.position.x < 0:
            self.position.x = 0
        elif self.position.x + self.size.x > canvas.size.x:
            self.position.x = canvas.size.x - self.size.x

class Brick:

    def __init__(self, position, status):
        self.position = position
        self.status = status

class game_status(Enum):
    normal = 0
    scored = 1
    over = -1

class BrickSet:

    def __init__(self, canvas):
        self.bricks = []
        self.row_count = 3
        self.column_count = 8
        self.padding = 10
        self.brick_size = Vector2(canvas.size.x / (self.row_count + 1), canvas.size.y / self.column_count)
        self.brick_offset = Vector2(self.padding, self.padding)

        for row in range(self.row_count):
            for column in range(self.column_count):
                self.bricks.append(Brick(Vector2(self.brick_offset.x + column * self.brick_size.x, self.brick_offset.y + row * self.brick_size.y), True))

    def detect_collision(self, ball_position):
        for brick in self.bricks:
            if brick.status and brick.is_on(ball_position):
                brick.status = False
                return game_status.scored
        return game_status.normal

    def draw(self, canvas):
        for brick in self.bricks:
            if brick.status:
                canvas.fill_rectangle(brick, brick.color)

class Ball:

    def __init__(self, position, velocity, color):
        self.original_position = position
        self.position = position
        self.velocity = velocity
        self.radius = 10
        self.color = color

    def detect_collision(self, canvas, paddle, brick_set):
        status = game_status.normal
        if self.position.y < self.radius:
            status = game_status.over
        elif paddle.is_on(self.position):
            self.velocity.x = -self.velocity.x
        elif brick_set.detect_collision(self.position):
            self.velocity.y = -self.velocity.y
            status = game_status.scored
        return status

    def reset(self):
        self.position = self.original_position
        self.velocity = Vector2(5, -5)

    def draw(self, canvas):
        canvas.fill_circle(self, self.color)

class Game:

    def press_right(self):
        self.paddle.velocity.x = 10

    def press_left(self):
        self.paddle.velocity.x = -10

    def draw(self):
        self.canvas.clear()
        self.brick_set.draw(self.canvas)
        self.paddle.draw(self.canvas)
        self.ball.draw(self.canvas)
        self.draw_score(self.canvas)

    def draw_score(self, canvas):
        canvas.fill_text(Vector2(10, 10), f"Score: {self.score}", "black", "12px sans-serif")
        canvas.fill_text(Vector2(10, 30), f"Lives: {self.lives}", "black", "12px sans-serif")

    def update(self):
        self.paddle.move_step(self.canvas)
        self.ball.move_step()
        status = self.ball.detect_collision(self.canvas, self.paddle, self.brick_set)
        if status == game_status.over:
            self.lives -= 1
            if self.lives == 0:
                self.game_over()
            else:
                self.ball.reset()
        elif status == game_status.scored:
            self.score += 1
            self.brick_set.bricks = self.brick_set.filter2d(lambda brick: brick.status)

    def run(self):
        self.canvas.on_draw = self.draw
        self.canvas.start()
        while True:
            self.update()
            self.canvas.request_draw()

    def game_over(self):
        self.canvas.fill_text(Vector2(self.canvas.size.x / 2, self.canvas.size.y / 2), "Game Over", "black", "24px sans-serif")
        self.canvas.request_draw()


class Program:

    def __init__(self):
        self.game = Game()

    def main(self):
        self.game.run()


if __name__ == "__main__":
    program = Program()
    program.main()
