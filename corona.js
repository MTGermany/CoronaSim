

var showVacc=false;  // false: only display as of dec2020
                    // true: second display option vacc+measures


// useLiveData=true: Obtain github data "live" via the fetch command
// Unfortunately, the fetch command is sometimes unstable
// and not working on my ipad

// useLiveData=false: obtained data server-side 
// via script updateCoronaInput.sh. Stable but need to upload once a day

var useLiveDataInit=false;  //!! will be changed by upload script, 2 versions
var useLiveData=useLiveDataInit;

var loggingDebug=false; //!! global var for testing functions inside calibr

// debugApple=true for debugging of devices w/o console (ipad) redirect
// it to a html element using console-log-html.js
// copy corona.js to coronaDebugApple.js and 
// use indexDebugApple.html for these purposes 
// (contains addtl <div id="logDiv">)

var debugApple=false;

var activateAnnotations=true; // if true, annotations can be drawn with mouse


var country="Germany";
var country2="Germany"; // needed for test data if(useLandkreise)
var countryGer="Deutschland";
var useLandkreise=false; // MT 2020-12-07: =true for new RKI Landkreis data

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


// graphical window at start, 

// new window: 
// (1) define qselect[window] by selecting from drawsim.dataG[], 
// (2) update initialisator of drawsim.yminType[], *ymax*: "this.yminType=["
// (3) check various "windowG==", "windowG!=", "windowG<" etc conditions

// initial window; consolidate with first option value of html!!
// 0=cum,1=log,2=casesReal,3=tests,4=rates,5=casesDaily,6=incidence 
var windowG=6; 


var myRun;
var isStopped=true



// global time simulation vars (see also "data related global variables")
// dayinit

var dayStartMarInit=8; //!! can also exceed 31, date initializer takes it
var dayStartMar=dayStartMarInit; 

var dayStartYear=dayStartMar+59;
var startDay=new Date(2020,02,dayStartMar); // months start @ zero, days @ 1
var present=new Date();   // time object for present 
var it=0;
var oneDay_ms=(1000 * 3600 * 24);
var itPresentInit=Math.floor(
    (present.getTime() - startDay.getTime())/oneDay_ms); 
                // itPresent=days(present-startDay)
                // floor because startDay time is 00:00 of given day

var itPresent=itPresentInit;


// data related global variables
// fetch with https://pomber.github.io/covid19/timeseries.json
// or load as a variable server-side (if useLiveData=false)

var dataGit=[];
var dataGit2=[];
var dataRKI=[];

// for validation

var dataGit_orig=[];
var dataGit2_orig=[];
var dataRKI_orig=[];
var simValid=[]; // store validation sim data outside DrawSim (created anew)
for (var iq=0; iq<=40; iq++){simValid[iq]=[];} //!!! def simValid
var nDaysValid=0;
var usedValidation=false; // only cp data to original data in first validation
var saveGroundData=true; // true if nDaysValid changed from =0 to >0


var data_dateBegin;
var data_idataStart; //!! dataGit dataset index for dayStartMar
var data_itmax;  // !! with respect to dayStartMar=data.length-data_idataStart

var data2_idataStart; // same for data2 containing the corona-test data
var data2_itmax;  

var data_date=[];
var data_cumCases=[];
var data_cumDeaths=[];
var data_cumRecovered=[];
var data_cumCfr=[];
var data_cumVacc=[];     // direct, sometimes n.a.
var data_rVacc=[];     // fraction of pop per day
var data2_posRate=[];      // #cases/#tests, last avail. period (in dataGit2)
var data2_cumTests=[];     // direct, sometimes n.a.


// derived data in data time order

var data_cumTestsCalc=[]; // better calculate  from posRate
var data_dn=[];
var data_dxt=[];
var data_dyt=[];
var data_dz=[];
var data_posRate=[];
var data_cfr=[];
var data_pTestModel=[]; // sim. "Hellfeld" P(tested|infected) if f(#tests)=true

var data_dxIncidence=[]; // weekly incidence per 100 000 from data
var data_dzIncidence=[]; // weekly incidence per 100 000 from data

var pTest_weeklyPattern=[]; // constant extrapolation with weekly pattern
var dn_weeklyPattern=[];  // constant extrapolation of #tests "



// global geographic simulation vars 

var n0=80.e6;  // #persons in Germany

const countryGerList={
  "Germany": "Deutschland",
  "Austria": "Oesterreich",
  "Czechia": "Tschechien",
  "France": "Frankreich",
  "United Kingdom": "England",
  "Italy": "Italien",
  "Poland": "Polen",
  "Spain": "Spanien",
  "Sweden": "Schweden",
  "Switzerland": "Schweiz",
  "Greece"     : "Griechenland",
  "Israel": "Israel",
  //  "China": "China",
  "India": "Indien",
  //  "Japan": "Japan",
  "Russia": "Russland",
  //  "Turkey": "Tuerkei",
  "US": "USA",
  "Australia": "Australien",
  "LK_Erzgebirgskreis": "LK Erzgebirgskreis",
  "LK_Osterzgebirge": "LK Osterzgebirge",
  "SK_Dresden": "Dresden"
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
  "Greece"        :   10700000,
  "Israel"        :    9100000,
  "India"         : 1353000000,
  "Russia"        :  144000000,
  "US"            :  328000000,
  "Australia"     :   25499881,
  "LK_Erzgebirgskreis": 334948,
  "LK_Osterzgebirge"  : 245586,
  "SK_Dresden"        : 556780
}


// will be only relevant if "xyz no longer <<1 ("Durchseuchung")
// will be later changed to fracDie=fracDieInit*pTest/pTestInit;
const fracDieInitList={
  "Germany"       : 0.005, // init
  "Austria"       : 0.0031,
  "Czechia"       : 0.0027,
  "France"        : 0.0040,
  "United Kingdom": 0.0040,
  "Italy"         : 0.0040,
  "Poland"        : 0.0040,
  "Spain"         : 0.0040,
  "Sweden"        : 0.0040,
  "Switzerland"   : 0.0055,
  "Greece"        : 0.0055,
  "Israel"        : 0.0055,
  "India"         : 0.0045,
  "Russia"        : 0.0040,
  "US"            : 0.0055,
  "Australia"     : 0.0040,
  "LK_Erzgebirgskreis": 0.005,
  "LK_Osterzgebirge"  : 0.005,
  "SK_Dresden"        : 0.005
}


const tauDieList={
  "Germany"       : 19, //19
  "Austria"       : 19,
  "Czechia"       : 19,
  "France"        : 19,
  "United Kingdom": 14,
  "Italy"         : 14,
  "Poland"        : 19,
  "Spain"         : 14,
  "Sweden"        : 19,
  "Switzerland"   : 19,
  "Greece"        : 14,
  "Israel"        : 17,
  "India"         : 17,
  "Russia"        : 17,
  "US"            : 17,
  "Australia"     : 17,
  "LK_Erzgebirgskreis": 14,
  "LK_Osterzgebirge"  : 16,
  "SK_Dresden"        : 16
}





const tauRecoverList={
  "Germany"       : 16,
  "Austria"       : 16,
  "Czechia"       : 30,
  "France"        : 20,
  "United Kingdom": 25,
  "Italy"         : 25,
  "Poland"        : 25,
  "Spain"         : 25,
  "Sweden"        : 25,
  "Switzerland"   : 18,
  "Greece"        : 18,
  "Israel"        : 18,
  "India"         : 18,
  "Russia"        : 18,
  "US"            : 18,
  "Australia"     : 18,
  "LK_Erzgebirgskreis": 16,
  "LK_Osterzgebirge"  : 16,
  "SK_Dresden"        : 16
}



var R0sliderUsed=false;
var otherSliderUsed=false;
var testSliderUsed=false;
//var fracDieSliderUsed=false; does not exist



// global simulation parameters/infection constants/parameters

var fpsstart=50;
var fps=fpsstart;  // controlled @ doSimulationStep()

// (i) controlled by sliders/control elements (apart from R0)


var pTestInit=0.1;     // P(Tested|infected)  if !f(#tests) assumed
var pTestModelMin=0.04;   // if calculated by sqrt- or propto model

var includeInfluenceTestNumber=true; // if true, pTest =f(#tests)
var slider_rVacc_moved=false; // if true, pTest =f(#tests)
var useSqrtModel=true; // whether use sqrt or linear dependence 

var tauRstartInit=2;   // active infectivity begins [days since infection]//1
var tauRendInit=10;    // active infectivity ends [days since infection]//10
var tauTestInit=7;     // time delay [days] test-infection //8

var tauRstart=tauRstartInit;
var tauRend=tauRendInit;  
var pTest=pTestInit;       // percentage of tested infected persons 
var tauTest=tauTestInit;
var tauAvg=5;      // smoothing interval (uneven!) for tauTest,
                   // tauDie, tauRecover

var pVacc=0;        // vaccination fraction in [0,1]
var rVaccInit=0;    // pVacc'(t) [fraction per day]
var rVacc=rVaccInit;
var IvaccArr=[];                    // used to calibrate with fixed time
for(var it=0; it<=itPresent; it++){ // profile ofvaccination imunity
  IvaccArr[it]=0;
}

var measuresInit=4;  // obsolete "Abstand+Maske", cf. corona_gui.js->str_measures
var measures=measuresInit; // obsolete

var casesInflowInit=0; // inported cases per day and 100 000 inhabitants
var casesInflow=casesInflowInit;

// (ii) not controlled

// reset to fracDieInit*pTest/pTestInit at restart but NOT during simulation
var fracDieInit=fracDieInitList.Germany; 
var fracDie=fracDieInit;           
var fracDieFactor=0.15; // reduction factor of simulated IFR
var itReduceBegin=10;
var tauReduce=210; // about 2*tauDie

var tauDie=tauDieList.Germany; // time from infection to death
var tauRecover=16; // time from infection to full recovery
var tauSymptoms=7;  // incubation time 

var taumax=Math.max(tauDie,tauRecover)+tauAvg+1;
 

// (iii) additional variables for simulating influence of tests,
//  note: useSqrtModel at the controlled variables

var alphaTest=0.0; // alpha error of test (false negative)
var betaTest=0.003; // beta error (false positive) after double testing


// (iv) calibration related parameters/variables

var inCalibration=false;  // other calc of vacc
                          // in CoronaSim.updateOneDay 
var itmin_calib; // start calibr time interval w/resp to dayStartMar
                 //     = dataGit_idataStart+1
var itmax_calib; //  end calibr time interval =^ data_itmax-1 
                 // should be split if there are more than approx 
                 // 20 weeks of data

const calibInterval=7; //!! calibration time interval [days] for one R0 value7
const Rinterval_last_min=14; // do not calibrate remaining period smaller 11
const calibrateOnce=false; // following variables only relevant if false
const nCalibIntervals=6; // multiples of calibInterval, !! >=30/calibInterval
                         // calibrates nCalibIntervals-nOverlap+1 params
var R0=1.42;    // init interactive R for slider corona_gui.js (overridden)
var R0_actual=R0;
var R0time=[];   // !! calibrated R0
                // initialize in function initialize() (then data available)
var R0_hist=[]; R0_hist[0]=R0; // one element PER DAY
var sigmaR0_hist=[]; sigmaR0_hist[0]=0; 
                   // per step 6

const nOverlap=3;        // multiples of calibInterval, 3
                         // >=max(1,floor(Rinterval_last_min/calibInterval)
var useInitSnap;
var firstR0fixed=false; //if first R0 element firstR0 is fixed @ calibr 
var firstR0=0;



var IFRinit=0.002;
var IFRinterval=28;
var IFRinterval_last_min=21;
var IFRtime=[];
var IFR_jmax=1+Math.ceil((itPresent-IFRinterval_last_min)/IFRinterval);
for(var j=0; j<IFR_jmax;j++){
  IFRtime[j]=IFRinit;
}





// (v) global graphical vars

var canvas;
var ctx;
var xPixLeft,yPixTop;
var xPix,yPix;
var xPixOld, yPixOld;
var sizeminViewport;
var sizeminCanvas;

var textsize=14;
var hasChanged=false;
var isSmartphone=false;
var isLandscape=true;

corona=new CoronaSim();



// ##############################################################
// !! test fetch method: w/o addtl cronjob/script
// directly from https://pomber.github.io/covid19/timeseries.json
//
// called ONLY in the html <body onload="..."> callback
// NOT: offline
// Ubuntu 12: Only Chrome! 
// Ubuntu18: Every browser??
// Android ??
//
// strange extremely confusing order of commands. 
// It is called erratically before or after initialize 
// (although it should before). It seems to be safely there   
// at creation time of the THREAD: 
// setInterval(simulationRun) simulationRun->doSimulationStep()

// since old browsers also do not understand arrow functions
// throwing syntax errors even if code is not reached,
// I have replaced them with normal anonymous functions 
// ##############################################################

//called ONLY in the <body onload> and toggleData event
function getGithubData() {
  var log=false;
  if(log) console.log("in getGithubData");
  //corona=new CoronaSim(); //!!

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


  // input data on number of tests and German RKI data
  // always from server (-> cron-job!)
  // since original json file too big
  // because of annoying undefined time order in fetch, set at beginnng!

  dataGit2 = JSON.parse(dataGitLocalTests); // must be different name!!

  console.log("dataGit2=",dataGit2);
  console.log("dataGit2.Germany.data[0]=",dataGit2.Germany.data[0]);
  var ndataTest2=dataGit2.Germany.data.length;
  console.log("dataGit2.Germany.data[0]=",dataGit2.Germany.data[0]);

  for(var i=ndataTest2-11; i<ndataTest2; i++){
    console.log("i=",i," dataGit2.Germany.data[i]=",
		dataGit2.Germany.data[i]);
  }

  dataRKI = JSON.parse(dataRKI_string); // must be different name!!
  console.log("dataRKI=",dataRKI);
  console.log("dataRKI[SK_Dresden][190]=",dataRKI["SK_Dresden"][190]);

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
	myRestartFunction(); // only HERE guaranteed that everything loaded
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
    fracDie=IFRfun_time(-20); // use IFR start array for init()
    corona.init(0); 
    myRestartFunction();
  }
} // getGithubData




// really malignous error: Apple cannot make date object out of yyyy-m-dd
// e.g., 2020-1-22 as delivered by dataGit

function insertLeadingZeroes(dateStr){
  var monthIsOneDigit=(dateStr.lastIndexOf("-")===6);
  var dayIsOneDigit=(dateStr.charAt(dateStr.length-2)==="-");
  return dateStr.substr(0,5)
    + ((monthIsOneDigit) ? "0" : "")
    + ((monthIsOneDigit) ? dateStr.substr(5,1) : dateStr.substr(5,2))
    + "-"
    + ((dayIsOneDigit) ? "0" : "")
    + ((dayIsOneDigit) ? dateStr.slice(-1) : dateStr.slice(-2));

}



