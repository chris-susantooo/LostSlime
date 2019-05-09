# LostSlime
A Multiplayer Rhythm/Educational Game Made with Node.js, Express and Socket.IO.

## Note
This project is currently work in progress. It is not ready for any actual use. Node.js has to be installed prior to development of this project, please visit the [download site](https://nodejs.org/en/) to download the LTS version (recommended).

## Installation
1. Clone this repository to your computer. If you are using VSCode, press ```Ctrl+Shift+P``` to open up the Command Palette, type in ```Git: clone``` and press enter, then copy and paste in this repo's url, choose a local folder of your choice.
2. Open a terminal instance, navigate to your root of LostSlime folder and type:
~~~
npm init -f
~~~
  This initializes the package.json to keep track of the packages that this project depends on. If you are using VSCode, you may press ``Ctrl+~`` to bring up the terminal instead.
 
3. Install the required modules:
~~~
npm install
~~~
If you are using macOS, you may have to install nodemon separately with sudo permission:
~~~
sudo npm install -g nodemon
~~~
4. You're done! Now type in:
~~~
nodemon app.js
~~~
This starts the server listening at port ```8081```. Open up your browser and visit ```localhost:8081``` to see the results!
