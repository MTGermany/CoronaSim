
// useLiveData=true: Obtain github data "live" via the fetch command
// Unfortunately, the fetch command is sometimes unstable
// and not working on my ipad

// useLiveData=false: obtained data server-side 
// via script updateCoronaInput.sh. Stable but need to upload once a day

var useLiveData=true;  

// debugApple=true for debugging of devices w/o console (ipad) redirect
// it to a html element using console-log-html.js
// copy corona.js to coronaDebugApple.js and 
// use indexDebugApple.html for these purposes 
// (contains addtl <div id="logDiv">)

var debugApple=false;

var country="Germany"
var countryGer="Deutschland"
var dayStartMar=19;
var startDay=new Date(2020,02,dayStartMar); // months start @ zero, days @ 1

const ln10=Math.log(10);
var displayType="lin"; // "lin" or "log"; consolidate with html


// global operative simulation vars 

var myRun;
var isStopped=true
var it=0;
var itmaxinit;  // #days init simulation; to be determined by js Date() object
var itmax;      // can be >itmaxinit during interactive simulation

var n0=80.e6;  // #persons in Germany


const RtimeList={   // 0-1,1-3,3-5,... weeks after start
  "Germany"       : [1.05, 0.75, 0.75, 0.70],
  "Austria"       : [0.8,  0.62, 0.62],
  "Czechia"       : [0.90, 0.75, 0.75],
  "France"        : [1.10, 1.06, 0.65],
  "United Kingdom": [1.60, 1.10, 0.99],
  "Italy"         : [0.93, 0.90, 0.84],
  "Poland"        : [1.62, 1.01, 0.97],
  "Spain"         : [0.90, 0.89, 0.70],
  "Sweden"        : [1.10, 1.20, 1.05, 1.00],
  "Switzerland"   : [0.82, 0.82, 0.60, 0.40],
  "India"         : [2.05, 1.47, 1.25],
  "Russia"        : [2.0,  1.8, 1.45, 1.4],
  "US"            : [1.3, 1.08, 1.00]
}
var Rtime=RtimeList["Germany"]; //!! need direct initialization 
var R0=Rtime[0];          //!! init time dependent R
var R_actual=R0;  // R0" controlled by slider, _actual: by data
var R_hist=[]; R_hist[0]=R_actual;
var RsliderUsed=false;

var oneDay_ms=(1000 * 3600 * 24);


// if use Europe opendata portal

var data_date_ddmmyyyy=[];
var data_diff2start=[];
var data_cases=[];
var data_cumCases=[];
var data_deaths=[];
var data_cumDeaths=[];
var data_deathsCases=[];


// fetch with https://pomber.github.io/covid19/timeseries.json
// or load as a variable server-side (if useLiveData=false)

var dataGit=[];
var dataGit_dateBegin;

var dataGit_istart;
var dataGit_date=[];
var dataGit_cumCases=[];
var dataGit_cumDeaths=[];
var dataGit_cumRecovered=[];
var dataGit_deathsCases=[];






// global simulation  parameters


// (i) controlled by sliders (apart from R0)

var fps=10;

var tauRstartInit=1;     // active infectivity begins [days since infection]
var tauRstart=tauRstartInit;
var tauRendInit=10;       // active infectivity ends [days since infection]//10
var tauRend=tauRendInit;  
var pTestInit=0.1;   // initial percentage of tested infected persons 
var pTest=pTestInit;       // percentage of tested infected persons 
var tauTestInit=10;  // time delay [days] test-infection
var tauTest=tauTestInit;
var tauAvg=5;      // smoothing interval for tauTest,tauDie,tauRecover

// (ii) not controlled

var fracDieInit=0.0044;  // fracDie for initial setting of pTest
var fracDie=fracDieInit; // will be set to fracDieInit*pTest/pTestInit 
                        // at restart but NOT during simulation
var tauDie=21;      // time from infection to death in fracDie cases
var tauRecover=25; // time from infection to full recovery
var tauSymptoms=7;  // incubation time 

var taumax=Math.max(tauDie,tauRecover)+tauAvg+1;
 
// global graphical vars

var canvas;
var ctx;
var xPixLeft,yPixTop;
var xPix,yPix;
var xPixOld, yPixOld;
var sizemin=0;





// ##############################################################
// !!! test fetch method: w/o addtl cronjob/script
// directly from https://pomber.github.io/covid19/timeseries.json
//
// called ONLY in the html <body onload="..."> callback
// NOT: offline
// Ubuntu 12: Only Chrome! 
// Ubuntu18: Every browser??
// Android ??
//
// strange extremely confusing order of commands. 
// It is called erratically before or after startup 
// (although it should before). It seems to be safely there   
// at creation time of the THREAD: 
// setInterval(simulationRun) simulationRun->doSimulationStep()

// since old browsers also do not understand arrow functions
// throwing syntax errors even if code is not reached,
// I have replaced them with normal anonymous functions 
// ##############################################################

//called ONLY in the <body onload> and toggleData event
function getGithubData() {
  corona=new CoronaSim(); //!!!

  if(debugApple){
    console.log("in ConsoleLogHTML");
    ConsoleLogHTML.DEFAULTS.error = "errClass";
    ConsoleLogHTML.DEFAULTS.warn = "warnClass";
    //ConsoleLogHTML.includeTimestamp=false;
    logTarget=document.getElementById("myULContainer");

    // connect(target,options,includeTimestamp,logAlsoToConsole)
    ConsoleLogHTML.connect(logTarget,null,false);
        // Redirect log messages
    console.log("example logging by console.log");
    console.warn("example warning by console.warn");
    console.error("example error by console.error");
    //ConsoleLogHTML.disconnect(); // Stop redirecting
  }

  if(useLiveData && !(typeof fetch === "undefined")){

    console.log("getGithubData(): fetch defined");

    fetch("https://pomber.github.io/covid19/timeseries.json")
      //.then((response1) => {
      .then(function(response1){
	return response1.json();
      })

      //.then((data1) => {
      .then(function(data1){
        dataGit=data1;
       // console.log("dataGit=",dataGit);
        //console.log("inner: dataGit[country]=",dataGit[country]);
        initializeData(country);
        corona.init(); //!!! only then ensured that data loaded! it=1 as result
      });
  }

  else{
    if(useLiveData){
      useLiveData=false;
      console.log("You are using an old Browser that does not understand Javascript's fetch");
    }
    dataGit = JSON.parse(dataGitLocal);
    console.log("useLiveData=false: dataGit=",dataGit);
    initializeData(country);
    //corona=new CoronaSim(); //!!!
    corona.init();
  }
}

// really malignous error: Apple cannot make date object out of yyyy-m-dd
// e.g., 2020-1-22 as delivered by dataGit