function initializeData(country){ 
  country2=(country==="United Kingdom") ? "England" : country;
  useLandkreise=(country==="LK_Erzgebirgskreis")
    || (country==="LK_Osterzgebirge") || (country==="SK_Dresden");
  if(useLandkreise){country2="Germany";}
  useLiveData=(useLandkreise) ? false : useLiveDataInit;
  console.log("\n\n======================================================",
	      "\nin initializeData(country): country=",country,
	      " country2=",country2,
	      "\n========================================================");


  // reset validation flags

  saveGroundData=true;


  // MT 2020-09  // [] access for strings works ONLY with "" or string vars
  // access ONLY for literals w/o string ""

  var data=(useLandkreise) ? dataRKI[country] : dataGit[country];
  var dateInitStr=data[0]["date"];

  var data2=dataGit2[country2].data;
  var dateInitStr2=data2[0]["date"];

  // !! re-initialize; otherwise consequential errors after switching back
  // to countries with more data
  
  dayStartMar=dayStartMarInit;
  dayStartYear=dayStartMar+59;
  startDay=new Date(2020,02,dayStartMar);
  itPresent=itPresentInit;

 // define time shifts start date - start date of the two data sources 

  data_dateBegin=new Date(insertLeadingZeroes(dateInitStr));
  data_idataStart=Math.round( // absolute index
    (startDay.getTime() - data_dateBegin.getTime() )/oneDay_ms);

  data2_dateBegin=new Date(insertLeadingZeroes(dateInitStr2));
  data2_idataStart=Math.round(
    (startDay.getTime() - data2_dateBegin.getTime() )/oneDay_ms);




 

  


  

  // MT 2020-12-10: Check if already cases at intended sim start day
  // if less than 10 days of cases at start, shift sim start forwards

  var daysCasesWarmupMin=10;
  var iFirstCase=0;
  var success=false;
  for(var i=0; (i<data.length)&&(!success); i++){
    if(data[i]["confirmed"]>0){ // later data_cumCases[i]
      iFirstCase=i;
      success=true;
    }
  }


  if(data_idataStart<iFirstCase+daysCasesWarmupMin){ // shift start of sim
    var daysForwards=iFirstCase+daysCasesWarmupMin-data_idataStart;
    data_idataStart+=daysForwards;
    data2_idataStart+=daysForwards;
    startDay=new Date(2020,02,dayStartMar+daysForwards);
    dayStartYear+=daysForwards;
    itPresent -= daysForwards;
    console.log("Warning: no data >=ten days before sim start",
		"\n => shift start date by ",daysForwards,
		" days to ",data2[data2_idataStart]["date"]);
  }

 // define time shifts start date - start date of the two data sources 

  data_itmax =data.length-data_idataStart; // relative index
  data2_itmax=data2.length-data2_idataStart;


  // testing the overall structure

  if(true){
    var nxtStart=data[data_idataStart]["confirmed"];

    console.log(
      "\nChecking times: ",
      "startDay=",startDay," present=",present,
      " itPresent=",itPresent,
      "\nTesting the overall read data structure:",
      "\ndata.length=",data.length,"  data2.length=",data2.length,
      "\ndata_idataStart=",data_idataStart,
      "  data2_idataStart=",data2_idataStart,
      "\ndata_itmax=",data_itmax,"  data2_itmax=",data2_itmax,
      "\n\ndata[0][\"date\"]=",data[0]["date"],
      "  data2[0][\"date\"]=",data2[0]["date"],
      "\ndata[data_idataStart][\"date\"]=",data[data_idataStart]["date"],
      "  data2[data2_idataStart][\"date\"]=",data2[data2_idataStart]["date"],
      "\ndata[data_idataStart+data_itmax-1][\"date\"]=",
         data[data_idataStart+data_itmax-1]["date"],
      "  data2[data2_idataStart+data2_itmax-1][\"date\"]=",
         data2[data2_idataStart+data2_itmax-1]["date"],
       "\nnxtStart=",nxtStart,
      "\n"
    );
  }



  // extract main data
  // reset all arrays since RKI sources have other length than country data

  data_date=[]; 
  data_cumCases=[];
  data_cumDeaths=[];
  data_cumRecovered=[];
  data_cumCfr=[];
  data_cumVacc=[];
  data2_posRate=[];
  data2_cumTests=[];

  // also for derived data (unless test numbers) used in simulation

  data_cumTestsCalc=[];
  data_dn=[];
  data_dxt=[];
  data_dyt=[];
  data_dz=[];
  data_posRate=[];
  data_cfr=[];
  data_pTestModel=[];

  data_dxIncidence=[];
  data_dzIncidence=[];
  pTest_weeklyPattern=[];
  dn_weeklyPattern=[];

  for(var i=0; i<data.length; i++){
    data_date[i]=data[i]["date"];
    data_cumCases[i]=data[i]["confirmed"];
    if((i>0)&&(data_cumCases[i]<data_cumCases[i-1])){
      data_cumCases[i]=data_cumCases[i-1]; // ANNOYING inconsistent RKI data
    }
    data_cumDeaths[i]=data[i]["deaths"];
    data_cumRecovered[i]=(useLandkreise) ? 0 : data[i]["recovered"];
    data_cumCfr[i]=(data_cumCases[i]==0)
      ? 0 : data_cumDeaths[i]/data_cumCases[i];
  }




  // extract test data (MT 2020-09)
  // !! rely on positive_rate instead of total tests
  // because more often available

  for(var i2=0; i2<data2.length; i2++){
    data2_cumTests[i2]=data2[i2].total_tests; // not always available
    //!! data2_cumCases[i2]=data2[i2].total_cases; if unific, 
    data2_posRate[i2]=data2[i2].positive_rate; // nearly always available
  }




  data_cumVacc[0]=0;                                                         
  var di2=data2_idataStart-data_idataStart;


  // vaccinations
  
  for(var i=0; i<=-di2; i++){
    data_cumTestsCalc[i]=0;
    data_cumVacc[i]=0;
  }

  for(var i=Math.max(1,-di2); i<data.length; i++){
    var i2=i+di2;
    if((i<30)||(i>=data.length-5)){
      console.log("i2=",i2," data2[i2]=",data2[i2]);
    }
    data_cumVacc[i]=(!(typeof data2[i2].total_vaccinations === "undefined"))
      ? data2[i2].total_vaccinations : (i>0) ? data_cumVacc[i-1] : 0;
  }


  // calculated vaccination rates (fraction of population per day)

  var data_rVacc_unsmoothed=[];
  data_rVacc_unsmoothed[0]=0;
  for(var i=1; i<data.length; i++){
    data_rVacc_unsmoothed[i]=(data_cumVacc[i]-data_cumVacc[i-1])/n0;
  }
  kernel=[1/7,1/7,1/7,1/7,1/7,1/7,1/7]; 
  data_rVacc=smooth(data_rVacc_unsmoothed,kernel);

  // correct artifacts near the end if rVacc unsmoothed=0 for last days

  for(var i=data.length-3; i<data.length; i++){
    var dVacc=data_cumVacc[i]-data_cumVacc[i-1]; // unsmoothed
    if(dVacc<1){data_rVacc[i]=data_rVacc[data.length-4]}; // rVacc smoothed
  }
  
  if(true) for(var i=0; i<data.length; i++){
    console.log(data_date[i],": data_cumVacc=",
		data_cumVacc[i]," data_rVacc=", data_rVacc[i]);
  }
  
  // calculated immunity fraction profile IvacArr using the dynamics of
  // vaccination() (!! related to it=i-data_idataStart)

  vaccSim=new Vaccination();
  vaccSim.initialize();
  var rVaccSim=0;
  for(var it=0; it<itPresent; it++){
    var i=it+data_idataStart;
    if(!( typeof data_rVacc[i] === "undefined")){
      rVaccSim=data_rVacc[i]; // otherwise unchhanged
    }
    //console.log("it=",it," i=",i," date=",data_date[i]," rVaccSim=",rVaccSim);
    vaccSim.update(rVaccSim,it,false);  // last arg=logging
    IvaccArr[it]=vaccSim.Ivacc;
    if(it>itPresent-10){console.log("it=",it," IvaccArr[it]=",IvaccArr[it]);}
  }

  
    
  // calculated cum test numbers and positive rate

  var i2_lastR=0; // i2 for last defined posRate; needed for extrapol
  data_cumTestsCalc[0]=0; // (offset not relevant)
    
  for(var i=1; i<data.length; i++){ // !! other i range; above range => errors
    var i2=i+di2;
    if( !(typeof data2_posRate[i2] === "undefined")){ //posRate given
      var rateAct=data2_posRate[i2];
      data_cumTestsCalc[i]=data_cumTestsCalc[i-1] + ((rateAct>0) 
	? (data_cumCases[i]-data_cumCases[i-1])/rateAct
						     : 0);
      i2_lastR=i2;

    }
  

    // extrapolate if actual posRate data undefined

    else{

      var rateAct=data2_posRate[i2_lastR];
      data2_posRate[i2]=rateAct;
      data_cumTestsCalc[i]=data_cumTestsCalc[i-1] + ((rateAct>0) 
	? (data_cumCases[i]-data_cumCases[i-1])/rateAct
						     : 0);
    }
  }



  // generate the data arrays (in data, not data2 time order) to be plotted
  // data_dx=estmation from data assuming 
  // (1) time interval tauTest where test is positive for infected people
  //     e.g. tauPos=7 from infection days 3-9 
  //     (start day here not relevant) 
  // (2) the probability that not tested people are infected factor gamma
  //     of that for tested people
  // (3) "Durchseuchung" <<1 (!! change later if xyz/n0 implemented!
  // (4) tests have certain alpha and beta errors

  var di2=data2_idataStart-data_idataStart; // translation data->data2 index

  var tauPos=7; //!! keep const 1 week irresp. of tau sliders:
                // tauPos=7 cancels out weekly pattern

  data_dxt[0]=0; 
  data_dyt[0]=0;
  data_dz[0]=0;

  for(var i=1; i<data.length; i++){
    data_dxt[i]=data_cumCases[i]-data_cumCases[i-1];
    data_dyt[i]=data_cumRecovered[i]-data_cumRecovered[i-1];
    // in spain the def of deaths changed -> cum deaths reduced, dz<0
    data_dz[i]=Math.max(data_cumDeaths[i]-data_cumDeaths[i-1], 0.);
  }


  // need new loop because of forward ref at cfr, ifr

  if(useLandkreise){
    console.log(
      "initializeData second round: calculating dn[] and data_pTestModel[]",
      "\n n0=",n0,"(n0Germany not needed if useLandkreise",
      " since rateAct in data used",
      "\n useSqrtModel=",useSqrtModel,
      "\n data_idataStart=",data_idataStart);
  }

  for(var i=0; i<data.length; i++){
    data_posRate[i]=data2_posRate[i+di2];
    data_dn[i]=data_dxt[i]/data_posRate[i];// more stable
    if(!((data_dn[i]>0)&&(data_dn[i]<1e11))){data_dn[i]=0;}
    var dnTauPos=data_cumTestsCalc[i+di2]-data_cumTestsCalc[i+di2-tauPos];
   

    var dxtTauPos=data_cumCases[i]-data_cumCases[i-tauPos];

    var dztTauPos=Math.max(data_cumDeaths[i]-data_cumDeaths[i-tauPos],0.);

    data_cfr[i]=Math.max(data_cumDeaths[i+tauDie-tauTest]
		 -data_cumDeaths[i+tauDie-tauTest-tauPos],0.)/dxtTauPos;

 

    //  proportional or  sqrt-like "Hellfeld" model: 
    // sqrt: assume 100% "Hellfeld" ifP(tested|new infected) if all n0 persons
    // are  tested within "infectiosity period" of assumed 7 days
    // linear: assume 100% if 10% are tested as above


    if((data_dn[i]>0)&&(data_dn[i]<1e11)){
      if(useSqrtModel){ // global var

	// the sqrt model square root model pTest
	//!!! (2021-01-04)
        // updated to full test every 14 instead of 7 days=^ 100%

        var pModel=Math.sqrt(14*data_dn[i]/n0);  

	// corrections if very vew tests (only at beginning)
	
        data_pTestModel[i]=pTestModelMin
	*Math.sqrt(1+Math.pow(pModel/pTestModelMin,2));
        data_pTestModel[i]=Math.min(data_pTestModel[i],1);
      }
      else{// use proportional model
	var pModel=10*7*data_dn[i]/n0;
	data_pTestModel[i]=Math.max(pTestModelMin,Math.min(1,pModel));
      }
    }


    else{// no dn data
      data_pTestModel[i]= pTestInit; //MT 2020-11 change from pTestModelMin
    }

  }


  
  //kernel=[1/9,2/9,3/9,2/9,1/9];
  kernel=[1/7,1/7,1/7,1/7,1/7,1/7,1/7];  //  in initializeData

  loggingDebug=true; //!! global debug variable
  data_pTestModelSmooth=smooth(data_pTestModel,kernel);
  loggingDebug=false;

 
  // ####################################################
  // weekly pattern for pTestModel and data_dn based on 3 periods
  // ####################################################

  var season0=[];
  var season1=[];
  var avg0=[];
  var avg1=[];
  for(var k=0; k<3; k++){// up to three weeks back
    avg0[k]=0; avg1[k]=0;
    for(var is=0; is<7; is++){ // is always =6 at data.length-1 //!!
      avg0[k] += data_pTestModel[data.length-21+7*k+is]/7;
      avg1[k] += data_dn[data.length-21+7*k+is]/7;
    }
  }


  for(var is=0; is<7; is++){
    season0[is]=0; season1[is]=0;
    for(var k=0; k<3; k++){
      season0[is] += (data_pTestModel[data.length-21+7*k+is]-avg0[k])/3;
      season1[is] += (data_dn[data.length-21+7*k+is]-avg1[k])/3;
    }
    pTest_weeklyPattern[is]=avg0[2]+season0[is];
    dn_weeklyPattern[is]=avg1[2]+season1[is];

 
   }


  

  // in initializeData(country);
  // check smoothing the objective data_cumCases for calibration

  if(false){
    //kernel=[1/9,2/9,3/9,2/9,1/9];
    kernel=[1/7,1/7,1/7,1/7,1/7,1/7,1/7];
    var data_cumCasesSmooth=smooth(data_cumCases,kernel);
    data_cumCases=data_cumCasesSmooth;
  }



  // ###############################################
  // debug (saisonal is always=6 at data.length-1)
  // ###############################################

  if(true){
    console.log("\ndata2[0][\"date\"]=",data2[0]["date"]);
    console.log("initializeData finished: final data:");
    for(var i=0; i<data.length; i++){
      //var logging=useLandkreise&&(i>data.length-10);
      var logging=(i>data.length-40);
      if(logging){
        var i2=i+data2_idataStart-data_idataStart;
	console.log(
	  insertLeadingZeroes(data[i]["date"]),": i=",i,
	  " data_dxt=",Math.round(data_dxt[i]),
	  //" data_dyt=",Math.round(data_dyt[i]),
	  " data_dz=",Math.round(data_dz[i]),
	  " data_dn[i]=",data_dn[i].toFixed(1),
	  "\n  data_pTestModel[i]=",data_pTestModel[i].toFixed(3),
	  " data_pTestModelSmooth[i]=",data_pTestModelSmooth[i].toFixed(3),
	  "\n  data_cumCases=",Math.round(data_cumCases[i]),
	  " data_cumVacc=",data_cumVacc[i],
	  " data_posRate=",data_posRate[i],
	  //" data2_posRate=",data2_posRate[i2],
	  " data_cumTestsCalc=", Math.round(data_cumTestsCalc[i]),
	 // " data_cfr=",data_cfr[i].toPrecision(3),
	  " "
	);
      }
    }
  }

  if(false){
    console.log("\ninitializeData finished: final weekly pattern:");
    for(var i=0; i<data.length; i++){
      //var logging=useLandkreise&&(i>data.length-10);
      var logging=(i>data.length-10);
      if(logging){
	var is=(70000+i-data.length)%7;
	console.log(
	  insertLeadingZeroes(data[i]["date"]),": iData=",i,
	  " is=",is,
	  " pTest: season0[is]=",season0[is],
	  " pTest_weeklyPattern[is]=",pTest_weeklyPattern[is].toPrecision(3),
	  "\nTest number dn: season1[is]=",season1[is],
	  " dn_weeklyPattern[is]=", dn_weeklyPattern[is].toFixed(0),
	  " ");
      }
    }
  }



  R0sliderUsed=false;
  otherSliderUsed=false;


 //##############################################################
// calibrate
 //##############################################################

  // args set global vars itmin_calib, itmax_calib 
  // needed to control fmin.nelderMead

  calibrate(); // in initializeData(country);
  myRestartFunction();



  console.log("\nend initializeData: country=",country);

} // initializeData(country);



// like influenca, covid19 is more active in winter
// relate factor to present to make simple future projections
// deactivate season/winter/summer curve by relAmplitude=0;
function calc_seasonFactor(it){
  var fracYearPeak=0.10; //  (first week February)
  var relAmplitude=0.0; // factor (1+/-relAmplitude)  (0.2)
  var phase=2*Math.PI*(dayStartYear+it-fracYearPeak)/365.;
  var phasePresent=2*Math.PI*(dayStartYear+itPresent-fracYearPeak)/365.;
  var factor=1+relAmplitude*Math.cos(phase);
  var factorPresent=1+relAmplitude*Math.cos(phasePresent);
  return factor/factorPresent;R0*seasonFactor/seasonFactorPresent;
}

//##############################################################
// function for variable replication rate R0 as a function of time
// t=tsim-dateStart [days] from t to t+1
// !! global vars bool firstR0fixed and firstR0 for managing overlap
//##############################################################

function R0fun_time(R0arr, it){
  var iPresent=data_idataStart+it;
  var iTest    =iPresent+Math.round(tauTest);
  var iTestPrev=iPresent+Math.round(tauTest-0.5*(tauRstart+tauRend));


  if(it<0){ // direct estimate from data 
    var nxtNewnum  =1./2.*(data_cumCases[iTest+1]-data_cumCases[iTest-1]);
    var nxtNewdenom=1./2.*(data_cumCases[iTestPrev+1]
			  -data_cumCases[iTestPrev-1]);

    // !! above estimator seems to overestimate R0 a bit,
    // hence factor 0.9 which gives good results 
    // (little R0 jumps <=> little jumps in sim new infections)
    // compared to fitted R0 (no data if iTestPrev<0!)

    var R0=((iTestPrev>=0)&&(nxtNewdenom>0)) ? 0.90*nxtNewnum/nxtNewdenom : 4;

    if(loggingDebug){ //!!! global variable; must=false in calibration
      console.log("R0fun_time: it=",it," nxtCum(iTest)=",data_cumCases[iTest],
		" nxtCum(iTestPrev)=",data_cumCases[iTestPrev],
		" nxtNewnum=",nxtNewnum,
		" nxtNewdenom=",nxtNewdenom,
		"");
    }

    R0= Math.min(5, Math.max(0.2,R0));

    if(loggingDebug){console.log("R0fun_time: warmup: returning R0=",R0);} //!!
    return R0;
  }


  else{// regular
    //return R0arr[index];    //steps
    var R0;                   // linear interpolation
    if(firstR0fixed){
      var indexWanted=Math.floor(it/calibInterval)-1;
      var index=Math.min(indexWanted, R0arr.length-1);
      var indexPlus=Math.min(indexWanted+1, R0arr.length-1);
      var relRest=(it-calibInterval*index)/calibInterval-1;
      var R0lower=(indexWanted<0) ? firstR0 : R0arr[index];
      R0= (1-relRest)*R0lower+relRest*R0arr[indexPlus];
    }
    else{
      var indexWanted=Math.floor(it/calibInterval);
      var index=Math.min(indexWanted, R0arr.length-1);
      var indexPlus=Math.min(indexWanted+1, R0arr.length-1);
      var relRest=(it-calibInterval*index)/calibInterval;
      R0= (1-relRest)*R0arr[index]+relRest*R0arr[indexPlus]; 
    }

     
    if(loggingDebug){console.log("R0fun_time: regular: returning R0=",R0);} //!!
    return R0;
  }
}//R0fun_time







/*##############################################################
 objective function for fitting the two-weekly reproduction rate 
 via the resulting dynamics of cases to the data
 used as function arg of the nl opt package fmin:
 fmin.nelderMead(SSEfunc, guessSSE)  or
 fmin.conjugateGradient(SSEfunc, guessSSE)
 gradient fbeta needed only for conjugateGradient

@param R0_arr: array of R0 values: R0_arr[0]: for days i<7,
                                 R0_arr[j]: 14 days starting at i=j*14
@param fR0: numerical gradient of func with respect to R0
   (provide void if not used to not confuse the fmin.nelderMead method)

@param_opt logging: optional logging switch (default false inside nelderMead)
@param_opt itStart: optional start to override itmin_calib
@param_opt itMax: optional end to override itmax_calib

@global param (do not know how to inject params into func):
@global data_cumCases: the data to fit, (it=0) corresp (idata=data_idataStart)
@global itmin_calib start of calib intervals (days since dayStartMar)
@global itmax_calib end of calib intervals (days since dayStartMar)
@global useInitSnap
NOTICE: fmin.nelderMead needs one-param SSEfunc SSEfunc(R0_arr):
        "sol2_SSEfunc=fmin.nelderMead(SSEfunc, R0guess);"
 ##############################################################*/

 //!! use separate array R0arr instead of global array R0time
 // for optimization if not whole array optimized.

 // R0time => used in R0fun_time(t)=R0fun_time(it) if it>=0
 //                  R0fun_time(t) data driven if t<0

