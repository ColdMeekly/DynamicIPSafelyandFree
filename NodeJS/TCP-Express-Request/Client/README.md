# TCP Express IP Receiver (Server)
This module uses Express and HTTPS to host a small website which will be used to receive IP addresses.

## Setup
  - Extract this folder, and save it somewhere.
  - CD to that directory in a PowerShell or other Terminal.
  - Run `npm install`.
  - Then do `sudo forever start app.js` to keep it running forever.

And that's all you need to do. To view logs:
  - Navigate to the directory of the server.
  - Go into `Logs/`
  - Locate the username of the computer that you'd like to see, and enter the folder.
  - The latest IP address of a certain device for that username will be inside `DEVICENAME.txt`.

This is still work in progress, and many more features are to be created.
