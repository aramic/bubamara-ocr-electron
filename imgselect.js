const dialog = require( 'electron' ).dialog
const zerorpc = require("zerorpc")
const fs = require('fs')
const selectFile = document.getElementById('select-file')
let client = new zerorpc.Client()
client.connect("tcp://127.0.0.1:4242")

/* Select the file */
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

/* Read the file */
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
        		//console.log(res)
        		output = res.toString('utf8')
                //console.log(output)
                makeInterpWin(filepath, output)
        	}
        })
    })
}
