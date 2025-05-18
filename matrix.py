import random
import shutil
import time
import sys

# Get terminal size
columns, rows = shutil.get_terminal_size()
chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()"

# Store positions for each column
drops = [0 for _ in range(columns)]

try:
    while True:
        print("\033[1;32m", end="")  # Green color
        for i in range(columns):
            if random.random() > 0.975:
                drops[i] = 0
            char = random.choice(chars) if drops[i] > 0 else " "
            print(char, end="")
            drops[i] += 1
        print()
        time.sleep(0.05)
except KeyboardInterrupt:
    print("\033[0m")  # Reset color
    sys.exit()
