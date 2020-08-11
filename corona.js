// TODO: split calibration interval (look at places with !!!)


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

/* Date object: 
 - Constructor e.g., date=new Date(2020,02,19); months start @ zero, days @ 1
 - another Constructor date=new Date("2020-01-22")
   Most stable/generic, but NOT "2020-1-22" (fails on apple)
 - "present" constructor: new Date()
 - get time in ms since 1970: date.getTime()
 - difference in days Math.round((date1.getTime()-date2.getTime())/oneDay_ms)
 - date.getFullYear() -> 2020
 - date.getMonth() -> 1 (w/o leading zeroes=February)
 - date.getDate() -> 22  (1-31)
 - add 50 days: date.setDate(date.getDate() + 50);
 - Operator >, < works as expected
 - console.log(date) -> like "Wed Mar 25 2015 01:00:00 GMT+0100 (CET)"
 - date.toDateString() -> Fri Jun 05 2020
 - var options = {month: "short", day: "2-digit"};
   date.toLocaleDateString("en-us",options) -> Jun 05;
*/



// general global variables

const ln10=Math.log(10);
var displayType="lin"; // "lin" or "log"; consolidate with html
var myRun;
var isStopped=true



// global time simulation vars (see also "data related global variables")

var dayStartMar=19;
var startDay=new Date(2020,02,dayStartMar); // months start @ zero, days @ 1

var it=0;
var itmaxinit;  // #days init simulation; to be determined by js Date() object
                // itmaxinit=days(present-startDay)
var itmax;      // can be >itmaxinit during interactive simulation

var itmin_calib; // !!! start calibr time interval w/resp to dayStartMar
                 //     =^ dataGit_idataStart+1
var itmax_calib; // !!! end calibr time interval =^ dataGit_imax-1 
                 // should be split if there are more than approx 
                 // 20 weeks of data

// data related global variables
// fetch with https://pomber.github.io/covid19/timeseries.json
// or load as a variable server-side (if useLiveData=false)

var dataGit=[];
var dataGit_dateBegin;

var dataGit_idataStart; //!!! dataGit dataset index for dayStartMar
var dataGit_imax;  // !!! with respect to dayStartMar=dataGit_cumCases.length-dataGit_idataStart

var dataGit_date=[];
var dataGit_cumCases=[];
var dataGit_cumDeaths=[];
var dataGit_cumRecovered=[];
var dataGit_deathsCases=[];



// global geographic simulation vars 

var n0=80.e6;  // #persons in Germany

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


