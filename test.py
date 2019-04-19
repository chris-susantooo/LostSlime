from pynput.keyboard import Key, Listener
import time
import contextlib
with contextlib.redirect_stdout(None):
    import pygame
import keyboard
import json

data = {}  
data['song'] = []  

begin = time.time()
pygame.mixer.init()
pygame.mixer.music.load("testing.ogg")
pygame.mixer.music.play()

def on_press(key):
    now = time.time() - begin
    print('{0} pressed'.format(
        key))
    k = keyboard.read_key()
    data['song'].append({  
    'key': k,
    'time': now,
    })

def on_release(key):
    if key == Key.esc:
        # Stop listener
        return False

# Collect events until released
with Listener(
        on_press=on_press,
        on_release=on_release) as listener:
    listener.join()

with open('data.txt', 'w') as outfile:  
    json.dump(data, outfile)