function insertLeadingZeroes(dateStr){
  var monthIsOneDigit=(dateStr.lastIndexOf("-")==6);
  var dayIsOneDigit=(dateStr.charAt(dateStr.length-2)==="-");
  return dateStr.substr(0,5)
    + ((monthIsOneDigit) ? "0" : "")
    + ((monthIsOneDigit) ? dateStr.substr(5,1) : dateStr.substr(5,2))
    + "-"
    + ((dayIsOneDigit) ? "0" : "")
    + ((dayIsOneDigit) ? dateStr.slice(-1) : dateStr.slice(-2));

}



function initializeData(country) {

  var data=dataGit[country];
  var dateInitStr=data[0]["date"];
  dataGit_dateBegin=new Date(insertLeadingZeroes(dateInitStr));
  dataGit_istart=Math.round(
    (startDay.getTime() - dataGit_dateBegin.getTime() )/oneDay_ms);

  console.log("new Date(\"2020-01-22\")=",new Date("2020-01-22"));
  console.log("new Date(\"2020-1-22\")=",new Date("2020-1-22"));
  console.log("dataGit_dateBegin=",dataGit_dateBegin);
  console.log("dataGit_istart=",dataGit_istart);


  var itmaxData=data.length;
  for(var it=0; it<itmaxData; it++){
    dataGit_date[it]=data[it]["date"];
    dataGit_cumCases[it]=data[it]["confirmed"];
    dataGit_cumDeaths[it]=data[it]["deaths"];
    dataGit_cumRecovered[it]=data[it]["recovered"];
    dataGit_deathsCases[it]=(data_cumCases[it]==0)
      ? 0 : dataGit_cumDeaths[it]/dataGit_cumCases[it];
    if(false){
	  console.log("it=",it," dataGit_date=",dataGit_date[it],
		      "\n dataGit_cumCases=",dataGit_cumCases[it],
		      " dataGit_cumDeaths=",dataGit_cumDeaths[it],
		      " dataGit_cumRecovered=",dataGit_cumRecovered[it]);
    }
  }

  nxtStart=dataGit_cumCases[dataGit_istart]; 

  console.log(
    "\nend initializeData: country=",country,
    "\n dataGit_istart=",dataGit_istart,
    "\n dataGit_cumCases.length=",dataGit_cumCases.length,
    "\n dataGit_date[0]=",dataGit_date[0],
    "\n dataGit_date[dataGit_istart]",dataGit_date[dataGit_istart],
    "\n dataGit_cumCases[dataGit_istart-1]",dataGit_cumCases[dataGit_istart-1],
    "\n dataGit_cumCases[dataGit_istart]",dataGit_cumCases[dataGit_istart],
    "\n dataGit_cumCases[dataGit_istart+1]",dataGit_cumCases[dataGit_istart+1],
    "\n dataGit_cumCases[dataGit_istart+2]",dataGit_cumCases[dataGit_istart+2],
    "\n dataGit_date[dataGit_cumCases.length-1]",
    dataGit_date[dataGit_cumCases.length-1],
    "\n nxtStart=",nxtStart,
    "\n"
  );

  calibrateR(); //!!!
}


//##############################################################
// function for variable replicationrate R0 as a function of time
// t=tsim-date(2020-03-19) [days]
//##############################################################

function R0fun_time(t){
  var iPresent=dataGit_istart+t;
  var iTest    =iPresent+Math.round(tauTest);
  var iTestPrev=iPresent+Math.round(tauTest-0.5*(tauRstart+tauRend));

  if(t<0){
    var xtNewnum  =1./2.*(dataGit_cumCases[iTest+1]-dataGit_cumCases[iTest-1]);
    var xtNewdenom=1./2.*(dataGit_cumCases[iTestPrev+1]
			  -dataGit_cumCases[iTestPrev-1]);
    var R=1.02*xtNewnum/xtNewdenom;
    if(false){
      console.log("R0fun_time: t=",t," xtCum(iTest)=",dataGit_cumCases[iTest],
		" xtCum(iTestPrev)=",dataGit_cumCases[iTestPrev],
		" xtNewnum=",xtNewnum,
		"");
    }
    return R;
  }
  else{
    var iweek=Math.floor(t/7);
    var nxt=dataGit_cumCases[iPresent];
    var index=Math.min(Math.floor((iweek+1)/2),Rtime.length-1);
    return Rtime[index];
  }

}

/*##############################################################
 objective function for fitting the two-weekly reproduction rate 
 via the resulting dynamics of cases to the data
 used as function arg of the nl opt package fmin:
 fmin.nelderMead(SSEfunc, guessSSE)  or
 fmin.conjugateGradient(SSEfunc, guessSSE)
 gradient fbeta needed only for conjugateGradient

@param R_arr: array of R values: R_arr[0]: for days i<7,
                                 R_arr[j]: 14 days starting at i=7+(j-1)*14
@param fR: numerical gradient of func with respect to R
 ##############################################################*/

function SSEfunc(R_arr,fR,logging) { 

  fR = fR || new Array(R_arr.length).fill(0); // crucial if fbeta missing!

  var sse=0;
  // init handling of numerical gradient

  var eps=0.001;
  var Rp=[]; // R arg where the jth component is increased by epsilon
  var Rm=[]; // R arg where the jth component is decreased by epsilon
  for (var j=0; j<R_arr.length; j++){
    Rp[j]=[];
    Rm[j]=[];
    for(var k=0; k<R_arr.length; k++){
      Rp[j][k]=R_arr[k];
      Rm[j][k]=R_arr[k];
    }
    Rp[j][j]+=eps;
    Rm[j][j]-=eps;
  }

  // simulation init

  nxtStart=dataGit_cumCases[dataGit_istart];
  //console.log("SSEfunc: nxtStart=",nxtStart);
  corona.init();


  // calculate SSE

  sse=0;
  var imax=dataGit_cumCases.length-dataGit_istart;dataGit_cumCases.length

  for(var i=1; i<imax; i++){
    var iweek=Math.floor(i/7);
    var index=Math.min(Math.floor((iweek+1)/2),R_arr.length-1);
    var R_actual=R_arr[index];
    corona.updateOneDay(R_actual);
    var nxData=dataGit_cumCases[dataGit_istart+i];
    var nxSim=n0*corona.xt;
    if(logging){
      console.log("SSEfunc: i=",i," nxData=",nxData,
		  " nxSim=",Math.round(nxSim));
    }
    sse+=Math.pow(nxData-nxSim,2);
  }


  // calculate the numerical gradient as side effect
  // only if gradient-based method. 
  // These fail here=>do not need to calc grad

  if(false){
   for (var j=0; j<R_arr.length; j++){
    fR[j]=0; // gradient
    corona.init();
    for(var i=1; i<imax; i++){
      var iweek=Math.floor(i/7);
      var index=Math.min(Math.floor((iweek+1)/2),R_arr.length-1);
      var R_actual=Rp[j][index];
      corona.updateOneDay(R_actual);
      var nxData=dataGit_cumCases[i];
      var nxSim=n0*corona.xt;
      fR[j]+=Math.pow(nxData-nxSim,2);
    }

    corona.init();
    for(var i=1; i<imax; i++){
      var iweek=Math.floor(i/7);
      var index=Math.min(Math.floor((iweek+1)/2),R_arr.length-1);
      var R_actual=Rm[j][index];  // here difference: Rm instead of Rp
      corona.updateOneDay(R_actual);
      var nxData=dataGit_cumCases[i];
      var nxSim=n0*corona.xt;
      fR[j]-=Math.pow(nxData-nxSim,2); // difference: -= instead of +=
    }
    fR[j]/=2*eps;
   }
  }

  corona.init(); // reset corona to avoid side effects
  return sse;
}


