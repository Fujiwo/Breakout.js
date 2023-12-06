import tkinter as tk

class BrickBreakerGame:
    def __init__(self, root):
        self.root = root
        self.canvas = tk.Canvas(self.root, width=800, height=600, bd=0, highlightthickness=0)
        self.canvas.pack()
        self.root.update()

        self.ball = self.canvas.create_oval(10, 10, 25, 25, fill="red")
        self.paddle = self.canvas.create_rectangle(0, 0, 100, 10, fill="black")
        self.canvas.move(self.paddle, 200, 300)

        self.bricks = []
        for i in range(5):
            brick = self.canvas.create_rectangle(10, 50 + i*60, 790, 80 + i*60, fill="blue")
            self.bricks.append(brick)

        self.root.bind("<Left>", self.move_left)
        self.root.bind("<Right>", self.move_right)
        self.root.bind("<Motion>", self.mouse_move)

        self.score = 0
        self.lives = 3

        self.score_label = tk.Label(self.root, text=f"Score: {self.score}")
        self.score_label.pack()
        self.lives_label = tk.Label(self.root, text=f"Lives: {self.lives}")
        self.lives_label.pack()

        self.play()

    def play(self):
        self.canvas.move(self.ball, 2, 2)
        pos = self.canvas.coords(self.ball)
        paddle_pos = self.canvas.coords(self.paddle)

        if pos[1] <= 0 or pos[3] >= self.canvas.winfo_height():
            self.canvas.move(self.ball, 0, -2)
        if pos[0] <= 0 or pos[2] >= self.canvas.winfo_width():
            self.canvas.move(self.ball, -2, 0)
        if pos[2] >= paddle_pos[0] and pos[0] <= paddle_pos[2] and pos[3] >= paddle_pos[1]:
            self.canvas.move(self.ball, 0, -2)

        for brick in self.bricks:
            brick_pos = self.canvas.coords(brick)
            if pos[2] >= brick_pos[0] and pos[0] <= brick_pos[2] and pos[3] >= brick_pos[1] and pos[1] <= brick_pos[3]:
                self.canvas.delete(brick)
                self.bricks.remove(brick)
                self.canvas.move(self.ball, 0, -2)
                self.score += 1
                self.score_label.config(text=f"Score: {self.score}")

        if len(self.bricks) == 0:
            print("YOU WIN!")
            return

        if pos[3] >= self.canvas.winfo_height():
            self.lives -= 1
            self.lives_label.config(text=f"Lives: {self.lives}")
            if self.lives == 0:
                print("GAME OVER")
                return
            else:
                self.canvas.move(self.ball, -pos[0], -pos[1])

        self.root.after(10, self.play)

    def move_left(self, event):
        pos = self.canvas.coords(self.paddle)
        if pos[0] > 0:
            self.canvas.move(self.paddle, -20, 0)

    def move_right(self, event):
        pos = self.canvas.coords(self.paddle)
        if pos[2] < self.canvas.winfo_width():
            self.canvas.move(self.paddle, 20, 0)

    def mouse_move(self, event):
        paddle_pos = self.canvas.coords(self.paddle)
        dx = event.x - (paddle_pos[0] + paddle_pos[2]) / 2
        if paddle_pos[0] + dx > 0 and paddle_pos[2] + dx < self.canvas.winfo_width():
            self.canvas.move(self.paddle, dx, 0)

if __name__ == "__main__":
    root = tk.Tk()
    game = BrickBreakerGame(root)
    root.mainloop()