function SSEfunc(R0arr, fR0, logging, itStartInp, itMaxInp, 
		 itSnapInp, useInitSnapInp) {
  if( typeof fR0 === "undefined"){
    fR0=[]; for(var j=0; j<R0arr.length; j++){fR0[j]=0;}
    //console.log("inside: fR0=",fR0);
  }
  if( typeof logging === "undefined"){logging=false;}
  var itStart=( typeof itStartInp === "undefined") ? itmin_calib : itStartInp;
  var itMax=( typeof itMaxInp === "undefined") ? itmax_calib : itMaxInp;
  var itSnap=( typeof itSnapInp === "undefined") ? -9999 : itSnapInp;
  takeSnapshot=( typeof itSnapInp === "undefined") ? false : true;
  if( !(typeof useInitSnapInp === "undefined")){
    useInitSnap=useInitSnapInp;
  } // otherwise leave at global state

  if(logging){
    console.log("\nEntering SSE func:",
	//	" R0arr=",R0arr, "\n",
		"\n start calibr segment: itStart=",itStart,
		"\n end calibr segment: <itMax=",itMax,
		"\n max it in data: <data_itmax=",data_itmax,
		"\n present it: itmax=",itmax,
		"\n takeSnapshot=",takeSnapshot,
		" useInitSnap=",useInitSnap,
		" itSnap=",itSnap,
		"");
  }



  // SSEfunc: start corona simulation, either set init state
  // data-driven from scratch
  // or use a snapshhot taken earlier

 
  if(useInitSnap){ // !! snapshot must be taken at itStart!
    if(!corona.snapAvailable){
      console.log("SSE: error: ",
		  " snapshot initialization requested but not available");
      return(" SSE failed!");
    }
    if(logging){
      console.log("SSEfunc; initializing with corona.snapshot: corona.snapshot.it=",corona.snapshot.it);
    }
    corona.setStateFromSnapshot();
  }

  else{
    
    fracDie=IFRfun_time(-20); //!!
    if(logging){
      console.log("SSEfunc; initializing from scratch with data: fracDie=",
		  fracDie);
    }
    corona.init(itStart, logging); 
    //corona.init(itStart, false); 
  }
  
  
  // SSEfunc: calculate SSE 

  //if(logging){ //!! always filter logging!!
  if(logging&&true){ //!! always filter logging!!
    var nxtStart=data_cumCases[data_idataStart];
    console.log("SSEfunc: start calculating SSE:",//" R0arr=",R0arr,
		" takeSnapshot=",takeSnapshot,
		" itStart=",itStart,
		" dnxt=",Math.round(n0*corona.dxt),
		" dnxtFalse=",Math.round(n0*corona.dxtFalse),
		" data: nxtStart=",nxtStart,
		" nxt=n0*corona.xt=",Math.round(n0*corona.xt),
		"\n\n");
  }

  var sse=0;
  for(var it=itStart; it<itMax; it++){ // SSEfunc

    if(it==itSnap){corona.takeSnapshot(itSnap);} //BEFORE corona.updateOneDay

    // simulate

    var R0_actual= R0fun_time(R0arr,it-itStart); // ! only R0arr used in SSEfunc
    //if(it==0){corona.vaccination.initialize();} //!!!!
    corona.updateOneDay(R0_actual, it, logging); // in SSE never logging=true!

    // increment SSE

    //  GoF function log(cumulative cases)

    var nxtSim=n0*corona.xt;
    var nxtData=data_cumCases[data_idataStart+it+1];  // sim from it to it+1

    //  GoF function log(new cases) !! not useful since drift @ cumulated

    //var nxtSim=n0*corona.dxt;
    //var nxtData=data_dxt[data_idataStart+it+1];  // sim from it to it+1



    sse+=Math.pow(Math.log(nxtData)-Math.log(nxtSim),2); //!! Math.log

    // additionally penalty for negative R0 or R0 near zero

    var R0lowLimit=0.4;  
    var prefact=0.01;
    if(R0_actual<R0lowLimit){
      sse += prefact*Math.pow(R0lowLimit-R0_actual,2);
    }

    // additionally penalty for extreme R0 //!! prefact <0.00001
    prefact=0.000001;
    sse += prefact*Math.pow(1-R0_actual,2);

    //if(logging&&(it<5)){
    //if(logging&&true){
    if(logging&&false){

      console.log("SSEfunc after update: it=",it," itSnap=",itSnap,
		  " R0_actual=",R0_actual.toFixed(2),
		  " nxtData=",nxtData,
		  " nxtSim=",Math.round(nxtSim),
		  " dnxSim=",Math.round(n0*corona.x[0]),
		  //" dsse=",Math.pow(Math.log(nxtData)-Math.log(nxtSim),2),
		 "");
    }	 

  }

  // calculate the numerical gradient as side effect
  // only if gradient-based method. 


  if(logging){console.log("SSEfunc: returning SSE=",sse,
			 // "\nfor R0arr=",R0arr,
			  "");}
  return sse;
}




//##############################################################
// callbacks influencing the overall simulation operation/appearance
//##############################################################


//called in the html  <body onload> event and by myRestartFunction()

function initialize() {
  //console.log("in initialize");


  // =============================================================
  // initialize R0 estimation result (particularly length) if still undefined
  // =============================================================

  if( typeof R0time[0] === "undefined"){
    R0time[0]=3; // start with high reproduction rate in first week 
    for(var index=1; index<getIndexCalibmax(itPresent); index++){
      R0time[index]=1.010101;
    }
  }
 

  // =============================================================
  // initialize CoronaSim (no effect of order with graphics)
  // =============================================================

  corona=new CoronaSim();
  fracDie=IFRfun_time(-20); // !! needed for corona.init
  if(!useLiveData){corona.init(0);} // otherwise inside fetch promise



  // =============================================================
  // initialize graphics
  // =============================================================


  window.addEventListener("resize", canvas_resize); // corona_gui.js
  window.addEventListener("wheel", callback_wheel); // corona_gui.js

  canvas = document.getElementById("myCanvas");
  ctx = canvas.getContext("2d");
  var rect = canvas.getBoundingClientRect();
  xPixLeft=rect.left;
  yPixTop=rect.top;
  drawsim=new DrawSim();

  setView(showVacc); // contains canvas_resize();

  drawsim.setWindow(windowG);

  //DOS!! (MT 2020-11)
  document.addEventListener('keyup',keyCallback(event));

  //works!! avoids the buggy doubleclick event (MT 2020-11)
  document.addEventListener('keyup',function(event){keyCallback(event);});


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


}


// =============================================================
// determine the calibration period index based on the time index 
// itime=time[days] - dayStartMar.
// first week index 0, then increment every TWO weeks 
// gives index of CONSOLIDATED calibrated R0time[]
// =============================================================

function getIndexTimeFromCalib(ical){ // MT 2020-08
  return calibInterval*ical; 
}

function getIndexCalib(itime){
  return Math.floor(itime/calibInterval);     // MT 2020-08
}

// last calibration interval must have at least 16 days
function getIndexCalibmax(itime){
  return getIndexCalib(itime-Rinterval_last_min); 
}


// =================================================
// determines calibrated R0time[]
// HERE inside calibrate() the control!
// location for inline nondynamic testing: search for these words
// =================================================

function calibrate(){

  inCalibration=true; // other calc of vacc in CoronaSim.updateOneDay 
  slider_rVacc_moved=false;
  console.log("\n\n==================================================",
	      "\nEntering calibrate(): country=",country,
	      "\n====================================================");
 
  console.log("\nEntering calibration of R0 ...");
  R0time=[];  //!! must revert it since some countries may have less data!!
  IFRtime=[];  //!! must revert it since some countries may have less data!!

  // !!!! needed, otherwise side effects if nonzero vaccination
  // cannot calibrate with vaccinations!!
  
  corona=new CoronaSim();//  corona.vaccination.initialize;

  var R0calib=[]; 
 // for(var j=0; j<betaIFRinit.length; j++){ 
 //   betaIFR[j]=betaIFRinit[j];
 // }

  var itmin_c=0;            // basis
  var itmax_c=data_itmax-1; //basis


  if(calibrateOnce){ // global param
    itmin_c=0;            
    itmax_c=data_itmax-1; 
    icalibmin=getIndexCalib(itmin_c);
    icalibmax=getIndexCalibmax(itmax_c);// *max: >=10d cal intv
    for(var icalib=icalibmin; icalib<=icalibmax; icalib++){
      R0calib[icalib-icalibmin]=(icalib==0) ? 1.2 : 1.111 //!!
    }
       
    //#####################################
    estimateR0(itmin_c, itmax_c, R0calib); // also transfers R0calib to R0time
    //#####################################

    estimateErrorCovar_R0hist_sigmaR0hist(itmin_c, itmax_c, R0time); 
  }

  // ############################################################
  // calibrate in multiple steps
  // ############################################################

  else{ 

    var logging=false; //!!!


    var dn=nCalibIntervals-nOverlap;
    var nPeriods=Math.round((data_itmax-1-Rinterval_last_min)/(calibInterval*dn));

    var ditOverlap=nOverlap*calibInterval;
 
    for(var ip=0; ip<nPeriods; ip++){
      itmin_c=calibInterval*ip*dn; //=past itsnap
      itmax_c=itmin_c+calibInterval*nCalibIntervals;

      //step it calculates to it+1 and SSE needs data at it+1, hence itmax-1
      if(ip==nPeriods-1){itmax_c=data_itmax-1;}

      // global variables for the minimum SSE function

      itmin_calib=itmin_c;
      itmax_calib=itmax_c;
      useInitSnap=(ip>0); 
      var takeSnapshot=false; // taken separately at the end of a period


      icalibmin=getIndexCalib(itmin_c);
      icalibmax=(ip==nPeriods-1) 
	? getIndexCalibmax(itmax_c) : getIndexCalibmax(itmax_c);


      // the follow condition to be false can happen because getIndexCalibmax
      // can return lower index than getIndexCalib because of minimum days
      // to be calibrated

      if(icalibmax>icalibmin){  // not >= since cond. icalibmax-- inside

        firstR0fixed=(ip>0); // gloal variable for R0fun
        if(ip>0){ //!! first R0 value fixed
          icalibmax--;
          firstR0=R0time[ip*dn];
        } 
 
       // get initial R0 estimate

	R0calib=[];
        for(var icalib=icalibmin; icalib<=icalibmax; icalib++){
          R0calib[icalib-icalibmin]=1; 
        }


        if(logging)
	console.log("\n\n\n\ncalibrate: period ip=",ip," dn=",dn,
		  "itmin_c=",itmin_c," itmax_c=",itmax_c,
		    " icalibmin=",icalibmin," icalibmax=",icalibmax,
		    " data_itmax-1=",data_itmax-1,
		    " useInitSnap=",useInitSnap,
		    "\nR0calib=",R0calib);

      // check if stripped SSEfunc used for nelderMead calculates correctly 

        if(false&&logging){ 
          var sse=SSEfunc(R0calib,null,false,itmin_c,itmax_c,-1,useInitSnap);
          console.log("\nFull specified SSEfun: sse=",sse);
 
          var sseNull=SSEfunc(R0calib,null,false);
          console.log("Minimal SSEfun needed for estimate: sseNull=",sseNull);
        }



        // estimate 

       //#####################################
        estimateR0(itmin_c, itmax_c, R0calib);  // also R0calib -> R0time
       //#####################################
        if(logging){console.log("before covar: R0calib=",R0calib);}
        estimateErrorCovar_R0hist_sigmaR0hist(itmin_c, itmax_c, R0calib);

        // calculate snapshot for init of next period

        var itsnap=Math.min(calibInterval*dn*(ip+1), itmax_c-1); //!!
        SSEfunc(R0calib,null,false,itmin_c,itmax_c,itsnap,useInitSnap);
        if(logging) console.log(" snapshot for initialiation in next period:",
		  corona.snapshot);
      }
    }// end calibration proper (several calibr steps)


    firstR0fixed=false; // for the whole simulation use all R0 values in R0time
    useInitSnap=false; 

    //test whole calibration

    //if(true&&logging){
    if(false&&logging){

      itsnap=calibInterval*dn; //first snapshot to compare with
      SSEfunc(R0time,null,logging,0, data_itmax-1,itsnap,useInitSnap);
      console.log("corona.snapshot=",corona.snapshot);
    }

  } // calbrate R0 with multiple periods


  //!!! here logging can be true for check of corona.update and corona.init

  var logging=false; 
  //var logging=true;

  if(logging){
    console.log("\nCalibration of R0 finished: testing SSEfunc calc. ...");
  }

  sse=SSEfunc(R0time,null,logging,0,data_itmax-1); // -1 because it: it->it+1
  console.log("calibrate(): calibrating R0 finished",
	      "\n final R0 values R0time=",R0time,
	      "\n fit quality sse=",sse);
  console.log("itPresent=",itPresent,
	      " getIndexCalibmax(itPresent)",getIndexCalibmax(itPresent));
  if(false){
    for(var i=data_date.length-7; i<data_date.length; i++){ //!!
      var it=i-data_idataStart;
      console.log(
	insertLeadingZeroes(data_date[i]),": iData=",i,
	" R00=",R0fun_time(R0time,it).toFixed(2),
	" is=",(70000+i-data_date.length)%7,
	" data_dn=",Math.round(data_dn[i]),
	" ");
    }
  }



   /** ##############################################################
  estimate the infection fatality rate (IFR)
  in contrast to estimateR0 easy and only dependent on, 
  not interacting with, estimateR0
  ############################################################## */


  console.log("\n\ncalibrate(): entering NEW calibration of IFR ...");
  IFR_jmax=1+Math.ceil(
    (itPresent-IFRinterval_last_min)/IFRinterval); //!!!as in def

  IFRtime=[]; for(var j=0; j<IFR_jmax; j++){IFRtime[j]=IFRinit;}
  var cumDeathsSim0=0;
  for(var j=0; j<IFR_jmax-1; j++){
    var it0=IFRinterval*j;
    var it1=Math.min(IFRinterval*(j+1), data_dz.length-data_idataStart);
    var IFRcal=calibIFR(cumDeathsSim0,it0,it1);
    IFRtime[j]=(j==0) ? IFRcal[1] : 0.5*(IFRcal[0]+IFRtime[j]);
    IFRtime[j+1]=IFRcal[1];
    cumDeathsSim0+=IFRcal[2];
  }

  // remove drifts due to the local calibration

  var cumDeathsSim=[];
  cumDeathsSim[0]=data_cumDeaths[data_idataStart];
  
  var f_D=1./tauAvg; 
  var dtau=Math.floor(tauAvg/2);

  f_D=1; // hardly any difference w/o smoothing in Ger!
  dtau=0;
  console.log("IFRtime=",IFRtime);
  for(var it=1; it<data_itmax; it++){
    var fracDie= IFRfun_time(it); // uses IFRtime[]
    var dnz=0;
    for(var j=-dtau; j<=dtau; j++){
      dnz+=n0*fracDie*f_D*corona.xnewShiftedTauDie[Math.max(0,it+j)];
    }
    cumDeathsSim[it]=cumDeathsSim[it-1]+dnz;
    if(false){
      console.log("it=",it," cumDeathsSim=",cumDeathsSim[it],
	  	  " cumDeathsData=",data_cumDeaths[data_idataStart+it]);
    }
    if( (it%IFRinterval==0)&&(it>0)){
      var j=it/IFRinterval;
      if(j<IFR_jmax ){
        var dCumDeathsSim=cumDeathsSim[it]-cumDeathsSim[it-IFRinterval];
        var dCumDeathsData=data_cumDeaths[data_idataStart+it]
	    - data_cumDeaths[data_idataStart+it-IFRinterval];
        var factor=dCumDeathsData/dCumDeathsSim;
        //var factor=data_cumDeaths[data_idataStart+it]/cumDeathsSim[it];
        IFRtime[j] *=factor;
        IFRtime[j-1] *=factor;
      
        if(false){
	  console.log("it=",it," CumDeathsSim=",dCumDeathsSim,
		    " dCumDeathsData=",dCumDeathsData, "factor=",factor);
        }
      }
    }
  }
  

  //!!! ANNOYING slightest shift after any country choice back to Germany
  // approx rel error 10^{-3} in calibr R and IFR (no solution; forget...)

  if(true){
    console.log("IFRtime=",IFRtime);
    console.log("data_idataStart=",data_idataStart);
    console.log("startDay=",startDay);
    console.log("dayStartMar=",dayStartMar);
    console.log("dayStartYear=",dayStartYear);
    console.log("itPresent=",itPresent);
    console.log("calc_seasonFactor(0)=",calc_seasonFactor(0));
  }
  
 //##############################################################
 // !! for inline nondynamic testing: add testcode here
 //##############################################################

  if(false){
    // code
    //alert('stopped simulation with alert');
    //setTimeout(function(){  alert('hello');}, 3000);  
    //alert('hi');
  }

  inCalibration=false; // use dynamic corona.vaccination.update(...)
                       // outside of calibration
  
    //alert('stopped simulation with alert');
}
//end calibrate()


// =============================================================
// simple SSE calibration function for the death cases
// in [it0, it1-1] 
// returns the two parameters vecIFR=(I1,I2)'
// of the linear function IFR(it)=I1+(it-it0)/(it1-it0)*(I2-I1)
// needs 
// * explicit time interval boundaries itin=it0, itmax=it1-1
// * new infections frac corona.xnewShiftedTauDie[it] (=> R0 needs to e already calibrated)
// * data deaths data_dz +shift of the data_* arrays data by idataStart
// * cum data deaths data_cumDeaths +shift of the data_* arrays data by idataStart
// * delay infection-death tauDie (no averaging over interval as in main sim)
// * number of people n0 in region

function calibIFR(cumDeathsSim0,it0, it1){


  // weighting function

  var r=[];
  for(var i=0; i<it1-it0; i++){
    r[i]=i/(it1-it0);
  }

// matrix components of lin eq (I1,I2)'=A^{-1}(c1,c2)'

  var a11=0;
  var a12=0;
  var a22=0;
  var c1=0;
  var c2=0;

  var avec=[];
  var bvec=[];
  for(var i=0; i<it1-it0; i++){
      // ! xnewShiftedTauDie not normalized if stemming from it<0
      // => bias error !!!
    var xnew=corona.xnewShiftedTauDie[Math.max(it0+i, 0)];
    var idata=data_idataStart+it0+i;
    avec[i]=n0*(1-r[i])*xnew;
    bvec[i]=n0*r[i]*xnew;
    var z=data_dz[Math.min(idata, data_dz.length-1)]; // rhs from data
    a11+=avec[i]*avec[i];
    a12+=avec[i]*bvec[i];
    a22+=bvec[i]*bvec[i];
    c1+=z*avec[i];
    c2+=z*bvec[i];
    if(false){
    //if(it0==0){
      console.log("calibIFR: it0+i=",it0+i," idata=",idata, 
		  "\n n0*xnew=",n0*xnew," a=",avec[i]," b=",bvec[i]," z=",z);
    }
  }

  var detA=a11*a22-a12*a12;
  if(detA==0){
    console.log("calibIFR: error: determinant detA=0");
    return [0,0];
  }

  var vecIFR=[];
  vecIFR[0]=(a22*c1-a12*c2)/detA;
  vecIFR[1]=(-a12*c1+a11*c2)/detA;
  if(vecIFR[0]<=0){vecIFR[0]=IFRinit;} // cope with all sorts of errors
  if(vecIFR[1]<=0){vecIFR[1]=IFRinit;}

  // calculate cumulated increment [t0,t1]

  var dCumDeathsSim=0;
  for(var i=0; i<it1-it0; i++){
    dCumDeathsSim+=avec[i]*vecIFR[0]+bvec[i]*vecIFR[1];
  }

  vecIFR[2]=dCumDeathsSim;
  console.log("calibIFR: it0=",it0," it1-1=",it1-1,
	      " data_itmax=",data_itmax,
	      " data_cumDeaths.length=",data_cumDeaths.length,
	      " data_dz.length=",data_dz.length,
	      " data_idataStart=",data_idataStart,
	      "\n data_cumDeaths[data_idataStart+it0]=",
	      data_cumDeaths[data_idataStart+it0],
	      " data_cumDeaths[data_idataStart+it1]=",
	      data_cumDeaths[data_idataStart+it1],
	      " cumDeathsSim0=",cumDeathsSim0,
	      " cumDeathsSim0+vecIFR[2]=",cumDeathsSim0+vecIFR[2]);
  return vecIFR;
} // calibIFR