//##############################################################
// callbacks influencing the overall simulation operation/appearance
//##############################################################


//called in the html  <body onload> event and by myRestartFunction()

function startup() {
 
  // =============================================================
  // get present and difference to startDay
  // =============================================================

  var present=new Date();
  //var present=new Date(2020,02,23); //!!
  
  // initialisation of itmaxinit; 
  // round because of daylight saving time complications

  itmaxinit = Math.round(
    (present.getTime() - startDay.getTime())/(oneDay_ms));
  itmax=itmaxinit;
  console.log("present=",present);





 

  // =============================================================
  // initialize CoronaSim
  // =============================================================

  corona=new CoronaSim();

  if(!useLiveData){corona.init();} // !! now inside fetch promise


  // =============================================================
  // initialize graphics
  // =============================================================

  canvas = document.getElementById("myCanvas");
  ctx = canvas.getContext("2d");
  var rect = canvas.getBoundingClientRect();
  xPixLeft=rect.left;
  yPixTop=rect.top;

  drawsim=new DrawSim();

  window.addEventListener("resize", canvas_resize);
  canvas_resize();

  drawsim.setDisplayType(displayType);

  // =============================================================
  // Apple debug
  // =============================================================

  if(debugApple){
    console.log("in ConsoleLogHTML");
    ConsoleLogHTML.DEFAULTS.error = "errClass";
    ConsoleLogHTML.DEFAULTS.warn = "warnClass";
    //ConsoleLogHTML.includeTimestamp=false;
    logTarget=document.getElementById("myULContainer");

    // connect(target,options,includeTimestamp,logAlsoToConsole)
    ConsoleLogHTML.connect(logTarget,null,false);
        // Redirect log messages
    console.log("example logging by console.log");
    console.warn("example warning by console.warn");
    console.error("example error by console.error");
    //ConsoleLogHTML.disconnect(); // Stop redirecting
  }


  // =============================================================
  // !!! for static testing: add testcode here
  // and set liveData=false and comment out myStartStopFunction();
  // =============================================================


  // =============================================================
  // actual startup
  // =============================================================

  myStartStopFunction(); // default: starts simulation up to present !!
  //myResetFunction();

}


// =============================================================
// calibrate the array R_arr of R values with fmin.nelderMead
// provided by open-source package fmin
// notice: fmin.conjugateGradient does not work here
// => use simple nelderMead and do not need to calculate
// num derivatives in func as side effect of SSEfunc
// =============================================================

function calibrateR(){
  var Rguess=[1.5,1,1,1];
  sol2_SSEfunc=fmin.nelderMead(SSEfunc, Rguess);
  for(var j=0; j<Rguess.length; j++){
    Rtime[j]=sol2_SSEfunc.x[j];
  }
  console.log("check optimization:")
  SSEfunc(Rtime,null,true);

  console.log("\ncalibrateR(): country=",country,
	      "\n  calibrated R values Rtime=",  Rtime);
}





 
//####################################################################

function displayTypeCallback(){
  if(displayType=="lin"){
    displayType="log";
    document.getElementById("buttonDisplayType").innerHTML
      ="=> lineare Darstellung";
  }
  else{
    displayType="lin";
    document.getElementById("buttonDisplayType").innerHTML
      ="=> log. Darstellung";
  }

  drawsim.setDisplayType(displayType); // clear and draAxes in setDisplay..
  drawsim.updateOneDay(it,displayType,corona.xtot,corona.xt,
		       corona.y,corona.yt,corona.z); // !! ONLY to redraw lines
}



// ###############################################################
// do simulations and graphics
// ###############################################################

function myStartStopFunction(){ //!!! hier bloederweise Daten noch nicht da!!

  clearInterval(myRun);
  //console.log("in myStartStopFunction: isStopped=",isStopped);

  if(isStopped){
        isStopped=false;
        document.getElementById("startStop").src="figs/buttonStop3_small.png";
        myRun=setInterval(simulationRun, 1000/fps);
  }
  else{
        document.getElementById("startStop").src="figs/buttonGo_small.png";
        isStopped=true;
  }
}

function selectDataCountry(){ 
  console.log("\n\nin selectDataCountry()");

  const countryGerList={
    "Germany": "Deutschland",
    "Austria": "&Ouml;sterreich",
    "Czechia": "Tschechien",
    "France": "Frankreich",
    "United Kingdom": "England",
    "Italy": "Italien",
    "Poland": "Polen",
    "Spain": "Spanien",
    "Sweden": "Schweden",
    "Switzerland": "Schweiz",
  //  "China": "China",
    "India": "Indien",
  //  "Japan": "Japan",
    "Russia": "Ru&szlig;land",
  //  "Turkey": "T&uuml;rkei",
    "US": "USA"
  }

/*
  const templateList={
    "Germany"       : 
    "Austria"       : 
    "Czechia"       : 
    "France"        : 
    "United Kingdom": 
    "Italy"         : 
    "Poland"        : 
    "Spain"         : 
    "Sweden"        : 
    "Switzerland"   : 
    "India"         : 
    "Russia"        : 
    "US"            : 
  }
*/

  const n0List={
    "Germany"       :   80500000,
    "Austria"       :    8800000,
    "Czechia"       :   10700000,
    "France"        :   67400000,
    "United Kingdom":   65100000,
    "Italy"         :   62200000,
    "Poland"        :   38400000,
    "Spain"         :   49300000,
    "Sweden"        :   10000000,
    "Switzerland"   :    8300000,
    "India"         : 1353000000,
    "Russia"        :  144000000,
    "US"            :  328000000
  }


  const tauRecoverList={
    "Germany"       : 25,
    "Austria"       : 28,
    "Czechia"       : 37,
    "France"        : 25,
    "United Kingdom": 25,
    "Italy"         : 25,
    "Poland"        : 25,
    "Spain"         : 25,
    "Sweden"        : 25,
    "Switzerland"   : 27,
    "India"         : 26,
    "Russia"        : 25,
    "US"            : 25
  }

  const tauDieList={
    "Germany"       : 21,
    "Austria"       : 22,
    "Czechia"       : 24,
    "France"        : 21,
    "United Kingdom": 21,
    "Italy"         : 21,
    "Poland"        : 21,
    "Spain"         : 21,
    "Sweden"        : 21,
    "Switzerland"   : 18,
    "India"         : 21,
    "Russia"        : 21,
    "US"            : 21
  }

  const fracDieInitList={
    "Germany"       : 0.0044,
    "Austria"       : 0.0040,
    "Czechia"       : 0.0041,
    "France"        : 0.0040,
    "United Kingdom": 0.0040,
    "Italy"         : 0.0040,
    "Poland"        : 0.0040,
    "Spain"         : 0.0040,
    "Sweden"        : 0.0040,
    "Switzerland"   : 0.0055,
    "India"         : 0.0085,
    "Russia"        : 0.0040,
    "US"            : 0.0040
  }




  country=document.getElementById("countries").value;
  countryGer=countryGerList[country];
  n0=parseInt(n0List[country]);
  fracDieInit=parseFloat(fracDieInitList[country]);
  tauRecover=parseFloat(tauRecoverList[country]);
  tauDie=parseFloat(tauDieList[country]);
  taumax=Math.max(tauDie,tauRecover)+tauAvg+1;
  console.log("country=",country);
  Rtime=RtimeList[country];
  var test=RtimeList["Germany"]; console.log("test=",test);
  console.log("RtimeList[\"Germany\"]=",RtimeList["Germany"]);
  console.log("RtimeList=",RtimeList, " Rtime=",Rtime);
  setSlider(slider_R0,  slider_R0Text,  Rtime[0],"");

  //flagName=(country==="Germany") ? "flagSwitzerland.png" : "flagGermany.png";
  //document.getElementById("flag").src="figs/"+flagName;
  document.getElementById("title").innerHTML=
    "Simulation der Covid-19 Pandemie "+ countryGer;
  initializeData(country);
  myRestartFunction();
}

