# homebridge-abode
[Homebridge](https://github.com/nfarina/homebridge) plugin that supports commands for arming and disarming the abode alarm system 

## Installation

```
sudo npm install -g xrvk/homebridge-abode
```

## Configuration

Configuration sample:

```json
"accessories": [
    {
        "accessory":      "Garage",
            "name":           "The Garage",
            "abode": {
                "username":      "",
                "password":      "",
            }
    }
]

```

## Abode API

I created and am using [abode-api](https://github.com/hbeckeri/abode-api) to control the alam to get the status of the door contact in my other library [homebridge-abode-garage](https://github.com/hbeckeri/homebridge-abode-garage).

You need to specify your abode login credentials in the configuration file.
