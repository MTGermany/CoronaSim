
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


// var R0

var slider_R0=document.getElementById("slider_R0");
var slider_R0Text = document.getElementById("slider_R0Text");

setSlider(slider_R0, slider_R0Text, R0,"");


slider_R0.oninput = function() {
  R0sliderUsed=true;
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
  testSliderUsed=true;
  includeInfluenceTestNumber=false;
  slider_pTestText.innerHTML = "&nbsp;"+this.value+" %";
  pTest=parseFloat(this.value/100.);
  //console.log("slider4 callback: pTest="+pTest);
  document.getElementById("testnumber").innerHTML
      ="Beruecksichtige Testhaeufigkeit";
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



//var pVacc;

var slider_pVacc=document.getElementById("slider_pVacc");
var slider_pVaccText = document.getElementById("slider_pVaccText");

setSlider(slider_pVacc, slider_pVaccText, 100*pVacc, " %");

slider_pVacc.oninput = function() {
  slider_pVaccText.innerHTML = "&nbsp;"+this.value+" %";
  pVacc=parseFloat(this.value/100.);
}


function str_measures(measures){
  return ((measures==0) ? "Halli Galli" : 
	  (measures==1) ? "wie 2019" :
	  (measures==2) ? "Abstand" :
	  (measures==3) ? "Abstand+Maske" :
	  (measures==4) ? "Teil-Lockdown" :
	  (measures==5) ? "Lockdown" : "Max Shutdown");
}

function calc_factorMeasures(measures){ // multiplication factor for R
  var factor=(measures==0) ? 1.20 :
    (measures==1) ? 1.00 :
    (measures==2) ? 0.85 :
    (measures==3) ? 0.80 :
    (measures==4) ? 0.65 :
    (measures==5) ? 0.50 : 0.30;
  return factor/0.65; // relate everything to actual level 4
}



// MT 2020-12-22: Do not show measures since not scientific
// var measures; {0=hulliGalli,1=none,2=distance,3=distance+masks,
// 4-6=lockdowns}
//!!! replaced by copy of R slider
// need factorMeasures, however (measures=measuresInit=4 in corona.js)

var factorMeasures=calc_factorMeasures(measures);

/*
var slider_measures=document.getElementById("slider_measures");
var slider_measuresText = document.getElementById("slider_measuresText");

slider_measures.value=measures; // setSlider does not fit here
slider_measuresText.innerHTML="&nbsp;"+str_measures(measures);

slider_measures.oninput = function() {
  measures=parseInt(this.value);
  slider_measuresText.innerHTML = "&nbsp;"+str_measures(measures);
  factorMeasures=calc_factorMeasures(measures);
}
*/

// var R0copy

var slider_R0cp=document.getElementById("slider_R0cp");
var slider_R0cpText = document.getElementById("slider_R0cpText");

setSlider(slider_R0cp, slider_R0cpText, R0,"");


slider_R0cp.oninput = function() {
  R0sliderUsed=true;
  slider_R0cpText.innerHTML = "&nbsp;"+this.value;
  R0=parseFloat(this.value);
  console.log("slider R0cp callback: R0="+R0);
}



//var casesInflow;

var slider_casesInflow=document.getElementById("slider_casesInflow");
var slider_casesInflowText = document.getElementById("slider_casesInflowText");

setSlider(slider_casesInflow, slider_casesInflowText, casesInflow,
	  "/Tag");

slider_casesInflow.oninput = function() {
  slider_casesInflowText.innerHTML = "&nbsp;"+this.value+"/Tag";
  casesInflow=parseFloat(this.value);
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
// Determine/adapt canvas size to its container canvasWindow 
// at init and as response to changes
// !! canvas has strange properties/DOS when initialized relatively vw vh
// document.getElementById("contents") always works

  // response to changed viewport/window sizes: canvas_gui.canvas_resize()
  // called at resize events 
  // because activated by window.addEventListener("resize", canvas_resize);

  // some DOS, only thing that works is canvas, 
  // need to get viewport indirectly
  // sets global variables 
  // - canvas.width, canvas.height
  // - viewport.width, viewport.height
  // - textsize, textsizeR0 (for the R0 values)
//###############################################################

var viewport={width: 200, height: 200}

function canvas_resize(){
  hasChanged=false;

  // actual canvas

  var canvasWindow=document.getElementById("contents");

  if (canvas.width!=canvasWindow.clientWidth){
    hasChanged=true;
    canvas.width  = canvasWindow.clientWidth;
  }

  if (canvas.height != canvasWindow.clientHeight){
    hasChanged=true;
    canvas.height  = canvasWindow.clientHeight;
  }



 // regardless of hasChanged=true 

  // viewport; consolidate with css media queries
  // (1) normal: both sides of viewport >= 600px
  // (2) smartphone default: at least one side <600px
  // (3) smartphone portrait: aspect ratio <1:1

  vw=window.innerWidth; // document.documentElement.clientWidth
  vh=window.innerHeight;
  sizeminCanvas=Math.min(canvas.width,canvas.height);
  sizeminWindow=Math.min(vw,vh); // "viewport" is standard object, not useful

  isSmartphone=(sizeminWindow<600);

  textsize=(isSmartphone) ? 0.03*sizeminWindow : 0.02*sizeminWindow;
  textsizeR0=1.1*textsize;
  if(false){
  console.log("canvas_gui.canvas_resize():",
		" isSmartphone=",isSmartphone,
		" canvas.width=",canvas.width,
		" canvas.height=",canvas.height,
		" textsize=",textsize,
		" textsizeR0=",textsizeR0);

  console.log("document.documentElement.clientHeight=",
	      document.documentElement.clientHeight,
	      "nnwindow.innerHeight=",window.innerHeight,
	      "\ncanvasWindow.clientHeight=",canvasWindow.clientHeight);
  }

  // update dependent graphics elements

  // must update canvas boundaries since canvas may be resized
  // canvas height is a bit oversized to allow changes inside canvas

  drawsim.xPix0  =(isSmartphone) ? 0.13*canvas.width : 0.08*canvas.width;
  drawsim.xPixMax=0.98*canvas.width;
  drawsim.yPix0  =(isSmartphone) ? 0.85*canvas.height : 0.90*canvas.height;
  drawsim.yPixMax=(showVacc) ? 0.05*canvas.height : 0.10*canvas.height;
  drawsim.wPix=drawsim.xPixMax-drawsim.xPix0;
  drawsim.hPix=drawsim.yPixMax-drawsim.yPix0;  //<0
  for(var i=0; i<=itmax-drawsim.itmin; i++){
      drawsim.xPix[i]=drawsim.xPix0
	+i*(drawsim.xPixMax-drawsim.xPix0)/(itmax-drawsim.itmin);
  }

  if(drawsim!==null){drawsim.draw(it);}//!! draw after resize


 }


//#################### new ###########################

//###############################################################
// canvas mouse callbacks
//###############################################################

var xPixOld,yPixOld;  // needed!
var xPixArr=[];
var yPixArr=[];
var xPixArrOld=[];
var yPixArrOld=[];
var newStrokeIndexArray=[]; // index of xPixArr,yPixArr where new curve starts



// clean array of double/multiple entries

function cleanPixArrays(){
  //console.log("entering cleanPixArrays: xPixArr.length=",xPixArr.length);

  for(var i=0; i<xPixArr.length; i++){
    xPixArrOld[i]=xPixArr[i];
    yPixArrOld[i]=yPixArr[i];
  }
  xPixArr=[]; // reset
  yPixArr=[];
  var j=0;
  xPixArr[0]=xPixArrOld[0];
  yPixArr[0]=yPixArrOld[0];
  for(var i=1; i<xPixArrOld.length; i++){
    var dist2=Math.pow(xPixArrOld[i]-xPixArrOld[i-1],2)
      +Math.pow(yPixArrOld[i]-yPixArrOld[i-1],2);
    //console.log("cleanPixArrays: i=",i," dist2=",dist2,
//		" xPixArrOld=",xPixArrOld);
    if(dist2>1e-6){
      j++;
      xPixArr[j]=xPixArrOld[i];
      yPixArr[j]=yPixArrOld[i];
    }
  }
  //console.log("leaving cleanPixArrays: xPixArr.length=",xPixArr.length);
}



// called on onmousedown and in DrawSim.draw()

function shiftX(){ // if moving time window; xPix always orig drawn pixel
  var timeshift=itmax-itPresent;
  return - (xshift=timeshift/itPresent * (drawsim.xPixMax-drawsim.xPix0));
}




function drawMouseAnnotations(){ 

  //console.log("drawMouseAnnotations: xPixArr.length=",xPixArr.length);

  // draw if distance between 2 points not too large (-> new stroke)
  var distCrit=30;  // in pixels; only draw if points closer together
  for(var i=1; i<xPixArr.length; i++){

    // move points with the moving window

    var xOld=xPixArr[i-1]+shiftX();
    var xNew=xPixArr[i]+shiftX();
    var dist=Math.sqrt(Math.pow(xNew-xOld,2)
		       +Math.pow(yPixArr[i]-yPixArr[i-1],2));

    if(dist<distCrit){
      var w=2;          // width of mouse-drawn lines
      var dx=xNew-xOld;
      var dy=yPixArr[i]-yPixArr[i-1];
      var offsetx=w*dy/dist;
      var offsety=-w*dx/dist;

      ctx.moveTo(xOld, yPixArr[i-1]);
      ctx.lineTo(xNew, yPixArr[i]);
      if(true){
	ctx.stroke(); // simple+fast
      }
      else{  // nicer and slower
        ctx.lineTo(xNew+offsetx, yPixArr[i]+offsety);
        ctx.lineTo(xOld+offsetx, yPixArr[i-1]+offsety);
        ctx.closePath(); // go to first point
        ctx.fill();
      }
    }
  }
}

// swipe away annotations at doubleclick

function wipeAway(){
  xPixArr=[];
  yPixArr=[];
  xPixArrOld=[];
  yPixArrOld=[];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawsim.draw(it);
}




//###############################################################
// canvas mouse callbacks
//###############################################################

var doubleclicked;
var mouseDown=false;

function onmouseenterCallback(event){
  //console.log("mouse entering canvas");
  mouseDown=false;
}

function onmouseoutCallback(event){
  //console.log("mouse out"); 
}


function onmousedownCallback(event){
  //console.log("mouse down");
  mouseDown=true;
}

function onmouseupCallback(event){
  //console.log("mouse up");
  mouseDown=false;
}

function onclickCallback(event){
  //console.log("mouse clicked");
  mouseDown=false;
}


function ondoubleclickCallback(event){ //Buggy; do not use it!
  //console.log("mouse doubleclicked");
  wipeAway();
  doubleclicked=true;
}

function keyCallback(event){
  //console.log("key entered");
  wipeAway();
  //doubleclicked=true;
}

function onmousemoveCallback(event){
 
  var canvasBB = canvas.getBoundingClientRect();
  var xPixLeft=canvasBB.left; // left-upper corner of the canvas 
  var yPixTop=canvasBB.top;   // in browser reference system
  var xPix= event.clientX-xPixLeft; //pixel coords in canvas reference
  var yPix= event.clientY-yPixTop; 
  //console.log("mouse moved: mouseDown=",mouseDown," xPix=",xPix); 
  var xPixRel=xPix/canvasBB.width;
  var yPixRel=yPix/canvasBB.height;

  if(doubleclicked){
    mouseDown=false;
    doubleclicked=false;
  }


  if(activateAnnotations&&mouseDown){
    var dist2=Math.pow(xPix-xPixOld,2)+Math.pow(yPix-yPixOld,2);
    if(dist2>0.9){
      xPixArr.push(xPixOld-shiftX());
      yPixArr.push(yPixOld);
      xPixArr.push(xPix-shiftX());
      yPixArr.push(yPix);
      cleanPixArrays();
      if(isStopped){drawMouseAnnotations();} // otherwise in drawsim.draw()
    }
  }

  xPixOld=xPix; yPixOld=yPix;

  if(false){
    if(mouseDown) console.log("mouse moved && down: drawing ...");
    else console.log("mouse moved && up: drag mouse to draw");
  }

  if(false){console.log("in onmousemoveCallback(event):"
       +" clientX="+ event.clientX+ " clientY="+ event.clientY
       +" xPix="+Math.round(xPix)+" yPix="+Math.round(yPix)
       +"<br>xPixRel="+xPixRel.toPrecision(2)
       +" yPixRel="+yPixRel.toPrecision(2)
      );
	   }
}


function toggleViews(){
  showVacc=(!showVacc);
  setView(showVacc);
}

function setView(showVacc){
  if(showVacc){
    document.getElementById("vaccinationButton").innerHTML
      = "=> Normale<br>Ansicht";
    document.getElementById("sliders").style.display="none"; // "hidden" DOS
    document.getElementById("sliders2").style.display="block"; // css DOS
  }

  else{
    document.getElementById("vaccinationButton").innerHTML
      = "=> Ma&szlig;nahmen-<br>Ansicht";
    document.getElementById("sliders").style.display="block";
    document.getElementById("sliders2").style.display="none";
  }
  canvas_resize();
}