function myRestartFunction(){ 
  //RsliderUsed=false;
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  fracDie=fracDieInit*pTest/pTestInit;
  console.log("restart: fracDie=",fracDie);
  startup();
  corona.init(); // because startup redefines CoronaSim() and data there here

  clearInterval(myRun);
  //it=1;
  myRun=setInterval(simulationRun, 1000/fps);

   // activate thread if stopped

  if(isStopped){
    isStopped=false;
    document.getElementById("startStop").src="figs/buttonStop3_small.png";
    //myRun=setInterval(simulationRun, 1000/fps);
  }
}

// selectDataCountry selects default sliders for the active country
// => can use it directly as the reset function

function myResetFunction(){ 
  RsliderUsed=false;

  tauRstart=tauRstartInit;
  setSlider(slider_tauRstart, slider_tauRstartText,
	  tauRstart, ((tauRstart==1) ? " Tag" : " Tage"));

  tauRend=tauRendInit;
  setSlider(slider_tauRend, slider_tauRendText,
	  tauRend, " Tage");

  tauTest=tauTestInit;
  setSlider(slider_tauTest, slider_tauTestText,tauTest, " Tagen");

  pTest=pTestInit; 
  setSlider(slider_pTest, slider_pTestText, 100*pTest, " %");


  selectDataCountry();
}


function simulationRun() {
  if(useLiveData&&(it==0)){
    console.log("Test:");
    for (var t=-5; t<=2; t++){
      console.log("t=",t," R0fun_time(t)=", R0fun_time(t));
    }
    //corona.init(); // !!! now inside fetch promise!

  }
  doSimulationStep(); //it++ at end
  //console.log("RsliderUsed=",RsliderUsed);
  if(!RsliderUsed){
    setSlider(slider_R0, slider_R0Text, R0fun_time(it),"");
  }
  if(it==itmaxinit+1){ 
    clearInterval(myRun);myStartStopFunction();
  }
}

//#########################################
// only called at main run, not warmup
// need to plot first
// because warmup already produced start values for it=0
//#########################################

function doSimulationStep(){
  if(false){console.log(" calling drawsim.updateOneDay: it=",it,
		       " n0* arg corona.xt=",n0*corona.xt);}
  drawsim.updateOneDay(it, displayType, corona.xtot, corona.xt,
		       corona.y, corona.yt, corona.z);
  R_actual=(RsliderUsed&&(it>=7)) ? R0 : R0fun_time(it);
  R_hist[it]=R_actual;
  //console.log("it=",it," R_actual=",R_actual);
  corona.updateOneDay(R_actual);
  it++;

}




//#################################################################
// simulation class. Use global vars just for writing purposes 
// (this "this.*" annoys with time)
//#################################################################

function log10(x){return Math.log(x)/ln10;}


//################################################################
//################################################################

function CoronaSim(){
  //console.log("CoronaSim created");
  this.x=[]; // age struture of fraction infected at given timestep
  this.xohne=[]; // age structure without deleting by recover,death
}



CoronaSim.prototype.init=function(){

  // start warmup at a very early phase
  // !! start with n0*this.xtot>=1, otherwise infection dead
  // feature, not bug

  this.xtot=1.01/n0; 
  this.xtotohne=1.01/n0; 
  //console.log("n0=",n0," 0.99/n0=",0.99/n0," this.xtot=",this.xtot);
  this.xt=0; // fraction of positively tested persons/n0 as f(t)
  this.y=0;  // fraction recovered real as a function of time
  this.yt=0; // fraction recovered data
  this.z=0;  // fraction dead
  this.pTestDay=[]; // fraction of tested infected at day t
  for(var i=0; i<100; i++){ // just initialisation for the first few steps
    this.pTestDay[i]=pTest;
  }
  // init infection-age profile this.x[tau] with exponential

  var r0=0.3; // initial exponential rate per day  (don't confuse r0 with R0)
  var denom=0;
  for(var tau=0; tau<taumax; tau++){
    denom+=Math.exp(-r0*tau);
  }
  for(var tau=0; tau<taumax; tau++){
    this.x[tau]=this.xtot*Math.exp(-r0*tau)/denom;
    this.xohne[tau]=this.x[tau];
    //console.log("this.x[tau]=",this.x[tau]);
  }

  // data-driven warmup

  for(t=-20; t<=0; t++){
    var Rt=R0fun_time(t);
    this.updateOneDay(Rt);
  }



  
  // scale down to match init value of n0*this.xt 
  // exactly to data nxtStart
 
  var scaleDownFact=nxtStart/(n0*this.xt);
  this.xtot     *= scaleDownFact;
  this.xtotohne *= scaleDownFact;
  this.xt       *= scaleDownFact;
  this.y        *= scaleDownFact;
  this.yt       *= scaleDownFact;
  this.z        *= scaleDownFact;
  for(var tau=0; tau<taumax; tau++){
    this.x[tau]     *= scaleDownFact;
    this.xohne[tau] *= scaleDownFact;
  }

  // reset it for start of proper simulation

  it=0; 

}

