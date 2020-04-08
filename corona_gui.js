
//###############################################################
// button callbacks in main corona.js
//###############################################################


//###############################################################
// slider callbacks
//###############################################################

// var fps

var slider_fps=document.getElementById("slider_fps");
var slider_fpsText = document.getElementById("slider_fpsText");


//fps=parseFloat(slider_fps.value);
//setSlider(slider_fps, slider_fpsText, slider_fps.value,"");
setSlider(slider_fps, slider_fpsText, fps," Tage/s");


slider_fps.oninput = function() {
  slider_fpsText.innerHTML = "&nbsp;"+this.value+" Tage/s";
  fps=parseFloat(this.value);
  console.log("slider1 callback: fps="+fps);
  clearInterval(myRun);
  if(!isStopped){myRun=setInterval(simulationRun, 1000/fps);}
}


// var R

var slider_R=document.getElementById("slider_R");
var slider_RText = document.getElementById("slider_RText");


//R=parseFloat(slider_R.value);
//setSlider(slider_R, slider_RText, slider_R.value,"");
setSlider(slider_R, slider_RText, R,"");


slider_R.oninput = function() {
  slider_RText.innerHTML = "&nbsp;"+this.value;
  R=parseFloat(this.value);
  console.log("slider1 callback: R="+R);
}



//var tauRstart;

var slider_tauRstart=document.getElementById("slider_tauRstart");
var slider_tauRstartText = document.getElementById("slider_tauRstartText");

setSlider(slider_tauRstart, slider_tauRstartText, 
	  tauRstart, ((tauRstart==1) ? " Tag" : " Tage"));


slider_tauRstart.oninput = function() {
  tauRstart=parseFloat(this.value);
  slider_tauRstartText.innerHTML = "&nbsp;"+this.value
    +((tauRstart==1) ? " Tag" : " Tage");
  if(tauRend<tauRstart){
    tauRend=tauRstart;
    setSlider(slider_tauRend, slider_tauRendText, 
	      tauRend, " Tage");
  }
  console.log("slider2 callback: tauRstart="+tauRstart);
}


//var tauRend;

var slider_tauRend=document.getElementById("slider_tauRend");
var slider_tauRendText = document.getElementById("slider_tauRendText");

setSlider(slider_tauRend, slider_tauRendText, 
	  tauRend, " Tage");


slider_tauRend.oninput = function() {
  tauRend=parseFloat(this.value);
  slider_tauRendText.innerHTML = "&nbsp;"+this.value
    +((tauRend==1) ? " Tag" : " Tage");
  if(tauRstart>tauRend){
    tauRstart=tauRend;
    setSlider(slider_tauRstart, slider_tauRstartText, 
	      tauRstart, " Tage");
  }
  console.log("slider2 callback: tauRend="+tauRend);
}


//var rTest;

var slider_rTest=document.getElementById("slider_rTest");
console.log("slider_rTest=",slider_rTest);
var slider_rTestText = document.getElementById("slider_rTestText");

setSlider(slider_rTest, slider_rTestText, 100*rTest, " %");


slider_rTest.oninput = function() {
  slider_rTestText.innerHTML = "&nbsp;"+this.value+" %";
  rTest=parseFloat(this.value/100.);
  console.log("slider4 callback: rTest="+rTest);
}


//var tauTest;

var slider_tauTest=document.getElementById("slider_tauTest");
var slider_tauTestText = document.getElementById("slider_tauTestText");

setSlider(slider_tauTest, slider_tauTestText, 
	  tauTest, " Tagen");


slider_tauTest.oninput = function() {
  tauTest=parseFloat(this.value);
  slider_tauTestText.innerHTML = "&nbsp;"+this.value
    +((tauTest==1) ? " Tag" : " Tagen");
  console.log("slider2 callback: tauTest="+tauTest);
}


// not yet used

//var param4;

/*
var slider_param4=document.getElementById("slider_param4");
var slider_param4Text = document.getElementById("slider_param4Text");

setSlider(slider_param4, slider_param4Text, param4, " %");


slider_param4.oninput = function() {
  slider_param4Text.innerHTML ="&nbsp;"+ this.value+" %";
  param4=parseFloat(this.value/100.);
  console.log("slider4 callback: param4="+param4);
}
*/



//###############################################################

// slider:      a slider object 
// sliderText:  the text field of this slider 
// value:         as displayed at html e.g., Math.round(100*js_value)
// unit:          as displayed by html, e.g., "%"

function setSlider(slider, sliderText, value, unit){
  console.log("setSlider: slider=",slider);
  slider.value=value;
  sliderText.innerHTML="&nbsp;"+value+unit;
}



//###############################################################
// canvas mouse callbacks
//###############################################################

function onmousemoveCallback(event){
 
  // canvas.left undefined; canvas.width=canvasBB.width-2

  var canvasBB = canvas.getBoundingClientRect();
  xPixLeft=canvasBB.left; // left-upper corner of the canvas 
  yPixTop=canvasBB.top;   // in browser reference system
  xPix= event.clientX-xPixLeft; //pixel coords in canvas reference
  yPix= event.clientY-yPixTop; 
  var xPixRel=xPix/canvasBB.width;
  var yPixRel=yPix/canvasBB.height;


  if(mouseDown){
    ctx.moveTo(xPixOld, yPixOld);
    ctx.lineTo(xPix, yPix);
    ctx.stroke();
  }

  xPixOld=xPix; yPixOld=yPix;

}

var mouseDown=false;
function onmousedownCallback(event){
  mouseDown=true;
}

function onmouseupCallback(event){
  mouseDown=false;
}

function onclickCallback(event){
  console.log("mouse clicked");
}

function onmouseoutCallback(event){
  //log1("mouse out");
}

function onmouseenterCallback(event){
  //log1("mouse entering canvas");
}



//###############################################################
// Determine/adapt canvas size to its container canvasWindow 
// at init and as response to changes
// !! canvas has strange properties/DOS when initialized relatively vw vh
// document.getElementById("contents") always works
//###############################################################

function canvas_resize(){
  var hasChanged=false;

  // canvasWindow is element determined by css #contents{...} spec
  // it contains the actual canvas

  var canvasWindow=document.getElementById("contents");

  if (canvas.width!=canvasWindow.clientWidth){
    hasChanged=true;
    canvas.width  = canvasWindow.clientWidth;
  }

  if (canvas.height != canvasWindow.clientHeight){
    hasChanged=true;
    canvas.height  = canvasWindow.clientHeight;
  }

  drawsim=new DrawSim();
  console.log("canvas_resize: new canvas dimensions ",
	      canvas.width," X ",canvas.height);
}


// ###############################################
// helper functions
// ###############################################

function log1(msg) {
  //var p = document.getElementById('loggingWindow');
  //p.innerHTML = msg;
  //p.innerHTML = p.innerHTML + " &nbsp;&nbsp;"+msg;
}

function log2(msg) {
 // var p = document.getElementById('loggingWindow2');
  //p.innerHTML = msg;
  //p.innerHTML = p.innerHTML + "  "+msg;
}

function clearLog1(){
 // var p = document.getElementById('loggingWindow');
 // p.innerHTML = "";
}


