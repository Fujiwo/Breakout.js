import tkinter as tk

class BlockBreaker:
    def __init__(self, master):
        self.master = master
        self.canvas = tk.Canvas(self.master, width=600, height=400, bg='white')
        self.canvas.pack()
        self.paddle = Paddle(self.canvas, 'blue')
        self.ball = Ball(self.canvas, self.paddle, 'red')
        self.canvas.bind_all('<Key>', self.key_press)

    def key_press(self, event):
        if event.keysym == 'Left':
            self.paddle.move(-10)
        elif event.keysym == 'Right':
            self.paddle.move(10)

    def run(self):
        self.ball.move()

class Paddle:
    def __init__(self, canvas, color):
        self.canvas = canvas
        self.id = canvas.create_rectangle(0, 0, 100, 10, fill=color)
        self.canvas.move(self.id, 200, 300)

    def move(self, distance):
        self.canvas.move(self.id, distance, 0)

class Ball:
    def __init__(self, canvas, paddle, color):
        self.canvas = canvas
        self.paddle = paddle
        self.id = canvas.create_oval(10, 10, 25, 25, fill=color)
        self.canvas.move(self.id, 245, 100)
        self.xspeed = 2
        self.yspeed = -2

    def move(self):
        self.canvas.move(self.id, self.xspeed, self.yspeed)
        pos = self.canvas.coords(self.id)
        if pos[1] <= 0 or pos[3] >= 400:
            self.yspeed = -self.yspeed
        if pos[0] <= 0 or pos[2] >= 600:
            self.xspeed = -self.xspeed
        paddle_pos = self.canvas.coords(self.paddle.id)
        if pos[2] >= paddle_pos[0] and pos[0] <= paddle_pos[2]:
            if pos[3] >= paddle_pos[1] and pos[3] <= paddle_pos[3]:
                self.yspeed = -self.yspeed
        self.canvas.after(20, self.move)

root = tk.Tk()
game = BlockBreaker(root)
root.mainloop()