//#################################################################
// central update step  ("o" means convolution)
// x[taumax]=0
// x[tau+1]=x[tau]
// x[0]=R*f_R o x * (1-(x+y+z))
// if(tauRecover>tauDie){
//   dz/dt=-dx[tauDie]/dt=fracDie*x[tauDie]
//   dy/dt=-dx[tauRecover]/dt=x[tauRecover] -> x[tauRecover]=0
// } otherwise, the other way round

//#################################################################
//!!!
CoronaSim.prototype.updateOneDay=function(R){ 


  if(false){
    console.log("Corona.updateOneDay: it=",it,
		"this.xtot=",this.xtot.toPrecision(3),
		"this.xtotohne=",this.xtotohne.toPrecision(3),
		"this.xt=",this.xt.toPrecision(3),
/*
		"this.yt=",this.yt.toPrecision(3),
		"this.z=",this.z.toPrecision(3),
		"\n  this.x[tauDie-1]=",this.x[tauDie-1].toPrecision(3),
		" this.xohne[tauDie-1]=",this.xohne[tauDie-1].toPrecision(3),
		"\n  this.x[tauDie]=",this.x[tauDie].toPrecision(3),
		" this.xohne[tauDie]=",this.xohne[tauDie].toPrecision(3),
		"\n  this.x[tauDie+1]=",this.x[tauDie+1].toPrecision(3),
		" this.xohne[tauDie+1]=",this.xohne[tauDie+1].toPrecision(3),
		"\n  this.x[tauRecover-1]=",this.x[tauRecover-1].toPrecision(3),
		"\n  this.x[tauRecover]=",this.x[tauRecover].toPrecision(3),
		"\n  this.x[tauRecover+1]=",this.x[tauRecover+1].toPrecision(3),
		"\n  this.xt/pTest-this.y-this.z=",
		(this.xt/pTest-this.y-this.z).toPrecision(3),
*/
		"");
  }



  // shift age profile of already infected by one

  for(var tau=taumax-1; tau>0; tau--){
    this.x[tau]=this.x[tau-1];
    this.xohne[tau]=this.xohne[tau-1];
  }


  // infect new people

  this.x[0]=0;
  var f_R=1./(tauRend-tauRstart+1);
  if(n0*this.xtot>=1){ // !!! infection finally dead if xtot<1
   for(var tau=tauRstart; tau<=tauRend; tau++){
    this.x[0]+=R*f_R*this.x[tau]
      //*(1-(this.xtot+this.y+this.z)); //!!!
      *(1-this.xtotohne);
    if(false){
      console.log("Corona.updateOneDay: it=",it," tau=",tau.toPrecision(3),
		" R*f_R=",R*f_R.toPrecision(3),
                " this.x[tau]*(1-(x+y+z)=",
		this.x[tau]*(1-(this.xtot+this.y+this.z)).toPrecision(3),
		" this.x[0]=",this.x[0].toPrecision(3)
		 );
    }
   }
  }
  this.xohne[0]=this.x[0];


  // test people 

  this.pTestDay[it]=pTest; // needed to determine fraction of 
                      // recovered among the tested later on

  tauAvg//=5; //!!
  var dtau=Math.min(Math.floor(tauAvg/2),Math.round(tauTest));
 

  var f_T=1./(2*dtau+1);
  for(var tau=tauTest-dtau; tau<=tauTest+dtau; tau++){
    this.xt += pTest*f_T*this.xohne[tau];
    if(false&&(it%20==0)){
      console.log("\ntest: it=",it," tau=",tau," x[tau]=",this.xohne[tau],
		  "this.xt=",this.xt);
    }
  }

  // let people die or recover
  // smooth dying and recovery infection age over tauAvg days
  // !! attention of order: change x[tau] last to keep consistency

  //tauAvg=5; //!!
  var dtau=Math.floor(tauAvg/2);

  var dz=[];
  var dy=[];
  var dzsum=0;
  var dysum=0;
  var f_D=1./tauAvg;
  var f_Rec=1./tauAvg;

  for(var tau=tauDie-dtau; tau<=tauDie+dtau; tau++){
    var tauH=Math.min(it,tau);
    //dz[tau-tauDie+dtau]=fracDie*f_D*this.xold[tauH][0];
    dz[tau-tauDie+dtau]=fracDie*f_D*this.xohne[tau];
    dzsum+=dz[tau-tauDie+dtau];
    this.x[tau] -=dz[tau-tauDie+dtau];
  }

  for(var tau=tauRecover-dtau; tau<=tauRecover+dtau; tau++){
    var tauH=Math.min(it,tau);
    dy[tau-tauRecover+dtau]=(1-fracDie)*f_Rec*this.xohne[tau];
    dysum+=dy[tau-tauRecover+dtau];
    this.x[tau] -=dy[tau-tauRecover+dtau];
  }
  this.z   += dzsum;
  this.y   += dysum;
  var dayTested=Math.max(0,it-Math.round(tauRecover-tauTest));

  this.yt  +=(this.pTestDay[dayTested]-fracDie)/(1-fracDie)*dysum;




  //console.log("it=",it," xt=",this.xt," dysum=",dysum," dzsum=",dzsum);



  // sum up the profile of infected people
  // xtot: sum of "actually infected" (neither recoverd nor dead)
  // xtotohne: cumulative sum of infected (incl recovered, dead)

  this.xtot=0;  

  //this.xtotohne=0; //!!!
  this.xtotohne+= this.x[0];//!!!
  for(var tau=0; tau<taumax; tau++){
    this.xtot     += this.x[tau];
  }


  // control output

  if(false){
    console.log("end CoronaSim.updateOneDay: it=",it,
		" nxt=",(n0*this.xt).toPrecision(5),
		" nxtot=",(n0*this.xtot).toPrecision(6),
		" nxtotohne=",(n0*this.xtotohne).toPrecision(6),
	//	" ny=",(n0*this.y).toPrecision(5),
	//	" nyt=",(n0*this.yt).toPrecision(5),
	//	" nz=",(n0*this.z).toPrecision(5),
		""
	     );
  }


} // CoronaSim.updateOneDay





//#################################################################
// Drawing class (graphics)
//#################################################################