// =============================================================
// estimate the array R0_arr of R0 values with fmin.nelderMead
// provided by open-source package fmin
// notice: fmin.conjugateGradient does not work here
// => use simple nelderMead and do not need to calculate
// num derivatives in func as side effect of SSEfunc
// @global (do not know how to inject params into func):
// @global data_cumCases: the data to fit, 
//                        (it=0) corresp (idata=data_idataStart)
// @param  R0calib input and result of estimateR0
// @param  itmin_c, itmax_c sets global itmin_calib, itmax_calib
// @global itmin_calib start of calibr intervals (days since dayStartMar)
// @global itmax_calib end of calibr intervals (days since dayStartMar)
// itmin_calib >=0
// itmax_calib < data_itmax-data_idataStart
// controlled by parameter itmin_c, itmax_c

// also transfers R0calib to R0time
// =============================================================

function estimateR0(itmin_c, itmax_c, R0calib){

  var icalibmin=getIndexCalib(itmin_c);
  var icalibmax=getIndexCalibmax(itmax_c);// *max: >=10d cal intv

  // set global variables itmin_calib, itmax_calib needed for 
  // fmin.nelderMead

  itmin_calib=itmin_c;
  itmax_calib=itmax_c;


  if(false){console.log("\n\nestimateR0: after initializing: R0calib=",R0calib,
			" itmin_c=",itmin_c, " itmax_c=",itmax_c,
			" before fmin.nelderMead");}
	   

  /** ##############################################################
  THE central estimation 
  - global control vars itmin_calib,itmax_calib
  - global data variable data_cumCases to fit to by minimizing SSEfunc
  - input/output R0calib
  - One round (ic<1 instead of ic<2) sometimes not enough

  !! unresolved speed issue at some firefox browsers (4% market chare):
  at initialize, SSEfunc takes factor 50 longer than later on
  - tested with 1000 iterations in separate loop 
    to eliminate uncertainties by fmin.nelderMead (needs about 5000 it)
  - Something  to do with not yet loaded data_cumCases from fetch?
    Probably since later on both SSEfunc and the separate test fast
  - Did not check (certainly is the cause) 
    since it's not worth the effort to try ressolve this
    due to utterly nondeterministic behaviour of fetch and only 
    relates to 4% market share
  ############################################################## */

  for(var ic=0; ic<2; ic++){ //!! 1 or 2

    //##############################################################
    sol2_SSEfunc=fmin.nelderMead(SSEfunc, R0calib);
    //##############################################################

  }


  // copy tp global R0 table R0time

  //console.log("estimateR0 before new transfer: R0time=",R0time);
  if(firstR0fixed) for(var j=0; j<R0calib.length; j++){ 
     R0time[j+1+icalibmin]=sol2_SSEfunc.x[j];
  }
  else for(var j=0; j<R0calib.length; j++){ // normal
     R0time[j+icalibmin]=sol2_SSEfunc.x[j];
  }
  if(false){console.log("estimateR0 after new transfer: firstR0fixed=",
			firstR0fixed, " R0time.length=",R0time.length);
	   }


 
  if(false){
    SSEfunc(R0calib,null,true); // logging of SSEfunc
  }


} // estimateR0



//=======================================================
//!Inductive statistics of the LSE estimator R0calib
// Cov(R0calib)=2 V(epsilon) H^{-1}, H=Hessian of SSEfunc(R0calib)
// also calculates daily values of R0 and sigmaR0 from 0 ... itmax
// !! secondary calculation;
// typically only used at the end with R0calib=global R0time
//=======================================================

function estimateErrorCovar_R0hist_sigmaR0hist(itmin_c, itmax_c, R0calib){

  var log=false;

  if(log){console.log("entering estimateErrorCovar(): R0calib=",R0calib,
		       " firstR0fixed=",firstR0fixed," firstR0=",firstR0);}

  var icalibmin=getIndexCalib(itmin_c);
  var icalibmax=getIndexCalibmax(itmax_c);// *max: >=10d cal intv


  var H=[]; // Hessian of actively estimated R0 elements
  for(var j=0; j<R0calib.length; j++){H[j]=[];}

  var dR0=0.001;



  var R0p=[]; for(var j=0; j<R0calib.length; j++){R0p[j]=R0calib[j];}
  var R0m=[]; for(var j=0; j<R0calib.length; j++){R0m[j]=R0calib[j];}
  var R0pp=[]; for(var j=0; j<R0calib.length; j++){R0pp[j]=R0calib[j];}
  var R0pm=[]; for(var j=0; j<R0calib.length; j++){R0pm[j]=R0calib[j];}
  var R0mp=[]; for(var j=0; j<R0calib.length; j++){R0mp[j]=R0calib[j];}
  var R0mm=[]; for(var j=0; j<R0calib.length; j++){R0mm[j]=R0calib[j];}

  // select calibration interval

  // diagonal

  for(var j=0; j<R0calib.length; j++){

    R0p[j]+=dR0;
    R0m[j]-=dR0;
    H[j][j]
      =(SSEfunc(R0p)-2*SSEfunc(R0calib)+SSEfunc(R0m))/(dR0*dR0);
    if(log){console.log("\n j=",j," R0calib=",R0calib,
			"\n           R0p=",R0p,"\n           R0m=",R0m,
			 "\n SSEfunc(R0p)=   ",SSEfunc(R0p),
			 "\n SSEfunc(R0calib)=",SSEfunc(R0calib),
			 "\n SSEfunc(R0m)=   ",SSEfunc(R0m),
			 "");}
    // revert for further use

    R0p[j]=R0calib[j];
    R0m[j]=R0calib[j];
  }

  // upper-diagonal

  for(var j=0; j<R0calib.length; j++){
    for(var k=j; k<R0calib.length; k++){
      R0pp[j]+=dR0; R0pp[k]+=dR0; 
      R0pm[j]+=dR0; R0pm[k]-=dR0; 
      R0mp[j]-=dR0; R0mp[k]+=dR0; 
      R0mm[j]-=dR0; R0mm[k]-=dR0; 
      H[j][k]
	=(SSEfunc(R0pp)-SSEfunc(R0pm)-SSEfunc(R0mp)+SSEfunc(R0pp))/(4*dR0*dR0);
      R0pp[j]=R0calib[j]; R0pp[k]=R0calib[k]; 
      R0pm[j]=R0calib[j]; R0pm[k]=R0calib[k]; 
      R0mp[j]=R0calib[j]; R0mp[k]=R0calib[k]; 
      R0mm[j]=R0calib[j]; R0mm[k]=R0calib[k]; 
    }
  }

  // lower-diagonal

  for(var j=0; j<H.length; j++){
    for(var k=0; k<j; k++){
      H[j][k]=H[k][j];
    }
  }

  if(log){
    console.log("before inverting: R0calib.length=",R0calib.length);
    for(var j=0; j<H.length; j++){
      console.log(" j=",j," H[j]=",H[j]);
    }
  }

  // inverse Hessian

  var Hinv=math.inv(H);

  // variance of random term epsilon assuming epsilon \sim i.i.d.

  var vareps=SSEfunc(R0calib)/(itmax_calib-itmin_calib-H.length);


  // calculate one-sigma estimation errors (every 2 weeks)

  var sigmaR0=[];
  for(var j=0; j<R0calib.length; j++){
    sigmaR0[j]=Math.sqrt(2*vareps*Hinv[j][j]);
  }




  // transfer R0 and sigma 
  // to global daily R0_hist[] and sigmaR0_hist[] p to present 
  // (extrapolate constant if needed, e.g. data not up-to-date)
  // getIndexTimeFromCalib(1) typically calibInterval days)

  for(var it=itmin_c; it<itPresent; it++){//
    var j=Math.min(Math.floor( (it-itmin_c)/calibInterval),
		   R0calib.length-1);
    sigmaR0_hist[it]=sigmaR0[j];
    R0_hist[it]=R0calib[j];
    if(log&&false){console.log("it=",it," j=",j,
			" sigmaR0_hist[it]=", sigmaR0_hist[it]);}
  }





} // estimateErrorCovar_R0hist_sigmaR0hist







function IFRfun_time(it){
  var jlower=Math.floor(it/IFRinterval);
  var r=it/IFRinterval-jlower;
  var jhigher=jlower+1;
  var ifr=((it<0)||(IFRtime.length==0)) ? IFRinit
    : ((jlower>=IFRtime.length)||(jhigher>=IFRtime.length))
    ? IFRtime[IFRtime.length-1]
      : (1-r)*IFRtime[jlower]+r*IFRtime[jhigher];
  
  if(false){console.log("IFRfun_time: it=",it," IFRtime.length=",
	      IFRtime.length,
	      " IFRtime[IFRtime.length-1]=",IFRtime[IFRtime.length-1],
			" jlower=",jlower," r=",r," ifr=",ifr);}
  return ifr;
}




// ###############################################################
// do simulations and graphics
// ###############################################################

// toggleViews (Massnahmen-Ansicht,=> normale Ansicht) in gui!

function toggleTestnumber(){ // callback html "testnumber"
  //clearInterval(myRun);

  if(includeInfluenceTestNumber){
    includeInfluenceTestNumber=false;
    document.getElementById("testnumber").innerHTML
      ="Ber&uuml;cksichtige<br>Testh&auml;ufigkeit";
        //myRun=setInterval(simulationRun, 1000/fps);
  }
  else{
    includeInfluenceTestNumber=true;
    document.getElementById("testnumber").innerHTML
      ="Ignoriere<br>Testh&auml;ufigkeit";
  }

  pTest=parseFloat(slider_pTest.value)/100;
  myCalibrateFunction();
  console.log("leaving toggleTestnumber: includeInfluenceTestNumber=",
	      includeInfluenceTestNumber,
	      " pTest=",pTest);
}



function selectDataCountry(){ // callback html select box "countryData"
  country=document.getElementById("countries").value;
  countryGer=countryGerList[country];
  n0=parseInt(n0List[country]);
  fracDieInit=parseFloat(fracDieInitList[country]);
  tauRecover=parseFloat(tauRecoverList[country]);
  tauDie=parseFloat(tauDieList[country]);
  taumax=Math.max(tauDie,tauRecover)+tauAvg+1;
  setSlider(slider_R0,  slider_R0Text,  R0time[0].toFixed(2),"");
  setSlider(slider_R0cp,  slider_R0cpText,  R0time[0].toFixed(2),"");
  rVacc=0;
  setSlider(slider_rVacc, slider_rVaccText, 700*rVacc, " %/Woche");

  document.getElementById("title").innerHTML=
    "Simulation der Covid-19 Pandemie "+ countryGer;

  if(false){console.log("\n\nin selectDataCountry",
	      "\n (only called in html select box callback",
	      " and in myResetFunction()):",
	      "\n country=",country,
	      " country2=",country2,
	      " itPresent=",itPresent);
	   }

  initializeData(country);

  //myCalibrateFunction(); // THIS addition solved annoying err "corona.yt=NaN"
                         // if several sequential conditions were satisfied

  //myRestartFunction();
} // selectDataCountry

 

function selectWindow(){ // callback html select box "windowGDiv"
  console.log("in selectWindow");
  windowG=document.getElementById("windows").value;

  drawsim.setWindow(windowG); // clear and draAxes in setDisplay..

  drawsim.transferSimData(it);

  drawsim.draw(it);

}


//#################################################################
function validate(){ // callback html select box "validateDiv"
//#################################################################

  nDaysValid=document.getElementById("validateDays").value;
  console.log("in validate: nDaysValid=",nDaysValid);
  var validText=((nDaysValid>0)&&((!isSmartphone) || isLandscape))
    ? "Validierung der "+nDaysValid+" letzten Tage" : "";
  document.getElementById("headerValidText").innerHTML=validText;

  // copy past data to 'ground truth" if nDaysValid switched from =0 to >0

  if(saveGroundData){ 
    console.log("copy windowg data to ground truth data");
    console.log("drawsim.dataG[0]=",drawsim.dataG[0]);

    // association see cstr drawSim
    // !! check "def simValid"

    for(var it=0; it<itPresent; it++){
      simValid[34][it]=drawsim.dataG[0].data[it];  // "Insg pos Getestete"
      simValid[35][it]=drawsim.dataG[2].data[it];  // "Insgesamt Gestorbene" 
      simValid[36][it]=drawsim.dataG[23].data[it]; // "Sim Neuinfiz/Tag"
      simValid[37][it]=drawsim.dataG[28].data[it]; // "Sim Gestorbene"
      simValid[38][it]=drawsim.dataG[32].data[it]; // "Sim Wo-Inzidenz Faelle"
      simValid[39][it]=drawsim.dataG[33].data[it]; // "Sim Wo-Inzidenz Gest."
      simValid[40][it]=drawsim.dataG[29].data[it]; // "Sim Pos pro Tag"
    }
    saveGroundData=false;
  }

  // activate/deactivate validation dispplay

  // [done in DrawSim Cstr which is called in calibrate below]


  // copy working data from full data if validate already used
  // save working data to full data if validate used for the first time

  if(usedValidation){
    dataGit=JSON.parse(JSON.stringify(dataGit_orig)); // full clone
    dataGit2=JSON.parse(JSON.stringify(dataGit2_orig));
    dataRKI=JSON.parse(JSON.stringify(dataRKI_orig));
  }
  else{
    dataGit_orig=JSON.parse(JSON.stringify(dataGit)); // full clone
    dataGit2_orig=JSON.parse(JSON.stringify(dataGit2));
    dataRKI_orig=JSON.parse(JSON.stringify(dataRKI));
    usedValidation=true;
  }

  // strip working data

  for(var attribute in dataGit){
    var n_arr=dataGit[attribute].length;
    var lastDateStr=insertLeadingZeroes(dataGit[attribute][n_arr-1]["date"]);
    var lastDate=new Date(lastDateStr);
    var days2present
      =Math.floor((present.getTime()-lastDate.getTime())/oneDay_ms);
    console.log(
      "dataGit: attribute=",attribute,
      " n_arr=",n_arr," lastDateStr=",lastDateStr,
      //" present=",present," lastDate=",lastDate,
      " days2present=",days2present);

    for(var j=days2present; j<nDaysValid; j++){
      dataGit[attribute].pop();
    }
  }

  for(var attribute in dataGit2){
    var n_arr=dataGit2[attribute]["data"].length;
    var lastDateStr=
      insertLeadingZeroes(dataGit2[attribute]["data"][n_arr-1]["date"]);
    var lastDate=new Date(lastDateStr);
    var days2present
      =Math.floor((present.getTime()-lastDate.getTime())/oneDay_ms);
    console.log(
      "dataGit2: attribute=",attribute,
      " n_arr=",n_arr," lastDateStr=",lastDateStr,
      " days2present=",days2present);

    for(var j=days2present; j<nDaysValid; j++){
      dataGit2[attribute]["data"].pop();
    }
  }

  for(var attribute in dataRKI){
    var n_arr=dataRKI[attribute].length;
    var lastDateStr=insertLeadingZeroes(dataRKI[attribute][n_arr-1]["date"]);
    var lastDate=new Date(lastDateStr);
    var days2present
      =Math.floor((present.getTime()-lastDate.getTime())/oneDay_ms);
    console.log(
      "dataGit: attribute=",attribute,
      " n_arr=",n_arr," lastDateStr=",lastDateStr,
      " days2present=",days2present);

    for(var j=days2present; j<nDaysValid; j++){
      dataRKI[attribute].pop();
    }
  }

  console.log("dataGit=",dataGit," dataGit_orig=",dataGit_orig);
  console.log("dataRKI=",dataRKI," dataRKI_orig=",dataRKI_orig);
  initializeData(country); // includes calibrate()
}


// callback stop & go

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

// callback restart button

function myRestartFunction(){ 
  console.log("in myRestartFunction: itPresent=",itPresent);

  rVacc=0; //!!!! as long as vaccinations not yet in data
  setSlider(slider_rVacc, slider_rVaccText, 700*rVacc, " %/Woche");

  initialize();
  console.log(" myRestartFunction after initialize: drawsim.itmin=",drawsim.itmin);
  fps=fpsstart;
  it=0; //!!! only instance apart from init where global it is reset to zero 
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  fracDie=IFRfun_time(-20); 
  corona.init(0,false); // because initialize redefines CoronaSim()

  clearInterval(myRun);
  drawsim.checkRescaling(it); //  sometimes bug x scaling not reset

  myRun=setInterval(simulationRun, 1000/fps);

   // activate thread if stopped

  if(isStopped){
    isStopped=false;
    document.getElementById("startStop").src="figs/buttonStop3_small.png";
    //myRun=setInterval(simulationRun, 1000/fps);
  }
}


// reset callback
// selectDataCountry selects default sliders for the active country
// => can use it directly as the reset function

function myResetFunction(){ 
  console.log("in myResetFunction");
  R0sliderUsed=false;
  otherSliderUsed=false;
  testSliderUsed=false;
  includeInfluenceTestNumber=true;

  document.getElementById("testnumber").innerHTML
      ="Ignoriere Testhaeufigkeit";  

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

  rVacc=rVaccInit;
  setSlider(slider_rVacc, slider_rVaccText, 700*rVacc, " %/Woche");

  casesInflow=casesInflowInit;
  setSlider(slider_casesInflow, slider_casesInflowText,
	    casesInflow,"/Tag/100 000 Einw.");

  //measures=measuresInit;
  //slider_measures.value=measures; // setSlider does not fit here
  //slider_measuresText.innerHTML="&nbsp;"+str_measures(measures);


  selectDataCountry();  
  myRestartFunction();
}


