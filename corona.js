// TODO: split calibration interval (look at places with !!!)


// useLiveData=true: Obtain github data "live" via the fetch command
// Unfortunately, the fetch command is sometimes unstable
// and not working on my ipad

// useLiveData=false: obtained data server-side 
// via script updateCoronaInput.sh. Stable but need to upload once a day

//var useLiveData=true;  
var useLiveData=false;  

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

var dayStartMar=20; //!!!
var startDay=new Date(2020,02,dayStartMar); // months start @ zero, days @ 1
var present=new Date();   // time object for present 
var it=0;
var oneDay_ms=(1000 * 3600 * 24);
var itmaxinit=Math.round(
    (present.getTime() - startDay.getTime())/oneDay_ms); 
                // itmaxinit=days(present-startDay)
                // round because of daylight saving time complications
var itmax=itmaxinit; // can be >itmaxinit during interactive simulation

var itmin_calib; // !!! start calibr time interval w/resp to dayStartMar
                 //     = dataGit_idataStart+1
var itmax_calib; // !!! end calibr time interval =^ data_imax-1 
                 // should be split if there are more than approx 
                 // 20 weeks of data

// data related global variables
// fetch with https://pomber.github.io/covid19/timeseries.json
// or load as a variable server-side (if useLiveData=false)

var dataGit=[];
var data_dateBegin;

var data_idataStart; //!!! dataGit dataset index for dayStartMar
var data_imax;  // !!! with respect to dayStartMar=data.length-data_idataStart

var data2_idataStart; // same for data2 containing the corona-test data
var data2_imax;  

var data_date=[];
var data_cumCases=[];
var data_cumDeaths=[];
var data_cumRecovered=[];
var data_deathsCases=[];
var data2_cumTests=[]; // other source, therefore dataGit2
var data2_cumTestsCalc=[]; // calculated from posRate
var data2_cumCases=[]; // #cases/#tests in last available period
var data2_posRate=[]; // #cases/#tests in last available period

// derived data in data time order

var data_xtAct=[];
var data_dn=[];
var data_dx=[];
var data_dxt=[];
var data_dyt=[];
var data_dz=[];
var data_posRate=[];
var data_cfr=[];
var data_ifr=[];