function DrawSim(){

  //console.log("drawSim created");

  this.unitPers=1000;  // persons counted in multiples of unitPers

  this.itR0=-1; // it value where n0*xt first exceeds nxtR0 (init val)
  this.yminLin=0;
  this.ymaxLin=10; // unitPers=1000-> 100 corresp to 100 000 persons
  this.yminPerc=0;
  this.ymaxPerc=10;
  this.yminLog=1;
  this.ymaxLog=7;
  this.nmin=10;      // if isplayType==="log", display for n>nmin cases

  this.log10min=Math.log(this.nmin)/ln10;
  this.log10max=Math.log(n0)/ln10;

  this.xPix0  =0.12*canvas.width;
  this.xPixMax=0.98*canvas.width;
  this.yPix0  =0.85*canvas.height;
  this.yPixMax=0.02*canvas.height;
  this.wPix=this.xPixMax-this.xPix0;
  this.hPix=this.yPixMax-this.yPix0;  //<0

  this.xPix=[];
  this.yDataLin=[];
  this.yDataLog=[];

  this.yDataLin[0]=[];  // infected
  this.yDataLin[1]=[];  // infected+positively tested
  this.yDataLin[2]=[];  // reovered real
  this.yDataLin[3]=[];  // reovered and tested before
  this.yDataLin[4]=[];  // dead
  this.yDataLin[5]=[];  // fraction dead/positively tested

  this.yDataLog[0]=[];  // infected
  this.yDataLog[1]=[];  // infected+positively tested
  this.yDataLog[2]=[];  // reovered real
  this.yDataLog[3]=[];  // reovered and tested before
  this.yDataLog[4]=[];  // dead
  this.yDataLog[5]=[];  // fraction dead/positively tested


  this.colLine=[];
  this.colLine[0]="rgb(255,90,0)";   // infected
  this.colLine[1]="rgb(233,0,0)";     //Tested
  this.colLine[2]="rgb(60,255,40)"; //RecoveredReal
  this.colLine[3]="rgb(0,150,40)";    //RecoveredData
  this.colLine[4]="rgb(0,0,0)";      //Dead
  this.colLine[5]="rgb(0,0,150)";       //FracDeadData

  this.wLine=[2,5,2,5,5,5]; //line width [pix]
  this.isActive=[];   // which line is drawn
  this.setDisplayType(displayType);
}


DrawSim.prototype.setDisplayType=function(displayType){
  var displayDeadRecovered=( (country==="Germany")
			     ||(country==="Austria")
			     ||(country==="Czechia")
			     ||(country==="Switzerland")
			     ||(country==="India"));
  this.isActiveLog=(displayDeadRecovered)
    ? [true,true,true,true,true,false]
    : [true,true,false,false, false,false]
  this.isActiveLin=(displayDeadRecovered)
    ? [false,true,false,true,true,true]
    : [false,true,false,false,false,false]
  this.isActive=(displayType==="lin") ? this.isActiveLin : this.isActiveLog;
  this.xPix0  =0.12*canvas.width;
  this.xPixMax=((displayDeadRecovered&&(displayType==="lin"))
		? 0.90: 0.98) * canvas.width;
  this.yPix0  =0.85*canvas.height;
  this.yPixMax=0.02*canvas.height;
  this.wPix=this.xPixMax-this.xPix0;
  this.hPix=this.yPixMax-this.yPix0;  //<0

  this.clear();
  this.drawAxes(displayType);
}


// type="vertical" or "horizontal"
// xyrel=relative pos on respective axis


DrawSim.prototype.drawGridLine=function(type,xyrel){
  var nSegm=100;
  ctx.beginPath();  //!! crucial; otherwise latest col used for ALL

  if(type==="vertical"){
    var nSegm=-0.2*this.hPix; 
    for(var i=0; i<nSegm; i++){
      var x0=this.xPix0+xyrel* this.wPix;
      var x1=x0;
      var y0=this.yPix0+i/nSegm* this.hPix;
      var y1=y0+0.3/nSegm* this.hPix;
      ctx.moveTo(x0,y0)
      ctx.lineTo(x1,y1);
    }
  }
  else{  //type==="horizontal"
    var nSegm=0.2*this.wPix; 
    for(var i=0; i<nSegm; i++){
      var x0=this.xPix0+i/nSegm* this.wPix;
      var x1=x0+0.3/nSegm * this.wPix;
      var y0=this.yPix0+xyrel* this.hPix;
      var y1=y0;
      ctx.moveTo(x0,y0)
      ctx.lineTo(x1,y1);
    }
  }
  ctx.stroke();
}


// displayType in {"lin", "log"}

