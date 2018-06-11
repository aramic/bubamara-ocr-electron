// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


// renderer.js

const zerorpc = require("zerorpc")
let client = new zerorpc.Client()
client.connect("tcp://127.0.0.1:4242")

const path = require('path')
const fs = require('fs')
var selectedImg = ''
const {dialog} = require('electron').remote
const selectFile = document.getElementById('select-file')

selectFile.addEventListener('click',function(){
    dialog.showOpenDialog(function (fileNames) {
        if(fileNames === undefined){
            console.log("No file selected")
        }else{
            document.getElementById("select-file").value = fileNames[0];
            readFile(fileNames[0])
        }
    }); 
},false);

function readFile(filepath) {
    fs.readFile(filepath, 'utf-8', function (err, data) {
        if(err){
            alert("An error ocurred reading the file :" + err.message)
            return
        }
        selectFile.innerHTML = "You have selected: " + filepath;
        //bubamaraGen(calibration, filepath)

        client.invoke("bubamaraGen", filepath, (error, res) => {
        	if(error) {
        		console.error(error)
        	} else {
        		console.log(res)
        		console.log(res.toString('utf8'));
        	}
        });
    });
}