function myCalibrateFunction(){ 
  R0sliderUsed=false;
  otherSliderUsed=false;
  testSliderUsed=false;
   // calibration unstable with external source => must set to zero
  casesInflow=0;
  setSlider(slider_casesInflow, slider_casesInflowText,
	    casesInflow,"/Tag/100 000 Einw.");
  calibrate();
  myRestartFunction();
}



function simulationRun() {
  var idata=Math.min(data_idataStart+it, data_idataStart+data_itmax-1);
  //console.log("simulationRun: before doSimulationStep: it=",it);
  doSimulationStep(); 
  //console.log("R0sliderUsed=",R0sliderUsed);
  if(!R0sliderUsed){
    setSlider(slider_R0, slider_R0Text, R0fun_time(R0time,it).toFixed(2),"");
    setSlider(slider_R0cp, slider_R0cpText, R0fun_time(R0time,it).toFixed(2),"");
  }

  if((!testSliderUsed)&&includeInfluenceTestNumber){
    setSlider(slider_pTest, slider_pTestText, 
	      //Math.round(100*pTest), " %");
	      (100*data_pTestModelSmooth[idata]).toFixed(2), " %");
  }

  if(!slider_rVacc_moved){
    setSlider(slider_rVacc, slider_rVaccText, (700*rVacc).toFixed(2), " %");
  }
  

  // suffer one undefined at data_cumCases 
  // (doSimulationStep increments it so itPresent-2 would be correct)
  // to get full sim curves (first plot then update 
  // to get the initial point it=0) 

  if(it==itPresent){ // !! itPresent, not itPresent-1 represents present
    console.log("before clearInterval: it=",it);
    clearInterval(myRun);myStartStopFunction();
  }
}

//#########################################
// only called at main run, not warmup
// !! need to plot first
// because warmup already produced start values for it=0
//#########################################

function doSimulationStep(){

  var itSlower=itPresent-42;
  var itFaster=itPresent+56;
  var changed_fps=((it==itSlower)||(it==itFaster));
  if(changed_fps){
    fps=(it==itSlower) ? 0.30*fpsstart : fpsstart;
    //console.log("doSimulationStep: changing fps, new fps=",fps);
    clearInterval(myRun);
    myRun=setInterval(simulationRun, 1000/fps);
  }
  R0_actual=(R0sliderUsed) ? R0 : R0fun_time(R0time,it);
  fracDie= IFRfun_time(it);

  R0_hist[it]=R0_actual;

  if(false){ // doSimulationStep: logging "allowed"
    console.log(" doSimulationStep before corona.update: it=",it,
		"data_cumCases[data_idataStart+it]=",
		data_cumCases[data_idataStart+it],
		" n0*corona.xt=",(n0*corona.xt).toPrecision(6),
		" R0_actual=",R0_actual.toPrecision(3),
		" fracDie=",fracDie.toPrecision(3),
		" corona.z=",Math.round(corona.z),
		"");
  }

  drawsim.draw(it);
 
  var logging=false;  // doSimulationStep: logging "allowed"
  //var logging=(it<3);


  corona.updateOneDay(R0_actual,it,logging); // in doSimulationStep
  it++; //!!! ONLY it main update

  if(false){
    var idata=data_idataStart+it; // not "+1+" since after it++
    console.log(" it=",it,
		" pTest=",pTest.toPrecision(3),
		" dnxtFalse=",Math.round(n0*corona.dxtFalse),
		" data_dxt[idata]=",data_dxt[idata]);
  }

  if(false){// doSimulationStep: logging "allowed"
  //if(true){// doSimulationStep: logging "allowed"
    var idata=data_idataStart+it; // not "+1+" since after it++
    console.log( "doSimulationStep: after it++: it=",it,
		 " R=",R0_actual.toFixed(2),
		" pTest=",pTest.toPrecision(3),
		" ndx=",Math.round(n0*corona.x[0]),
		" ndxt=",Math.round(n0*corona.dxt),
		" ndxtFalse=",Math.round(n0*corona.dxtFalse),
		" nxt=",Math.round(n0*corona.xt),
		" nxtData=",((it<itPresent-1) ? data_cumCases[idata]:"na"),
		" fracDie=",fracDie.toPrecision(3),
		" n0*corona.z=",Math.round(n0*corona.z),
		" deathsData=",((it<itPresent-1) ? data_cumDeaths[idata]:"na"),
		"");
  }


}




//#################################################################
// simulation class. Use global vars just for writing purposes 
// (this "this.*" annoys with time)
//#################################################################

function log10(x){return Math.log(x)/ln10;}





//################################################################
//################################################################

function Vaccination(){
  this.I0=0.95;      // fraction of immune people >=1 week after second vacc.
  this.tau0=28;      // days after full effect I0 is reached (1 week after)
  this.Ivacc=0;      // population immunity fraction by vaccinations
  this.pVaccHist=[]; // history[tau] of vacc percentage pVacc (first vacc.)
  for(var tau=0; tau<this.tau0; tau++){
    this.pVaccHist[tau]=0;
  }
  // cannot use this.initialize here
}

Vaccination.prototype.initialize=function(){
  this.Ivacc=0;
  for(var tau=0; tau<this.tau0; tau++){
    this.pVaccHist[tau]=0;
  }
}

Vaccination.prototype.update=function(rVacc,it,logging){
  if(true){
  //if(it>=itPresent-4){ // !! change later if data on vaccinations go into calib
    for(var tau=this.tau0-1; tau>0; tau--){
      this.pVaccHist[tau]=this.pVaccHist[tau-1];
    }
    this.pVaccHist[0]=Math.min(this.pVaccHist[0]+rVacc,1);
    pVacc=this.pVaccHist[0]; // global var for display
    this.Ivacc +=this.I0/(this.tau0-1) // (this.tau0-1) Gartenzauneffekt OK
      *(this.pVaccHist[0]-this.pVaccHist[this.tau0-1]);
    if(logging){
      console.log("Vaccination.update: this.tau0=",this.tau0," it=",it,
		  "\n this.pVaccHist[0]=",this.pVaccHist[0],
		  " this.pVaccHist[this.tau0-1]=",this.pVaccHist[this.tau0-1],
		  " this.Ivacc=",this.Ivacc);
    }
  }
}



function CoronaSim(){
  //console.log("CoronaSim created");
  this.x=[]; // age struture f(tau|it) of frac infected at given timestep it
  this.xohne=[]; // age structure without deleting by recover,death 
                 // (!!needed for correct recovery rate and balance x,y,z!)
  this.xnewShiftedTauDie=[]; // fraction new infected as f(timestep it),
  this.snapAvailable=false; // initially, no snapshot of the state exists
  this.Reff=1.11;    // need some start ecause otherwise bug at drawing
                     // undeterministic too early calling of drawsim 
  this.vaccination=new Vaccination();
}


//!! need to chose appropriate fracDie before!

CoronaSim.prototype.init=function(itStart,logging){

  if( typeof logging === "undefined"){logging=false;}

  var idataStart=data_idataStart+itStart;
  var nxtStart=data_cumCases[idataStart]; // target number of cum cases at iStart=^ local variable idataStart



  // start warmup at a very early phase
  // !! start with n0*this.xAct>=1, otherwise infection dead
  // feature, not bug

  //##############################################################
  // !! it BEFORE warmup. Becaue this.xt is cumulative 
  // but this.xAct and this.x[] is not, need ALWAYS to start
  // at the very beginning also for large itStart
  // unless following is saved at it=itStart:

  // (1) this.x[] (this.xAct=sum(this.x[])
  // (2) this.y, this.z  (in contrast to x[] and xAct cumulative, 
  //                      => need to save as well 
  //                      although not contained in dynamics)
  // (3) this.xyz (cumulated this.x[0] + this.y + this.z, IN dynamics (sat.)
  //               canNOT be derived from the other quantities
  // (4) this.xt, this.yt (outside dynamics 
  //                       but needed for calibr, at least xt)
  //##############################################################


  //var it0=Math.max(-21, itStart-28); // it BEFORE warmup
  var it0=-21; // it BEFORE warmup

  // xAct: sum of "actually infected" this.x[tau] (neither rec. nor dead)
  // xyz: cumulative sum of infected (incl recovered, dead)
  this.xAct=10/n0; // must be >1, otherwise eliminated
  this.xyz =this.xAct;
  this.xt  =0; // fraction of positively tested persons/n0 as f(t)
  //this.xt  =pTest*this.xyz; // fraction of positively tested persons/n0 as f(t)

  this.y=0;  // fraction recovered real as a function of time
  //this.yt=0; // fraction recovered data
  this.z=0;  // fraction dead (real=data)
  //this.pTestDay=[]; // fraction of tested among the new infected
  //for(var i=0; i<500; i++){ // just initialisation for the first few steps
   // this.pTestDay[i]=pTest;
 // }

  // init infection-age profile this.x[tau] with exponential
  // initial exponential rate r0 per day  (don't confuse r0 with R0)

  var tauR=0.5*(tauRstart+tauRend)// middle period for one repro cycle
  var r0=Math.log(R0fun_time(R0time,it0))/tauR;  // init reprod rate by stable R0fun_*
  var denom=0; 

  for(var tau=0; tau<taumax; tau++){
    denom+=Math.exp(-r0*tau);
  }
  for(var tau=0; tau<taumax; tau++){ // in init
    this.x[tau]=this.xAct*Math.exp(-r0*tau)/denom;
    this.xohne[tau]=this.x[tau];
    if(false){console.log("init: it0=",it0," R0=",R0fun_time(R0time,it0),
			    " r0=",r0," tau=",tau,
			    " this.x[tau]=",this.x[tau]);}
  }

  // data-driven warmup

  // !!! loggingDebug global variable
  
  //loggingDebug=logging&&useLandkreise;
  loggingDebug=false; 

  if(loggingDebug){
    console.log("corona.init warmup:  it0=",it0," itStart=",itStart,
		"\n R0time=",R0time);
  }

  for(var its=it0; its<itStart; its++){ 
    var Rt=R0fun_time(R0time,its); // !!! uses loggingDebug as global variable

    //if(logging&&useLandkreise){
    if(logging&&false){
      console.log("corona.init warmup before update: its=",its,
			    " pTest=",pTest.toPrecision(3),
			    " R=",Rt.toFixed(2),
			    " ndx=",(n0*this.x[0]).toPrecision(3),
			    " ndxt=",(n0*this.dxt).toPrecision(3),
			    " ndxtFalse=",(n0*this.dxtFalse).toPrecision(3),
			    "");}
    this.updateOneDay(Rt,its,logging); // in CoronaSim, data-driven warmup
  }
  loggingDebug=false; 


  if(logging){
    console.log("corona.init, before scaledown: nxtStart=",nxtStart,
		" n0*this.xt=",n0*this.xt);
  }


  // scale down to match init value of n0*this.xt 
  // exactly to data nxtStart
 
  var scaleDownFact=nxtStart/(n0*this.xt);
  this.xAct     *= scaleDownFact;
  this.xyz      *= scaleDownFact;
  this.xt       *= scaleDownFact;
  this.dx       *= scaleDownFact;
  this.dxt      *= scaleDownFact;
  this.y        *= scaleDownFact;
  this.z        *= scaleDownFact;
  this.dxtFalse = 0; //!!
  //this.dxtFalse=(data_dn[data_idataStart]/n0 
//		 - pTest*this.xohne[tauTest])*betaTest;//!!

  for(var tau=0; tau<taumax; tau++){
    this.x[tau]     *= scaleDownFact;
    this.xohne[tau] *= scaleDownFact;
  }

  // reset it for start of proper simulation


  if(logging){
    console.log("CoronaSim.init after warmup: itStart=",itStart,
		"\n  n0*this.x[0]=",Math.round(n0*this.x[0]),
		"\n  n0*this.dxt=",Math.round(n0*this.dxt),
		"\n  n0*this.dxtFalse=",Math.round(n0*this.dxtFalse),
		"\n  n0*this.z=",Math.round(n0*this.z),
		"");
  }

 }//init




//#################################################################
  // save/set complete state (take snapshot of all the variables needed
  // to resume the simulation at a given timestep later on:

  // (1) this.x[] (this.xAct=sum(this.x[]),
  // (2) this.y, this.z  (in contrast to x[] and xAct cumulative, 
  //                      => need to save as well 
  //                      although not contained in dynamics)
  // (3) this.xyz (cumulated this.x[0] IN dynamics (herd immunity fraction)
  //               canNOT be derived from the other quantities
  // (4) this.xt, this.yt (outside dynamics 
  //                       but needed for calibr, at least xt)
  // called by SSEfunc which is also in control of the time itsnap for it
//#################################################################

CoronaSim.prototype.takeSnapshot=function(it){
  this.snapAvailable=true;
  this.snapshot={
    it:   it,
    x:    [],
    xohne:[],
    xAct: this.xAct,
    y:    this.y,
    z:    this.z,
    xyz:  this.xyz,
    xt:   this.xt
  }

  for(var tau=0; tau<taumax; tau++){ // copy by value
    this.snapshot.x[tau]=this.x[tau];
    this.snapshot.xohne[tau]=this.xohne[tau];
  }

  if(false){
    console.log(
      "corona.takeSnapshot: this.snapshot.it=",this.snapshot.it,
      "\n  this.snapshot.xAct=",this.snapshot.xAct.toPrecision(3),
      "\n  this.snapshot.xt=",this.snapshot.xt.toPrecision(3),
      "\n  this.snapshot.y=",this.snapshot.y.toPrecision(3),
      "\n  this.snapshot.z=",this.snapshot.z.toPrecision(3),
      "\n  this.snapshot.xyz=",this.snapshot.xyz.toPrecision(3),
      "\n  this.snapshot.x[tauDie]=",this.snapshot.x[tauDie].toPrecision(3),
      "\n  this.snapshot.xohne[tauDie]=",this.snapshot.xohne[tauDie].toPrecision(3),
      "");
  }

}