DrawSim.prototype.drawAxes=function(displayType){

 // define x axis label positions and text, time starts Mar 20

  var itmaxCrit=60;
  var itmaxCrit2=450;
  var dFirstDay=(itmax<itmaxCrit) ? 23-dayStartMar//Mar 23 :
    : (itmax<itmaxCrit2) ? 32-dayStartMar //Apr1
    : 123-dayStartMar;   //Jul 1
  var dDays=(itmax<itmaxCrit) ? 7
    : (itmax<itmaxCrit2) ? 30.4 : 182.6;  // avg month has 30.4 days
  var timeText=(itmax<itmaxCrit)
    ? ["23.03", "30.03", "06.04", "13.04", "20.04", "27.04", 
       "04.05", "11.05", "18.05"]
    : (itmax<itmaxCrit2)
    ? ["Apr","Mai","Jun", "Jul", "Aug", "Sep", "Okt", 
       "Nov", "Dez", "Jan2021", "Feb", "Mar", "Apr","Mai","Jun", "Jul"]
    : ["Jul 2020", "Jan 2021", "Jul 2021", "Jan 2022", "Jul 2022", 
       "Jan 2023", "Jul 2023", "Jan 2024"];

  var timeRel=[];
  for(var i=0; i<timeText.length; i++){
    timeRel[i]=(dFirstDay+i*dDays)/(itmax); //!!!
  }

  //define y axis label positions and text

  var ymin=(displayType==="lin") ? 0 : 1;
  var ymax=(displayType==="lin") ? this.ymaxLin : this.ymaxLog;
  var dy=1; // always for log
  if(displayType==="lin"){
    var power10=Math.floor(log10(ymax));
    var multiplicator=Math.pow(10, power10);
    var ymaxRange01=ymax/multiplicator;
    dy=(ymaxRange01<2) ? 0.2*multiplicator
      :(ymaxRange01<5) ? 0.5*multiplicator : multiplicator;
  }

  var ny=Math.floor(ymax/dy);
  var iymin=1; // should work both for lin and log


 //define y2 axis label positions and text

  var ymin2=0;
  var ymax2=this.ymaxPerc;
  //var ymax2=Math.min(10,this.ymaxPerc);
  if((displayType==="lin")&&(this.isActiveLin[5])){
    var power10=Math.floor(log10(ymax2));
    var multiplicator=Math.pow(10, power10);
    var ymaxRange02=ymax2/multiplicator;
    var dy2=(ymaxRange02<2) ? 0.2*multiplicator
        :(ymaxRange02<5) ? 0.5*multiplicator : multiplicator;
    var ny2=Math.floor(ymax2/dy2);
  }



 
  // define text properties

  var textsize=Math.min(0.030*canvas.width,0.045*canvas.height);
  //var textsize=0.035*Math.min(canvas.width, canvas.height);
  ctx.font = textsize+"px Arial";



  // draw 3 px wide lines as coordinates

  ctx.fillStyle="rgb(0,0,0)";
  ctx.fillRect(this.xPix0, this.yPix0-1, this.wPix, 3);
  ctx.fillRect(this.xPix0-0, this.yPix0, 3, this.hPix);


  // draw grid

  ctx.strokeStyle="rgb(0,0,0)";

  for(var ix=0; (ix<timeRel.length)&&(timeRel[ix]<0.96); ix++){
    this.drawGridLine("vertical", timeRel[ix]);
  }

  for(var iy=1; iy<=ny; iy++){
    this.drawGridLine("horizontal",iy*dy/(ymax-ymin));
  }

  ctx.stroke();


  // draw name+values x axis

  ctx.fillText("Zeit (Start "+dayStartMar+". Maerz 2020)",
	       this.xPix0+0.3*this.wPix, this.yPix0+3*textsize);

  var dxShift=(itmax<itmaxCrit) ? -1.1*textsize : 0;
  for(var ix=0; (ix<timeRel.length)&&(timeRel[ix]<0.96); ix++){
    ctx.fillText(timeText[ix],
		 this.xPix0+timeRel[ix]*this.wPix+dxShift,
		 this.yPix0+1.5*textsize);
  }


  // draw name+values y1 axis

  var label_y=(displayType==="lin")
    ? countryGer+": Personenzahl (in Tausend)" : countryGer+": Personenzahl";

  var yPix=(displayType==="lin")
    ? this.yPix0+0.01*this.hPix : this.yPix0+0.15*this.hPix;
  ctx.setTransform(0,-1,1,0,
		   this.xPix0-3.0*textsize,yPix);
  ctx.fillText(label_y,0,0);
  ctx.setTransform(1,0,0,1,0,0)
  for(var iy=ymin; iy<=ny; iy++){
    var valueStr=(displayType==="lin")  ? iy*dy : "10^"+iy;
    ctx.fillText(valueStr,
		 this.xPix0-2.5*textsize,
		 this.yPix0+(iy*dy-ymin)/(ymax-ymin)*this.hPix+0.5*textsize);
  }

  
  // draw name+values y2 axis if displayType="lin"

  if((displayType==="lin")&&(this.isActiveLin[5])){

    var label_y2="Tote/bekannt Erkrankte [%]";
    ctx.fillStyle=this.colLine[5];
    ctx.setTransform(0,-1,1,0,
		   this.xPixMax+3.0*textsize,this.yPix0+0.2*this.hPix);
    ctx.fillText(label_y2,0,0);
    ctx.setTransform(1,0,0,1,0,0)
    for(var iy=ymin2; iy<=ny2; iy++){
      var valueStr= iy*dy2 
      ctx.fillText(valueStr,
		  this.xPixMax+0.8*textsize,
		  this.yPix0+(iy*dy2-ymin2)/(ymax2-ymin2)*this.hPix
		   +0.5*textsize);
    }
  }

  
  

  // draw key

  var yrelTop=(displayType==="lin") ? 0.96 : -4.5*(1.2*textsize/this.hPix);
  var xrelLeft=(displayType==="lin") ? 0.02 : 0.60;
  var dyrel=-1.2*textsize/this.hPix;
  var il=0;
  if(this.isActive[0]){
    ctx.fillStyle=this.colLine[0];
    ctx.fillText("Aktuell real infizierte Personen",
	         this.xPix0+xrelLeft*this.wPix,
		 this.yPix0+(yrelTop-il*dyrel)*this.hPix);
    il++;
  }

  if(this.isActive[1]){
    ctx.fillStyle=this.colLine[1];
    ctx.fillText("Erfasste infiz. Personen",
	         this.xPix0+xrelLeft*this.wPix,
		 this.yPix0+(yrelTop-il*dyrel)*this.hPix);
    il++;
  }

  if(this.isActive[2]){
    ctx.fillStyle=this.colLine[2];
    ctx.fillText("Genesene Personen (real)",
	         this.xPix0+xrelLeft*this.wPix,
		 this.yPix0+(yrelTop-il*dyrel)*this.hPix);
    il++;
  }

  if(this.isActive[3]){
    ctx.fillStyle=this.colLine[3];
    ctx.fillText("Erfasste genesene Personen",
	       this.xPix0+xrelLeft*this.wPix,
		 this.yPix0+(yrelTop-il*dyrel)*this.hPix);
    il++;
  }

  if(this.isActive[4]){
    ctx.fillStyle=this.colLine[4];
    ctx.fillText("Gestorbene Personen",
		 this.xPix0+xrelLeft*this.wPix,
		 this.yPix0+(yrelTop-il*dyrel)*this.hPix);
    il++;
  } 

  if(this.isActive[5]){
    ctx.fillStyle=this.colLine[5];
    ctx.fillText("#Tote/#positiv getestet",
	         this.xPix0+xrelLeft*this.wPix,
		 this.yPix0+(yrelTop-il*dyrel)*this.hPix);
  }

}




// displayType in {"lin", "log"}