// MT 2020-09
var dataGit2=[];

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


  // input data on number of tests always from server (-> cron-job!)
  // since original json file too big
  // because of annoying undefined time order in fetch, set at beginnng!

  dataGit2 = JSON.parse(dataGitLocalTests); // must be different name!!
  console.log("dataGit2=",dataGit2);
  console.log("dataGit2.England.data[100]=",dataGit2.England.data[100]);


  // other data can be brought life by fetch on modern browsers

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
        console.log("in fetch function: dataGit=",dataGit);
	console.log("end getGithubData(..) live alternative");
        initializeData(country); //!! MUST remain inside; extremely annoying
        corona.init(); //!! only then ensured that data loaded! it=1 as result
      });
  }

  // fallback: use also main data from server (-> cron-job!)

  else{
    if(useLiveData){
      useLiveData=false;
      console.log("You are using an old Browser that does not understand Javascript's fetch");
    }
    dataGit = JSON.parse(dataGitLocal); // known since html->data/github.json
    console.log("useLiveData=false, get data from server: dataGit=",dataGit);
    console.log("end getGithubData(..) non-live alternative");
    initializeData(country); //!! MUST repeat because of annoying time order
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
  var country2=(country==="United Kingdom") ? "England" : country;
  console.log("in initializeData(country): country=",country,
	      " country2=",country2);
  console.log(" Rtime.length=",Rtime.length);


  // MT 2020-09  // [] access for strings works ONLY with "" or string vars
  // . access ONLY for literals w/o string ""

  var data=dataGit[country];
  var dateInitStr=data[0]["date"];

  var data2=dataGit2[country2].data;
  var dateInitStr2=data2[0]["date"];

 // define time shifts start date - start date of the two data sources 

  data_dateBegin=new Date(insertLeadingZeroes(dateInitStr));
  data_idataStart=Math.round( // absolute index
    (startDay.getTime() - data_dateBegin.getTime() )/oneDay_ms);
  data_imax=data.length-data_idataStart; // relative index
  nxtStart=data[data_idataStart]["confirmed"];

  data2_dateBegin=new Date(insertLeadingZeroes(dateInitStr2));
  data2_idataStart=Math.round(
    (startDay.getTime() - data2_dateBegin.getTime() )/oneDay_ms);
  data2_imax=data2.length-data2_idataStart;


  // testing the overall structure

  console.log(
    "dateInitStr=",dateInitStr, "dateInitStr2=",dateInitStr2,
    "\n data_idataStart=",data_idataStart,
    "  data2_idataStart=",data2_idataStart,
    "\n data.length=",data.length," data2.length=",data2.length,
    "\n data[data_idataStart][\"date\"]=",data[data_idataStart]["date"],
    "\n data2[data2_idataStart][\"date\"]=",data2[data2_idataStart]["date"],
    "\n data_imax=",data_imax," data2_imax=",data2_imax,
    "\n nxtStart=",nxtStart,
    "\n"
  );



  // extract main data

  var itmaxData=data.length;
  for(var it=0; it<itmaxData; it++){
    data_date[it]=data[it]["date"];
    data_cumCases[it]=data[it]["confirmed"];
    data_cumDeaths[it]=data[it]["deaths"];
    data_cumRecovered[it]=data[it]["recovered"];
    data_deathsCases[it]=(data_cumCases[it]==0)
      ? 0 : data_cumDeaths[it]/data_cumCases[it];
    if(false){
	  console.log("it=",it," data_date=",data_date[it],
		      "\n data_cumCases=",data_cumCases[it],
		      " data_cumDeaths=",data_cumDeaths[it],
		      " data_cumRecovered=",data_cumRecovered[it]);
    }
  }


  // extract test data (MT 2020-09)

  var itmaxData2=data2.length;
  for(var it=0; it<itmaxData2; it++){
    data2_cumTests[it]=data2[it].total_tests;
    data2_cumCases[it]=data2[it].total_cases;
    data2_posRate[it]=data2[it].positive_rate;
    //console.log("it=",it," data2[it]=",data2[it]);
  }
		
  // extract cumTests
  // in some countries, only few days/nonr have new cumul data: 
  // interpolate them

  var firstTestsRecorded=false;
  var it_last=0; // it for last defined cumul #tests
  var directTestData=[]; // data given w/o inter/extrapolation

  for(var it=0; it<itmaxData2; it++){
    directTestData[it]= (!(typeof data2_cumTests[it] === "undefined"));
    if(directTestData[it]){
      var cumAct=data2_cumTests[it];
      var cumLast=data2_cumTests[it_last];

      if(firstTestsRecorded){ // already reference for past
	for(var i=it_last+1; i<it; i++){
	  data2_cumTests[i]=cumLast+(i-it_last)/(it-it_last)
	    *(cumAct-cumLast);
	}
      }

      else{ // assume 21 days of tests before first reporting
	var di=Math.min(it, 21); 
	for(var i=it-di; i<it; i++){
	  data2_cumTests[i]=(1+(i-it)/di)*cumAct;
	}
	for(var i=0; i<it-di; i++){
	  data2_cumTests[i]=0;
	}
      }
      it_last=it;
      firstTestsRecorded=true;
    }

    if((it==itmaxData2-1)&&(it_last>0)){ // extrapolate if any data is defined
      for(var i=it_last+1; i<itmaxData2; i++){
	data2_cumTests[i]=data2_cumTests[it_last] + (i-it_last)
	  * (data2_cumTests[it_last]-data2_cumTests[it_last-1]);
      }
    }

  }



  // extract posRate and calculate cum tests (some countries do not have them)

  it_last=0; // it for last defined posRate
  data2_cumTestsCalc[0]=0;

  for(var it=0; it<itmaxData2; it++){
    if( !(typeof data2_posRate[it] === "undefined")){ //posRate given

      var rateAct=data2_posRate[it];
      var cumCasesLast=data2_cumCases[it_last];
      var cumTestLast=(directTestData[it_last])
	? data2_cumTests[it_last] : data2_cumTestsCalc[it_last];
      
      // extrapolate  to beginning if cum. test data defined

      if(it_last==0){ 
	if(directTestData[it]){
	  rateAct=data2_cumCases[it]/data2_cumTests[it];
	}
	data2_posRate[0]=rateAct;
      }

      // interpolate between dates of defined posRate

      for(var i=it_last+1; i<=it; i++){
	data2_posRate[i]=rateAct;
	data2_cumTestsCalc[i]=(rateAct>0) 
	  ? cumTestLast+(data2_cumCases[i]-cumCasesLast)/rateAct
	  : 0;
      }

      it_last=it;
    }

    // extrapolate if last posRate data undefined

    if((it==itmaxData2-1)&&(it_last !=it)){
      var rateAct=data2_posRate[it_last];
      var cumTestLast=data2_cumTestsCalc[it_last];
      var cumCasesLast=data2_cumCases[it_last];

      for(var i=it_last+1; i<itmaxData2; i++){
	data2_posRate[i]=rateAct;
	data2_cumTestsCalc[i]=(rateAct>0) 
	  ? cumTestLast+(data2_cumCases[i]-cumCasesLast)/rateAct
	  : 0;
      }
    }
  }


  console.log("initializeData:");
  // generate the dat arrays (in data, not data2 time order) to be plotted
  // data_dx=estmation from data assuming 
  // (1) time interval tauTest where test is positive for infected people
  //     e.g. tauPos=7 from infection days 3-9 
  //     (start day here not relevant) 
  // (2) the probability that not tested people are infected factor gamma
  //     of that for tested people
  // (3) "Durchseuchung" <<1 (!!! change later if xyz/n0 implemented!
  // (4) tests have certain alpha and beta errors

  var di=data2_idataStart-data_idataStart; // translation data->data2 index
  var tauPos=7;
  var gamma=0.1;
  var alpha=0;
  var beta=0;
  for(var i=0; i<itmaxData; i++){
    data_dxt[i]=data_cumCases[i]-data_cumCases[i-1];
    data_dyt[i]=data_cumRecovered[i]-data_cumRecovered[i-1];
    data_dz[i]=data_cumDeaths[i]-data_cumDeaths[i-1];
    data_xtAct[i]=data_cumCases[i]-data_cumRecovered[i]-data_cumDeaths[i];
  }

  // need new loop because of forward ref at cfr, ifr

  for(var i=0; i<itmaxData; i++){
    data_posRate[i]=data2_posRate[i+di];
    //data_dn[i]=data2_cumTests[i+di]-data2_cumTests[i+di-1];
    data_dn[i]=data_dxt[i]/data_posRate[i];
    var dnTauPos=data2_cumTests[i+di]-data2_cumTests[i+di-tauPos];
    var pit=(data2_posRate[i+di]-beta)/(1-alpha-beta); // prob infected|tested
 
    // denom tauPos because not tested people have a period tauPos
    // to be tested positive 
    // (!!!if tauPos=7, also cancels out weekly pattern)

    data_dx[i]=(pit*dnTauPos + gamma*pit*(n0-dnTauPos))/tauPos;

    var dxTauPos=data_cumCases[i]-data_cumCases[i-tauPos];
    var dxtTauPos=data_cumCases[i]-data_cumCases[i-tauPos];
    var dztTauPos=data_cumDeaths[i]-data_cumDeaths[i-tauPos];

    // tauPos=7 days average (!!! also cancels out weekly pattern)
    data_cfr[i]=(data_cumDeaths[i+tauDie-tauTest]
		 -data_cumDeaths[i+tauDie-tauTest-tauPos])/dxtTauPos;
    data_ifr[i]=(data_cumDeaths[i+tauDie]
		 -data_cumDeaths[i+tauDie-tauPos])/(tauPos*data_dx[i]);
  }


  for(var i=0; i<itmaxData; i++){
    if(true){
    //if((i>itmaxData-30)&&(i<itmaxData)){
      console.log(
	insertLeadingZeroes(data[i]["date"]),": iData=",i,
	" data_xtAct=",Math.round(data_xtAct[i]),
	" data_dn=",Math.round(data_dn[i]),
	" data_dx=",Math.round(data_dx[i]),
	" data_dxt=",Math.round(data_dxt[i]),
	" data_dyt=",Math.round(data_dyt[i]),
	" data_dz=",Math.round(data_dz[i]),
	"\n             data_posRate=",data_posRate[i].toPrecision(3),
	" data_dz[i+tauDie-tauTest]=",data_dz[i+tauDie-tauTest],
	" data_dxt[i]=",data_dxt[i],
	" data_cfr=",data_cfr[i].toPrecision(3),
	" data_ifr=",data_ifr[i].toPrecision(3),
	" ");
    }
  }


  //for(var it=0; it<itmaxData2; it++){
  for(var it=itmaxData2-5; it<itmaxData2; it++){
    console.log(data2[it]["date"],": it=",it,
		" data2_cumCases=",Math.round(data2_cumCases[it]),
		" data_cumCases=",Math.round(data_cumCases[it+data_idataStart-data2_idataStart]),
		" data2_posRate=",data2_posRate[it].toPrecision(3),
		" data2_cumTests=",Math.round(data2_cumTests[it]),
		" data2_cumTestsCalc=", 
		Math.round(data2_cumTestsCalc[it]) );
  }



 

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
// t=tsim-date(2020-03-19) [days] from t to t+1
//##############################################################

function Rfun_time(t){
  var iPresent=data_idataStart+t;
  var iTest    =iPresent+Math.round(tauTest);
  var iTestPrev=iPresent+Math.round(tauTest-0.5*(tauRstart+tauRend));

  if(t<0){ //!!! direct estimate from data 
    var nxtNewnum  =1./2.*(data_cumCases[iTest+1]-data_cumCases[iTest-1]);
    var nxtNewdenom=1./2.*(data_cumCases[iTestPrev+1]
			  -data_cumCases[iTestPrev-1]);
    var R=1.02*nxtNewnum/nxtNewdenom;
    if(false){
      console.log("Rfun_time: t=",t," xtCum(iTest)=",data_cumCases[iTest],
		" xtCum(iTestPrev)=",data_cumCases[iTestPrev],
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
    //var iweek=Math.floor(t/7); //MT2020-08
    var index=Math.min(getIndexCalib(t),Rtime.length-1); //MT2020-08
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

  nxtStart=data_cumCases[data_idataStart];
  corona.init(); // scales up/down to nxtStart at the last warmup step

  // calculate SSE

  var sse=0;
  if(logging){
    var nxData=data_cumCases[data_idataStart+0];
    console.log("SSEfunc: i=0, n0*corona.xt=",n0*corona.xt,
		" nxData=",nxData);
  }

  for(var i=0; i<data_imax-1; i++){
    var it=i;

    //!!!! itmin/max_calib refers to start of time step
    // => itmin_calib>=0, itmax_calib<data_imax-1

    var inCalib=((it>=itmin_calib)&&(it<itmax_calib)); 
    var indexR=Math.min(getIndexCalib(it),Rtime.length-1);
    var indexCalib=Math.min(getIndexCalib(it)-getIndexCalib(itmin_calib),
			    R_arr.length-1); //!!!!
    var R_actual=(inCalib) ? R_arr[indexCalib] : Rtime[indexR];

    if(logging&&false){
      var nxData=data_cumCases[data_idataStart+it];
      var nxSim=n0*corona.xt;
      console.log("SSEfunc before update: it=",it,
		  " R_actual=",R_actual.toFixed(2),
		  " nxData=",nxData,
		  " nxSim=",Math.round(nxSim),
		  " nActiveTrueSim=",Math.round(n0*corona.xAct));
    }

    corona.updateOneDay(R_actual); it++;
    var nxData=data_cumCases[data_idataStart+it]; // i+1 after update
    var nxSim=n0*corona.xt;

    //if(logging&&(i<60)){ 
    if(false){ // 2020-09
      console.log("SSEfunc after update and it++: it=",it,
		  " R_actual (it-1->it)=",R_actual.toFixed(2),
		  " nxData=",nxData,
		  " nxSim=",Math.round(nxSim));
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

  //present=new Date();
  //var present=new Date(2020,02,23); //!!
  
  // initialisation of itmaxinit; 
  // round because of daylight saving time complications

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
// gives index of CONSOLIDATED calibrated Rtime[]
// =============================================================

function getIndexTimeFromCalib(ical){ // MT 2020-08
  return 14*ical; //!!! only here changes of time interv of one calibr point
}

function getIndexCalib(itime){
  return Math.floor(itime/getIndexTimeFromCalib(1));     // MT 2020-08
}


function getIndexCalibmax(itime){
  return getIndexCalib(itime-10); //!!! calib R for at least xx days
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
  itmax_calib=data_imax-1;  // (data_imax w/resp to dayStartMar!!)
                               // ! NaN variance if itmax_calib=data_imax
  // !!! calibrate part of Rtime[] defined by itmin_calib, itmax_calib

  estimateR(); // determines calibrated Rtime[] /!!! here Rtime.length set, transfer setting from estimateR->calibrate

  estimateErrorCovar(); // uses calibrated Rtime[]

//!!!! zweites Kalib-Intervall klappt noch nicht, obwohl calibr anscheinend OK

/*
  itmin_calib=61;               
  itmax_calib=data_imax;
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
// itmax_calib < data_imax-data_idataStart
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
      //console.log("iter ",ic+1," j=",j, // 2020-09
//		  " Rtime[j+indexcalibmin]=",Rtime[j+indexcalibmin],
// 		  " Rguess[j]=",Rguess[j]);
    }

  }


  for(var j=0; j<Rguess.length; j++){
    Rtime[j+indexcalibmin]=sol2_SSEfunc.x[j];
  }



  if(true){
    console.log("\nafter estimateR(): country=",country,
	//	" data_imax=",data_imax,
		"\n itmin_calib=",itmin_calib," itmax_calib=",itmax_calib,
                " indexcalibmin=", indexcalibmin,
	        "\n  estimated R in calibr interval sol2_SSEfunc.x=",
		sol2_SSEfunc.x,
                "\n  Rguess=", Rguess,
	        "\n  estimated R values Rtime=", Rtime,
		"");
  }

  if(true){
    SSEfunc(Rguess,null,true);
    //SSEfunc(Rguess);
  }
}



//=======================================================
//!Inductive statistics of the LSE estimator Rtime
// Cov(Rtime)=2 V(epsilon) H^{-1}, H=Hessian of SSEfunc(Rtime)
//=======================================================

function estimateErrorCovar(){

  console.log("in estimateErrorCovar(): itmax=",itmax);
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

  //var vareps=SSEfunc(Rtime)/(data_imax-Rtime.length);
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
    //console.log("i=",i," sigmaR_hist[i]=",sigmaR_hist[i]);
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
  drawsim.draw(it,displayType,corona.xAct,corona.xt,
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

  // suffer one undefined at data_cumCases 
  // (doSimulationStep increments it so itmaxinit-2 would be correct)
  // to get full sim curves (first plot then update 
  // to get the initial point it=0) 

  if(it==itmaxinit-1){ 
    clearInterval(myRun);myStartStopFunction();
  }
}

//#########################################
// only called at main run, not warmup
// !!! need to plot first
// because warmup already produced start values for it=0
// !!! 
//#########################################

function doSimulationStep(){ //!!!

  //!!! it->(it+1) because otherwise not consistent with "calculate SSE"
  var R_actual=(RsliderUsed) ? R0 : Rfun_time(it);
  R_hist[it]=R_actual;

  if(false){
    console.log(" doSimulationStep before corona.update: it=",it,
		"data_cumCases[data_idataStart+it]=",
		data_cumCases[data_idataStart+it],
		" n0*corona.xt=",(n0*corona.xt).toPrecision(6),
		" R_actual=",R_actual.toPrecision(3));
  }


  drawsim.draw(it, displayType, corona.xAct, corona.xt, // need R_hist
		       corona.y, corona.yt, corona.z, corona.xyz);
 
  var logging=false;
  corona.updateOneDay(R_actual,logging);
  it++;

  if(true){
    console.log(" doSimulationStep after corona.update: it=",it,
		"data_cumCases[data_idataStart+it]=",
		((it<itmaxinit-1) ? data_cumCases[data_idataStart+it]:"na"),
		" n0*corona.xt=",(n0*corona.xt).toPrecision(6),
		" R_actual (it-1->it)=",R_actual.toPrecision(3));
  }


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
  // !! start with n0*this.xAct>=1, otherwise infection dead
  // feature, not bug

  // xAct: sum of "actually infected" (neither recovered nor dead)
  // xyz: cumulative sum of infected (incl recovered, dead)

  this.xAct=1.01/n0; 
  this.xyz=1.01/n0; 
  //console.log("init: n0=",n0," 0.99/n0=",0.99/n0," this.xAct=",this.xAct);
  this.xt=0; // fraction of positively tested persons/n0 as f(t)
  this.y=0;  // fraction recovered real as a function of time
  this.yt=0; // fraction recovered data
  this.z=0;  // fraction dead (real=data)
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
    this.x[tau]=this.xAct*Math.exp(-r0*tau)/denom;
    this.xohne[tau]=this.x[tau];
    //console.log("init: this.x[tau]=",this.x[tau]);
  }

  // data-driven warmup

  for(t=-20; t<0; t++){
    var Rt=Rfun_time(t);
    this.updateOneDay(Rt,false); //!!
    //this.updateOneDay(Rt,true); // logging=true
  }



  
  // scale down to match init value of n0*this.xt 
  // exactly to data nxtStart
 
  var scaleDownFact=nxtStart/(n0*this.xt);
  this.xAct     *= scaleDownFact;
  this.xyz *= scaleDownFact;
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

  //console.log("CoronaSim.init after warmup: n0*this.xt=",n0*this.xt);

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
		" this.xAct=",this.xAct.toPrecision(3),
		" this.xyz=",this.xyz.toPrecision(3),
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
  if(n0*this.xAct>=1){ // !! infection finally dead if xAct<1
   for(var tau=tauRstart; tau<=tauRend; tau++){
    this.x[0]+=R*f_R*this.x[tau]
      *(1-this.xyz);
    if(false){
      console.log("Corona.updateOneDay: it=",it," tau=",tau.toPrecision(3),
		" R*f_R=",R*f_R.toPrecision(3),
                " this.x[tau]*(1-(x+y+z)=",
		this.x[tau]*(1-(this.xAct+this.y+this.z)).toPrecision(3),
		" this.x[0]=",this.x[0].toPrecision(3)
		 );
    }
   }
  }
  this.xohne[0]=this.x[0];


  // test people 

  this.pTestDay[it]=pTest; // needed to determine fraction of 
                      // recovered among the tested later on
  //!!! sometimes this.pTestDay undefined!!!

  tauAvg=5; //!!
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
  // xAct: sum of "actually infected" (neither recoverd nor dead)
  // xyz: cumulative sum of infected (incl recovered, dead)

  this.xAct=0;  

  this.xyz+= this.x[0];
  for(var tau=0; tau<taumax; tau++){
    this.xAct     += this.x[tau];
  }

  this.itcount++;

  // control output

  if(logging){
    console.log("end CoronaSim.updateOneDay: this.itcount=",this.itcount,
		" R=",R.toFixed(2),
		" nxt=",Math.round(n0*this.xt),
	//	" nxAct=",(n0*this.xAct).toPrecision(6),
	//	" nxyz=",(n0*this.xyz).toPrecision(6),
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
  this.ySimLin=[];
  this.ySimLog=[];


  // Reference quantities; always the same for 
  // displayType in {"lin", "log", "act"}
  // three categoriess: cumulative, actual/rates per day, relative

  //  [0] => xAct=actual infected real sim
  //  [1] => xt=cumulated infected data (=cases, pos tested) as simulated
  //  [2] => y=cumulated recovered real sim
  //  [3] => yt=cumulated recovered data as simulated
  //  [4] => z=cumulated dead (real=data) as simulated
  //  [5] => z/xt=cumulated cfr (cfr as ratio of cumulated quantities!)

  // NEW sim (for actual/rates per day, relative)
  //!!! not yet implemented, new ySim* files

  //  [6] => dxSim=daily number new infected real sim
  //  [7] => dzSim=daily number new dead sim
  //  [8] => ifrSim=infection fatality rate [dzSim(t+Td)/dxSim(t)]_avg
  //  [9] => xyz/n0="Durchseuchungsrate" sim
             // (xyz=cumulated infected real sim (incl recovered, dead)

  // NEW data (for actual/rates per day, relative)

  // [10] => xtAct=xt-yt-z=actual infected data
  // [11] => dn=daily number of tests (positive or negative)
  // [12] => dxData=daily number new infected real from data estimation
  // [13] => dxt=daily number positive tests
  // [14] => dyt=daily number of positive-tested recoveries
  // [15] => dz=daily or daily number of deaths
  // [16] => posRate (e.g. data2_posRate)=dxt/dn
  // [17] => cfr=case fatality rate=dz(t+Td-Tt)/dxt(t)
  // [18] => ifrData=infection fatality rate dz(t+Td)/dxData(t)


  this.ySimLin[0]=[];  // xAct=infected real actual
  this.ySimLin[1]=[];  
  this.ySimLin[2]=[];  
  this.ySimLin[3]=[]; 
  this.ySimLin[4]=[]; 
  this.ySimLin[5]=[]; 
  this.ySimLin[6]=[]; 

  this.ySimLog[0]=[];  
  this.ySimLog[1]=[];  
  this.ySimLog[2]=[]; 
  this.ySimLog[3]=[]; 
  this.ySimLog[4]=[]; 
  this.ySimLog[5]=[]; 
  this.ySimLog[6]=[]; 


  this.colLine=[];
  this.colLine[0]="rgb(255,90,0)";    // xAct=infected real actual
  this.colLine[1]="rgb(233,0,0)";     // xt=infected cases (=pos tested) cum
  this.colLine[2]="rgb(60,255,40)";   // y=recovered real cum
  this.colLine[3]="rgb(0,150,40)";    // yt=recovered cases cum
  this.colLine[4]="rgb(0,0,0)";       // z=dead real cum = dead cases cum
  this.colLine[5]="rgb(0,0,150)";     // z/xt (ratio of cumulated quantities!)

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


// displayType in {"lin", "log", "act"}

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


  // calculate weekly date string array for every week after startDay

  for(var iw=0; iw<Math.floor(itmax/7)+1; iw++){
    var date=new Date(startDay.getTime()); // copy constructor
    date.setDate(date.getDate() + iw*7); // set iw*7 days ahead
    timeTextW[iw]=date.toLocaleDateString("en-us",options);
    //timeTextW[iw]=date.toLocaleDateString("de",options);

    if(date.getMonth()==0){timeTextW[iw]+=(", "+date.getFullYear());}
  }

 
  // calculate actually used date string array 
  // with variable tick intervals dweek

  var dweek=(itmax<itmaxCrit) ? 1 : (itmax<itmaxCrit2) ? 2 : 4;
  var iwinit=0; // MT 2020-08
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


  // draw date strings on x axis

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


// R values drawn in DrawSim.update

}




// displayType in {"lin", "log", "act"}

//######################################################################
DrawSim.prototype.draw=function(it,displayType,xAct,xt,y,yt,z,xyz){
//######################################################################

  // update  text properties 

  this.sizemin=Math.min(canvas.width,1.25*canvas.height);
  this.textsize=(this.sizemin>600) ? 0.02*this.sizemin : 0.03*this.sizemin;
  this.textsizeR=1.5*this.textsize;

  ctx.font = this.textsize+"px Arial";
  //console.log("DrawSim.draw: this.textsize=",this.textsize," ctx.font=",ctx.font);



  // transfer new data

  //  [0] => xAct=actual infected real sim
  //  [1] => xt=cumulated infected data (=cases, pos tested) as simulated
  //  [2] => y=cumulated recovered real sim
  //  [3] => yt=cumulated recovered data as simulated
  //  [4] => z=cumulated dead (real=data) as simulated
  //  [5] => z/xt=cumulated cfr (cfr as ratio of cumulated quantities!)
  // ... (see "Reference quantities")


  this.ySimLin[0][it]=n0*xAct/this.unitPers;
  this.ySimLin[1][it]=n0*xt/this.unitPers;
  this.ySimLin[2][it]=n0*y/this.unitPers;
  this.ySimLin[3][it]=n0*yt/this.unitPers;
  this.ySimLin[4][it]=n0*z/this.unitPers;
  this.ySimLin[5][it]=(xt>1e-12) ? 100*z/xt : 0; 
  this.ySimLin[6][it]=n0*xyz/this.unitPers;


  this.ySimLog[0][it]=log10(n0*xAct); 
  this.ySimLog[1][it]=log10(n0*xt);
  this.ySimLog[2][it]=log10(n0*y);
  this.ySimLog[3][it]=log10(n0*yt);
  this.ySimLog[4][it]=log10(n0*z);
  this.ySimLog[5][it]=(xt>1e-6) ? log10(100*z/xt) : 0;

  if(false){console.log("DrawSim.draw: it=",it,
			" this.ySimLin[1][it]=",this.ySimLin[1][it],
			//" this.ySimLog[0][it]=",this.ySimLog[0][it],
			"");}

//##########################################################
// test possible rescaling due to new data on x and y axis 
// and redraw if erase=true
//##########################################################

  var erase=false;

  // possible rescaling in x

  if(it>itmax){
    itmax=it;
    erase=true;
  }

  for(var i=0; i<=itmax; i++){ // (re)define x pixel coords
    this.xPix[i]=this.xPix0+i*(this.xPixMax-this.xPix0)/(itmax);
  }

  // possible rescaling in y due to simulation development
  // (need also to update ymax of display actually not used)

  if((displayType==="lin")||(displayType==="log")){

    for(var q=0; q<5; q++){ 
      if((this.isActiveLin[q])&&(this.ySimLin[q][it]>this.ymaxLin)){
        this.ymaxLin=this.ySimLin[q][it];
        if(displayType==="lin"){erase=true;}
      }

      if((this.isActiveLog[q])&&(this.ySimLog[q][it]>this.ymaxLog)){
        this.ymaxLog=this.ySimLog[q][it];
        if (displayType==="log"){erase=true;}
      }
    }

    if(this.ySimLin[5][it]>this.ymaxPerc){ // ySimLin[5] =z/yt in percent
      this.ymaxPerc=this.ySimLin[5][it];
      erase=true;
    }
  }


  // possible rescaling in y due to new data (never needed for log)

  if(displayType==="lin"){
    var i_dataGit=it+data_idataStart;
    if(i_dataGit<data_cumCases.length){

      if(data_cumCases[i_dataGit]>this.unitPers*this.ymaxLin){
	this.ymaxLin=data_cumCases[i_dataGit]/this.unitPers;
	erase=true;
      }

      if(100*data_deathsCases[i_dataGit]>this.ymaxPerc){
	this.ymaxPerc=100*data_deathsCases[i_dataGit];
	erase=true;
      }
    }
  }

  if(displayType==="act"){
  }


  if(erase){
    this.clear();
    this.drawAxes(displayType);
  }

  //#######################################
  // actual drawing of sim results
  //#######################################

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
  ctx.fillText(str_R,0,0);
  ctx.setTransform(1,0,0,1,0,0);

  for(var ical=0; ical<=getIndexCalib(it); ical++){ // !!! 
    var itR=getIndexTimeFromCalib(ical);
    x0=this.xPix[itR];
    ctx.fillRect(x0-1,this.yPix0,3,this.hPix);

    ctx.setTransform(0,-1,1,0,x0+1.0*this.textsizeR,y0);
    //console.log("drawSim.draw: it=",it," itR=",itR);
    str_R="R="+R_hist[itR].toFixed(2)
      +( (RsliderUsed||otherSliderUsed||(itR>=data_imax))
     // +((true) // if sigma_R undefiuned
	? "" : (" +/- "+sigmaR_hist[itR].toFixed(2)));
    ctx.fillText(str_R,0,0);
    ctx.setTransform(1,0,0,1,0,0);
  }

  ctx.font = this.textsize+"px Arial"; // revert font size

  //#######################################
  // actual plotting of data points
  //#######################################

  if((displayType==="lin")||(displayType==="log")){

    // [0]=x=xSimCum, not at plotPoints
    // [2]=y=ySimCum, not at plotPoints

    if(this.isActive[1]){ // xt
      this.plotPoints(it, 1, data_cumCases, displayType);
    }

    if(this.isActive[3]){ // yt
      this.plotPoints(it, 3, data_cumRecovered, displayType);
    }

    if(this.isActive[4]){ // z
      this.plotPoints(it, 4, data_cumDeaths, displayType); 
    }

    if(this.isActive[5]){ // z/xt
      this.plotPoints(it, 5, data_deathsCases, displayType); 
    }
  }


  if(displayType==="act"){

  }

}


//######################################################################
DrawSim.prototype.drawCurve=function(it,q,displayType){
//######################################################################
  //console.log("in DrawSim.drawCurve: q=",q," displayType=",displayType);
  var simdata=(displayType==="log") ? this.ySimLog[q] : this.ySimLin[q];
  var w=this.wLine[q]/2;
  var yminDraw=(displayType==="log") ? this.yminLog : this.yminLin;
  var ymaxDraw=(displayType==="log") ? this.ymaxLog : this.ymaxLin;
  if(q==5){yminDraw=this.yminPerc; ymaxDraw=this.ymaxPerc};

  ctx.fillStyle=this.colLine[q];

  for (var itg=0; itg<=it; itg++){
    if((itg>0)&&(simdata[itg]>=yminDraw) &&(simdata[itg]<=ymaxDraw)){
      var yrel=(simdata[itg]-yminDraw)/(ymaxDraw-yminDraw);
      var yrelOld=(simdata[itg-1]-yminDraw)/(ymaxDraw-yminDraw);
      var simPix=this.yPix0+yrel*(this.yPixMax-this.yPix0);
      var simPixOld=this.yPix0+yrelOld*(this.yPixMax-this.yPix0);
     // if(q==0){console.log("q=",q," yrel=",yrel);}
      ctx.beginPath(); //!! crucial; otherwise latest col used for ALL
      var phi=Math.atan((simPix-simPixOld)/
			(this.xPix[itg]-this.xPix[itg-1]));
      var cphi=Math.cos(phi);
      var sphi=Math.sin(phi);
      ctx.moveTo(this.xPix[itg-1]-w*sphi, simPixOld+w*cphi);
      ctx.lineTo(this.xPix[itg-1]+w*sphi, simPixOld-w*cphi);
      ctx.lineTo(this.xPix[itg]+w*sphi,   simPix-w*cphi);
      ctx.lineTo(this.xPix[itg]-w*sphi,   simPix+w*cphi);
      ctx.closePath();  // !! crucial, otherwise latest col used for ALL
      ctx.fill();
    }
  }

  // debug

  if(false){
  //if( (q==1)&&(it<=20)){
    var idata=data_idataStart+it;
    console.log("DrawSim.drawCurve: it=",it," quantity q=",q,
		" simdata[it]=",simdata[it]);
  }


}


// plot the data; q only for determining the corresponding color
// uses the full data array and subtracts data_idataStart from index
// => needs the data, not data2 format 
// => add data2_idataStart-data_idataStart to index of data2 quantities

//######################################################################
DrawSim.prototype.plotPoints=function(it,q,data_arr,displayType){
//######################################################################

  var yminDraw=(displayType==="log") ? this.yminLog : this.yminLin;
  var ymaxDraw=(displayType==="log") ? this.ymaxLog : this.ymaxLin;
  if(q==5){yminDraw=this.yminPerc; ymaxDraw=this.ymaxPerc};

  ctx.fillStyle=this.colLine[q];

  for (var i=0; i<data_arr.length; i++){


    var itg=i-data_idataStart;

    // log 10 and, if lin, in 1000 =>*0.001, if perc *100

    var y=(displayType==="log") ? log10(data_arr[i]) : 0.001*data_arr[i];
    if(q==5){y=100*data_arr[i];}

    // actual plotting


    if((itg>=0)&&(itg<=it)){
      var yrel=(y-yminDraw)/(ymaxDraw-yminDraw);
      var dataPix=this.yPix0+yrel*(this.yPixMax-this.yPix0);
      ctx.beginPath(); //!! crucial; otherwise latest col used for ALL
      ctx.arc(this.xPix[itg],dataPix,0.005*sizemin, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  // debug

  if(false){
  //if( (q==1)&&(it<=20)){
    var idata=data_idataStart+it;
    console.log("DrawSim.plotPoints: it=",it," idata=",idata,
		" quantity q=",q," data_arr[idata]=",data_arr[idata]);
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
