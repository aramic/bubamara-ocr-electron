// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


// renderer.js

const zerorpc = require("zerorpc")
let client = new zerorpc.Client()
client.connect("tcp://127.0.0.1:4242")

const path = require('path')
const fs = require('fs')
const remote = require('electron').remote;
const BrowserWindow = remote.BrowserWindow;
const {dialog} = require('electron').remote
const selectFile = document.getElementById('select-file')
const key = document.getElementById('key')

/* Read the file */
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
    //console.log("readFile started. filepath=" + filepath )        
    fs.readFile(filepath, 'utf-8', function (err, data) {
        if(err){
            alert("An error ocurred reading the file :" + err.message)
            return
        }
        //selectFile.innerHTML = "You have selected: " + filepath;
        //bubamaraGen(calibration, filepath)

        client.invoke("bubamaraGen", filepath, (error, res) => {
        	if(error) {
        		console.error(error)
        	} else {
        		//console.log(res)
        		output = res.toString('utf8')
                let inputImg = filepath
                //console.log(output)
                formatInterp(inputImg, output)
        	}
        })
    })
}

function formatInterp(inputImg, output) {
    //console.log("formatInterp started. output=" + output )    

    let interpArray = output.split(' ')
    let interpretation = ''
    let nameString = inputImg;
    let fileTitle = nameString.split("/").pop();


    for (let i = 0; i < interpArray.length; i++) {        
        let letter = interpArray[i]
        let cardDir = path.resolve(__dirname, './assets/img/cards/' + letter + '/')   
        let sectImg = path.resolve(__dirname, './python/cache/' + fileTitle + '/' + i + '.jpg')
        console.log(sectImg)

        interpretation += '<div class=\'letter ' + letter + '\'>' + letter + '<div class=\'subworld\'><img src=\'' + randomImage(cardDir) + '\'><div class=\'initial\'>' + letter + '</div><div class=\'bubamara\'></div><div class=\'section\'><img src=\'' + sectImg + '\'></div></div></div> '
        if( i == interpArray.length - 1 ) {
            //console.log(interpretation)
            makeInterpWin(fileTitle, interpretation)
        }
        //console.log("interpretation is " + interpretation)
        //outputArray.push(associateImage(letter, cardDir, letterMeta))
        //console.log("interpretation is " + interpretation + "at index " + i)
    }

}

function randomImage(dir) {
    const dirs = fs.readdirSync(dir).map(file => {
      return path.join(dir, file);
    });

    return dirs[Math.floor(Math.random() * (dirs.length-1))]
}

/* Display the interpretation */
function makeInterpWin(fileTitle, interpretation) {

    let winTitle = "Interpretation of " + fileTitle
    let interpWin = new BrowserWindow({
        show: false, 
        title: winTitle,
        width: 640,
        height: 440
    })
    interpWin.loadURL(require('url').format({
        pathname: path.join(__dirname, 'interpretation.html'),
        protocol: 'file:',
        slashes: true
    }))

    //console.log(interpretation) 

    interpWin.webContents.executeJavaScript(`
        document.getElementById("interpretation").innerHTML += "${interpretation}"
    `)

    interpWin.once('ready-to-show', () => {
        interpWin.show()
    })
}

/* Display the key */
key.addEventListener('click', function() {
    let keyWin = new BrowserWindow({
        show: false,
        width: 400,
        height: 300
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