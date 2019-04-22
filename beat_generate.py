from pynput import keyboard
import time
import contextlib
with contextlib.redirect_stdout(None):
    import pygame
import json  
import threading
from tkinter import *            

def play_song():
    data = []  
    

    begin = time.time()
    pygame.mixer.init()
    pygame.mixer.music.load(e1.get())
    pygame.mixer.music.play()
    def callback():
        def get_key_name(key):
            if isinstance(key, keyboard.KeyCode):
                return key.char
            else:
                return str(key)

        def on_press(key):
            now = time.time() - begin
            k = get_key_name(key)
            T.insert(END,k)
            T.insert(END," input at ")
            T.insert(END,now)
            T.insert(END,"\n")
            T.see(END)
            data.append({  
            'key': k,
            'time': now,
            })

        def on_release(key):
            if str(key) == 'Key.enter':
                # Stop listener
                return False

        with keyboard.Listener(on_press=on_press,on_release=on_release) as listener:
           listener.join()

        with open(e2.get(), 'w') as outfile:  
            json.dump(data, outfile)
    t = threading.Thread(target=callback)
    t.start()


window = Tk()
window.title("Beat generator")
window.geometry('640x480')
Label(window, text="Song file").grid(row=0)
Label(window, text="Output file").grid(row=1)
e1 = Entry(window)
e2 = Entry(window)
e1.grid(row=0, column=1)
e2.grid(row=1, column=1)


Label(window, text="Input here").grid(row=5, column=0, columnspan=2)
Label(window, text="Please press \"Enter\" for saving JSON").grid(row=6, column=0, columnspan=2)

Label(window, text="Record").grid(row=6, column=2)
s = Scrollbar(window)
T = Text(window, height=30, width=30)
T.grid(row=7,column=2, rowspan=3, padx=20)
s.config(command=T.yview)
T.config(yscrollcommand=s.set)
T.see(END)

s1 = Scrollbar(window)
T1 = Text(window, height=30, width=20)
T1.grid(row=7,column=0, columnspan=2)
s1.config(command=T1.yview)
T1.config(yscrollcommand=s1.set)

Button(window, text='Confirm', command=play_song).grid(row=0, column=2, rowspan=2, sticky=W, pady=4)
window.mainloop()