//######################################################################
DrawSim.prototype.updateOneDay=function(it,displayType,xtot,xt,y,yt,z){
//######################################################################




  // transfer new data

  this.yDataLin[0][it]=n0*xtot/this.unitPers;
  this.yDataLin[1][it]=n0*xt/this.unitPers;
  this.yDataLin[2][it]=n0*y/this.unitPers;
  this.yDataLin[3][it]=n0*yt/this.unitPers;
  this.yDataLin[4][it]=n0*z/this.unitPers;
  this.yDataLin[5][it]=(xt>1e-12) ? 100*z/xt : 0; // yDataLin[5] "rel"[%] 

  this.yDataLog[0][it]=log10(n0*xtot); 
  this.yDataLog[1][it]=log10(n0*xt);
  this.yDataLog[2][it]=log10(n0*y);
  this.yDataLog[3][it]=log10(n0*yt);
  this.yDataLog[4][it]=log10(n0*z);
  this.yDataLog[5][it]=(xt>1e-6) ? log10(100*z/xt) : 0;

  if(false){console.log("DrawSim.updateOneDay: it=",it,
			" this.yDataLin[1][it]=",this.yDataLin[1][it],
			//" this.yDataLog[0][it]=",this.yDataLog[0][it],
			"");}

// test possible rescaling due to new data

  var erase=false;

  if(it>itmax){
    itmax=it;
    erase=true;
  }
  // need to redefine x pixel coords if rescaling in x

  for(var i=0; i<=itmax; i++){
    this.xPix[i]=this.xPix0+i*(this.xPixMax-this.xPix0)/(itmax);
  }

  // need also to update ymax of display actually not used

  for(var q=0; q<5; q++){ 
    if((this.isActiveLin[q])&&(this.yDataLin[q][it]>this.ymaxLin)){
      this.ymaxLin=this.yDataLin[q][it];
      if(displayType==="lin"){erase=true;}
    }

    if((this.isActiveLog[q])&&(this.yDataLog[q][it]>this.ymaxLog)){
      this.ymaxLog=this.yDataLog[q][it];
      if (displayType==="log"){erase=true;}
    }

    if(false){
      console.log("it=",it," q=",q,
		  " this.yDataLin[q][it]=",this.yDataLin[q][it],
		  " this.ymaxLin=",this.ymaxLin,
		    " this.ymaxLog=",this.ymaxLog);
    }
    
  }

  if(this.yDataLin[5][it]>this.ymaxPerc){ // yDataLin[5] =z/yt in percent
    this.ymaxPerc=this.yDataLin[5][it];
    erase=true;
  }

  // take care of data=max in linear representation


  if(displayType==="lin"){
    var i_dataGit=it+dataGit_istart;
    if(i_dataGit<dataGit_cumCases.length){

      if(dataGit_cumCases[i_dataGit]>this.unitPers*this.ymaxLin){
	this.ymaxLin=dataGit_cumCases[i_dataGit]/this.unitPers;
	erase=true;
      }

      if(100*dataGit_deathsCases[i_dataGit]>this.ymaxPerc){
	this.ymaxPerc=100*dataGit_deathsCases[i_dataGit];
	erase=true;
      }
    }
  }


  if(erase){
    this.clear();
    this.drawAxes(displayType);
  }


  // actual drawing of sim results

  for(var q=0; q<6; q++){
    if(this.isActive[q]){
      this.drawCurve(it,q,displayType);
    }
  }

// drawing vertical separation lines R0start and R0 


  ctx.fillStyle="#888888";
  var x0=this.xPix0;
  var y0=this.yPix0+0.4*this.hPix;
  var textsize=Math.min(0.030*canvas.width,0.045*canvas.height);

  ctx.setTransform(0,-1,1,0,x0+1.0*textsize,y0);
  ctx.fillText("R="+R0fun_time(0),0,0);
  ctx.setTransform(1,0,0,1,0,0);

  for(var iw=1; iw<it/7; iw+=2){
    var itR=7*iw;
    x0=this.xPix[itR];
    ctx.fillRect(x0-1,this.yPix0,3,this.hPix);

    ctx.setTransform(0,-1,1,0,x0+1.0*textsize,y0);
    ctx.fillText("R="+R_hist[itR],0,0);
    ctx.setTransform(1,0,0,1,0,0);
  }



  if(this.isActive[1]){ // xt
    this.plotPoints(it, 1, dataGit_cumCases, displayType);
  }

  if(this.isActive[3]){ // yt
    this.plotPoints(it, 3, dataGit_cumRecovered, displayType);
  }

  if(this.isActive[4]){ // z
    this.plotPoints(it, 4, dataGit_cumDeaths, displayType); 
  }

  if(this.isActive[5]){ // z/xt
    this.plotPoints(it, 5, dataGit_deathsCases, displayType); 
  }

}


//######################################################################
DrawSim.prototype.drawCurve=function(it,q,displayType){
//######################################################################
  //console.log("in DrawSim.drawCurve: q=",q," displayType=",displayType);
  var data=(displayType==="log") ? this.yDataLog[q] : this.yDataLin[q];
  var w=this.wLine[q]/2;
  var yminDraw=(displayType==="log") ? this.yminLog : this.yminLin;
  var ymaxDraw=(displayType==="log") ? this.ymaxLog : this.ymaxLin;
  if(q==5){yminDraw=this.yminPerc; ymaxDraw=this.ymaxPerc};

  ctx.fillStyle=this.colLine[q];

  for (var itg=0; itg<it; itg++){
    if(false){console.log("q=",q," itg=",itg," data[itg]=",data[itg],
			 " yminDraw=",yminDraw,
			 " ymaxDraw=",ymaxDraw);}
    if((itg>0)&&(data[itg]>=yminDraw) &&(data[itg]<=ymaxDraw)){
      var yrel=(data[itg]-yminDraw)/(ymaxDraw-yminDraw);
      var yrelOld=(data[itg-1]-yminDraw)/(ymaxDraw-yminDraw);
      var dataPix=this.yPix0+yrel*(this.yPixMax-this.yPix0);
      var dataPixOld=this.yPix0+yrelOld*(this.yPixMax-this.yPix0);
     // if(q==0){console.log("q=",q," yrel=",yrel);}
      ctx.beginPath(); //!! crucial; otherwise latest col used for ALL
      var phi=Math.atan((dataPix-dataPixOld)/
			(this.xPix[itg]-this.xPix[itg-1]));
      var cphi=Math.cos(phi);
      var sphi=Math.sin(phi);
      ctx.moveTo(this.xPix[itg-1]-w*sphi, dataPixOld+w*cphi);
      ctx.lineTo(this.xPix[itg-1]+w*sphi, dataPixOld-w*cphi);
      ctx.lineTo(this.xPix[itg]+w*sphi,   dataPix-w*cphi);
      ctx.lineTo(this.xPix[itg]-w*sphi,   dataPix+w*cphi);
      ctx.closePath();  // !! crucial, otherwise latest col used for ALL
      ctx.fill();
    }
  }
}


// plot the data; q only for determining the corresponding color

//######################################################################
DrawSim.prototype.plotPoints=function(it,q,data_arr,displayType){
//######################################################################

  var yminDraw=(displayType==="log") ? this.yminLog : this.yminLin;
  var ymaxDraw=(displayType==="log") ? this.ymaxLog : this.ymaxLin;
  if(q==5){yminDraw=this.yminPerc; ymaxDraw=this.ymaxPerc};

  ctx.fillStyle=this.colLine[q];

  for (var i=0; i<data_arr.length; i++){


    var itg=i-dataGit_istart;

    // log 10 and, if lin, in 1000 =>*0.001, if perc *100

    var y=(displayType==="log") ? log10(data_arr[i]) : 0.001*data_arr[i];
    if(q==5){y=100*data_arr[i];}

    // actual plotting


    if((itg>=0)&&(itg<=it)){
      if(false){console.log("it=",it," i=",i," itg=",itg,
			   " data_arr[i]=",data_arr[i]);}

      var yrel=(y-yminDraw)/(ymaxDraw-yminDraw);
      var dataPix=this.yPix0+yrel*(this.yPixMax-this.yPix0);
      ctx.beginPath(); //!! crucial; otherwise latest col used for ALL
      ctx.arc(this.xPix[itg],dataPix,0.010*sizemin, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
}

DrawSim.prototype.clear=function(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}


// from Stackoverflow; dirty unicode trick
//since <sub>...</sub> not allowed in canvas

function toSub(value){
     var str = "";
     //  Get the number of digits, with a minimum at 0 in case the value itself is 0
     var mag = Math.max(0, Math.floor(log10(value)));
     //  Loop through all digits
     while (mag >= 0)
     {
       //  Current digit's value
       var digit = Math.floor(value/Math.pow(10, mag))%10;
       //  Append as subscript character
       str += String.fromCharCode(8320 + digit);
       mag--;
     }
     return str;
}
