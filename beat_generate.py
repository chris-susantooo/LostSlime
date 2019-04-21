from pynput import keyboard
import time
import contextlib
with contextlib.redirect_stdout(None):
    import pygame
import json

fn = input()
# comment
data = {}  
data['song'] = []  

begin = time.time()
pygame.mixer.init()
pygame.mixer.music.load(fn)
pygame.mixer.music.play()

def get_key_name(key):
    if isinstance(key, keyboard.KeyCode):
        return key.char
    else:
        return str(key)

def on_press(key):
    now = time.time() - begin
    print('{0} pressed'.format(
        key))
    k = get_key_name(key)
    data['song'].append({  
    'key': k,
    'time': now,
    })

def on_release(key):
    if str(key) == 'Key.esc':
        # Stop listener
        return False

# Collect events until released
with keyboard.Listener(
        on_press=on_press,
        on_release=on_release) as listener:
    listener.join()

with open('song_data.txt', 'w') as outfile:  
    json.dump(data, outfile)