CoronaSim.prototype.setStateFromSnapshot=function(){
  this.snapshot.it;
  for(var tau=0; tau<taumax; tau++){
    this.x[tau]=this.snapshot.x[tau];
    this.xohne[tau]=this.snapshot.xohne[tau];
  }
  this.xAct=this.snapshot.xAct;
  this.y   =this.snapshot.y;
  this.z   =this.snapshot.z;
  this.xyz =this.snapshot.xyz;
  this.xt  =this.snapshot.xt;
  if(false){
    console.log(
      "corona.setStateFromSnapshot: this.snapshot.it=",this.snapshot.it,
      "\n  this.xAct=",this.xAct.toPrecision(3),
      "\n  this.xt=",this.xt.toPrecision(3),
      "\n  this.y=",this.y.toPrecision(3),
      "\n  this.z=",this.z.toPrecision(3),
      "\n  this.xyz=",this.xyz.toPrecision(3),
      "\n  this.x[tauDie]=",this.x[tauDie].toPrecision(3),
      "\n  this.xohne[tauDie]=",this.xohne[tauDie].toPrecision(3),
      "");

    if(false) console.log("corona.setStateFromSnapshot: this.x=",this.x);

  }
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

CoronaSim.prototype.updateOneDay=function(R0,it,logging){ 

  if( typeof logging === "undefined"){logging=false;}
  //logging=logging&&(it>=83)&&(it<86);//!!
  //logging=false; //!!



  //if(logging){  //filter because of called mult times in calibr!
  if(logging&&useLandkreise&&(it<10)){//filter because of calibr!
  //if(logging&&((it==-10)||(it==10))){
    console.log(
      "Enter CoronaSim.updateOneDay: it=",it," R0=",R0.toPrecision(2),
      " this.xAct=",this.xAct.toPrecision(2),
      " this.xyz=",this.xyz.toPrecision(2),
      " this.y=",this.y.toPrecision(2),
      " this.z=",this.z.toPrecision(2),
      " nxt=n0*this.xt=",Math.round(n0*this.xt),
      " fracDie=",fracDie.toPrecision(2),
      " nzSim=",Math.round(n0*this.xt),
      //"\n  this.x[tauDie-1]=",this.x[tauDie-1].toPrecision(3),
      //"\n  this.x[tauDie]=",this.x[tauDie].toPrecision(3),
      //"\n  this.x[tauDie+1]=",this.x[tauDie+1].toPrecision(3),
      //"\n  this.x[tauRecover-1]=",this.x[tauRecover-1].toPrecision(3),
      //"\n  this.x[tauRecover]=",this.x[tauRecover].toPrecision(3),
      //"\n  this.x[tauRecover+1]=",this.x[tauRecover+1].toPrecision(3),
      "");
  }


  // ###############################################
  // updateOneDay: Do the true actual dynamics
  // ###############################################


  // ###############################################
  // true dynamics (0): calculate the factors contributing to the
  //                    main infection process at step (2)
  // ###############################################

  if(it==0){this.vaccination.initialize();}


  // IvaccArr[it]: global fixed vacc immunity time profile
  // generated interactively here, if outside calibration
  
  var Ivacc=(it>=0) ? IvaccArr[it] : 0; // inside calibration with profile

  if(!inCalibration){
    if(!slider_rVacc_moved){ // if slider moved, rVacc directly from slider
      var i=it+data_idataStart;
      if(i<0){rVacc=0;}
      rVacc=(i<data_rVacc.length)
	? data_rVacc[i] : data_rVacc[data_rVacc.length-1];
    }
    this.vaccination.update(rVacc,it,logging);
    Ivacc=this.vaccination.Ivacc; //!!! geht nicht bei calibration
  }
  
  if(it>=itPresent){
    console.log("inCalibration=",inCalibration,
		" slider_rVacc_moved=",slider_rVacc_moved,
		" rVacc=",rVacc,
		" Ivacc=",Ivacc);
  }
  this.Reff=R0*(1-Ivacc)*(1-this.xyz)
    * ((it<=itPresent) ? 1 : calc_seasonFactor(it));

  // source term from external trips

  var x0source=casesInflow/100000; // from returners of foreign regions

  
  // ###############################################
  // true dynamics (1): shift age profile of already infected by one
  // ###############################################

  for(var tau=taumax-1; tau>0; tau--){
    this.x[tau]=this.x[tau-1];
    this.xohne[tau]=this.xohne[tau-1];
  }


  // ###############################################
  // true dynamics (2): infect new people
  // ###############################################

  this.x[0]=x0source;
  var f_R=1./(tauRend-tauRstart+1);

  if(n0*this.xAct>=1){ // !! infection finally dead if xAct<1
    for(var tau=tauRstart; tau<=tauRend; tau++){
      this.x[0]+=this.Reff*f_R*this.x[tau];
    }
  }

  this.xohne[0]=this.x[0];



  // ###############################################
  // true dynamics (3): let people die or recover
  // smooth  over tauAvg days
  // ###############################################

  var dtau=Math.floor(tauAvg/2); // tauAvg is global uneven variable, e.g.=5
  var f_D=1./tauAvg;

  this.dz=0;
  var dysum=0;

  for(var tau=tauDie-dtau; tau<=tauDie+dtau; tau++){
    var dztau=fracDie*f_D*this.xohne[tau]; //!! here xohne crucial
    this.dz+=dztau;
    this.x[tau] -=dztau; // xohne remains unsubtracted
  }


  var f_Rec=1./tauAvg;
  for(var tau=tauRecover-dtau; tau<=tauRecover+dtau; tau++){
    var dy=(1-fracDie)*f_Rec*this.xohne[tau]; //!! here xohne crucial
    dysum+=dy;
    this.x[tau] -=dy; // xohne remains unsubtracted
  }
  this.z   += this.dz;
  this.y   += dysum;


  // ###############################################
  // (4) sum up the profile of infected people
  // xAct: relative sum of "actually infected" (neither recoverd nor dead)
  // xyz: relative cumulative sum of infected (incl recovered, dead)
  // ###############################################

  // MT 2020-12-23 fraction of newly infected at time it 
  // for later use direct calibr IFR
  if((it>=-tauDie)&&(it<itPresent)){
    this.xnewShiftedTauDie[it+tauDie]=this.x[0];
  }
  this.xyz+= this.x[0]; // cumulative fraction of newly infected

  this.xAct=0;  
  for(var tau=0; tau<taumax; tau++){
    this.xAct     += this.x[tau];
  }



  //#####################################################
  // Test people (in updateOneDay)
  //#####################################################



  // (1) simulated positive tests
  // test time ~ U(tauTest-tauAvg/2,tauTest+tauAvg/2) over infection age

  // sim from it to it+1, hence "+1"
  var idata=Math.max(it+data_idataStart+1, 0); 

  // possibly override slider-controlled pTest with the square-root model;
  // in forecast mode constant trend  with seasonal pattern

  if(includeInfluenceTestNumber){ 
    if(idata<data_pTestModel.length){pTest=data_pTestModel[idata];} 
    else{pTest=pTest_weeklyPattern[(idata-data_pTestModel.length)%7];} 
  }

  var dtau=Math.min(Math.floor(tauAvg/2),Math.round(tauTest));
  var f_T=1./(2*dtau+1);
  this.dxt=0;
  for(var tau=tauTest-dtau; tau<=tauTest+dtau; tau++){
    this.dxt +=pTest*f_T*this.xohne[tau]*(1-alphaTest);
  }

  // add beta error outside tau loop (the test gets dn-pTest*n0*this.xohne
  // noninfected people ) and increment cumulative this.xt
  // Math.min(.) prevents a larger number of false positives than cases

  if(it>=0){// do not use absolute data such as data_dn in warmup!

    if(includeInfluenceTestNumber){ 
      var dn=(idata<data_dn.length)
	? data_dn[idata] : dn_weeklyPattern[(idata-data_pTestModel.length)%7];
      this.dxtFalse=(dn/n0 - pTest*this.xohne[tauTest])*betaTest;
      this.dxtFalse=Math.min(this.dxtFalse, 0.9*this.dxt); 
    }

    // no influence of test number 
    // => prob tree nt with p infected->1-alpha pos, alpha neg
    // 1-p ot infected, beta ->pos, 1-beta->neg

    else{ 
      var dn=n0*pTest*pTest/7.; // comes from sqrt model
      var p=7*this.dxt/(n0*pTest); 
      this.dxtFalse=dn/n0*(1-p)*betaTest;
      this.dxtFalse=Math.min(this.dxtFalse, 0.9*this.dxt); 
    }

    if(idata==data_dn.length-1){// save relative value of false positives
      this.falseTrueRatio=this.dxtFalse/this.dxt;
    }
 
    //this.dxt still only true pos.; define this.dxtFalse before this!

    if(idata>=data_dn.length){
      this.dxtFalse=this.falseTrueRatio*this.dxt; 
    }
    this.dxt+=this.dxtFalse;

  }

  this.xt += this.dxt;




  //##########################################################
  // Debug output (filter needed because called in calibration)
  //##########################################################

  //if(false){ // filter needed because called in calibration
  //if(logging&&useLandkreise&&(it<10)){ // filter needed because calibration!
  if(false&&(it>=itPresent)){ // it<itPresent in calibration => not reached
    console.log(
      "end CoronaSim.updateOneDay: it=",it," R0=",R0.toPrecision(2),
      " dnxt=",Math.round(n0*this.dxt),
      " this.xAct=",this.xAct.toPrecision(3),
      " idata=",idata," data_pTestModel.length=",data_pTestModel.length,
      " pTest=",pTest,
     // " this.xyz=",this.xyz.toPrecision(3),
     // " pTest=",pTest.toPrecision(3), //!! undefined for Dresden etc
     // " this.y=",this.y.toPrecision(3),
     // " this.z=",this.z.toPrecision(3),
	//	" nxt=n0*this.xt=",Math.round(n0*this.xt),
      //"\n  this.x[tauDie-1]=",this.x[tauDie-1].toPrecision(3),
      //"    this.xohne[tauDie-1]=",this.xohne[tauDie-1].toPrecision(3),
      //"\n  this.x[tauDie]=",this.x[tauDie].toPrecision(3),
      //"    this.xohne[tauDie]=",this.xohne[tauDie].toPrecision(3),
      //"\n  this.x[tauDie+1]=",this.x[tauDie+1].toPrecision(3),
      //"    this.xohne[tauDie+1]=",this.xohne[tauDie+1].toPrecision(3),
     // "\n  this.x[tauRecover-1]=",this.x[tauRecover-1].toPrecision(3),
      //"\n  this.x[tauRecover]=",this.x[tauRecover].toPrecision(3),
      //"\n  this.x[tauRecover+1]=",this.x[tauRecover+1].toPrecision(3),
      "");
  }


} // CoronaSim.updateOneDay






// Helper function for drawing class: data smoothing
// arithmetic average of order tau

function avgArithm(arr,tau){
  var kernel=[];
  var half=(tau%2==0) ? Math.round(tau/2) : Math.round((tau-1)/2);

  for(var i=0; i<arr.length; i++){smooth[i]=0;}
  for(var di=-half; di<=half; di++){
    kernel[di+half]=1./tau;
  }
  if(tau%2==0){
    kernel[0]/=2;
    kernel[2*half]/=2;
  }

  return smooth(arr, kernel);
}


// kernel must have odd #points
// although negative indices allowed, unstable: 
// length and initializer expect all indices starting at 0

function smooth(arr, kernel){
  if(kernel.length%2==0){
    console.log("smooth: error: kernel.length=",kernel.length,
		" provided kernel must have an uneven number of points");
    return arr;
  }

  var smooth=[]; 
  for(var i=0; i<arr.length; i++){smooth[i]=0;}
  var half=Math.round((kernel.length-1)/2);
  for(var i=half; i<arr.length-half; i++){
    for(var di=-half; di<=half; di++){
      smooth[i]+=kernel[half+di]*arr[i+di];
      //if(i==Math.round(arr.length/2)){
      //  console.log("i=",i, "di=",di," kernel[half+di]=",kernel[half+di],
      //    " arr[i+di]=",arr[i+di]);
      //}
    }
  }

  // lower boundary: just the input (not relevant)

  for(var i=0; i<half; i++){smooth[i]=arr[i];} // lower boundary not relevant


  // upper boundary treatment with or without seasonal analysis
  
  var applySmoothingSeason=false;

  if(!applySmoothingSeason){ // no season analysis
    // just take raw data
    // for(var i=arr.length-half; i<arr.length; i++){smooth[i]=arr[i];}

    // use smaller filters (smooth[i]=0 already set at beginning)
    for(var i=arr.length-half; i<arr.length; i++){
      var halfRed=arr.length-i-1;
      var denom=0;
      for(var di=-halfRed; di<=halfRed; di++){
	denom+= kernel[half+di];
      }
      for(var di=-halfRed; di<=halfRed; di++){
        smooth[i]+=kernel[half+di]/denom * arr[i+di];
      }
    }
  }

  else{// assume 7d period

    var n=arr.length;
    var trendLen=3; // 3 periods (in this application, data always available)
    //console.log("\nsmoothUpper: ");
    //for(var i=n-10; i<n; i++){console.log("i=",i," arr[i]=",arr[i]);}


    var T=[]; // trend
    var S=[]; // period-7 saison characteristics

    // trend

    for(var i=n-3-7*trendLen; i<n-3; i++){ // 3, not half
      T[i]=0;
      for(var j=i-3; j<=i+3; j++){
	T[i]+=arr[j]/7;
      }
      //console.log("i=",i," n=",n," arr[i]=",arr[i]," T[i]=",T[i]);
    }

    // saison characteristics

    for(var k=0; k<7; k++){S[k]=0;}
    for(var i=n-3-7*trendLen; i<n-3; i++){
      k=i%7;
      S[k] += (arr[i]-T[i])/trendLen;
    }
    //for(var k=0; k<7; k++){console.log("k=",k, " e^S[k]=",Math.exp(S[k]));}

    // extrapolation: saison*trend

    var ilast=arr.length-Math.max(half,3)-1;
    for(var i=arr.length-half; i<arr.length; i++){
      
      T[i]=T[ilast]+(i-ilast)*(T[ilast]-T[ilast-7])/7;
      smooth[i]=T[i]+S[i%7];
    }
  }
 

  //for(var i=arr.length-21; i<arr.length; i++){
  //  console.log("i=",i," arr[i]=",arr[i]," smooth[i]=",smooth[i]); }

  return smooth;
}




//#################################################################
// Drawing class (graphics)
//#################################################################

function DrawSim(){

  //console.log("DrawSim created");

  // windowG:
  // 0=cum,1=log,2=casesReal,3=tests,4=rates,5=casesDaily,6=incidence 

  this.unitPers=1000;  // persons counted in multiples of unitPers

  this.yminType=[0,1,0,0,0,0,0];  
  this.ymaxType=[1,6,2,2,2,2,1]; 

  this.mirroredGraphics=false; // if death counts upside down

  this.timeWindow=180; // moving window of width this.timeWindow days
  this.xPix=[]; // this.xPix0 etc defined in corona_gui.js
  this.itmin=0; 
  this.itmax=this.timeWindow; 
 
  colCasesCum="rgb(245,10,0)"; // cumulated plots
  colCasesCumSim="rgb(255,0,0)"; // cumulated plots
  colCasesCumValid="rgb(255,120,10)";
  colCasesRecovCum="rgb(0,150,40)";
  colCasesRecovCumSim="rgb(0,150,40)";
  colCasesBars="rgb(255,150,0)";  // main plots
  colCasesSim="rgb(255,0,0)";
  colCasesValid="rgb(140,0,140)";
  colFalsePos="rgb(0,220,0)";
  colDead="rgb(0,0,0)";  
  colDeadValid="rgb(180,180,180)";  
  colDeadSim="rgb(120,120,120)";  
  colPosrate="rgb(255,0,255)"; 
  colCFR="rgb(100,0,180)";  
  colIFR="rgb(127,127,127)";
  colInfectedReal="rgb(255,150,0)";
  colInfectedLin="rgb(140,0,140)";
  colInfectedLinValid="rgb(255,50,255)";
  colInfectedTot="rgb(0,0,220)";
  colTests="rgb(0,0,210)";



  // central container for the graphics data

  this.dataG=[];
  this.xtPast=0; // needed to derive yt from balance since no longer calc.


// window 0 "Kumulierte Faelle" (sim+data cumulated)

  this.dataG[0]={key: "Insgesamt positiv Getestete (in 1000)",
		 data: [],
		 type: 3, // 0=data dir (posCases),
                          // 1=solid deriv from data (CFR), 
                          // 2=more speculative derivation (IFR)
                          // 3=simulation, 4=speculative simulation
		 plottype: "lines",  // in "lines", "points", "bars"
		 plotLog: false,  // if true, logarithm plotted
		 ytrafo: [0.001, false,false],// [scalefact, half, mirrored]
		 color:colCasesCumSim
		}

  this.dataG[34]={key: "Validierungsreferenz: alle Daten",
                                    //Insgesamt positiv Getestete (in 1000)"
		 data: simValid[34], // simValid[][] defined in validate()
		 type: 3, // 0=data dir (posCases),
                          // 1=solid deriv from data (CFR), 
                          // 2=more speculative derivation (IFR)
                          // 3=simulation, 4=speculative simulation
		 plottype: "lines",  // in "lines", "points", "bars"
		 plotLog: false,  // if true, logarithm plotted
		 ytrafo: [0.001, false,false],// [scalefact, half, mirrored]
		 color:colCasesCumValid
		}

  this.dataG[1]={key: "Insg. Genesene unter den Getesteten (in 1000)",data:[],
		 type: 3, plottype: "lines", plotLog: false, 
		 ytrafo: [0.001, false,false],
		 color:colCasesRecovCumSim};


  this.dataG[2]={key: "Insgesamt Gestorbene (in 100)", data: [],
		 type: 3, plottype: "lines", plotLog: false, 
		 ytrafo: [0.01, false,false],
		 color:colDead};
  
  this.dataG[35]={key: "Validierungsreferenz: alle Daten",
                                   //Insgesamt Gestorbene (in 100)", 
		  data: simValid[35], // simValid[][] defined in validate()
		  type: 3, plottype: "lines", plotLog: false, 
		  ytrafo: [0.01, false,false],
		  color:colDeadValid};

 // this.dataG[3]={key: "#Tote ges/#positiv getestet ges", data: [],
//		 type: 3, plottype: "lines", plotLog: false,
//		  ytrafo: [1, false,false], color:colPosrateCum};


  this.dataG[4]={key: "Insgesamt positiv Getestete (in 1000)",data: [],
		 type: 0, plottype: "points", plotLog: false, 
		 ytrafo: [0.001, false,false], color:colCasesCum};

  this.dataG[5]={key: "Insg. Genesene unter den Getesteten (in 1000)",data:[],
		 type: 0, plottype: "points", plotLog: false, 
		 ytrafo: [0.001, false,false], color:colCasesRecovCum};

  this.dataG[6]={key: "Insgesamt Gestorbene (in 100)", data: [],
		 type: 0, plottype: "points", plotLog: false, 
		 ytrafo: [0.01, false,false], color:colDead};

 // this.dataG[7]={key: "#Tote ges/#positiv getestet ges", data: [],
//		 type: 0, plottype: "points", plotLog: false,
//		  ytrafo: [1, false,false], color:colPosrateCum};



  
  // window 1 "Simulationen (log)" (sim+data log)


  this.dataG[8]={key: "Aktuell real infizierte Personen", data: [],
		 type: 4, plottype: "lines", plotLog: true, 
		 ytrafo: [1, false,false],
		 color:colInfectedReal};

  this.dataG[9]={key: "Insgesamt positiv Getestete", data: [],
		 type: 3, plottype: "lines", plotLog: true, 
		 ytrafo: [1, false,false],
		 color:colCasesCumSim};

  this.dataG[12]={key: "Insgesamt Gestorbene", data: [],
		  type: 3, plottype: "lines", plotLog: true, 
		  ytrafo: [1, false,false],
		  color:colDead};

  this.dataG[13]={key: "Insgesamt positiv Getestete", data: [],
		  type: 0, plottype: "points", plotLog: true, 
		  ytrafo: [1, false,false],
		  color:colCasesCum};

  this.dataG[14]={key: "Insgesamt Genesene unter den Getesteten", data: [],
		  type: 0, plottype: "points", plotLog: true, 
		  ytrafo: [1, false,false], color: colCasesRecovCum};

  this.dataG[15]={key: "Insgesamt Gestorbene", data: [],
		  type: 0, plottype: "points", plotLog: true, 
		  ytrafo: [1, false,false], color:colDead};

  this.dataG[25]={key: "Simulierte Durchseuchung", data: [],
		 type: 4, plottype: "lines", plotLog: true, 
		 ytrafo: [1, false,false], color:colInfectedTot};



  // window 2: "Faelle vs Infizierte" mirrored bar chart cases vs dead persons
  // ytrafo=[scalefact, half, mirrored] 

  this.dataG[16]={key: "Positiv Getestete pro Tag", data: [],
		 type: 0, plottype: "bars", plotLog: false, 
		 ytrafo: [0.1, true,false], color:colCasesBars}; 
                 // real: scale*10

  this.dataG[17]={key: "Gestorbene pro Tag", data: [],
		 type: 0, plottype: "bars", plotLog: false, 
		 ytrafo: [1, true,true], color:colDead};

  this.dataG[23]={key: "Simulierte Neuinfizierte pro Tag (in 10)", data: [],
		 type: 4, plottype: "lines", plotLog: false, 
		 ytrafo: [0.01, true,false], color:colInfectedLin};
                 // real: scale*10
  this.dataG[36]={key: "Validierungsreferenz: alle Daten",
                       //Simulierte Neuinfizierte pro Tag (in 10)", 
                  data: simValid[36],
		 type: 4, plottype: "lines", plotLog: false, 
		 ytrafo: [0.01, true,false], color:colInfectedLinValid};
                 // real: scale*10

  this.dataG[28]={key: "Simulierte Gestorbene pro Tag", data: [],
		 type: 4, plottype: "lines", plotLog: false, 
		 ytrafo: [1, true,true], color:colDeadSim};
  this.dataG[37]={key: "Validierungsreferenz: alle Daten", // sim Gestorbene
                 data: simValid[37],
		 type: 4, plottype: "lines", plotLog: false, 
		 ytrafo: [1, true,true], color:colDeadValid};




  // window 3: "Daten: Tests
  // ytrafo=[scalefact, half, mirrored]

  this.dataG[18]={key: "Positiv Getestete pro Tag", data: [],
		 type: 0, plottype: "bars", plotLog: false, 
		 ytrafo: [1, false,false], color:colCasesBars};

  this.dataG[19]={key: "Tests pro Tag (in 100)", data: [],
		 type: 0, plottype: "points", plotLog: false, 
		 ytrafo: [0.01, false,false], color:colTests};

  this.dataG[24]={key: "Simulierte Neuinfizierte pro Tag (in 10)", data: [],
		 type: 4, plottype: "lines", plotLog: false, 
		 ytrafo: [0.1, false,false], color:colInfectedLin};

  this.dataG[26]={key: "Simulierte False Positives pro Tag", data: [],
		 type: 4, plottype: "lines", plotLog: false, 
		 ytrafo: [1, false,false], color:colFalsePos};

  this.dataG[27]={key: "Simulierte Test-Positive pro Tag", data: [],
		 type: 3, plottype: "lines", plotLog: false, 
		 ytrafo: [1, false,false], color:colCasesSim};


  // window 4: infection ratios

  this.dataG[20]={key: "Anteil positiver Tests [%]", data: [],
		 type: 0, plottype: "points", plotLog: false, 
		 ytrafo: [100, false,false], color:colPosrate};

  this.dataG[21]={key: "CFR (Case fatality rate) [%]", data: [],
		 type: 1, plottype: "points", plotLog: false, 
		 ytrafo: [100, false,false], color:colCFR};

  this.dataG[22]={key: "Sim IFR (Infection fatality rate) [Promille]", data: [],
		 type: 4, plottype: "lines", plotLog: false, 
		 ytrafo: [1000, false,false], color:colIFR};


// window 5: "Taegliche Faelle"  (plus this.dataG[16], [17], [28])


  this.dataG[29]={key: "Simulierte Test-Positive pro Tag", data: [],
		 type: 3, plottype: "lines", plotLog: false, 
		 ytrafo: [0.1, true,false], color:colCasesSim};

  this.dataG[40]={key: "Validierungsreferenz: alle Daten",
		  data: simValid[40],
		  type: 3, plottype: "lines", plotLog: false, 
		  ytrafo: [0.1, true,false], color:colCasesValid};


// new window 6 weekly incidence

  this.dataG[30]={key: "Wocheninzidenz pro 100 000", data: [],
		 type: 0, plottype: "bars", plotLog: false, 
		 ytrafo: [0.1, true,false], color:colCasesBars}; // real: scale*10

  this.dataG[31]={key: "Woechentlich Gestorbene pro 100 000", data: [],
		 type: 0, plottype: "bars", plotLog: false, 
		 ytrafo: [1, true,true], color:colDead};


  this.dataG[32]={key: "Simulierte Wocheninzidenz Faelle", data: [],
		 type: 3, plottype: "lines", plotLog: false, 
		 ytrafo: [0.1, true,false], color:colCasesSim};

  this.dataG[38]={key: "Validierungsreferenz: alle Daten", // Wocheninzidenz
		  data: simValid[38],
		  type: 3, plottype: "lines", plotLog: false, 
		  ytrafo: [0.1, true,false], color:colCasesValid};

  this.dataG[33]={key: "Simulierte Wocheninzidenz Gestorbene", 
		  data: [],
		  type: 4, plottype: "lines", plotLog: false, 
		  ytrafo: [1, true,true], color:colDeadSim};
  this.dataG[39]={key: "Validierungsreferenz: alle Daten", // W-Inz. Gest
		  data: simValid[39],
		  type: 4, plottype: "lines", plotLog: false, 
		  ytrafo: [1, true,true], color:colDeadValid};





// quantity selector for the different display windows
// array indices>=34: validation reference
// 0=cum,1=log,2=casesReal,3=tests,4=rates,5=casesDaily,6=incidence 

  this.qselectRegular=[];
  this.qselectValid=[];
  this.qselect=[];

  this.qselectRegular[0]=[0,1,2,4,5,6];     // "kumulierte Faelle"
  this.qselectRegular[1]=[8,9,12,13,15,25]; // "Simulationen (log)"
  this.qselectRegular[2]=[16,17,23,28];     // "Faelle vs Infizierte"
  this.qselectRegular[3]=[18,19,24,26,27];  // "Daten: Tests"
  this.qselectRegular[4]=[20,21,22];        // "Infektionsraten"
  this.qselectRegular[5]=[16,17,28,29];     // "Taegliche Faelle"
  this.qselectRegular[6]=[30,31,32,33];     // "Wochen-Inzidenz"

  this.qselectValid[0]=[0,34,1,2,35,4,5,6];  
  this.qselectValid[1]=[8,9,12,13,15,25];
  this.qselectValid[2]=[16,17,23,36,28,37];
  this.qselectValid[3]=[18,19,24,26,27];
  this.qselectValid[4]=[20,21,22];
  this.qselectValid[5]=[16,17,28,37,29,40];
  this.qselectValid[6]=[30,31,32,38,33,39];

  for(var iw=0; iw<this.qselectRegular.length; iw++){
    this.qselect[iw]=
      (nDaysValid>0) ? this.qselectValid[iw] : this.qselectRegular[iw];
  }

  console.log("\n\n\nDrawSim Cstr: nDaysValid=",nDaysValid," this.itmin=",this.itmin);

  this.label_y_window=[countryGer+": Personenzahl (in Tausend)",
		       countryGer+": Personenzahl",
		       countryGer+": Personen pro Tag",
		       countryGer+": taegliche Zahlen",
		       countryGer+": Anteil [% oder Promille]",
		       countryGer+": Personen pro Tag",
		       countryGer+": Pers./Woche/100 000 Ew."
];


  // initialize data feed and fonts at drawSim/drawAxes since sometimes
  // data fetch not yet finished/canvas not yet sized at construction time

  //console.log("end drawsim cstr: windowG=",windowG);
 
}


DrawSim.prototype.setWindow=function(windowG){
  var displayRecovered=( (country==="Germany")
			     ||(country==="Austria")
			     ||(country==="Czechia")
			     ||(country==="Switzerland")
			     ||(country==="India"));

  if(!displayRecovered){
    this.qselect[0]=(nDaysValid>0) ? [0,2,4,6,34,35] : [0,2,4,6];
  }



  this.clear();
  //this.drawAxes(windowG);

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


// windowG={0=cum,1=log,2=casesReal,3=tests,4=rates,5=casesDaily,6=incidence} 
DrawSim.prototype.drawAxes=function(windowG){

  // update the font (drawAxes called at first drawing and after all 
  // canvas/display changes)

  ctx.font = textsize+"px Arial"; 



  // define x axis label positions and strings, time starts Mar 20

  var timeTextW=[];
  var timeText=[];
  var days=[];
  var timeRel=[]; // days relative to this.itmax-this.itmin
  var options = {month: "short", day: "2-digit"};
  //var year=startDay.getFullYear(); // no need; add year for whole January
  var phi=40 * Math.PI/180.; // to rotate date display anticlockw. by phi
  var cphi=Math.cos(phi);
  var sphi=Math.sin(phi);

  // calculate weekly date string array for every week after startDay

  for(var iw=0; iw<Math.floor(this.itmax/7)+1; iw++){
    var date=new Date(startDay.getTime()); // copy constructor
    date.setDate(date.getDate() + iw*7+1); // set iw*7+1 days ahead (sim it => result at it+1)
    timeTextW[iw]=date.toLocaleDateString("en-us",options);
    //timeTextW[iw]=date.toLocaleDateString("de",options);

    if(date.getMonth()==0){timeTextW[iw]+=(", "+date.getFullYear());}
  }

  // calculate  x axis ticks/labels by selecting from string array
  // with variable tick intervals dweek

  var dweek=(this.timeWindow<100) 
    ? 1 : (this.timeWindow<200) 
    ? 2 : 4;
  var iwinit=0; // MT 2020-08
  for(var itick=0; itick<Math.round(timeTextW.length/dweek); itick++){
    days[itick]=7*(iwinit+dweek*itick);
    timeText[itick]=timeTextW[iwinit+dweek*itick];
    timeRel[itick]=(days[itick]-this.itmin)/(this.itmax-this.itmin);
  }



  //define y axis tick/label positions (in y, not pix)
  // actual label not defined here, from this.label_y_window[windowG]

  var ymin=this.yminType[windowG];
  var ymax=this.ymaxType[windowG];
  //console.log("drawAxes: ymin=",ymin," ymax=",ymax);

  var dy=1; // always for log
  if(windowG!=1){// !=log
    var power10=Math.floor(log10(ymax));
    var multiplicator=Math.pow(10, power10);
    var ymaxRange01=ymax/multiplicator;
    dy=(ymaxRange01<2) ? 0.2*multiplicator
      :(ymaxRange01<5) ? 0.5*multiplicator : multiplicator;
  }

  var ny=Math.floor(ymax/dy);
  var iymin=1; // should work both for lin and log
  //if(it<5){console.log("in drawAxes: dy=",dy," ny=",ny);}



  // draw 3 px wide lines as coordinates
  // remaining hack: mirrored graphics cases/deaths: yPix0,hPix w/o "this"

  var yPix0=(this.mirroredGraphics) 
    ? 0.5*(this.yPix0+this.yPixMax) : this.yPix0;
  var hPix=(this.mirroredGraphics) ? 0.5*this.hPix : this.hPix;

  ctx.fillStyle="rgb(0,0,0)";
  ctx.fillRect(this.xPix0, yPix0-1.5, this.wPix, 3);
  ctx.fillRect(this.xPix0-1.5,this.yPix0, 3, this.hPix);// y axis always orig!



  // draw grid (inside drawAxes)

  ctx.strokeStyle="rgb(0,0,0)";

  for(var ix=0; days[ix]<=this.itmax; ix++){
    if(timeRel[ix]>=0){this.drawGridLine("vertical", timeRel[ix]);}
  }

  if(!this.mirroredGraphics){
    for(var iy=1; iy<=ny; iy++){
      this.drawGridLine("horizontal",iy*dy/(ymax-ymin));
    }
  }
  else{ // double mirrored graphics, direct hack, remains
    for(var iy=1; iy<=ny; iy++){
      this.drawGridLine("horizontal",0.5*(1+iy*dy/(ymax-ymin)));
      this.drawGridLine("horizontal",0.5*(1-iy*dy/(ymax-ymin)));
    }
  }

  ctx.stroke();



  // draw date strings on x axis

  var dxShift=(phi<0.01) ? -1.1*textsize : -2.4*cphi*textsize;
  var dyShift=(1.5+2*sphi)*textsize;
  for(var ix=0; days[ix]<=this.itmax; ix++){
    if(timeRel[ix]>=0){
      var xpix=this.xPix0+timeRel[ix]*this.wPix+dxShift;
      var ypix=this.yPix0+dyShift;
      ctx.setTransform(cphi,-sphi,+sphi,cphi,xpix,ypix);
      ctx.fillText(timeText[ix],0,0);
    }
  }
  ctx.setTransform(1,0,0,1,0,0);




  // draw name+values strings on y1 axis

  var label_y=this.label_y_window[windowG];
  var yPix=(windowG!=1)
    ? this.yPix0+0.01*this.hPix : this.yPix0+0.15*this.hPix;
  ctx.setTransform(0,-1,1,0,
		   this.xPix0-3.0*textsize,yPix);
  ctx.fillText(label_y,0,0);
  ctx.setTransform(1,0,0,1,0,0);

  // normal graphics

  if(!this.mirroredGraphics){ 
    for(var iy=0; iy<=ny; iy++){
      var valueStr=(windowG!=1)  ? iy*dy : "10^"+iy;
      //console.log("valueStr=",valueStr);
      ctx.fillText(valueStr,
		   this.xPix0-2.5*textsize,
		   yPix0+(iy*dy-ymin)/(ymax-ymin)*hPix+0.5*textsize);
    }
  }

// draw double mirrored graphics scaling 10:1 
// hack remains: yPix0,hPix instead of this.yPix0, this.hPix

  else{
    for(var iy=0; iy<=ny; iy++){
      var valueStr=10*iy*dy;
      ctx.fillText(valueStr,
		   this.xPix0-2.5*textsize,
		   yPix0+(iy*dy-ymin)/(ymax-ymin)*hPix+0.5*textsize);
    }
    for(var iy=1; iy<=ny; iy++){
      var valueStr=iy*dy;
      ctx.fillText(valueStr,
		   this.xPix0-2.5*textsize,
		   yPix0-(iy*dy-ymin)/(ymax-ymin)*hPix+0.5*textsize);
    }
  }




  
  // draw key drawkey (drawAxes)

  var yrelTop=(windowG==1) // 1=log
    ? -8*(1.28*textsize/this.hPix) : 0.99; // 8: lines above x axis
  var xrelLeft=(windowG==1)||(windowG==4) ? 0.40 :
      (windowG==0) ? 0.02 : 0.20; 
  var dyrel=-1.2*textsize/this.hPix;
  var ikey=0;

  for (var iq=0; iq<this.qselect[windowG].length; iq++){

    var q=this.qselect[windowG][iq];

    // no key for sim graphics when calibr./valid. points are plotted

    if((windowG>=2)||(this.dataG[q].type>=3)){

      ctx.fillStyle=this.dataG[q].color;
      ctx.fillText(this.dataG[q].key,
	           this.xPix0+xrelLeft*this.wPix,
		   this.yPix0+(yrelTop-ikey*dyrel)*this.hPix);
      ikey++;
    }
  }

  if(true){// draw "Durchseuchung" etc

    // calculate time string
    // set it+1 days ahead of startDay (it=time BEFORE sim)

    var date=new Date(startDay.getTime()); // copy constructor
    date.setDate(date.getDate() + it+1); 
    var options = {year: "numeric", month: "short", day: "2-digit"};
    var str_date=date.toLocaleDateString("de-de",options);

    // display date left upper corner

    var xrelLeftDate=-0.06;
    var yrelTopDate=(showVacc) ? 1.02 : 1.04;
    ctx.fillStyle="rgb(0,0,0)";
    ctx.fillText(str_date,
		 this.xPix0+xrelLeftDate*this.wPix,
		 this.yPix0+yrelTopDate*this.hPix);

    // display other state variables anchored at xrelLeft,yrelTop
    
    var Xperc=Math.round(1000*corona.xyz)/10;
    ctx.fillText("Durchseuchung X="+(Xperc.toFixed(1))+" %",
		 this.xPix0+xrelLeft*this.wPix,
		 this.yPix0+(yrelTop-(ikey+1)*dyrel)*this.hPix);
    
    ctx.fillText("Aktuelles R="+(corona.Reff.toFixed(2)),
		 this.xPix0+xrelLeft*this.wPix,
		 this.yPix0+(yrelTop-(ikey+2)*dyrel)*this.hPix);
    
    ctx.fillText("Aktuelle IFR="+(100*IFRfun_time(it)).toFixed(2)+" %",
		 this.xPix0+xrelLeft*this.wPix,
		 this.yPix0+(yrelTop-(ikey+3)*dyrel)*this.hPix);

    // 1 line gap ("ikey+5") because x axis of most relevant windows
    // windowG={0=cum,1=log,2=casesReal,3=tests,4=rates,
    // 5=casesDaily,6=incidence} 
    var line=( (windowG==2)||(windowG==5)||(windowG==6)) ? 5 : 4
   
    ctx.fillText("Insgesamt Gestorbene (sim.)="+(Math.round(n0*corona.z)),
		 this.xPix0+xrelLeft*this.wPix,
		 this.yPix0+(yrelTop-(ikey+line)*dyrel)*this.hPix);

    if(pVacc>0){
      line++;
      ctx.fillText("Impfrate: "+(Math.round(100*pVacc))+" %",
		 this.xPix0+xrelLeft*this.wPix,
		 this.yPix0+(yrelTop-(ikey+line)*dyrel)*this.hPix);
    }
    
    if(casesInflow>0){
      line++;
      ctx.fillText("Fall-Import: "+(Math.round(casesInflow))
		   +"/Tag/100 000 Einw.",
		   this.xPix0+xrelLeft*this.wPix,
		   this.yPix0+(yrelTop-(ikey+line)*dyrel)*this.hPix);
    }

    if(measures!=4){
      line++;
      ctx.fillText("Massnahmen: "+str_measures(measures),
		   this.xPix0+xrelLeft*this.wPix,
		   this.yPix0+(yrelTop-(ikey+line)*dyrel)*this.hPix);
    }
    
  }


// R values drawn directly in draw in simulation part

} // drawAxes



// transfer all coronaSim data directly  
// to graphics data container this.dataG[q] with types 3 or 4
// called every simulation step: corona.xAct etc are scalars!

//######################################################################
DrawSim.prototype.transferSimData=function(it){
//######################################################################

  this.dataG[0].data[it]=n0*corona.xt;
  this.dataG[2].data[it]=n0*corona.z;
  //this.dataG[3].data[it]=n0*corona.z/corona.xt
  this.dataG[8].data[it]=log10(n0*corona.xAct);
  this.dataG[9].data[it]=log10(n0*corona.xt);
  // this.dataG[10].data[it]=log10(n0*corona.y); // obsolete
  this.dataG[12].data[it]=log10(n0*corona.z);
  this.dataG[22].data[it]=IFRfun_time(it); //!! new!
  this.dataG[23].data[it]=n0*corona.x[0]; // x[0]=infected at infection age 0
  this.dataG[24].data=this.dataG[23].data;
  this.dataG[25].data[it]=log10(n0*corona.xyz); // "Durchseuchung"
  this.dataG[26].data[it]=n0*corona.dxtFalse; // sim number of false positives
  this.dataG[27].data[it]=n0*corona.dxt; // sim number of positive tests
  this.dataG[28].data[it]=n0*corona.dz; // sim number of deaths per day
  this.dataG[29].data[it]=n0*corona.dxt; // sim number of positive tests
                                         // other scaling

  // weekly incidences per 100 000: sim_dxIncidence, sim_dzIncidence;

  var xsimPastWeek=0;
  this.dataG[32].data[it]=100000/n0
    *(this.dataG[0].data[it]-this.dataG[0].data[Math.max(it-7,0)]);
  this.dataG[33].data[it]=100000/n0
    *(this.dataG[2].data[it]-this.dataG[2].data[Math.max(it-7,0)]);
  

  // get yt  from balance xt past, zt=z

  var itPast=it-tauRecover;
  var nxtPast=(it<tauRecover)
    ? data_cumCases[it-tauRecover+data_idataStart]
    : this.dataG[0].data[itPast];
  this.dataG[1].data[it]=nxtPast-n0*corona.z; // balance past infected-deaths
  //this.dataG[11].data[it]=log10(this.dataG[1].data[it]); // obsolete


  // get validation reference if in validation mode
  if(nDaysValid>0){


  }
  if(false){
    console.log("\n\nDrawSim.transferSimData");
    for(var q=0; q<this.dataG.length; q++){
      if(this.dataG[q].type>=3){
	data=this.dataG[q].data;
	console.log(
	  this.dataG[q].key,
	  ": q=",q,"\ndata.length=", data.length,
	  " data[0]=", data[0],
	  " data[data.length-1]=",data[data.length-1]);
      }
    }
  }

}


// transfer of all measured data 
// to graphics data container this.dataG[q] with types 0-2
// called only once at the beginning!


//######################################################################
DrawSim.prototype.transferRecordedData=function(){
//######################################################################

  if(false){console.log("\nin drawsim.transferRecordedData: it=",it,
	      " for unnoying unknown reason repeated several times",
			" only at loading");}
// windows 0,1
  this.dataG[4].data=data_cumCases;  // by reference
  this.dataG[5].data=data_cumRecovered;
  this.dataG[6].data=data_cumDeaths;
  //this.dataG[7].data=data_cumCfr;
 
  for(var i=0; i<data_cumCases.length; i++){ // by value because of log10:
    this.dataG[13].data[i]=log10(data_cumCases[i]);
    this.dataG[14].data[i]=log10(data_cumRecovered[i]);
    this.dataG[15].data[i]=log10(data_cumDeaths[i]);
  }


  // windows 2-4

  //kernel=[1]; //!! worldometer data too strong weekly changes, 
                 // more than RKI => slight smoothing
  kernel=[1/4,2/4,1/4];

  //kernel=[1/9,2/9,3/9,2/9,1/9];
  //kernel=[1/16,2/16,3/16,4/16,3/16,2/16,1/16];
  //kernel=[1/25,2/25,3/25,4/25,5/25,4/25,3/25,2/25,1/25];

  var dnSmooth=smooth(data_dn,kernel);
  var dxtSmooth=smooth(data_dxt,kernel);
  var dzSmooth=smooth(data_dz,kernel);
  var posRateSmooth=smooth(data_posRate,kernel);
  var cfrSmooth=smooth(data_cfr,kernel);

  

  this.dataG[16].data=dxtSmooth; // by reference
  this.dataG[17].data=dzSmooth; 

  this.dataG[18].data=dxtSmooth; // the same as [16]
  this.dataG[19].data=dnSmooth; 

  this.dataG[20].data=posRateSmooth;
  this.dataG[21].data=cfrSmooth;
  //this.dataG[22].data=ifrSmooth;//!! now [22] reserved for sim ifr=fracDie


  // data: calculate weekly incidences (transferRecordedData called only once)
  // 700000=7 (weekly) times 100 000 (per 100 000)

  var kernel=[1/7, 1/7, 1/7, 1/7, 1/7, 1/7, 1/7];
  var cases_smooth=smooth(data_dxt,kernel);
  var deaths_smooth=smooth(data_dz,kernel);
  for(var i=6; i<data_dxt.length; i++){
    data_dxIncidence[i]=cases_smooth[i-3]*700000/n0;
    data_dzIncidence[i]=deaths_smooth[i-3]*700000/n0;
    if(false){
    //if(i>data_dxt.length-14){
      console.log("i=",i," data_dxIncidence[i]=",data_dxIncidence[i],
		  " data_dzIncidence[i]=",data_dzIncidence[i]);
    }
  }
  for(var i=0; i<6; i++){
    data_dxIncidence[i]=data_cumCases[i]*700000/n0;
    data_dzIncidence[i]=data_cumDeaths[i]*700000/n0;
  }

  this.dataG[30].data=data_dxIncidence; // weekly data incidence by reference
  this.dataG[31].data=data_dzIncidence;


  if(false){
    console.log("\n\nDrawSim.transferRecordedData: data_cumCases.length=",
		data_cumCases.length);
    for(var q=0; q<this.dataG.length; q++){
      if(this.dataG[q].type<3){
	data=this.dataG[q].data;
	half=Math.round(data.length/2-1);
	console.log(
	  this.dataG[q].key,
	  ": q=",q,"\ndata.length=", data.length,
	  " data[0]=", data[0],
	  " data[half]=", data[half],
	  " data[data.length-1]=",data[data.length-1]);
      }
    }
  }

}

//######################################################################
DrawSim.prototype.checkRescaling=function(it){
//######################################################################


  // (1) possible rescaling in x
  // !! only instance where this.itmin, this.itmax at lhs except init

  this.itmax=Math.round(Math.max(it,this.timeWindow));
  this.itmin=Math.round(this.itmax-this.timeWindow);


  if(true){ // only instance where this.xPix[] defined
    for(var i=0; i<=this.itmax-this.itmin; i++){
      this.xPix[i]=this.xPix0
	+i*(this.xPixMax-this.xPix0)/(this.itmax-this.itmin);
    }
    //console.log("this.itmax=",this.itmax," this.itmin=",this.itmin);
  }



  // (2) possible rescaling in y for all the graph windows

  for(var iw=0; iw<this.qselect.length; iw++){ //windows
    for(iq=0; iq<this.qselect[iw].length; iq++){ // quantity selector
      var q=this.qselect[iw][iq];
      var data=this.dataG[q].data;
      var i=(this.dataG[q].type<3) ? it+data_idataStart : it;
      var scaling=this.dataG[q].ytrafo[0];
      var type=this.dataG[q].type;
      var value=data[i]*scaling;

      if(value>this.ymaxType[iw]){
	this.ymaxType[iw]=value;
	if(false){
	  console.log(
	    "checkRescaling: new maximum! it=",it, "window iw=",iw,
	    " quantity q=",q," i=",i,
	    " type=",((type<3) ? "data" : "sim"),
	    " scaling=",scaling,
	    "\nbefore restrictions: this.ymaxType[iw]=",this.ymaxType[iw]
	  );
	}
      }

    }
  }


 // (3) restrict scalings for some windows

  this.ymaxType[4]=Math.min(this.ymaxType[4], 20); // rel quant. <=20 %
  this.ymaxType[0]=Math.max(this.ymaxType[0], 1); // abs lin to 20


  //console.log("leaving checkRescaling: this.ymaxType=",this.ymaxType);
}// DrawSim.checkRescaling=


//######################################################################
DrawSim.prototype.drawR0Estimate=function(it){
//######################################################################

  //console.log("in DrawSim.drawR0Estimate: it=",it);
  if(!showVacc){ // do not show R0 values in "measures"=vaccination view
   ctx.fillStyle="#888888";// vertical period separation lines
   var y0=this.yPix0+0.03*this.hPix;
   ctx.font = textsizeR0+"px Arial"; 
   var dxPix=Math.max(1,0.002*sizeminWindow);
   for(var ical=0; ical<=getIndexCalib(it); ical++){ 
    var itR0=getIndexTimeFromCalib(ical);
    var x0=this.xPix[itR0-this.itmin];
    //ctx.fillRect(x0-0.5*dxPix,this.yPix0,dxPix,this.hPix);

    ctx.setTransform(0,-1,1,0,x0+textsizeR0,y0);
    if(false){
      console.log("drawSim.draw: it=",it," itR0=",itR0,
		" R0_hist.length=",R0_hist.length,
		" sigmaR0_hist.length=",sigmaR0_hist.length,
		" itPresent=",itPresent,
		" R0_hist[itR0]=",R0_hist[itR0],
		" sigmaR0_hist[itR0]=",sigmaR0_hist[itR0],
		"");
    }

    //'?' in following line should not happen ut extremely rarely does
    var R0=(itR0>=R0_hist.length) ? R0_actual : R0_hist[itR0]; 
    var sigmaR0=(itR0<itPresent) ? sigmaR0_hist[itR0] : 0;
    var str_R0="R  ="+R0.toFixed(2)
      +((true) // if plotting  w/o "+/- stddev
	? "" : (" +/- "+sigmaR0.toFixed(2)));

    var step=(canvas.width<=600) ? 2 : 1;
    //if(ical%2==0){ //!! drawn every ical'th calibration value
    if(ical%step==0){
     ctx.fillText(str_R0,0,0);
      ctx.font = (Math.round(0.7*textsizeR0))+"px Arial"; 
      ctx.fillText("0",0.8*textsizeR0,0.3*textsizeR0);
    }
    ctx.font = textsizeR0+"px Arial"; 
    ctx.setTransform(1,0,0,1,0,0);
   }
  }
}




//######################################################################
DrawSim.prototype.draw=function(it){
//######################################################################

  //console.log("\nin DrawSim.draw: it=",it," this.itmin=",this.itmin,
//	      " this.itmax=",this.itmax);

  this.mirroredGraphics=((windowG==2)||(windowG==5)||(windowG==6));

  // global vars canvas.width, canvas.height,
  // viewport.width, viewport.height
  // textsize, textsizeR0 (for the R0 values) set by 
  // canvas_gui.canvas_resize()



  // transfer new data and redraw whole graphics

  this.transferSimData(it);
  if(it==0){this.transferRecordedData()}; 
 


  // check for possible scaling/rescaling due to new data on x and y axis 

  this.checkRescaling(it);

  // prepare drawing

  this.clear();


  // draw simulations and data for all windows

  // filter scaling, drawCurves with line thickness,
  //  plotPoints with point types , plotBars by parsing this.dataG[q]

  // qselect: quantity selector for windowG
  //console.log("\ndraw: it=",it," this.ymaxType=",this.ymaxType);

  for(var iq =0; iq<this.qselect[windowG].length; iq++){ 
    var q=this.qselect[windowG][iq];
    var data=this.dataG[q].data;
    var i=(this.dataG[q].type<3) ? it+data_idataStart : it;
    var scaling=this.dataG[q].ytrafo[0];
    var half=this.dataG[q].ytrafo[1];
    var downwards=this.dataG[q].ytrafo[2];
    var type=this.dataG[q].type;
    var plottype=this.dataG[q].plottype;
    var wLine=(type==3) ? 0.002*sizeminCanvas
	:(type==4) ? 0.003*sizeminCanvas :  0.001*sizeminCanvas;
    wLine=Math.max(wLine,0.5);
    var color=this.dataG[q].color;
    var pointType=type;
    var actValue=scaling*this.dataG[q].data[i];
    if(false){
    //if(it<5){
      console.log("draw: it=",it," i=",i,
		  " windowG=",windowG,
		  " q=",q,//" type=",type,
		  " scaling=",scaling," half=",half," downwardsw=",downwards,
		  " plottype=",plottype,//" wline=",wLine,
		  " actValue=",actValue);
    }

      // draw some data (the simulations) as lines/curves

    if(this.dataG[q].plottype=="lines"){
      this.drawCurve(it, 0, data, 
		     scaling,half,downwards, wLine, color, windowG);
    }

      // plot some data as points

    if(this.dataG[q].plottype=="points"){
      this.plotPoints(it, data_idataStart, data, 
		      scaling,half,downwards, pointType, color, windowG);
    }

      // plot some data as bars

    if(this.dataG[q].plottype=="bars"){
      var istart=(this.dataG[q].type>2) ? 0 : data_idataStart;
      this.plotBars(it, istart, data,  
		    scaling,half,downwards,color, windowG);

    }
  



  } // loop over all quantities to be drawn


  // draw R0 estimates for windows qith simulations
  
  if(this.mirroredGraphics){
      this.drawR0Estimate(it);
  }

  this.drawAxes(windowG);  // at the end to have grid+labels at top layer


  if(activateAnnotations){drawMouseAnnotations();} // corona_gui.js

} //DrawSim.draw





//######################################################################
DrawSim.prototype.drawCurve=function(it, iDataStart, data_arr,
				     scaling, half, downwards,
				     wLine, color, windowG){
//######################################################################

  var yminDraw=this.yminType[windowG];
  var ymaxDraw=this.ymaxType[windowG];

  // new settings for up/down plots

  var yPix0=(half) ? 0.5*(this.yPix0+this.yPixMax)
    : (downwards) ? this.yPixMax : this.yPix0;
  var yPixMax=yPix0+((downwards) ? -1 : 1)*((half) ? 0.5 : 1)
    *(this.yPixMax-this.yPix0);

  if(half&&false){
    console.log("drawCurve: half=",half," downwards=",downwards,
  		" yPix0=",yPix0," yPixMax=",yPixMax);
  }

 
  ctx.fillStyle=color;
  //console.log("drawCurve: this.itmin=",this.itmin," it=",it);
  for (var ig=this.itmin; ig<=it; ig++){// ig=visible graphed data point !!
    var i=iDataStart+ig; // i=iData
    var ip=ig-this.itmin; // ip=ipixel; order number of shown data point
    var value=data_arr[i]*scaling;
    if((i>0)&&(value>=yminDraw) &&(value<=ymaxDraw)){
      var valueOld=data_arr[i-1]*scaling;
      var yrel=(value-yminDraw)/(ymaxDraw-yminDraw);
      var yrelOld=(valueOld-yminDraw)/(ymaxDraw-yminDraw);
      var yPix=yPix0+yrel*(yPixMax-yPix0);
      var yPixOld=yPix0+yrelOld*(yPixMax-yPix0);

      var phi=Math.atan((yPix-yPixOld)/
			(this.xPix[ip]-this.xPix[ip-1]));
      var cphi=Math.cos(phi);
      var sphi=Math.sin(phi);

      ctx.beginPath(); //!! crucial; otherwise latest col used for ALL
      ctx.moveTo(this.xPix[ip-1]-wLine*sphi, yPixOld+wLine*cphi);
      ctx.lineTo(this.xPix[ip-1]+wLine*sphi, yPixOld-wLine*cphi);
      ctx.lineTo(this.xPix[ip]+wLine*sphi,   yPix-wLine*cphi);
      ctx.lineTo(this.xPix[ip]-wLine*sphi,   yPix+wLine*cphi);
      ctx.closePath();  // !! crucial, otherwise latest col used for ALL
      ctx.fill();

      if(false){
        //wLine=0.5;//!
	var arg0=[this.xPix[ip-1]-wLine*sphi, yPixOld+wLine*cphi];
	var arg1=[this.xPix[ip-1]+wLine*sphi, yPixOld-wLine*cphi];
	var arg2=[this.xPix[ip]+wLine*sphi,   yPix-wLine*cphi];
	var arg3=[this.xPix[ip]-wLine*sphi,   yPix+wLine*cphi];

	console.log("drawCurves, i=",i," yrel=",yrel,
		    "\n  ctx.moveTo",arg0,
		    "\n  ctx.lineTo",arg1,
		    "\n  ctx.lineTo",arg2,
		    "\n  ctx.lineTo",arg3);
      }

      if(false){
      //if(i==itg){
	console.log("drawCurve: last point: data_arr[ig]=",data_arr[ig],
		    "yrel=",yrel);
      }

    }
  }

  // debug

  if(false){
  //if( (q==1)&&(it<=20)){
    var idata=data_idataStart+it;
    console.log("DrawSim.drawCurve: it=",it," quantity q=",q,
		" data_arr[igt]=",data_arr[igt]);
  }


}


// plot the data; q only for determining the corresponding color
// uses the full data array and subtracts data_idataStart from index
// => needs the data, not data2 format 
// => add data2_idataStart-data_idataStart to index of data2 quantities

//######################################################################
DrawSim.prototype.plotPoints=function(it, iDataStart, data_arr, 
				      scaling, half, downwards,
				      pointType, color, windowG){
//######################################################################

  var yminDraw=this.yminType[windowG];
  var ymaxDraw=this.ymaxType[windowG];


  // new settings for up/down plots

  var yPix0=(half) ? 0.5*(this.yPix0+this.yPixMax)
    : (downwards) ? this.yPixMax : this.yPix0;
  var yPixMax=yPix0+((downwards) ? -1 : 1)*((half) ? 0.5 : 1)
    *(this.yPixMax-this.yPix0);

  ctx.fillStyle=color;
  for (var ig=0; ig<=it; ig++){ 
    var i=iDataStart+ig; // i=iData
    var ip=ig-this.itmin; // ip=ipixel; order number of shown data point
    var value=data_arr[i]*scaling;
    if((i>0)&&(value>=yminDraw) &&(value<=ymaxDraw)){
      var yrel=(value-yminDraw)/(ymaxDraw-yminDraw);
      var yPix=yPix0+yrel*(yPixMax-yPix0);
      var r=Math.max(0.006*sizeminCanvas, 1);
      if(pointType==0){
        ctx.beginPath(); //!! crucial; otherwise latest col used for ALL
        ctx.arc(this.xPix[ip], yPix, r, 0, 2 * Math.PI);
        ctx.fill();
      }
      else{
	var r=Math.max(0.006*sizeminCanvas, 1);
        ctx.beginPath(); //!! crucial; otherwise latest col used for ALL
        ctx.moveTo(this.xPix[ip]-r,yPix-r);
        ctx.lineTo(this.xPix[ip]-r,yPix+r);
        ctx.lineTo(this.xPix[ip]+r,yPix+r);
        ctx.lineTo(this.xPix[ip]+r,yPix-r);
        ctx.lineTo(this.xPix[ip]-r,yPix-r);
	ctx.closePath();

	if(pointType==1){
          ctx.fill();
	}
	else{
          ctx.stroke();  // filled: fill(); open: line() called stroke()
	}
      }

      if(false){
      //if(pointType>0){
	arg0=[this.xPix[ip]-r,yPix-r];
	arg1=[this.xPix[ip]-r,yPix+r];
	arg2=[this.xPix[ip]+r,yPix+r];
	arg3=[this.xPix[ip]+r,yPix-r];
	arg4=[this.xPix[ip]-r,yPix-r];
	console.log("ctx.moveTo",arg0,
		    "\n  ctx.lineTo",arg1,
		    "\n  ctx.lineTo",arg2,
		    "\n  ctx.lineTo",arg3,
		    "\n  ctx.lineTo",arg4);
      }
    }
  }
}




// if half is true, x axis on half height 
// if down is true, bars are plotted downwards
// to make plot with bars up and downwards pointing, select 
// plot 1: half=true, up=true
// plot 1: half=true, up=false

//######################################################################
DrawSim.prototype.plotBars=function(it, iDataStart, data_arr, scaling,
				    half, downwards, color, windowG){
//######################################################################

  var yminDraw=this.yminType[windowG];
  var ymaxDraw=this.ymaxType[windowG];


  // new settings for up/down plots

  var yPix0=(half) ? 0.5*(this.yPix0+this.yPixMax)
    : (downwards) ? this.yPixMax : this.yPix0;
  var yPixMax=yPix0+((downwards) ? -1 : 1)*((half) ? 0.5 : 1)
    *(this.yPixMax-this.yPix0);
  if(false){
  //if(half){
    console.log("plotBars: half=",half," downwards=",downwards,
  		" yPix0=",yPix0," yPixMax=",yPixMax);
  }

  var w=1.0*(this.xPix[1]-this.xPix[0]);

  ctx.fillStyle=color;

  // first bar ig=this.itmin as in curves would cover y axis
  for (var ig=this.itmin+1; ig<=it; ig++){ 
    var i=iDataStart+ig; // i=iData
    var ip=ig-this.itmin; // ip=ipixel; order number of shown data point
    var value=data_arr[i]*scaling;
    if((i>0)&&(value>=yminDraw) &&(value<=ymaxDraw)){
      var yrel=(value-yminDraw)/(ymaxDraw-yminDraw);
      var yPix=yPix0+yrel*(yPixMax-yPix0);
      ctx.fillRect(this.xPix[ip]-0.5*w, yPix0, w, yPix-yPix0);
      //if(itg==it){console.log(" yrel=",yrel," yPix=",yPix);}
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
