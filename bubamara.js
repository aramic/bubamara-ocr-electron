const cv = require('opencv4nodejs')
const path = require('path')
const fs = require('fs')
const nj = require('numjs')
var selectedImg = ''
var calibration = './assets/calibration/tablet.jpg'

const {dialog} = require('electron').remote
const selectFile = document.getElementById('select-file')

const xPixels = 100
const yPixels = 100


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
        bubamaraGen(calibration, filepath)
    });
}

function bubamaraGen(trainImg, testImg) {
    let bubamara = cv.imread(trainImg)
    bubamara = bubamara.cvtColor(cv.COLOR_BGR2GRAY)
    let test = cv.imread(testImg)
    test = test.cvtColor(cv.COLOR_BGR2GRAY)

    //const testWidth = test.cols
    //const testHeight = test.rows
    //const GRID_SIZE = 100

    //console.log(bubamara.sizes[0])

    var xROI = Math.floor(test.sizes[0] / xPixels) * xPixels
    var yROI = Math.floor(test.sizes[1] / yPixels) * yPixels
    console.log(bubamara)  
    console.log(test) 
    console.log(xROI + ", " + yROI)

    //var bubamaraCells = [nj.hsplit(row,6) for row in nj.vsplit(bubamara,5)]
    //console.log(bubamaraCells)

    //let newCrop = test.getRegion(new cv.Rect(0, 0, xROI, yROI))

    //cropTest = test[0:300, 0:600]
    //const cropArea = bubamara.getRegion(new cv.Rect(0, 0, 300, 600))
}


/*function onImageSelected(e) {
  alert('an image has been selected');

  selectedFile = e.target.files[0];

  var reader = new FileReader();
  reader.onload = function(re) {
    selectedImgBGR = decodeImageFromBase64(re.target.result).resizeToMax(500);
    selectedImg = selectedImgBGR;
    renderImage(
      selectedImg,
      document.getElementById('input')
    );
    renderRangeMask();
  };
  reader.readAsDataURL(selectedFile);
  
}*/

/*
var currentFilter = {
  c0lower: 0,
  c0upper: 255,
  c1lower: 0,
  c1upper: 255,
  c2lower: 0,
  c2upper: 255
};

renderImage(selectedImgBGR, document.getElementById('input'));

function resetSlidersAndRanges(colorSpace) {
  currentFilter = {
    c0lower: 0,
    c0upper: colorSpace === 'hsv' ? 180 : 255,
    c1lower: 0,
    c1upper: 255,
    c2lower: 0,
    c2upper: 255
  };

  if (colorSpace === 'gray') {
    document.getElementById('slider-group-c1').style.display = 'none';
    document.getElementById('slider-group-c2').style.display = 'none';
    document.getElementById('c0lower').style.display = 0;
    document.getElementById('c0upper').style.display = 255;
  } else {
    document.getElementById('slider-group-c1').style.display = 'flex';
    document.getElementById('slider-group-c2').style.display = 'flex';
  }

  Object.keys(currentFilter).forEach(function(sliderId) {
    var val = currentFilter[sliderId];
    var slider = document.getElementById(sliderId);
    slider.max = colorSpace === 'hsv' && sliderId === 'c0upper'  ? 180 : 255;
    slider.value = val;
    slider.MaterialSlider.change();
    document.getElementById(sliderId + '-value').innerHTML = val;
  });

  ['bgr', 'hsv', 'lab', 'gray'].forEach((cSpace) => {
    var colorClazz = 'mdl-button--colored';
    var btn = document.getElementById(cSpace + '-btn');
    if (cSpace === colorSpace) {
      btn.classList.add(colorClazz);
    } else {
      btn.classList.remove(colorClazz);
    }
  });
}

function bgr() {
  selectedImg = selectedImgBGR;
  document.getElementById('c0-label').innerHTML = 'B';
  document.getElementById('c1-label').innerHTML = 'G';
  document.getElementById('c2-label').innerHTML = 'R';
  resetSlidersAndRanges('bgr');
  renderImage(selectedImgBGR, document.getElementById('input'));
  renderRangeMask();
}

function hsv() {
  selectedImg = selectedImgBGR.cvtColor(cv.COLOR_BGR2HSV);
  document.getElementById('c0-label').innerHTML = 'H';
  document.getElementById('c1-label').innerHTML = 'S';
  document.getElementById('c2-label').innerHTML = 'V';
  resetSlidersAndRanges('hsv');
  renderImage(selectedImgBGR, document.getElementById('input'));
  renderRangeMask();
}

function lab() {
  selectedImg = selectedImgBGR.cvtColor(cv.COLOR_BGR2Lab);
  document.getElementById('c0-label').innerHTML = 'L';
  document.getElementById('c1-label').innerHTML = 'a';
  document.getElementById('c2-label').innerHTML = 'b';
  resetSlidersAndRanges('lab');
  renderImage(selectedImgBGR, document.getElementById('input'));
  renderRangeMask();
}

function gray() {
  selectedImg = selectedImgBGR.bgrToGray();
  resetSlidersAndRanges('gray');
  document.getElementById('c0-label').innerHTML = 'G';
  renderImage(selectedImg, document.getElementById('input'));
  renderRangeMask();
}

function onRangeChanged(e) {
  var val = parseInt(e.target.value);
  var id = e.target.id;

  if (id.includes('lower')) {
    val = Math.min(val, currentFilter[id.replace('lower', 'upper')]);
    e.target.value = val;
  } else {
    val = Math.max(val, currentFilter[id.replace('upper', 'lower')]);
    e.target.value = val;
  }
  currentFilter[id] = val;

  document.getElementById(e.target.id + '-value').innerHTML = val;
  renderRangeMask();
}

function renderRangeMask() {
  var inRange;
  if (selectedImg.channels === 1) {
    inRange = selectedImg.threshold(
      currentFilter.c0lower,
      255,
      cv.THRESH_BINARY
    )
    .and(
      selectedImg.threshold(
        currentFilter.c0upper,
        255,
        cv.THRESH_BINARY_INV
      )
    );
  } else {
    inRange = selectedImg.inRange(
      new cv.Vec(currentFilter.c0lower, currentFilter.c1lower, currentFilter.c2lower),
      new cv.Vec(currentFilter.c0upper, currentFilter.c1upper, currentFilter.c2upper)
    );
  }
  renderImage(
    inRange,
    document.getElementById('mask')
  );
}*/
