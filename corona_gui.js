
//###############################################################
// button callbacks in main corona.js
//###############################################################


//###############################################################
// slider callbacks
//###############################################################

// var fps

/*
var slider_fps=document.getElementById("slider_fps");
var slider_fpsText = document.getElementById("slider_fpsText");


setSlider(slider_fps, slider_fpsText, fps," Tage/s");


slider_fps.oninput = function() {
  slider_fpsText.innerHTML = "&nbsp;"+this.value+" Tage/s";
  fps=parseFloat(this.value);
  console.log("slider1 callback: fps="+fps);
  clearInterval(myRun);
  if(!isStopped){myRun=setInterval(simulationRun, 1000/fps);}
}
*/


// var R03

/*
var slider_R03=document.getElementById("slider_R03");
var slider_R03Text = document.getElementById("slider_R03Text");

setSlider(slider_R03, slider_R03Text, R03,"");


slider_R03.oninput = function() {
  slider_R03Text.innerHTML = "&nbsp;"+this.value;
  R03=parseFloat(this.value);
  console.log("slider1 callback: R03="+R03);
}
*/

// var R04

/*
var slider_R04=document.getElementById("slider_R04");
var slider_R04Text = document.getElementById("slider_R04Text");

setSlider(slider_R04, slider_R04Text, R04,"");


slider_R04.oninput = function() {
  slider_R04Text.innerHTML = "&nbsp;"+this.value;
  R04=parseFloat(this.value);
  console.log("slider1 callback: R04="+R04);
}
*/

// var R0

var slider_R0=document.getElementById("slider_R0");
var slider_R0Text = document.getElementById("slider_R0Text");

setSlider(slider_R0, slider_R0Text, R0,"");


slider_R0.oninput = function() {
  RsliderUsed=true;
  slider_R0Text.innerHTML = "&nbsp;"+this.value;
  R0=parseFloat(this.value);
  console.log("slider1 callback: R0="+R0);
}



//var tauRstart;

var slider_tauRstart=document.getElementById("slider_tauRstart");
var slider_tauRstartText = document.getElementById("slider_tauRstartText");

setSlider(slider_tauRstart, slider_tauRstartText, 
	  tauRstart, ((tauRstart==1) ? " Tag" : " Tage"));


slider_tauRstart.oninput = function() {
  otherSliderUsed=true;
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
  otherSliderUsed=true;
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


//var pTest;

var slider_pTest=document.getElementById("slider_pTest");
var slider_pTestText = document.getElementById("slider_pTestText");

setSlider(slider_pTest, slider_pTestText, 100*pTest, " %");


slider_pTest.oninput = function() {
  otherSliderUsed=true;
  slider_pTestText.innerHTML = "&nbsp;"+this.value+" %";
  var pTestold=pTest;
  pTest=parseFloat(this.value/100.);
  //console.log("slider4 callback: pTest="+pTest);
}


//var tauTest;

var slider_tauTest=document.getElementById("slider_tauTest");
var slider_tauTestText = document.getElementById("slider_tauTestText");

setSlider(slider_tauTest, slider_tauTestText, 
	  tauTest, " Tagen");


slider_tauTest.oninput = function() {
  otherSliderUsed=true;
  tauTest=parseFloat(this.value);
  slider_tauTestText.innerHTML = "&nbsp;"+this.value
    +((tauTest==1) ? " Tag" : " Tagen");
  //console.log("slider2 callback: tauTest="+tauTest);
}




//###############################################################

// slider:      a slider object 
// sliderText:  the text field of this slider 
// value:         as displayed at html e.g., Math.round(100*js_value)
// unit:          as displayed by html, e.g., "%"

function setSlider(slider, sliderText, value, unit){
  //console.log("setSlider: slider=",slider);
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

  if(hasChanged){sizemin=Math.min(canvas.width,canvas.height);}

  if(drawsim!==null){drawsim.setDatatype(datatype);}
  //console.log("canvas_resize: new canvas dimensions ",
//	      canvas.width," X ",canvas.height);
  //console.log("drawsim.hPix=",drawsim.hPix);
}


