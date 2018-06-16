// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


// renderer.js

const zerorpc = require("zerorpc")
const client = new zerorpc.Client()
const path = require('path')
const fs = require('fs')
const electron = require('electron')
const remote = require('electron').remote
const {dialog} = require('electron').remote
const BrowserWindow = remote.BrowserWindow
const selectFile = document.getElementById('select-file')
const key = document.getElementById('key')
const storage = remote.app.getPath('userData')
const junk = require('junk');

// Start the server for Python and confirm it is running

client.connect("tcp://127.0.0.1:4242")
client.invoke("echo", "server ready", (err, res) => {
  if(err || res !== 'server ready') {
    console.error(err)
  } else {
    console.log("server is ready")
  }
})

// Read the file

selectFile.addEventListener('click',function(){
    dialog.showOpenDialog({ filters: [
        { name: 'Images', extensions: ['jpg', 'png', 'gif'] }]}, 
        function (fileNames) {
        if(fileNames === undefined){
            console.log("No file selected")
        }else{
            document.getElementById("select-file").value = fileNames[0];
            readFile(fileNames[0])
        }
    })
},false)

function readFile(filepath) {
    fs.readFile(filepath, 'utf-8', function (err, data) {
        if(err){
            console.log("An error ocurred reading the file :" + err.message)
            return
        }
        selectFile.classList.add('loading')
        selectFile.innerHTML = "Loading <span class=\'ellipses\'><span>.</span><span>.</span><span>.</span></span>";

        client.invoke("bubamaraGen", filepath, storage, (error, res) => {
            if(error) {
                console.log(error)
                selectFile.innerHTML = "Mysteriously, BUBAMARA-OCR was unable to read that image. Perhaps you can try a different one?"
                selectFile.classList.remove('loading')
            } else {
                output = res.toString('utf8')
                let inputImg = filepath
                formatInterp(inputImg, output)
            }
        })
    })
}

// Format the interpretation

function formatInterp(inputImg, output) {

    let interpretation = ''
    let fileTitle = inputImg.split("/").pop()
    let interpArray = output.split(" ")
    interpArray.pop()

    for (let i = 0; i < interpArray.length; i++) {        
        let letter = interpArray[i]
        let cardDir = path.resolve(__dirname, './assets/img/cards/' + letter + '/')   
        let sectImg = path.resolve(__dirname, storage + '/cache/' + fileTitle + '/' + i + '.jpg')

        //interpretation += '<div class=\'letter ' + letter + '\'>' + letter + '<div class=\'subworld\'><img src=\'' + randomImage(cardDir) + '\'><div class=\'initial\'>' + letter + '</div><div class=\'bubamara\'></div><div class=\'section\'><img src=\'' + sectImg + '\'></div></div></div> '
        interpretation += '<div class=\'letter\' data-letter=\'' + letter + '\' data-section=\'' + sectImg + '\' data-card=\'' + randomImage(cardDir) + '\'>' + letter + '</div> '
        if( i == interpArray.length - 1 ) {
            makeInterpWin(fileTitle, interpretation)
        }
    }

}

function randomImage(dir) {
    const dirs = fs.readdirSync(dir).map(file => {
      return path.join(dir, file);
    });

    dirs.filter(junk.not)  

    return dirs[Math.floor(Math.random() * (dirs.length-1))]
}

/* Display the interpretation */
function makeInterpWin(fileTitle, interpretation) {
    const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize

    let maxX = width - 640
    let maxY = height - 440

    let randomX = Math.floor(Math.random() * (maxX - 1))
    let randomY = Math.floor(Math.random() * (maxY - 1))

    let winTitle = "Interpretation of " + fileTitle
    let interpWin = new BrowserWindow({
        show: false, 
        title: winTitle,
        width: 640,
        height: 440,
        x: randomX,
        y: randomY
    })


    interpWin.loadURL(require('url').format({
        pathname: path.join(__dirname, 'interpretation.html'),
        protocol: 'file:',
        slashes: true
    }))

    interpWin.webContents.executeJavaScript(`
        document.getElementById("interpretation").innerHTML += "${interpretation}"
    `)


    interpWin.once('ready-to-show', () => {
        interpWin.show()
        selectFile.innerHTML = "Choose image"
        selectFile.classList.remove('loading')
    })

    letterNavigate(interpWin);

}

// Navigate through the letters and display their metadata
function letterNavigate(win) {
    win.webContents.executeJavaScript(`
        let letters = document.getElementsByClassName('letter')
        letters[0].classList.add('active')

        function updateSubWorld(activeLetter) {
            let letter = activeLetter.getAttribute('data-letter')
            let section = activeLetter.getAttribute('data-section')
            let card = activeLetter.getAttribute('data-card')
            let subworld = document.getElementById('subworld')
            console.log(letter)
            console.log(section)
            console.log(card)
            document.getElementById('image').src = card
            document.getElementById('initial').innerHTML = letter
            document.getElementById('subworld').className = letter
            document.getElementById('section').src = section
        }

        updateSubWorld(letters[0])        

        for (let i = 0; i < letters.length; i++) {
            letters[i].addEventListener('mouseover', function() {
                let active = document.getElementsByClassName('active')
                active[0].classList.remove('active')                                
                letters[i].classList.add('active')
                updateSubWorld(letters[i])
            })
        }

        window.addEventListener('keydown', function(e) {
            switch(e.which) {
                case 37: // left

                var index = 0;
                for (let i = 0; i < letters.length; i++) {
                    if( letters[i].classList.contains('active') ) {
                        index = i
                    }
                }
                if( index > 0) {                
                    letters[index].classList.remove('active')                                
                    letters[index-1].classList.add('active')  
                    updateSubWorld(letters[index-1])
                }     

                break;

                case 39: // right

                var index = 0;
                for (let i = 0; i < letters.length; i++) {
                    if( letters[i].classList.contains('active') ) {
                        index = i
                    }
                }

                if( index < (letters.length - 1)) {
                    letters[index].classList.remove('active')                                
                    letters[index+1].classList.add('active')
                    updateSubWorld(letters[index+1])
                }

                break;

                default: return;
            }
            e.preventDefault();

        })

    `)
}

// Get a random position within screen bounds
function randomScreenPosition(winWidth, winHeight) {
    const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize

    let maxX = width - winWidth
    let maxY = height - winHeight

    let randomX = Math.floor(Math.random() * (maxX - 1))
    let randomY = Math.floor(Math.random() * (maxY - 1))
    return {randomX, randomY}
}

// Display the key
key.addEventListener('click', function() {

    const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize

    let maxX = width - 640
    let maxY = height - 440

    let randomX = Math.floor(Math.random() * (maxX - 1))
    let randomY = Math.floor(Math.random() * (maxY - 1))

    let keyWin = new BrowserWindow({
        show: false,
        width: 600,
        height: 400,
        x: randomX,
        y: randomY
    })
    keyWin.loadURL(require('url').format({
        pathname: path.join(__dirname, 'key.html'),
        protocol: 'file:',
        slashes: true
    }))
    
    keyWin.once('ready-to-show', () => {
        keyWin.show()
    })

})