const fracDieInitList={
    "Germany"       : 0.0048,
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





var RsliderUsed=false;
var otherSliderUsed=false;
var R0=1.42;       // init interactive R for slider corona_gui.js (overridden)
var Rtime=[]; //!!! calibrated R; one element per 1-2 weeks
              // initialize in function startup() (then data available)
var R_hist=[]; R_hist[0]=R0; // R from past interactions; one element per day
var sigmaR_hist=[]; sigmaR_hist[0]=0; 

var oneDay_ms=(1000 * 3600 * 24);


// if use Europe opendata portal

var data_date_ddmmyyyy=[];
var data_diff2start=[];
var data_cases=[];
var data_cumCases=[];
var data_deaths=[];
var data_cumDeaths=[];
var data_deathsCases=[];






// global simulation  parameters


// (i) controlled by sliders (apart from R0)

var fps=10;

var tauRstartInit=4;   // active infectivity begins [days since infection]//1
var tauRendInit=12;    // active infectivity ends [days since infection]//10
var tauTestInit=8;    // time delay [days] test-infection //8
var pTestInit=0.1;     // initial percentage of tested infected persons //0.1

var tauRstart=tauRstartInit;
var tauRend=tauRendInit;  
var pTest=pTestInit;       // percentage of tested infected persons 
var tauTest=tauTestInit;
var tauAvg=5;      // smoothing interval for tauTest,tauDie,tauRecover

// (ii) not controlled

var fracDieInit=0.0047;  // fracDie for initial setting of pTest
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
  console.log("in getGithubData");
  corona=new CoronaSim(); //!!

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
        corona.init(); //!! only then ensured that data loaded! it=1 as result
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
    //corona=new CoronaSim(); //!!
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
  console.log("in initializeData(country)");
  console.log(" Rtime.length=",Rtime.length);
  var data=dataGit[country];
  var dateInitStr=data[0]["date"];

  // !! extremely heineous apple date bug: 
  // cannot make use of date str such as 2020-1-22

  //console.log("new Date(\"2020-01-22\")=",new Date("2020-01-22"));
  //console.log("new Date(\"2020-1-22\")=",new Date("2020-1-22"));
  //console.log("dataGit_dateBegin=",dataGit_dateBegin);
  //console.log("dataGit_idataStart=",dataGit_idataStart);


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

  dataGit_dateBegin=new Date(insertLeadingZeroes(dateInitStr));
  dataGit_idataStart=Math.round(
    (startDay.getTime() - dataGit_dateBegin.getTime() )/oneDay_ms);
  dataGit_imax=dataGit_cumCases.length-dataGit_idataStart;


  nxtStart=dataGit_cumCases[dataGit_idataStart]; 

  console.log(
    " dataGit_idataStart=",dataGit_idataStart,
    "\n  dataGit_cumCases.length=",dataGit_cumCases.length,
    "\n  dataGit_date[0]=",dataGit_date[0],
    "\n  dataGit_date[dataGit_idataStart]",dataGit_date[dataGit_idataStart],
    "\n  dataGit_cumCases[dataGit_idataStart-1]",dataGit_cumCases[dataGit_idataStart-1],
    "\n  dataGit_cumCases[dataGit_idataStart]",dataGit_cumCases[dataGit_idataStart],
    "\n  dataGit_cumCases[dataGit_idataStart+1]",dataGit_cumCases[dataGit_idataStart+1],
    "\n  dataGit_cumCases[dataGit_idataStart+2]",dataGit_cumCases[dataGit_idataStart+2],
    "\n  dataGit_date[dataGit_cumCases.length-1]",
    dataGit_date[dataGit_cumCases.length-1],
    "\n  nxtStart=",nxtStart,
    "\n"
  );

  RsliderUsed=false;
  otherSliderUsed=false;
  calibrate(); //!!! determines Rtime.length


 //##############################################################
 // !! for inline nondynamic  testing: add testcode here
 //##############################################################

  if(false){
    Rguess= [1.8555828429026051, 0.6830523633876675, 0.6269836250678231, 0.695683771637065, 0.8262257735681733, 0.6956357378063327, 1.528364682075033, 0.7687901284239431];
    console.log("Rguess=",Rguess,
		" SSEfunc(Rguess,null,true)=",SSEfunc(Rguess,null,true));
  }

  console.log("end initializeData: country=",country);
  console.log(" Rtime.length=",Rtime.length);

} // initializeData(country);


//##############################################################
// function for variable replication rate R as a function of time
// t=tsim-date(2020-03-19) [days]
//##############################################################

