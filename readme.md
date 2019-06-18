# Usage

1. `npm install`
2. For Ubuntu/Xubuntu you need to install `nmcli`
3. Create `.env` file at the root project folder and fill the variables
4. Verify that you are connected to the WiFi that you want to reset
5. `npm start`

# Windows
You will need to open the cmd or terminal with **Administrator privileges**

To get get the **WIFI_SSID** run on terminal 
```bash
netsh wlan show profile
```
Should be the same ssid and profile name 

To get the **WIFI_INTERFACE_NAME** run on terminal
```bash
netsh wlan show networks
```

# Ubuntu/Xubuntu
To get get the **WIFI_SSID** run on terminal 
```bash
nmcli connection show
```
