# Get started

- Install arduino IED 1.6.8 or above
- Config the Arduino IDE to work with (ESP8266)[http://esp8266.github.io/Arduino/versions/2.3.0/doc/installing.html]
- Config the arduino IDE to upload files to ESP8266 flash file system SPIFFS
    - Download the (tool)[https://github.com/esp8266/arduino-esp8266fs-plugin/releases/download/0.2.0/ESP8266FS-0.2.0.zip]
    - In your Arduino sketchbook directory, create tools directory if it doesn't exist yet
    - Unpack the tool into tools directory (the path will look like `<home_dir>/Arduino/tools/ESP8266FS/tool/esp8266fs.jar`)
    - Restart Arduino IDE
    - Go to sketch directory (choose Sketch > Show Sketch Folder)
    - Create a directory named `data` and any files you want in the file system there
    - Make sure you have selected a board, port, and closed Serial Monitor
    - Select Tools > ESP8266 Sketch Data Upload. This should start uploading the files into ESP8266 flash file system. When done, IDE status bar will display SPIFFS Image Uploaded message.

# Configure the Slave

- Connect to the Slave network WIFI
- Acess the local IP: 192.168.4.1
- Configure the data
- Save!
