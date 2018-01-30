# **DIPS-FREE Server**
The **Dynamic IP's Free** project is developed by one person, as a side project
to create a powerful yet free alternative to Dynamic IP Providers such as: No-IP and
Dyn-Dns

---

## Features
Currently supported Features:
  - Authentication
    - Username
    - Device
    - HTTP Basic Auth
  - SSL
  - Multiple Device support
  - Logs
  - Fully Configurable
  - Anti-Human design
  - Resistance to scanning tools

Planned / Upcoming Features:
  - Multiple server types (UDP, TCP)
  - Menu??
  - Easier way to edit config?

  ---

## Setup
  - Extract this folder, and save it somewhere.
  - CD to that directory in a PowerShell or other Terminal.
  - Run `npm install`.
  - Then do `sudo node app.js` to keep it running forever.

After this, you will encounter an error - requiring you to change the config to point to a valid certificate.
To do this:
  - Navigate to `Config/`.
  - Using **sudo** open `config.json` with preferred text editor.
  - Modify the `Key_Path` and `Cert_Path` values to point to your key and certificate files.
  - *Optionally* you may now explore and edit other options in the config.

And that's all you need to do for the setup.
Simply run the script again using `sudo node app.js`

---

### To view logs:
  - Navigate to the directory of the server.
  - Go into `Logs/`
  - Locate the username of the computer that you'd like to see, and enter the folder.
  - The latest IP address of a certain device for that username will be inside `DEVICENAME.txt`.

### Configuration file
  - `Devices` and `Usernames` accepts an array of strings.
  - `StatusCode` accepts any valid http status code integer.
  - `users` accepts an object, which has the a username (key) and password (value).
  - `AuthMethod` accepts an integer `0-2`
  ```javascript
  0 = Accept All,
  1 = Blacklist,
  2 = Whitelist
  ```
  - `authType` accepts an integer `0-2`
  ```javascript
  0 = Devices,
  1 = Users,
  2 = Both Devices and Users
  ```
  - `Cert_Path` accepts a string, which is the relative path to the `.cert` file.
  - `Key_Path` accepts a string, which is the relative path to the `.key` file.


---

Currently very early alpha.
