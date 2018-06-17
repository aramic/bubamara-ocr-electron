# Bubamara OCR with Electron

This is an Electron GUI wrapped around the original Bubamara OCR Python script. It is based on https://github.com/fyears/electron-python-example.

![Bubamara OCR calibration](https://github.com/aramic/bubamara-ocr-electron/raw/master/assets/img/calibration/tablet.jpg)

## Requirements

This is tested to work with
- Mac OSX 10.12.6
- Python 3.5.5
- Node 6.14.3

## Install Python dependencies for building locally

Use `pip` to install `opencv`, `numpy`, `zerorpc` and `pyinstaller`.
```
pip install opencv
pip install numpy
pip install zerorpc
pip install pyinstaller

# for windows only
pip install pypiwin32 # for pyinstaller
```

## Install Electron

First, clean all caches.
```
# On Linux / OS X
# clean caches
npm cache clean
rm -rf ~/.node-gyp
rm -rf ~/.electron-gyp
rm -rf ./node_modules

# On Window PowerShell (not cmd.exe!!!)
# clean caches
Remove-Item "$($env:USERPROFILE)\.node-gyp" -Force -Recurse -ErrorAction Ignore
Remove-Item "$($env:USERPROFILE)\.electron-gyp" -Force -Recurse -ErrorAction Ignore
Remove-Item .\node_modules -Force -Recurse -ErrorAction Ignore
```

Then, install `electron` using `npm`. It's important to install Electron 1.7.6.
```
npm install --runtime=electron --target=1.7.6

# verify the electron binary and its version by opening it
./node_modules/.bin/electron
```

Sometimes issues might come up with the `zeromq` dependency. If that is the case, try following:
```
npm cache clean
npm rebuild zeromq --runtime=electron --target=1.7.2
```

## Run the app

Navigate to the app's directory in terminal and write
```
npm start
```

## Package for distribution

Use `pyinstaller` to package the Python aspect first. It does not always include `_sysconfigdata`, so the `--hiddenimport` argument is helpful.

```
pyinstaller pyfiles/api.py --distpath pydist --hiddenimport _sysconfigdata

rm -rf build/
rm -rf api.spec
```

Test that Python was packaged correctly by navigating to `pydist/api/` and running the `api` executable to see if there are any errors.

Then, move on to the Electron packaging. The `--icon` argument is required for Mac.
```
./node_modules/.bin/electron-packager . --overwrite --ignore="pyfiles$" --icon "assets/icons/mac/icon.icns"
```