function Rfun_time(t){
  var iPresent=dataGit_idataStart+t;
  var iTest    =iPresent+Math.round(tauTest);
  var iTestPrev=iPresent+Math.round(tauTest-0.5*(tauRstart+tauRend));

  if(t<=0){ //!!! R as relevant for period from dayStartMar-1 to dayStartMar
    var nxtNewnum  =1./2.*(dataGit_cumCases[iTest+1]-dataGit_cumCases[iTest-1]);
    var nxtNewdenom=1./2.*(dataGit_cumCases[iTestPrev+1]
			  -dataGit_cumCases[iTestPrev-1]);
    var R=1.02*nxtNewnum/nxtNewdenom;
    if(false){
      console.log("Rfun_time: t=",t," xtCum(iTest)=",dataGit_cumCases[iTest],
		" xtCum(iTestPrev)=",dataGit_cumCases[iTestPrev],
		" xtNewnum=",xtNewnum,
		" xtNewdenom=",xtNewdenom,
		"");
    }

    // !! deflect infinity, NaN etc and too large R values if denom 0
    // avoid too small R values if num 0

    if(Math.abs(nxtNewdenom)<1e-10){
      //console.log("Rfun_time: t=",t," error: R factor infinity");
      R=5;
    }
    R=Math.min(5, Math.max(0.2,R));

    return R;
  }

  else{// regular
    var iweek=Math.floor(t/7);
    var nxt=dataGit_cumCases[iPresent];
    var index=Math.min(Math.floor((iweek+1)/2),Rtime.length-1);
    return Rtime[index]; //!! Rtime is central array to keep actual R curve
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
@param fR: optional numerical gradient of func with respect to R
@param logging: optional logging switch
@global param (do not know how to inject params into func):
@global itmin_calib start of calibr intervals (days since dayStartMar)
@global itmax_calib end of calibr intervals (days since dayStartMar)

NOTICE: fmin.nelderMead needs one-param SSEfunc SSEfunc(R_arr):
        "sol2_SSEfunc=fmin.nelderMead(SSEfunc, Rguess);"
 ##############################################################*/

function SSEfunc(R_arr, fR, logging) { //!!!!! use separate R_array for optimization if not whole array optimized!!!!

  //console.log("in SSE func: R_arr=",R_arr);

  if( typeof fR === "undefined"){
    fR=[]; for(var j=0; j<R_arr.length; j++){fR[j]=0;}
    //console.log("inside: fR=",fR);
  }
  if( typeof logging === "undefined"){logging=false;}




  // always full simulation time incl corona.init
  // !! [change possibly later including specialized corona.init(itime);] 


  // simulation init

  nxtStart=dataGit_cumCases[dataGit_idataStart];
  corona.init(); // scales up/down to nxtStart at the last warmup step

  // calculate SSE

  var sse=0;

  for(var i=1; i<dataGit_imax; i++){
    var inCalib=((i>=itmin_calib)&&(i<itmax_calib)); //!!!!
    var indexR=Math.min(getIndexCalib(i),Rtime.length-1);
    var indexCalib=Math.min(getIndexCalib(i)-getIndexCalib(itmin_calib),
			    R_arr.length-1); //!!!!
    var R_actual=(inCalib) ? R_arr[indexCalib] : Rtime[indexR];

    if(logging&&(i==1)){
      var nxData=dataGit_cumCases[dataGit_idataStart+i-1];
      var nxSim=n0*corona.xt;
      console.log("SSEfunc: i=0=init",
		  " R_actual=",R_actual.toFixed(2),
		  " nxData=",nxData,
		  " nxSim=",Math.round(nxSim),
		  " nActiveTrueSim=",Math.round(n0*corona.xtot));
    }

    corona.updateOneDay(R_actual);
    var nxData=dataGit_cumCases[dataGit_idataStart+i];
    var nxSim=n0*corona.xt;

    if(logging){ 
      console.log("SSEfunc: i=",i,
		  " R_actual=",R_actual.toFixed(2),
		  " nxData=",nxData,
		  " nxSim=",Math.round(nxSim),
		  " nActiveTrueSim=",Math.round(n0*corona.xtot));
    }


    if(inCalib){ //!!!
      sse+=Math.pow(Math.log(nxData)-Math.log(nxSim),2); //!! Math.log
    }

  // MT 2020-07 penalize negative R or R near zero

    var RlowLimit=0.2;
    var prefact=1;
    if(R_actual<RlowLimit){
      sse += prefact*Math.pow(RlowLimit-R_actual,2);
    }
  }



  /*
  // calculate the numerical gradient as side effect
  // only if gradient-based method. 
  // These fail here=>do not need to calc grad

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

  if(false){
   for (var j=0; j<R_arr.length; j++){
    fR[j]=0; // gradient
    corona.init();
    for(var i=1; i<dataGit_imax; i++){
      var iweek=Math.floor(i/7);
      var index=Math.min(Math.floor((iweek+1)/2),R_arr.length-1);
      var R_actual=Rp[j][index];
      corona.updateOneDay(R_actual);
      var nxData=dataGit_cumCases[i];
      var nxSim=n0*corona.xt;
      fR[j]+=Math.pow(nxData-nxSim,2);
    }

    corona.init();
    for(var i=1; i<dataGit_imax; i++){
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
  */


  return sse;
}


//##############################################################
// callbacks influencing the overall simulation operation/appearance
//##############################################################


//called in the html  <body onload> event and by myRestartFunction()

function startup() {
  console.log("in startup");
  // =============================================================
  // get present and difference to startDay
  // =============================================================

  var present=new Date();
  //var present=new Date(2020,02,23); //!!
  
  // initialisation of itmaxinit; 
  // round because of daylight saving time complications

  itmaxinit = Math.round(
    (present.getTime() - startDay.getTime())/oneDay_ms);
  itmax=itmaxinit;
  //console.log("present=",present);


  // initialize R estimation result (particularly length) if still undefined

  if( typeof Rtime[0] === "undefined"){
    Rtime[0]=3; //!!! start with high reproduction rate in first week 
    for(var index=1; index<=getIndexCalibmax(itmaxinit); index++){
      Rtime[index]=1;
    }
    
  }
 

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
  // actual startup
  // =============================================================

  myStartStopFunction(); // default: starts simulation up to present !!
  //myResetFunction();

}


// =============================================================
// determine the calibration period index based on the time index 
// itime=time[days] - dayStartMar.
// first week index 0, then increment every TWO weeks 
// =============================================================

function getIndexCalib(itime){
  var iweek=Math.floor(itime/7);
  return Math.floor((iweek+1)/2);
}

function getIndexCalibmax(itime){
  return getIndexCalib(itime-7); // calib R for at least 7 days
}


// =================================================
// determines calibrated Rtime[]
// =================================================

function calibrate(){

  console.log(" in function calibrate(), country=",country);

  /// set global variables itmin_calib, itmax_calib 
  // for calibration interval (itmin_calib>=1 day since dayStartMar) 

  itmin_calib=0;               
  //itmax_calib=144;  //!!!! klappt auch fuer weniger als itmax
  itmax_calib=dataGit_imax-1;  // (dataGit_imax w/resp to dayStartMar!!)
                               // ! NaN variance if itmax_calib=dataGit_imax
  // !!! calibrate part of Rtime[] defined by itmin_calib, itmax_calib

  estimateR(); // determines calibrated Rtime[] /!!! here Rtime.length set, transfer setting from estimateR->calibrate

  estimateErrorCovar(); // uses calibrated Rtime[]

//!!!! zweites Kalib-Intervall klappt noch nicht, obwohl calibr anscheinend OK

/*
  itmin_calib=61;               
  itmax_calib=dataGit_imax;
  estimateR();
  estimateErrorCovar();
*/
}




// =============================================================
// estimate the array R_arr of R values with fmin.nelderMead
// provided by open-source package fmin
// notice: fmin.conjugateGradient does not work here
// => use simple nelderMead and do not need to calculate
// num derivatives in func as side effect of SSEfunc
// @global param (do not know how to inject params into func):
// (1) itmin_calib start of calibr intervals (days since dayStartMar)
// (2) itmax_calib end of calibr intervals (days since dayStartMar)
// itmin_calib >=0
// itmax_calib < dataGit_imax-dataGit_idataStart
// =============================================================

function estimateR(){

  /// !!! THIS determines number of calibration intervals
 // need at least 7 days for calibr interval

  var indexcalibmin=getIndexCalib(itmin_calib);
  var indexcalibmax=getIndexCalibmax(itmax_calib);

  // define and initialize Rguess[]
  // (expect strong growth rate in first interval)

  var Rguess=[]; 
  for(var indexcalib=indexcalibmin; indexcalib<=indexcalibmax; indexcalib++){
    Rguess[indexcalib-indexcalibmin]=(indexcalib==0) ? 3 : 1; 
  }


  for(var ic=0; ic<2; ic++){ // One round (ic<1) sometimes not enough


    // ##############################################################
    // THE central estimation with global vars itmin/max_calib
    sol2_SSEfunc=fmin.nelderMead(SSEfunc, Rguess);
    // ##############################################################


    console.log("\n\n\n");
    for(var j=0; j<Rguess.length; j++){
      console.log("iter ",ic+1," j=",j,
		  " Rtime[j+indexcalibmin]=",Rtime[j+indexcalibmin],
		  " Rguess[j]=",Rguess[j]);
    }

  }


  for(var j=0; j<Rguess.length; j++){
    Rtime[j+indexcalibmin]=sol2_SSEfunc.x[j];
  }



  if(true){
    console.log("\nafter estimateR(): country=",country,
	//	" dataGit_imax=",dataGit_imax,
		"\n itmin_calib=",itmin_calib," itmax_calib=",itmax_calib,
                " indexcalibmin=", indexcalibmin,
	        "\n  estimated R in calibr interval sol2_SSEfunc.x=",
		sol2_SSEfunc.x,
                "\n  Rguess=", Rguess,
	        "\n  estimated R values Rtime=", Rtime,
		"");
  }
}



//=======================================================
//!Inductive statistics of the LSE estimator Rtime
// Cov(Rtime)=2 V(epsilon) H^{-1}, H=Hessian of SSEfunc(Rtime)
//=======================================================

function estimateErrorCovar(){

  var indexcalibmin=getIndexCalib(itmin_calib);
  var indexcalibmax=getIndexCalibmax(itmax_calib);
  //console.log("indexcalibmax=",indexcalibmax);

  var H=[]; // Hessian of actively estimated R elements
  for(var j=0; j<indexcalibmax+1-indexcalibmin; j++){H[j]=[];}

  var dR=0.001;



  var Rp=[]; for(var j=0; j<Rtime.length; j++){Rp[j]=Rtime[j];}
  var Rm=[]; for(var j=0; j<Rtime.length; j++){Rm[j]=Rtime[j];}
  var Rpp=[]; for(var j=0; j<Rtime.length; j++){Rpp[j]=Rtime[j];}
  var Rpm=[]; for(var j=0; j<Rtime.length; j++){Rpm[j]=Rtime[j];}
  var Rmp=[]; for(var j=0; j<Rtime.length; j++){Rmp[j]=Rtime[j];}
  var Rmm=[]; for(var j=0; j<Rtime.length; j++){Rmm[j]=Rtime[j];}

  // !!! select calibration interval

  // diagonal

  //for(var j=0; j<Rtime.length; j++){
  for(var j=indexcalibmin; j<=indexcalibmax; j++){ //!!!
    Rp[j]+=dR;
    Rm[j]-=dR;
    H[j-indexcalibmin][j-indexcalibmin]
      =(SSEfunc(Rp)-2*SSEfunc(Rtime)+SSEfunc(Rm))/(dR*dR);
    if(false){console.log("\n j=",j," Rtime=",Rtime,"\n Rp=",Rp,"\n Rm=",Rm,
			 "\n SSEfunc(Rp)=   ",SSEfunc(Rp),
			 "\n SSEfunc(Rtime)=",SSEfunc(Rtime),
			 "\n SSEfunc(Rm)=   ",SSEfunc(Rm),
			 "");}
    // revert for further use

    Rp[j]=Rtime[j];
    Rm[j]=Rtime[j];
  }

  // upper-diagonal

  //for(var j=0; j<Rtime.length; j++){
   // for(var k=j; k<Rtime.length; k++){
  for(var j=indexcalibmin; j<=indexcalibmax; j++){
    for(var k=j; k<=indexcalibmax; k++){
      Rpp[j]+=dR; Rpp[k]+=dR; 
      Rpm[j]+=dR; Rpm[k]-=dR; 
      Rmp[j]-=dR; Rmp[k]+=dR; 
      Rmm[j]-=dR; Rmm[k]-=dR; 
      H[j-indexcalibmin][k-indexcalibmin]
	=(SSEfunc(Rpp)-SSEfunc(Rpm)-SSEfunc(Rmp)+SSEfunc(Rpp))/(4*dR*dR);
      Rpp[j]=Rtime[j]; Rpp[k]=Rtime[k]; 
      Rpm[j]=Rtime[j]; Rpm[k]=Rtime[k]; 
      Rmp[j]=Rtime[j]; Rmp[k]=Rtime[k]; 
      Rmm[j]=Rtime[j]; Rmm[k]=Rtime[k]; 
    }
  }

  // lower-diagonal

  //for(var j=1; j<Rtime.length; j++){
  for(var j=0; j<H.length; j++){
    for(var k=0; k<j; k++){
      H[j][k]=H[k][j];
    }
  }

  // inverse Hessian

  var Hinv=math.inv(H);

  // variance of random term epsilon assuming epsilon \sim i.i.d.

  //var vareps=SSEfunc(Rtime)/(dataGit_imax-Rtime.length);
  var vareps=SSEfunc(Rtime)/(itmax_calib-itmin_calib-H.length); //!!!


  // one-sigma estimation errors of parameters Rtime[j] (every 2 weeks a new)

  var Rtime_sigma=[];
  //for(var j=0; j<Rtime.length; j++){
  for(var j=0; j<indexcalibmax+1-indexcalibmin; j++){//!!!
    Rtime_sigma[j]=Math.sqrt(2*vareps*Hinv[j][j]);
  }

  // global one-sigma estimation errors sigmaR_hist of daily time series of R
  // always for it=0...itmax

  for(var i=0; i<itmax; i++){//
    var incalib=((i>=itmin_calib)&&(i<itmax_calib));
    var index=Math.min(getIndexCalib(i)-getIndexCalib(itmin_calib),
		       Rtime_sigma.length-1);
    sigmaR_hist[i]=(incalib) ? Rtime_sigma[index] : 0;
  }

  if(false){ //!!
    console.log("Inductive statistics: Rtime.length=",Rtime.length,
		" SSE=", SSEfunc(Rtime));
    //console.log("\n gradient grad(SSE)=",grad,"\n");

    for (var j=0; j<Rtime.length; j++){
      console.log(" row of Hessian=",j," H[j]=",H[j]);
    }
    console.log("\n");
    for (var j=0; j<Rtime.length; j++){
      console.log(" row of inverse Hessian=",j," Hinv[j]=",Hinv[j]);
    }
    console.log("\nEstimates with One-sigma estimation errors:");
    for (var j=0; j<Rtime.length; j++){
      console.log("j=",j," Rtime[j]=",Rtime[j].toFixed(2)," +/- ",
		  Rtime_sigma[j].toFixed(2));
    }

  }
} // estimateErrorCovar()


 
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

function myStartStopFunction(){ //!! hier bloederweise Daten noch nicht da!!
  console.log("in myStartStopFunction");
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
  console.log("\nin selectDataCountry()");



  country=document.getElementById("countries").value;
  countryGer=countryGerList[country];
  n0=parseInt(n0List[country]);
  fracDieInit=parseFloat(fracDieInitList[country]);
  tauRecover=parseFloat(tauRecoverList[country]);
  tauDie=parseFloat(tauDieList[country]);
  taumax=Math.max(tauDie,tauRecover)+tauAvg+1;
  console.log("country=",country);
  console.log("selectDataCountry: country=",country,
	      " Rtime.length=",Rtime.length); 
  setSlider(slider_R0,  slider_R0Text,  Rtime[0].toFixed(2),"");

  document.getElementById("title").innerHTML=
    "Simulation der Covid-19 Pandemie "+ countryGer;

  initializeData(country);
  myRestartFunction();
} // selectDataCountry


function myRestartFunction(){ 
  console.log("in myRestartFunction");
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  fracDie=fracDieInit*pTest/pTestInit;
  //console.log("restart: fracDie=",fracDie);
  startup();
  corona.init(); // because startup redefines CoronaSim() and data there here

  clearInterval(myRun);
  it=0; //!!! only instance apart from init where global it is reset to zero 

  myRun=setInterval(simulationRun, 1000/fps);

   // activate thread if stopped

  if(isStopped){
    isStopped=false;
    document.getElementById("startStop").src="figs/buttonStop3_small.png";
    //myRun=setInterval(simulationRun, 1000/fps);
  }
}

function myCalibrateFunction(){ 
  RsliderUsed=false;
  otherSliderUsed=false;
  calibrate();
  myRestartFunction();
}



// selectDataCountry selects default sliders for the active country
// => can use it directly as the reset function

function myResetFunction(){ 
  console.log("in myResetFunction");
  RsliderUsed=false;
  otherSliderUsed=false;

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
  if(false&&useLiveData&&(it==0)){
    console.log("Test:");
    for (var t=-5; t<=2; t++){
      console.log("t=",t," Rfun_time(t)=", Rfun_time(t));
    }
    //corona.init(); // !! now inside fetch promise!

  }
  doSimulationStep(); 
  //console.log("RsliderUsed=",RsliderUsed);
  if(!RsliderUsed){
    setSlider(slider_R0, slider_R0Text, Rfun_time(it).toFixed(2),"");
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

  //!!! it->(it+1) because otherwise not consistent with "calculate SSE"
  var R_actual=(RsliderUsed&&(it+1>=7)) ? R0 : Rfun_time(it+1);
  R_hist[it]=R_actual;
  var logging=false;
  corona.updateOneDay(R_actual,logging);
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
  this.itcount=0;
}



CoronaSim.prototype.init=function(){

  // start warmup at a very early phase
  // !! start with n0*this.xtot>=1, otherwise infection dead
  // feature, not bug


  this.xtot=1.01/n0; 
  this.xtotohne=1.01/n0; 
  //console.log("init: n0=",n0," 0.99/n0=",0.99/n0," this.xtot=",this.xtot);
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
    //console.log("init: this.x[tau]=",this.x[tau]);
  }

  // data-driven warmup

  for(t=-20; t<=0; t++){
    var Rt=Rfun_time(t);
    this.updateOneDay(Rt,false); //!!
    //this.updateOneDay(Rt,true); // logging=true
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

  this.itcount=0;

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

CoronaSim.prototype.updateOneDay=function(R,logging){ 


  if(logging){
    console.log("Corona.updateOneDay: it=",it," R=",R,
		" this.xtot=",this.xtot.toPrecision(3),
		" this.xtotohne=",this.xtotohne.toPrecision(3),
		" this.xt=",this.xt.toPrecision(3),
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
  if(n0*this.xtot>=1){ // !! infection finally dead if xtot<1
   for(var tau=tauRstart; tau<=tauRend; tau++){
    this.x[0]+=R*f_R*this.x[tau]
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

  this.xtotohne+= this.x[0];
  for(var tau=0; tau<taumax; tau++){
    this.xtot     += this.x[tau];
  }

  this.itcount++;

  // control output

  if(logging){
    console.log("end CoronaSim.updateOneDay: this.itcount=",this.itcount,
		" R=",R.toFixed(2),
		" nxt=",Math.round(n0*this.xt),
	//	" nxtot=",(n0*this.xtot).toPrecision(6),
	//	" nxtotohne=",(n0*this.xtotohne).toPrecision(6),
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

  this.wLine=[1,2,1,2,2,2]; //line width [pix]
  this.isActive=[];   // which line is drawn
  this.setDisplayType(displayType);

  // init text properties (size of canvas may not definitely known hee!!)

  this.sizemin=Math.min(canvas.width,1.25*canvas.height);
  //this.textsize=Math.min(0.030*canvas.width,0.045*canvas.height);
  this.textsize=(this.sizemin>600) ? 0.02*this.sizemin : 0.03*this.sizemin;
  ctx.font = this.textsize+"px Arial";
  console.log("DrawSim Cstr: this.textsize=",this.textsize," ctx.font=",ctx.font);
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

  var itmaxCrit=105;
  var itmaxCrit2=210;
  var timeTextW=[];
  var timeText=[];
  var days=[];
  var timeRel=[]; // days relative to itmax
  var options = {month: "short", day: "2-digit"};
  //var year=startDay.getFullYear(); // no need; add year for whole January
  var phi=40 * Math.PI/180.; // to rotate date display anticlockw. by phi
  var cphi=Math.cos(phi);
  var sphi=Math.sin(phi);

  for(var iw=0; iw<Math.floor(itmax/7)+1; iw++){
    var date=new Date(startDay.getTime()); // copy constructor
    date.setDate(date.getDate() + iw*7); // set iw*7 days ahead
    timeTextW[iw]=date.toLocaleDateString("en-us",options);
    //timeTextW[iw]=date.toLocaleDateString("de",options);

    if(date.getMonth()==0){timeTextW[iw]+=(", "+date.getFullYear());}

    //console.log("DrawSim.drawAxes: iw=",iw," timeTextW[iw]=",timeTextW[iw]);
  }

  var dweek=(itmax<itmaxCrit) ? 1 : (itmax<itmaxCrit2) ? 2 : 4;
  var iwinit=(itmax<itmaxCrit) ? 0 : 1;
  for(var itick=0; itick<Math.round(timeTextW.length/dweek); itick++){
    days[itick]=7*(iwinit+dweek*itick);
    timeText[itick]=timeTextW[iwinit+dweek*itick];
    timeRel[itick]=days[itick]/(itmax);
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



  // draw 3 px wide lines as coordinates

  ctx.fillStyle="rgb(0,0,0)";
  ctx.fillRect(this.xPix0, this.yPix0-1, this.wPix, 3);
  ctx.fillRect(this.xPix0-0, this.yPix0, 3, this.hPix);


  // draw grid

  ctx.strokeStyle="rgb(0,0,0)";

  for(var ix=0; days[ix]<=itmax; ix++){
    this.drawGridLine("vertical", timeRel[ix]);
  }

  for(var iy=1; iy<=ny; iy++){
    this.drawGridLine("horizontal",iy*dy/(ymax-ymin));
  }

  ctx.stroke();


  // draw times


  var dxShift=(phi<0.01) ? -1.1*this.textsize : -2.4*cphi*this.textsize;
  var dyShift=(1.5+2*sphi)*this.textsize;
  //for(var ix=0; ix<timeRel.length; ix++){//!!
  for(var ix=0; days[ix]<=itmax; ix++){
    var xpix=this.xPix0+timeRel[ix]*this.wPix+dxShift;
    var ypix=this.yPix0+dyShift;
    ctx.setTransform(cphi,-sphi,+sphi,cphi,xpix,ypix);
    ctx.fillText(timeText[ix],0,0);
  }
  ctx.setTransform(1,0,0,1,0,0);

  // draw name+values y1 axis

  var label_y=(displayType==="lin")
    ? countryGer+": Personenzahl (in Tausend)" : countryGer+": Personenzahl";

  var yPix=(displayType==="lin")
    ? this.yPix0+0.01*this.hPix : this.yPix0+0.15*this.hPix;
  ctx.setTransform(0,-1,1,0,
		   this.xPix0-3.0*this.textsize,yPix);
  ctx.fillText(label_y,0,0);
  ctx.setTransform(1,0,0,1,0,0)
  for(var iy=ymin; iy<=ny; iy++){
    var valueStr=(displayType==="lin")  ? iy*dy : "10^"+iy;
    ctx.fillText(valueStr,
		 this.xPix0-2.5*this.textsize,
		 this.yPix0+(iy*dy-ymin)/(ymax-ymin)*this.hPix+0.5*this.textsize);
  }

  
  // draw name+values y2 axis if displayType="lin"

  if((displayType==="lin")&&(this.isActiveLin[5])){

    var label_y2="Tote/bekannt Erkrankte [%]";
    ctx.fillStyle=this.colLine[5];
    ctx.setTransform(0,-1,1,0,
		   this.xPixMax+3.0*this.textsize,this.yPix0+0.2*this.hPix);
    ctx.fillText(label_y2,0,0);
    ctx.setTransform(1,0,0,1,0,0)
    for(var iy=ymin2; iy<=ny2; iy++){
      var valueStr= iy*dy2 
      ctx.fillText(valueStr,
		  this.xPixMax+0.8*this.textsize,
		  this.yPix0+(iy*dy2-ymin2)/(ymax2-ymin2)*this.hPix
		   +0.5*this.textsize);
    }
  }

  
  

  // draw key

  var yrelTop=(displayType==="lin") ? 0.96 : -4.5*(1.2*this.textsize/this.hPix);
  var xrelLeft=(displayType==="lin") ? 0.02 : 0.60;
  var dyrel=-1.2*this.textsize/this.hPix;
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

  // update  text properties 

  this.sizemin=Math.min(canvas.width,1.25*canvas.height);
  this.textsize=(this.sizemin>600) ? 0.02*this.sizemin : 0.03*this.sizemin;
  this.textsizeR=1.5*this.textsize;

  ctx.font = this.textsize+"px Arial";
  //console.log("DrawSim.updateOneDay: this.textsize=",this.textsize," ctx.font=",ctx.font);



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
    var i_dataGit=it+dataGit_idataStart;
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


  // drawing vertical separation lines; draw R estimates

  ctx.fillStyle="#888888";
  var x0=this.xPix0;
  var y0=this.yPix0+0.3*this.hPix;

  ctx.setTransform(0,-1,1,0,x0+1.0*this.textsizeR,y0);
  var str_R="R="+R_hist[0].toFixed(2)
      +( (RsliderUsed||otherSliderUsed)
	 ? "" : (" +/- "+sigmaR_hist[0].toFixed(2)));
  ctx.font = this.textsizeR+"px Arial";
  //console.log("updateOneDay: this.textsizeR=",this.textsizeR," ctx.font=",ctx.font);
  ctx.fillText(str_R,0,0);
  ctx.setTransform(1,0,0,1,0,0);

  for(var iw=1; iw<it/7; iw+=2){ // !!! iw=1,3,5,7...
    var itR=7*iw;
    x0=this.xPix[itR];
    ctx.fillRect(x0-1,this.yPix0,3,this.hPix);

    ctx.setTransform(0,-1,1,0,x0+1.0*this.textsizeR,y0);
    str_R="R="+R_hist[itR].toFixed(2)
      +( (RsliderUsed||otherSliderUsed||(itR>=dataGit_imax))
	 ? "" : (" +/- "+sigmaR_hist[itR].toFixed(2)));
    ctx.fillText(str_R,0,0);
    ctx.setTransform(1,0,0,1,0,0);
  }

  ctx.font = this.textsize+"px Arial"; // revert font size


  // plot data points

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


    var itg=i-dataGit_idataStart;

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
      ctx.arc(this.xPix[itg],dataPix,0.005*sizemin, 0, 2 * Math.PI);
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
