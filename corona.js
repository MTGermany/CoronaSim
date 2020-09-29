
// useLiveData=true: Obtain github data "live" via the fetch command
// Unfortunately, the fetch command is sometimes unstable
// and not working on my ipad

// useLiveData=false: obtained data server-side 
// via script updateCoronaInput.sh. Stable but need to upload once a day

var useLiveData=false;  //!! will be changed by upload script, 2 versions

// debugApple=true for debugging of devices w/o console (ipad) redirect
// it to a html element using console-log-html.js
// copy corona.js to coronaDebugApple.js and 
// use indexDebugApple.html for these purposes 
// (contains addtl <div id="logDiv">)

var debugApple=false;

var country="Germany";
var countryGer="Deutschland";

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


// graphical window at start, 0=lin,1=log,2=cases,3=tests,4=rates 

var windowG=0; // consolidate with first option value of html!!


var myRun;
var isStopped=true



// global time simulation vars (see also "data related global variables")

var dayStartMar=20; //!! 20 you can also exceed 31, date initializer takes it
var startDay=new Date(2020,02,dayStartMar); // months start @ zero, days @ 1
var present=new Date();   // time object for present 
var it=0;
var oneDay_ms=(1000 * 3600 * 24);
var itmaxinit=Math.round(
    (present.getTime() - startDay.getTime())/oneDay_ms); 
                // itmaxinit=days(present-startDay)
                // round because of daylight saving time complications
var itmax=itmaxinit; // can be >itmaxinit during interactive simulation




// data related global variables
// fetch with https://pomber.github.io/covid19/timeseries.json
// or load as a variable server-side (if useLiveData=false)

var dataGit=[];
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
var data2_cumTests=[]; // other source, therefore dataGit2
var data2_cumTestsCalc=[]; // calculated from posRate
var data2_cumCases=[]; // #cases/#tests in last available period
var data2_posRate=[]; // #cases/#tests in last available period

// derived data in data time order

var data_dn=[];
var data_dxt=[];
var data_dyt=[];
var data_dz=[];
var data_posRate=[];
var data_cfr=[];
var data_ifr=[];
var data_pTestModel=[]; // sim. "Hellfeld" P(tested|infected) if f(#tests)=true
var pTest_weeklyPattern=[]; // constant extrapolation with weekly pattern
var dn_weeklyPattern=[];  // constant extrapolation of #tests "


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
    "India"         : 0.0045,
    "Russia"        : 0.0040,
    "US"            : 0.0055
}


const tauDieList={
    "Germany"       : 21, //21
    "Austria"       : 21,
    "Czechia"       : 21,
    "France"        : 21,
    "United Kingdom": 21,
    "Italy"         : 11,
    "Poland"        : 21,
    "Spain"         : 21,
    "Sweden"        : 21,
    "Switzerland"   : 19,
    "India"         : 17,
    "Russia"        : 17,
    "US"            : 17
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
    "India"         : 18,
    "Russia"        : 18,
    "US"            : 18
}



var RsliderUsed=false;
var otherSliderUsed=false;
var testSliderUsed=false;
//var fracDieSliderUsed=false; does not exist

var R0=1.42;    // init interactive R for slider corona_gui.js (overridden)
var Rtime=[];   // !! calibrated R; one element PER 2 WEEKS
                // initialize in function initialize() (then data available)
var R_hist=[]; R_hist[0]=R0; // one element PER DAY
var sigmaR_hist=[]; sigmaR_hist[0]=0; 

// beta parameters for IFR function IFRfun_time
// need to define it explicitely here because sequentially calibrated after R

var betaIFRinit=[0.005,0.003,0.001,0.001];
var betaIFR=[];





// global simulation  parameters

var fps=50;

// (i) controlled by sliders/control elements (apart from R0)


var pTestInit=0.08;     // P(Tested|infected)  if !f(#tests) assumed
var pTestModelMin=0.04;   // if calculated by sqrt- or propto model

var includeInfluenceTestNumber=true; // if true, pTest =f(#tests)
var useSqrtModel=true; // whether use sqrt or linear dependence 

var tauRstartInit=2;   // active infectivity begins [days since infection]//1
var tauRendInit=8;    // active infectivity ends [days since infection]//10
var tauTestInit=5;     // time delay [days] test-infection //8

var tauRstart=tauRstartInit;
var tauRend=tauRendInit;  
var pTest=pTestInit;       // percentage of tested infected persons 
var tauTest=tauTestInit;
var tauAvg=5;      // smoothing interval (uneven!) for tauTest,tauDie,tauRecover

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

var alpha=0.0; // alpha error of test (false negative)
var beta=0.003; // beta error (false positive) after double testing
// if in Germany beta>0.006, n_falsePos can be > nPositive => contradict
// => formally, matrix not invertible


// (iv) calibration related parameters/variables

var itmin_calib; // start calibr time interval w/resp to dayStartMar
                 //     = dataGit_idataStart+1
var itmax_calib; //  end calibr time interval =^ data_itmax-1 
                 // should be split if there are more than approx 
                 // 20 weeks of data

const calibInterval=14; //!! calibration time interval [days] for one R value
const calibAddtlDaysLast=7; // do not calibrate remaining period smaller
const calibrateOnce=false; // following variables only relevant if false
const nCalibIntervals=5; // multiples of calibInterval, >=30/calibInterval
const nOverlap=1;        // multiples of calibInterval, 
                         // >=max(1,floor(calibAddtlDaysLast/calibInterval)
var useInitSnap;
var firstRfixed=false; //if first R element firstR is fixed @ calibr 
var firstR=0;




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
    fracDie=IFRfun_time(betaIFRinit,-20); // use IFR start array for init()
    corona.init(0); 
    myRestartFunction();
    //myStartStopFunction();
  }
} // getGithubData




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
  data_itmax=data.length-data_idataStart; // relative index

  data2_dateBegin=new Date(insertLeadingZeroes(dateInitStr2));
  data2_idataStart=Math.round(
    (startDay.getTime() - data2_dateBegin.getTime() )/oneDay_ms);
  data2_itmax=data2.length-data2_idataStart;


  // testing the overall structure

  if(true){
    var nxtStart=data[data_idataStart]["confirmed"];

    console.log(
      "dateInitStr=",dateInitStr, "dateInitStr2=",dateInitStr2,
      "\n data_idataStart=",data_idataStart,
      "  data2_idataStart=",data2_idataStart,
      "\n data.length=",data.length," data2.length=",data2.length,
      "\n data[data_idataStart][\"date\"]=",data[data_idataStart]["date"],
      "\n data2[data2_idataStart][\"date\"]=",data2[data2_idataStart]["date"],
      "\n data_itmax=",data_itmax," data2_itmax=",data2_itmax,
      "\n nxtStart=",nxtStart,
      "\n"
    );
  }



  // extract main data

  var itmaxData=data.length;
  for(var it=0; it<itmaxData; it++){
    data_date[it]=data[it]["date"];
    data_cumCases[it]=data[it]["confirmed"];
    data_cumDeaths[it]=data[it]["deaths"];
    data_cumRecovered[it]=data[it]["recovered"];
    data_cumCfr[it]=(data_cumCases[it]==0)
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


  console.log("initializeData:");  // inside initializeData(country);

  // generate the data arrays (in data, not data2 time order) to be plotted
  // data_dx=estmation from data assuming 
  // (1) time interval tauTest where test is positive for infected people
  //     e.g. tauPos=7 from infection days 3-9 
  //     (start day here not relevant) 
  // (2) the probability that not tested people are infected factor gamma
  //     of that for tested people
  // (3) "Durchseuchung" <<1 (!! change later if xyz/n0 implemented!
  // (4) tests have certain alpha and beta errors

  var di=data2_idataStart-data_idataStart; // translation data->data2 index

  var tauPos=7; //!!! consolidate with global constants/sliders
// if tauPos=7, also cancels out weekly pattern

  for(var i=0; i<itmaxData; i++){
    data_dxt[i]=data_cumCases[i]-data_cumCases[i-1];
    data_dyt[i]=data_cumRecovered[i]-data_cumRecovered[i-1];
    // in spain the def of deaths changed -> cum deaths reduced, dz<0
    data_dz[i]=Math.max(data_cumDeaths[i]-data_cumDeaths[i-1], 0.);
  }

  // need new loop because of forward ref at cfr, ifr

  for(var i=0; i<itmaxData; i++){
    data_posRate[i]=data2_posRate[i+di];
    data_dn[i]=data_dxt[i]/data_posRate[i];// more stable
    if(!((data_dn[i]>0)&&(data_dn[i]<1e11))){data_dn[i]=0;}
    var dnTauPos=data2_cumTestsCalc[i+di]-data2_cumTestsCalc[i+di-tauPos];
    var pit=(data2_posRate[i+di]-beta)/(1-alpha-beta); // prob infected|tested
 
  
    data_cfr[i]=Math.max(data_cumDeaths[i+tauDie-tauTest]
		 -data_cumDeaths[i+tauDie-tauTest-tauPos],0.)/dxtTauPos;

    var dxtTauPos=data_cumCases[i]-data_cumCases[i-tauPos];

    var dztTauPos=Math.max(data_cumDeaths[i]-data_cumDeaths[i-tauPos],0.);


    if(true){ //!!!! check if still needed! true data here
      // possibly replace by calibrated fracDie: 
      // IFRfun_time(betaIFR,i-data_idataStart); 

      // denom tauPos because not tested people have a period tauPos
      // to be tested positive 
      // (!! if tauPos=7, also cancels out weekly pattern)

      var gamma=0.05;
      var data_dx=(pit*dnTauPos + gamma*pit*(n0-dnTauPos))/tauPos;
      data_ifr[i]=Math.max(data_cumDeaths[i+tauDie]
		 -data_cumDeaths[i+tauDie-tauPos],0.)/(tauPos*data_dx);
    }



    //  prooportional or  sqrt-like "Hellfeld" model: 
    // sqrt: assume 100% "Hellfeld" ifP(tested|new infected) if all n0 persons
    // are  tested within "infectiosity period" of assumed 7 days
    // linear: assume 100% if 10% are tested as above


    if((data_dn[i]>0)&&(data_dn[i]<1e11)){
      if(useSqrtModel){ // global var
        var pModel=Math.sqrt(7*data_dn[i]/n0);

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
      data_pTestModel[i]= pTestModelMin;
    }

    //console.log("it=",i-data_idataStart," useSqrtModel=",useSqrtModel,
//		" data_pTestModel[i]=",data_pTestModel[i]);
  }

  // ####################################################
  // weekly pattern for pTestModel and data_dn based on 3 periods

  var season0=[];
  var season1=[];
  var avg0=[];
  var avg1=[];
  for(var k=0; k<3; k++){// up to three weeks back
    avg0[k]=0; avg1[k]=0;
    for(var is=0; is<7; is++){
      avg0[k] += data_pTestModel[itmaxData-21+7*k+is]/7;
      avg1[k] += data_dn[itmaxData-21+7*k+is]/7;
    }
  }


  for(var is=0; is<7; is++){
    season0[is]=0; season1[is]=0;
    for(var k=0; k<3; k++){
      season0[is] += (data_pTestModel[itmaxData-21+7*k+is]-avg0[k])/3;
      season1[is] += (data_dn[itmaxData-21+7*k+is]-avg1[k])/3;
    }
    pTest_weeklyPattern[is]=avg0[2]+season0[is];
    dn_weeklyPattern[is]=avg1[2]+season1[is];
    if(false){console.log("is=",is," season0[is]=",season0[is],
		" season1[is]=",season1[is],
		" pTest_weeklyPattern[is]=",pTest_weeklyPattern[is]);
	     }
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
 /* (1) insert button "Beruecksichtige Testhaeufigkeit" <->"Rohdaten"
     (2) action Testhaeufigkeit: data_cumCases[i]=data_cumCasesAdj+Neukalibr
         var adaptCases=true (wie button "Neukalibrierung")
     (3) Lasse in Grafik Geheilten und Totenzahl weg
     (4) Slider Testrate zappelt hin und her propto adjFactor
  5 Button nur aktiv falls in Sim-Modifunction myFunction() {
  var x = document.getElementById("myDIV");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}


(6) Simulationsergebnisse xt auch in windowG==2 und 3 zeichnen, Xt von 0,1
    diffenenzieren, bei adaptCases==true mit adjFactor zappeln lassen

*/
  // ###############################################



  // ###############################################
  // debug

  if(true){
    console.log("");
    //for(var i=0; i<itmaxData; i++){
    for(var i=data_idataStart-22; i<=data_idataStart; i++){
    //for(var i=itmaxData-5; i<itmaxData; i++){
    //if((i>itmaxData-30)&&(i<itmaxData)){
      console.log(
	insertLeadingZeroes(data[i]["date"]),": iData=",i,
	" data_dn=",Math.round(data_dn[i]),
	" data_dxt=",Math.round(data_dxt[i]),
	" data_dyt=",Math.round(data_dyt[i]),
	" data_dz=",Math.round(data_dz[i]),
	"\n             data_posRate=",data_posRate[i],
	" data_cfr=",data_cfr[i].toPrecision(3),
	" data_ifr=",data_ifr[i].toPrecision(3),
	" ");
    }
  }



  if(false){
    for(var it=itmaxData2-5; it<itmaxData2; it++){
      var it2=it+data_idataStart-data2_idataStart;
      console.log("");
      console.log(data2[it]["date"],": it=",it,
		" data2_cumCases=",Math.round(data2_cumCases[it]),
		" data_cumCases=",Math.round(data_cumCases[it2]),
		" data2_posRate=",data2_posRate[it].toPrecision(3),
		" data2_cumTests=",Math.round(data2_cumTests[it]),
		" data2_cumTestsCalc=", 
		Math.round(data2_cumTestsCalc[it]) );
    }
  }

  RsliderUsed=false;
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


//##############################################################
// function for variable replication rate R as a function of time
// t=tsim-dateStart [days] from t to t+1
// global vars bool firstRfixed and firstR for managing overlap!!!
//##############################################################

function Rfun_time(Rarr, it){
  var iPresent=data_idataStart+it;
  var iTest    =iPresent+Math.round(tauTest);
  var iTestPrev=iPresent+Math.round(tauTest-0.5*(tauRstart+tauRend));

  if(it<0){ // direct estimate from data 
    var nxtNewnum  =1./2.*(data_cumCases[iTest+1]-data_cumCases[iTest-1]);
    var nxtNewdenom=1./2.*(data_cumCases[iTestPrev+1]
			  -data_cumCases[iTestPrev-1]);

    // !! above estimator seems to overestimate R a bit,
    // hence factor 0.9 which gives good results 
    // (little R jumps <=> little jumps in sim new infections)
    // compared to fitted R (no data if iTestPrev<0!)

    var R=((iTestPrev<0) ||(nxtNewdenom<1)) ? 5 : 0.90*nxtNewnum/nxtNewdenom;

    if(false){
      console.log("Rfun_time: t=",it," xtCum(iTest)=",data_cumCases[iTest],
		" xtCum(iTestPrev)=",data_cumCases[iTestPrev],
		" xtNewnum=",xtNewnum,
		" xtNewdenom=",xtNewdenom,
		"");
    }

    R=(includeInfluenceTestNumber) // because test influence reduces true R
      ? Math.min(5, Math.max(0.2,R))
      : Math.min(5, Math.max(0.2,R));

    return R;
  }


  else{// regular
    //return Rarr[index];    //steps
    var R;                   // linear interpolation
    if(firstRfixed){
      var indexWanted=Math.floor(it/calibInterval)-1;
      var index=Math.min(indexWanted, Rarr.length-1);
      var indexPlus=Math.min(indexWanted+1, Rarr.length-1);
      var relRest=(it-calibInterval*index)/calibInterval-1;
      var Rlower=(indexWanted<0) ? firstR : Rarr[index];
      R= (1-relRest)*Rlower+relRest*Rarr[indexPlus];
    }
    else{
      var indexWanted=Math.floor(it/calibInterval);
      var index=Math.min(indexWanted, Rarr.length-1);
      var indexPlus=Math.min(indexWanted+1, Rarr.length-1);
      var relRest=(it-calibInterval*index)/calibInterval;
      R= (1-relRest)*Rarr[index]+relRest*Rarr[indexPlus]; 
    }
    return R;
  }
}//Rfun_time


/*
  else{// regular
    var indexWanted=Math.floor(it/calibInterval);
    var index=Math.min(indexWanted, Rarr.length-1);
    var indexPlus=Math.min(indexWanted+1, Rarr.length-1);
    var relRest=(it-calibInterval*index)/calibInterval;

    //return Rarr[index];                                     //steps
    return (1-relRest)*Rarr[index]+relRest*Rarr[indexPlus]; // lin intp
  }
*/






/*##############################################################
 objective function for fitting the two-weekly reproduction rate 
 via the resulting dynamics of cases to the data
 used as function arg of the nl opt package fmin:
 fmin.nelderMead(SSEfunc, guessSSE)  or
 fmin.conjugateGradient(SSEfunc, guessSSE)
 gradient fbeta needed only for conjugateGradient

@param R_arr: array of R values: R_arr[0]: for days i<7,
                                 R_arr[j]: 14 days starting at i=j*14
@param fR: numerical gradient of func with respect to R
   (provide void if not used to not confuse the fmin.nelderMead method)

@param_opt logging: optional logging switch (default false inside nelderMead)
@param_opt itStart: optional start to override itmin_calib
@param_opt itMax: optional end to override itmax_calib

@global param (do not know how to inject params into func):
@global data_cumCases: the data to fit, (it=0) corresp (idata=data_idataStart)
@global itmin_calib start of calib intervals (days since dayStartMar)
@global itmax_calib end of calib intervals (days since dayStartMar)
@global useInitSnap
NOTICE: fmin.nelderMead needs one-param SSEfunc SSEfunc(R_arr):
        "sol2_SSEfunc=fmin.nelderMead(SSEfunc, Rguess);"
 ##############################################################*/

 //!! use separate array Rarr instead of global array Rtime
 // for optimization if not whole array optimized.

 // Rtime => used in Rfun_time(t)=Rfun_time(it) if it>=0
 //                  Rfun_time(t) data driven if t<0

function SSEfunc(Rarr, fR, logging, itStartInp, itMaxInp, 
		 itSnapInp, useInitSnapInp) {
  if( typeof fR === "undefined"){
    fR=[]; for(var j=0; j<Rarr.length; j++){fR[j]=0;}
    //console.log("inside: fR=",fR);
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
	//	" Rarr=",Rarr, "\n",
		" itStart=",itStart," itMax=",itMax,
		" data_itmax=",data_itmax," itmax=",itmax,
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
    if(logging){console.log("SSEfunc; initializing from scratch with data");}
    fracDie=IFRfun_time(betaIFRinit,-20); //!!
    corona.init(itStart, logging); 
    //corona.init(itStart, false); 
  }
  
  
  // SSEfunc: calculate SSE 

  //if(logging){ //!! always filter logging!!
  if(logging&&true){ //!! always filter logging!!
    var nxtStart=data_cumCases[data_idataStart];
    console.log("SSEfunc: start calculating SSE:",//" Rarr=",Rarr,
		" takeSnapshot=",takeSnapshot,
		" itStart=",itStart,
		" dnxt=",Math.round(n0*corona.dxt),
		" dnxtFalse=",Math.round(n0*corona.dxtFalse),
		" data: nxtStart=",nxtStart,
		" nxt=n0*corona.xt=",Math.round(n0*corona.xt),
		"\n\n");
  }

  var sse=0;
  for(var it=itStart; it<itMax; it++){

    if(it==itSnap){corona.takeSnapshot(itSnap);} //BEFORE corona.updateOneDay

    // simulate

    var R_actual= Rfun_time(Rarr,it-itStart); //!!!only Rarr used in SSEfunc
    corona.updateOneDay(R_actual, it, logging); // in SSE never logging=true!

    // increment SSE

    //  !!! GoF function log(cumulative cases)

    var nxtSim=n0*corona.xt;
    var nxtData=data_cumCases[data_idataStart+it+1];  // sim from it to it+1

    //  !!! GoF function log(new cases) !! not useful since drift @ cumulated

    //var nxtSim=n0*corona.dxt;
    //var nxtData=data_dxt[data_idataStart+it+1];  // sim from it to it+1



    sse+=Math.pow(Math.log(nxtData)-Math.log(nxtSim),2); //!! Math.log

    // additionally penalty for negative R or R near zero

    var RlowLimit=0.4;  
    var prefact=0.001;
    if(R_actual<RlowLimit){
      sse += prefact*Math.pow(RlowLimit-R_actual,2);
    }

    // additionally penalty for extreme R //!!! prefact <0.0001
    prefact=0.000001;
    sse += prefact*Math.pow(1-R_actual,2);

    //if(logging&&(it<5)){
    //if(logging&&true){
    if(logging&&false){

      console.log("SSEfunc after update: it=",it," itSnap=",itSnap,
		  " R_actual=",R_actual.toFixed(2),
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
			 // "\nfor Rarr=",Rarr,
			  "");}
  return sse;
}




//##############################################################
// callbacks influencing the overall simulation operation/appearance
//##############################################################


//called in the html  <body onload> event and by myRestartFunction()

function initialize() {
  console.log("in initialize");
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
    Rtime[0]=3; // start with high reproduction rate in first week 
    for(var index=1; index<=getIndexCalibmax(itmaxinit); index++){
      Rtime[index]=1;
    }
    
  }
 

  // =============================================================
  // initialize CoronaSim (no effect of order with graphics)
  // =============================================================

  corona=new CoronaSim();
  fracDie=IFRfun_time(betaIFRinit,-20); //!!!
  if(!useLiveData){corona.init(0);} // !! now inside fetch promise



  // =============================================================
  // initialize graphics
  // =============================================================


  window.addEventListener("resize", canvas_resize);

  canvas = document.getElementById("myCanvas");
  ctx = canvas.getContext("2d");
  var rect = canvas.getBoundingClientRect();
  xPixLeft=rect.left;
  yPixTop=rect.top;
  drawsim=new DrawSim();

  canvas_resize();

  drawsim.setWindow(windowG);


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
// gives index of CONSOLIDATED calibrated Rtime[]
// =============================================================

function getIndexTimeFromCalib(ical){ // MT 2020-08
  return calibInterval*ical; 
}

function getIndexCalib(itime){
  return Math.floor(itime/calibInterval);     // MT 2020-08
}

// last calibration interval must have at least 16 days
function getIndexCalibmax(itime){
  return getIndexCalib(itime-calibAddtlDaysLast); 
}


// =================================================
// determines calibrated Rtime[]
// HERE inside calibrate() the control!
// location for inline nondynamic testing: search for these words
// =================================================

function calibrate(){


  var Rcalib=[]; 
  for(var j=0; j<betaIFRinit.length; j++){ //!!!
    betaIFR[j]=betaIFRinit[j];
  }

  var itmin_c=0;            // basis
  var itmax_c=data_itmax-1; //basis


  if(calibrateOnce){ // global param
    itmin_c=0;            
    itmax_c=data_itmax-1; 
    icalibmin=getIndexCalib(itmin_c);
    icalibmax=getIndexCalibmax(itmax_c);// *max: >=10d cal intv
    Rcalib=[]; // init
    for(var icalib=icalibmin; icalib<=icalibmax; icalib++){
      Rcalib[icalib-icalibmin]=(icalib==0) ? 1.2 : 1; //!!
    }
    estimateR(itmin_c, itmax_c, Rcalib); // also transfers Rcalib to Rtime
    estimateErrorCovar_Rhist_sigmaRhist(itmin_c, itmax_c, Rtime); 
  }

  // ############################################################
  // calibrate in multiple steps
  // ############################################################

  else{ 

    var logging=false;


    var dn=nCalibIntervals-nOverlap;
    var nPeriods=Math.round((data_itmax-1-calibAddtlDaysLast)/(calibInterval*dn));

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

     // get initial R estimate

      icalibmin=getIndexCalib(itmin_c);
      icalibmax=(ip==nPeriods-1) 
//	? getIndexCalibmax(itmax_c) : getIndexCalib(itmax_c);
	? getIndexCalibmax(itmax_c) : getIndexCalibmax(itmax_c);//!!!


      // the follow condition to be false can happen because getIndexCalibmax
      // can return lower index than getIndexCalib because of minimum days
      // to be calibrated


      if(icalibmax>icalibmin){  // not >= since cond. icalibmax-- inside
        firstRfixed=(ip>0); // gloal variable for Rfun
        if(ip>0){ //!! first R value fixed
          icalibmax--;
          firstR=Rtime[ip*dn];
        } 
        Rcalib=[];
        for(var icalib=icalibmin; icalib<=icalibmax; icalib++){
          Rcalib[icalib-icalibmin]=1; 
        }


        if(logging)
	console.log("\n\n\n\ncalibrate: period ip=",ip," dn=",dn,
		  "itmin_c=",itmin_c," itmax_c=",itmax_c,
		    " icalibmin=",icalibmin," icalibmax=",icalibmax,
		    " data_itmax-1=",data_itmax-1,
		    " useInitSnap=",useInitSnap,
		    "\nRcalib=",Rcalib);

      // check if stripped SSEfunc used for nelderMead calculates correctly 

        if(false&&logging){ 
          var sse=SSEfunc(Rcalib,null,false,itmin_c,itmax_c,-1,useInitSnap);
          console.log("\nFull specified SSEfun: sse=",sse);
 
          var sseNull=SSEfunc(Rcalib,null,false);
          console.log("Minimal SSEfun needed for estimate: sseNull=",sseNull);
        }



        // estimate 

        estimateR(itmin_c, itmax_c, Rcalib);  // also Rcalib -> Rtime
        if(logging){console.log("before covar: Rcalib=",Rcalib);}
        estimateErrorCovar_Rhist_sigmaRhist(itmin_c, itmax_c, Rcalib);

        // calculate snapshot for init of next period

        var itsnap=Math.min(calibInterval*dn*(ip+1), itmax_c-1); //!!
        SSEfunc(Rcalib,null,false,itmin_c,itmax_c,itsnap,useInitSnap);
        if(logging) console.log(" snapshot for initialiation in next period:",
		  corona.snapshot);
      }
    }// end calibration proper (several calibr steps)


    firstRfixed=false; // for the whole simulation use all R values in Rtime
    useInitSnap=false; 

    //test whole calibration

    //if(true&&logging){
    if(false&&logging){

      itsnap=calibInterval*dn; //first snapshot to compare with
      SSEfunc(Rtime,null,logging,0, data_itmax-1,itsnap,useInitSnap);
      console.log("corona.snapshot=",corona.snapshot);
    }

  } // calbrate R with multiple periods

  var logging=false;  //calibrate()
  //var logging=true;
  sse=SSEfunc(Rtime,null,logging,0,data_itmax-1); // -1 because it: it->it+1
  console.log("leaving calibrate():",
	      "\n final R values=",Rtime,
	      "\n fit quality sse=",sse);
  


   /** ##############################################################
  estimate the infection fatality rate (IFR)
  in contrast to estimateR easy and only dependent on, 
  not interacting with, estimateR. (the numbe rof deaths is included in the 
  herd immunity xyzTot: more deaths<->less healed<->xyzTot
  ############################################################## */

  console.log("\n\ncalibrating IFR ...betaIFRinit=",betaIFRinit);

  var betaIFRcal=[]; // init for calibration

  for(var j=0; j<betaIFRinit.length; j++){ // betaIFRfinal def at beginning
    betaIFRcal[j]=betaIFRinit[j];
  }
  var logging=true;
  var sse=SSEfuncIFR(betaIFR,null,false);
  console.log("before IFR calibration: betaIFRcal=",betaIFRcal,
	      " sse=",Math.round(sse));


  //###############################################
  sol2_SSEfuncIFR=fmin.nelderMead(SSEfuncIFR, betaIFRcal);

  //###############################################

  for(var j=0; j<betaIFRcal.length; j++){ 
    betaIFR[j]=sol2_SSEfuncIFR.x[j];
  }

  //check
  //var sse=SSEfuncIFR(betaIFR,null,true); console.log("sse=",sse);
  console.log("after IFR calibration: betaIFR=",betaIFR,
	      " sse=",Math.round(sol2_SSEfuncIFR.fx));

/*

*/

/*
  var dn=2;
  var nPeriods=Math.round((data_itmax)/(calibInterval*dn));
 
  for(var ip=1; ip<2; ip++){
 
    IFRcalib=[];
    for(var j=0; j<dn; j++){IFRcalib[j]=0.001;}

    itmin_c=calibInterval*ip*dn;
    itmax_c=Math.min(itmin_c+calibInterval*dn,data_itmax-1);

    itmin_calib=itmin_c; // global variables for the SSE function
    itmax_calib=itmax_c;

    icalibmin=getIndexCalib(itmin_c);
    icalibmax=getIndexCalib(itmax_c);
    if(logging){
	console.log("\n\n\n\ncalibrate: period ip=",ip," dn=",dn,
		  "itmin_c=",itmin_c," itmax_c=",itmax_c,
		    " icalibmin=",icalibmin," icalibmax=",icalibmax,
		    "\nIFRcalib=",IFRcalib);
    }


     // check SSE func
    if(true&&logging){
      var sse=SSEfuncIFR(IFRcalib,null,true,itmin_c,itmax_c);
      console.log("\nFull specified SSEfuncIFR: sse=",sse);
 
      var sseNull=SSEfuncIFR(IFRcalib,null,false);
      console.log("Minimal SSEfuncIFR needed for estimate: sseNull=",sseNull);
    }
  } // loop IFR calibration
*/



  //#####################################################

 

 //##############################################################
 // !! for inline nondynamic testing: add testcode here
 //##############################################################

  if(false){
    var Rtest=[1,1,1,1,1];
    useInitSnap=false;
    var itstart=0;
    var itend=56;
    console.log("\n\ninline nondy. Testing: Rtest=",Rtest);
    console.log("calling  SSEfunc(Rtest,null,true,0,56,42,useInitSnap)");
    var sse=SSEfunc(Rtest,null,true,0,56,42,useInitSnap);
    console.log("Test: sse=",sse);
    alert('stopped simulation with alert');
    //setTimeout(function(){  alert('hello');}, 3000);  
    //alert('hi');
  }

    //alert('stopped simulation with alert');
}
//calibrate()




// =============================================================
// estimate the array R_arr of R values with fmin.nelderMead
// provided by open-source package fmin
// notice: fmin.conjugateGradient does not work here
// => use simple nelderMead and do not need to calculate
// num derivatives in func as side effect of SSEfunc
// @global (do not know how to inject params into func):
// @global data_cumCases: the data to fit, 
//                        (it=0) corresp (idata=data_idataStart)
// @param  Rcalib input and result of estimateR
// @param  itmin_c, itmax_c sets global itmin_calib, itmax_calib
// @global itmin_calib start of calibr intervals (days since dayStartMar)
// @global itmax_calib end of calibr intervals (days since dayStartMar)
// itmin_calib >=0
// itmax_calib < data_itmax-data_idataStart
// controlled by parameter itmin_c, itmax_c

// also transfers Rcalib to Rtime
// =============================================================

function estimateR(itmin_c, itmax_c, Rcalib){

  var icalibmin=getIndexCalib(itmin_c);
  var icalibmax=getIndexCalibmax(itmax_c);// *max: >=10d cal intv

  // set global variables itmin_calib, itmax_calib needed for 
  // fmin.nelderMead

  itmin_calib=itmin_c;
  itmax_calib=itmax_c;


  if(false){console.log("\n\nestimateR: after initializing: Rcalib=",Rcalib,
			" itmin_c=",itmin_c, " itmax_c=",itmax_c,
			" before fmin.nelderMead");}
	   

  /** ##############################################################
  THE central estimation 
  - global control vars itmin_calib,itmax_calib
  - global data variable data_cumCases to fit to by minimizing SSEfunc
  - input/output Rcalib
  - One round (ic<1 instead of ic<2) sometimes not enough

  !!! unresolved speed issue at some firefox browsers (4% market chare):
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

  for(var ic=0; ic<1; ic++){ //!!! 2

    //##############################################################
    sol2_SSEfunc=fmin.nelderMead(SSEfunc, Rcalib);
    //##############################################################
    //console.log("\nafter iter ",ic+1,": Rcalib=",Rcalib);

  }
  //console.log("estimateR: after fmin.nelderMead: Rcalib=",Rcalib);



  // copy tp global R table Rtime

  //console.log("estimateR before new transfer: Rtime=",Rtime);
  if(firstRfixed) for(var j=0; j<Rcalib.length; j++){ //!!!
    Rtime[j+1+icalibmin]=sol2_SSEfunc.x[j];
  }
  else for(var j=0; j<Rcalib.length; j++){ // normal
    Rtime[j+icalibmin]=sol2_SSEfunc.x[j];
  }
  //console.log("estimateR after new transfer: Rtime=",Rtime);


 
  if(false){
    SSEfunc(Rcalib,null,true); // logging of SSEfunc
  }


  //console.log("\n\nleaving estimateR: Rcalib=", Rcalib,
//	      "\n\nRtime=", Rtime,"\n");

} // estimateR



//=======================================================
//!Inductive statistics of the LSE estimator Rcalib
// Cov(Rcalib)=2 V(epsilon) H^{-1}, H=Hessian of SSEfunc(Rcalib)
// also calculates daily values of R and sigmaR from 0 ... itmax
// !! secondary calculation;
// typically only used at the end with Rcalib=global Rtime
//=======================================================

function estimateErrorCovar_Rhist_sigmaRhist(itmin_c, itmax_c, Rcalib){

  var log=false;

  if(log){console.log("entering estimateErrorCovar(): Rcalib=",Rcalib,
		       " firstRfixed=",firstRfixed," firstR=",firstR);}

  var icalibmin=getIndexCalib(itmin_c);
  var icalibmax=getIndexCalibmax(itmax_c);// *max: >=10d cal intv


  var H=[]; // Hessian of actively estimated R elements
  for(var j=0; j<Rcalib.length; j++){H[j]=[];}

  var dR=0.001;



  var Rp=[]; for(var j=0; j<Rcalib.length; j++){Rp[j]=Rcalib[j];}
  var Rm=[]; for(var j=0; j<Rcalib.length; j++){Rm[j]=Rcalib[j];}
  var Rpp=[]; for(var j=0; j<Rcalib.length; j++){Rpp[j]=Rcalib[j];}
  var Rpm=[]; for(var j=0; j<Rcalib.length; j++){Rpm[j]=Rcalib[j];}
  var Rmp=[]; for(var j=0; j<Rcalib.length; j++){Rmp[j]=Rcalib[j];}
  var Rmm=[]; for(var j=0; j<Rcalib.length; j++){Rmm[j]=Rcalib[j];}

  // select calibration interval

  // diagonal

  for(var j=0; j<Rcalib.length; j++){

    Rp[j]+=dR;
    Rm[j]-=dR;
    H[j][j]
      =(SSEfunc(Rp)-2*SSEfunc(Rcalib)+SSEfunc(Rm))/(dR*dR);
    if(log){console.log("\n j=",j," Rcalib=",Rcalib,
			"\n           Rp=",Rp,"\n           Rm=",Rm,
			 "\n SSEfunc(Rp)=   ",SSEfunc(Rp),
			 "\n SSEfunc(Rcalib)=",SSEfunc(Rcalib),
			 "\n SSEfunc(Rm)=   ",SSEfunc(Rm),
			 "");}
    // revert for further use

    Rp[j]=Rcalib[j];
    Rm[j]=Rcalib[j];
  }

  // upper-diagonal

  for(var j=0; j<Rcalib.length; j++){
    for(var k=j; k<Rcalib.length; k++){
      Rpp[j]+=dR; Rpp[k]+=dR; 
      Rpm[j]+=dR; Rpm[k]-=dR; 
      Rmp[j]-=dR; Rmp[k]+=dR; 
      Rmm[j]-=dR; Rmm[k]-=dR; 
      H[j][k]
	=(SSEfunc(Rpp)-SSEfunc(Rpm)-SSEfunc(Rmp)+SSEfunc(Rpp))/(4*dR*dR);
      Rpp[j]=Rcalib[j]; Rpp[k]=Rcalib[k]; 
      Rpm[j]=Rcalib[j]; Rpm[k]=Rcalib[k]; 
      Rmp[j]=Rcalib[j]; Rmp[k]=Rcalib[k]; 
      Rmm[j]=Rcalib[j]; Rmm[k]=Rcalib[k]; 
    }
  }

  // lower-diagonal

  for(var j=0; j<H.length; j++){
    for(var k=0; k<j; k++){
      H[j][k]=H[k][j];
    }
  }

  if(log){
    console.log("before inverting: Rcalib.length=",Rcalib.length);
    for(var j=0; j<H.length; j++){
      console.log(" j=",j," H[j]=",H[j]);
    }
  }

  // inverse Hessian

  var Hinv=math.inv(H);

  // variance of random term epsilon assuming epsilon \sim i.i.d.

  var vareps=SSEfunc(Rcalib)/(itmax_calib-itmin_calib-H.length);


  // calculate one-sigma estimation errors (every 2 weeks)

  var sigmaR=[];
  for(var j=0; j<Rcalib.length; j++){
    sigmaR[j]=Math.sqrt(2*vareps*Hinv[j][j]);
  }




  // transfer R and sigma 
  // to global daily R_hist[] and sigmaR_hist[] p to present 
  // (extrapolate constant if needed, e.g. data not up-to-date)
  // getIndexTimeFromCalib(1) typically calibInterval days)

  for(var it=itmin_c; it<itmaxinit; it++){//
    var j=Math.min(Math.floor( (it-itmin_c)/calibInterval),
		   Rcalib.length-1);
    sigmaR_hist[it]=sigmaR[j];
    R_hist[it]=Rcalib[j];
    if(log&&false){console.log("it=",it," j=",j,
			" sigmaR_hist[it]=", sigmaR_hist[it]);}
  }





} // estimateErrorCovar_Rhist_sigmaRhist





// ###############################################################
// calculate log(SSE(IFR)) as GoF of the IFR calibration
// beta: hint: tauDie as 4th element does not work even with intp in corona.updateO*
// ###############################################################


function SSEfuncIFR(beta, grad, logging) {
  if( typeof grad === "undefined"){
    grad=[]; for(var j=0; j<beta.length; j++){grad[j]=0;}
  }
  if( typeof logging === "undefined"){logging=false;}

  if(logging){
    console.log("\nEntering SSEfuncIFR:",
		" beta=",beta);
  }

  // init with it=0 to have exactly the same
  // simulation as after finsihed R calibration  (one-step calib)

  fracDie=IFRfun_time(beta,-20); // also use fracDie in warmup!
  corona.init(0, logging); 

  var sseIFR=0;
  for(var it=0; it<data_itmax-1; it++){

    // simulate

    fracDie= IFRfun_time(beta,it);    // beta to be calibrated
    var R_actual= Rfun_time(Rtime,it); // Rtime already calibrated

    corona.updateOneDay(R_actual, it, logging); // using fracDie
    if(logging){console.log("it=",it," fracDie=",fracDie," tauDie=",tauDie,
			    " R_actual=",R_actual," ndz=",n0*corona.dz,
			    " ndx=",n0*corona.x[0],
			    " nxt=",n0*corona.xt);}

    //  !!! GoF function new deaths (no log because of zero values)

    // var nSim=n0*corona.dz;
    // var nData=data_cumDeaths[data_idataStart+it+1]  
    //     -data_cumDeaths[data_idataStart+it];

    //  !!! GoF function cum deaths (no log because of zero values)

    var nSim=n0*corona.z;
    var nData=data_cumDeaths[data_idataStart+it+1];

    if(logging){console.log("it=",it," nSim=",nSim," nData=",nData);}
    sseIFR+=Math.pow(nData-nSim,2);

    // penalty for IFR<=0

    var IFRmin=5e-4;
    var penalty0=100*nData;
    if(fracDie<IFRmin){
      sseIFR += penalty0*Math.pow((IFRmin-fracDie)/fracDie,2);
    }
  }
  return sseIFR;
}


// beta: 4-array containing 4 IFRs to be calibrated as first elements; 
// times it0,it1,it2,it3 fixed
// !!!it0 <0 because interferes with init(: fracDie= IFRfun_time(beta,-20);

function IFRfun_time(beta, it){
  var it0=0; 
  var it1=20;
  var it2=70;
  var it3=140;
  var IFR=(it<it0) ? beta[0] : (it<it1)
    ? beta[0]+(beta[1]-beta[0])/(it1-it0)*(it-it0):(it<it2)
    ? beta[1]+(beta[2]-beta[1])/(it2-it1)*(it-it1):(it<it3)
    ? beta[2]+(beta[3]-beta[2])/(it3-it2)*(it-it2):beta[3];
  return IFR;

}//IFRfun_time






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


function toggleTestnumber(){ // callback html "testnumber"
  //clearInterval(myRun);

  if(includeInfluenceTestNumber){
    includeInfluenceTestNumber=false;
    document.getElementById("testnumber").innerHTML
      ="Beruecksichtige Testhaeufigkeit";
        //myRun=setInterval(simulationRun, 1000/fps);
  }
  else{
    includeInfluenceTestNumber=true;
    document.getElementById("testnumber").innerHTML
      ="Ignoriere Testhaeufigkeit";
  }

  pTest=parseFloat(slider_pTest.value)/100;
  myCalibrateFunction();
  console.log("leaving toggleTestnumber: includeInfluenceTestNumber=",
	      includeInfluenceTestNumber,
	      " pTest=",pTest);
}



function selectDataCountry(){ // callback html select box "countryData"
  console.log("\nin selectDataCountry(): itmax=",itmaxinit);
  itmax=itmaxinit;
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
  //drawsim.drawOld(it,windowG,corona.xAct,corona.xt,
//		       corona.y,corona.yt,corona.z); // !! also scales anew
}



function myRestartFunction(){ 
  console.log("in myRestartFunction: itmax=itmaxinit=",itmaxinit);
  initialize();
  itmax=itmaxinit;
  it=0; //!!! only instance apart from init where global it is reset to zero 
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  fracDie=IFRfun_time(betaIFR,-20); //!!! fracDieInit*pTest/pTestInit;
  corona.init(0,true); // because initialize redefines CoronaSim() and data there here

  clearInterval(myRun);
  console.log("myRestartFunction: itmax=",itmax);
  drawsim.checkRescaling(it); //  sometimes bug x scaling not reset

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
  testSliderUsed=false;
  calibrate();
  myRestartFunction();
}



// selectDataCountry selects default sliders for the active country
// => can use it directly as the reset function

function myResetFunction(){ 
  console.log("in myResetFunction");
  RsliderUsed=false;
  otherSliderUsed=false;
  testSliderUsed=false;

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
  myRestartFunction();
}


function simulationRun() {

  doSimulationStep(); 
  //console.log("RsliderUsed=",RsliderUsed);
  if(!RsliderUsed){
    setSlider(slider_R0, slider_R0Text, Rfun_time(Rtime,it).toFixed(2),"");
  }

  if((!testSliderUsed)&&includeInfluenceTestNumber){
    setSlider(slider_pTest, slider_pTestText, Math.round(100*pTest), " %");
  }

  // suffer one undefined at data_cumCases 
  // (doSimulationStep increments it so itmaxinit-2 would be correct)
  // to get full sim curves (first plot then update 
  // to get the initial point it=0) 

  if(it==itmaxinit-1){ 
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

  //!!! it->(it+1) because otherwise not consistent with "calculate SSE"
  var R_actual=(RsliderUsed) ? R0 : Rfun_time(Rtime,it);
  fracDie= IFRfun_time(betaIFR,it); //!!!

  R_hist[it]=R_actual;
 // console.log("IFRfun_time(betaIFRfinal,it)=", IFRfun_time(betaIFRfinal,it));

  if(false){ // doSimulationStep: logging "allowed"
    console.log(" doSimulationStep before corona.update: it=",it,
		"data_cumCases[data_idataStart+it]=",
		data_cumCases[data_idataStart+it],
		" n0*corona.xt=",(n0*corona.xt).toPrecision(6),
		" R_actual=",R_actual.toPrecision(3),
		" fracDie=",fracDie.toPrecision(3),
		" corona.z=",Math.round(corona.z),
		"");
  }

  drawsim.draw(it);
 
  var logging=false;  // doSimulationStep: logging "allowed"
  //var logging=(it<3);


  corona.updateOneDay(R_actual,it,logging); // in doSimulationStep
  it++;

  //if(false){// doSimulationStep: logging "allowed"
  if(true){// doSimulationStep: logging "allowed"
    var idata=data_idataStart+it; // not "+1+" since after it++
    console.log( "doSimulationStep: after it++: it=",it,
		 " R=",R_actual.toFixed(2),
		" pTest=",pTest.toPrecision(3),
		" ndx=",Math.round(n0*corona.x[0]),
		" ndxt=",Math.round(n0*corona.dxt),
		" ndxtFalse=",Math.round(n0*corona.dxtFalse),
		" nxt=",Math.round(n0*corona.xt),
		" nxtData=",((it<itmaxinit-1) ? data_cumCases[idata]:"na"),
		" fracDie=",fracDie.toPrecision(3),
		" n0*corona.z=",Math.round(n0*corona.z),
		" deathsData=",((it<itmaxinit-1) ? data_cumDeaths[idata]:"na"),
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

function CoronaSim(){
  //console.log("CoronaSim created");
  this.x=[]; // age struture of fraction infected at given timestep
  this.xohne=[]; // age structure without deleting by recover,death 
                 // (!!needed for correct recovery rate and balance x,y,z!)
  this.snapAvailable=false; // initially, no snapshot of the state exists
}


//!!! need to chose appropriate fracDie before!

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
  var r0=Math.log(Rfun_time(Rtime,it0))/tauR;  // init reprod rate by stable Rfun_*
  var denom=0; 

  for(var tau=0; tau<taumax; tau++){
    denom+=Math.exp(-r0*tau);
  }
  for(var tau=0; tau<taumax; tau++){ // in init
    this.x[tau]=this.xAct*Math.exp(-r0*tau)/denom;
    this.xohne[tau]=this.x[tau];
    if(false){console.log("init: it0=",it0," R0=",Rfun_time(Rtime,it0),
			    " r0=",r0," tau=",tau,
			    " this.x[tau]=",this.x[tau]);}
  }

  // data-driven warmup

  for(var its=it0; its<itStart; its++){ 
    var Rt=Rfun_time(Rtime,its);

    if(logging&&(it==-10)){console.log("corona.init warmup before update: its=",its,
			    " pTest=",pTest.toPrecision(3),
			    " R=",Rt.toFixed(2),
			    " ndx=",(n0*this.x[0]).toPrecision(3),
			    " ndxt=",(n0*this.dxt).toPrecision(3),
			    " ndxtFalse=",(n0*this.dxtFalse).toPrecision(3),
			    "");}
    this.updateOneDay(Rt,its,logging); // in CoronaSim, data-driven warmup
  }



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
  this.dxtFalse = 0; //!!
  this.y        *= scaleDownFact;
  this.z        *= scaleDownFact;
  this.dxtFalse=(data_dn[data_idataStart]/n0 
		 - pTest*this.xohne[tauTest])*beta;//!!

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

CoronaSim.prototype.updateOneDay=function(R,it,logging){ 

  if( typeof logging === "undefined"){logging=false;}
  //logging=logging&&(it>=83)&&(it<86);//!!
  //logging=false; //!!



  //if(logging){  //filter needed because of called mult times in calibr!
  //if(logging&&false){
  if(logging&&((it==-10)||(it==10))){
    console.log(
      "Enter CoronaSim.updateOneDay: it=",it," R=",R.toPrecision(2),
      " this.xAct=",this.xAct.toPrecision(3),
      " this.xyz=",this.xyz.toPrecision(3),
      " this.y=",this.y.toPrecision(3),
      " this.z=",this.z.toPrecision(3),
      " nxt=n0*this.xt=",Math.round(n0*this.xt),
      " fracDie=",fracDie.toPrecision(3),
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
  // updateOneDay: Do the true dynamics
  // ###############################################

  // (1) shift age profile of already infected by one

  for(var tau=taumax-1; tau>0; tau--){
    this.x[tau]=this.x[tau-1];
    this.xohne[tau]=this.xohne[tau-1];
  }


  // true dynamics (2): infect new people

  this.x[0]=0;
  var f_R=1./(tauRend-tauRstart+1);
  if(n0*this.xAct>=1){ // !! infection finally dead if xAct<1
    for(var tau=tauRstart; tau<=tauRend; tau++){
      this.x[0]+=R*f_R*this.x[tau]*(1-this.xyz);
    }
  }
  this.xohne[0]=this.x[0];



  // true dynamics (3): let people die or recover
  // smooth  over tauAvg days

  var dtau=Math.floor(tauAvg/2); // tauAvg is global uneven variable, e.g.=5

  var f_D=1./tauAvg;

/*
  var tauDie_i=Math.floor(tauDie); //!! real-values tauDie
  var tauDie_r=tauDie-tauDie_i;
  var f_D=1./(tauAvg+tauDie_r);
*/

  this.dz=0;
  var dysum=0;

  for(var tau=tauDie-dtau; tau<=tauDie+dtau; tau++){
    var dztau=fracDie*f_D*this.xohne[tau]; //!! here xohne crucial
    this.dz+=dztau;
    this.x[tau] -=dztau; // xohne remains unsubtracted
  }
  //this.dz+=fracDie*f_D*tauDie_r*this.xohne[tauDie+dtau+1]; //!!real tauDie

  var f_Rec=1./tauAvg;
  for(var tau=tauRecover-dtau; tau<=tauRecover+dtau; tau++){
    var dy=(1-fracDie)*f_Rec*this.xohne[tau]; //!! here xohne crucial
    dysum+=dy;
    this.x[tau] -=dy; // xohne remains unsubtracted
  }
  this.z   += this.dz;
  this.y   += dysum;


  // (4) sum up the profile of infected people
  // xAct: relative sum of "actually infected" (neither recoverd nor dead)
  // xyz: relative cumulative sum of infected (incl recovered, dead)


  this.xyz+= this.x[0];

  this.xAct=0;  
  for(var tau=0; tau<taumax; tau++){
    this.xAct     += this.x[tau];
  }



  //#####################################################
  // Test people (in updateOneDay)
  //#####################################################



  // (1) simulated positive tests
  // test time ~ U(tauTest-tauAvg/2,tauTest+tauAvg/2) over infection age

  var idata=it+data_idataStart+1; // sim from it to it+1, hence "+1"

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
    this.dxt +=pTest*f_T*this.xohne[tau]*(1-alpha);
  }

  // add beta error outside tau loop (the test gets dn-pTest*n0*this.xohne
  // noninfected people ) and increment cumulative this.xt

  if(it>=0){// do not use absolute data such as data_dn in warmup!
    var dn=(idata<data_dn.length) 
      ? data_dn[idata] : dn_weeklyPattern[(idata-data_pTestModel.length)%7];
    this.dxtFalse=(dn/n0 - pTest*this.xohne[tauTest])*beta;
    this.dxt+=this.dxtFalse;
  }

  this.xt += this.dxt;



  // (2) simulate tested recoveries:
  // (now, do simply balance at graphics stage 
  // (following three commented lines work well w/o beta error)

  //this.pTestDay[it]= pTest;
  //var dayTested=Math.max(0,it-Math.round(tauRecover-tauTest));
  // this.yt  +=(this.pTestDay[dayTested]-fracDie)/(1-fracDie)*dysum


  



  // control output (it is undefined here!)

  if(logging&&false){ // filter needed because called in calibration!

    console.log(
      "end CoronaSim.updateOneDay: it=",it," R=",R.toPrecision(2),
      " this.xAct=",this.xAct.toPrecision(3),
      " this.xyz=",this.xyz.toPrecision(3),
      " this.y=",this.y.toPrecision(3),
      " this.z=",this.z.toPrecision(3),
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
// .length and initializer expect all indices starting at 0

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

  // upper boundary treatment (lower not relevant)

  for(var i=0; i<half; i++){smooth[i]=arr[i];} // lower boundary not relevant

  var applySmoothingToUpper=true;

  // additive saison decomposition since sometimes zeroes in the data
  if(applySmoothingToUpper){// assume 7d period

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
 
  else{ // just take raw data
    for(var i=arr.length-half; i<arr.length; i++){smooth[i]=arr[i];}
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

  this.unitPers=1000;  // persons counted in multiples of unitPers

  this.itR0=-1; // it value where n0*xt first exceeds nxtR0 (init val)
  this.yminType=[0,1,0,0,0];   // lin,log,act0,act1,act2
  this.ymaxType=[10,7,10,10,10];   // lin,log,act0,act1,act2
  this.ymaxPerc=20;
  this.ymaxLin=11;
  this.ymaxLog=7;



  this.xPix=[]; // this.xPix0 etc defined in drawSim method


 
  colInfected="rgb(255,150,0)";
  colInfectedWin3="rgb(255,170,0)";
  colInfectedTot="rgb(0,0,220)";
  colTests="rgb(0,0,210)";
  colCases="rgb(245,10,0)";
  colCasesBars="rgb(220,0,0)";
  colSimCases="rgb(100,0,0)";
  colFalsePos="rgb(0,220,0)";
  colRecov="rgb(60,255,40)";
  colRecovCases="rgb(0,150,40)";
  colDead="rgb(0,0,0)";  
  colPosrateCum="rgb(0,0,150)"; 
  colPosrate="rgb(255,0,255)"; 
  colCFR="rgb(100,0,180)";  
  colIFR="rgb(127,127,127)";



  // central conatiner for the graphics data

  this.dataG=[];
  this.xtPast=0; // needed to derive yt from balance since no longer calc.

// window 0 (sim+data lin)

  this.dataG[0]={key: "Insgesamt positiv Getestete (in 1000)",
		 data: [],
		 type: 3, // 0=data dir (posCases),
                          // 1=solid deriv from data (CFR), 
                          // 2=more speculative derivation (IFR)
                          // 3=simulation, 4=speculative simulation
		 window: 0, // 0=sim cum lin, 1=sim cum log,2-4=data views
		 plottype: "lines",  // in "lines", "points", "bars"
		 plotLog: false,  // if true, logarithm plotted
		 ytrafo: [0.001, false,false],// [scalefact, half, mirrored]
		 color:colCases
		}

  this.dataG[1]={key: "Insg. Genesene unter den Getesteten (in 1000)",data:[],
		 type: 3, window:0, plottype: "lines", plotLog: false, 
		 ytrafo: [0.001, false,false], color:colRecovCases};

  this.dataG[2]={key: "Insgesamt Gestorbene (in 100)", data: [],
		 type: 3, window:0, plottype: "lines", plotLog: false, 
		 ytrafo: [0.01, false,false], color:colDead};

  this.dataG[3]={key: "#Tote ges/#positiv getestet ges", data: [],
		 type: 3, window:0, plottype: "lines", plotLog: false,
		  ytrafo: [1, false,false], color:colPosrateCum};



  this.dataG[4]={key: "Insgesamt positiv Getestete (in 1000)",data: [],
		 type: 0, window:0, plottype: "points", plotLog: false, 
		 ytrafo: [0.001, false,false], color:colCases};

  this.dataG[5]={key: "Insg. Genesene unter den Getesteten (in 1000)",data:[],
		 type: 0, window:0, plottype: "points", plotLog: false, 
		 ytrafo: [0.001, false,false], color:colRecovCases};

  this.dataG[6]={key: "Insgesamt Gestorbene (in 100)", data: [],
		 type: 3, window:0, plottype: "lines", plotLog: false,
		 type: 0, window:0, plottype: "points", plotLog: false, 
		 ytrafo: [0.01, false,false], color:colDead};

  this.dataG[7]={key: "#Tote ges/#positiv getestet ges", data: [],
		 type: 0, window:0, plottype: "points", plotLog: false,
		  ytrafo: [1, false,false], color:colPosrateCum};

  // window 1 (sim+data log)


  this.dataG[8]={key: "Aktuell real infizierte Personen", data: [],
		 type: 4, window:1, plottype: "lines", plotLog: true, 
		 ytrafo: [1, false,false], color:colInfected};

  this.dataG[9]={key: "Insgesamt positiv Getestete", data: [],
		 type: 3, window:1, plottype: "lines", plotLog: true, 
		 ytrafo: [1, false,false], color:colCases};

  this.dataG[10]={key: "Insgesamt Genesene unter allen Personen", data: [],
		  type: 4, window:1, plottype: "lines", plotLog: true, 
		  ytrafo: [1, false,false], color:colRecov};

  this.dataG[11]={key: "Insgesamt Genesene unter den Getesteten", data: [],
		  type: 3, window:1, plottype: "lines", plotLog: true, 
		  ytrafo: [1, false,false], color: colRecovCases};

  this.dataG[12]={key: "Insgesamt Gestorbene", data: [],
		  type: 3, window:1, plottype: "lines", plotLog: true, 
		  ytrafo: [1, false,false], color:colDead};



  this.dataG[13]={key: "Insgesamt positiv Getestete", data: [],
		 type: 0, window:1, plottype: "points", plotLog: true, 
		 ytrafo: [1, false,false], color:colCases};

  this.dataG[14]={key: "Insgesamt Genesene unter den Getesteten", data: [],
		  type: 0, window:1, plottype: "points", plotLog: true, 
		  ytrafo: [1, false,false], color: colRecovCases};

  this.dataG[15]={key: "Insgesamt Gestorbene", data: [],
		  type: 0, window:1, plottype: "points", plotLog: true, 
		  ytrafo: [1, false,false], color:colDead};



  // window 2: mirrored bar chart cases vs dead persons
  // ytrafo=[scalefact, half, mirrored] 

  this.dataG[16]={key: "Positiv Getestete pro Tag", data: [],
		 type: 0, window:2, plottype: "bars", plotLog: false, 
		 ytrafo: [0.1, true,false], color:colCasesBars}; // real: scale*10

  this.dataG[17]={key: "Gestorbene pro Tag", data: [],
		 type: 0, window:2, plottype: "bars", plotLog: false, 
		 ytrafo: [1, true,true], color:colDead};

  // + new data at bottom



  // window 3: mirrored bar chart cases vs dead persons
  // ytrafo=[scalefact, half, mirrored]

  this.dataG[18]={key: "Positiv Getestete pro Tag", data: [],
		 type: 0, window:3, plottype: "bars", plotLog: false, 
		 ytrafo: [1, false,false], color:colCasesBars};

  this.dataG[19]={key: "Tests pro Tag (in 100)", data: [],
		 type: 0, window:3, plottype: "points", plotLog: false, 
		 ytrafo: [0.01, false,false], color:colTests};


  // window 4: infection ratios

  this.dataG[20]={key: "Anteil positiver Tests [%]", data: [],
		 type: 0, window:4, plottype: "points", plotLog: false, 
		 ytrafo: [100, false,false], color:colPosrate};

  this.dataG[21]={key: "CFR (Case fatality rate) [%]", data: [],
		 type: 1, window:4, plottype: "points", plotLog: false, 
		 ytrafo: [100, false,false], color:colCFR};

  this.dataG[22]={key: "Sim IFR (Infection fatality rate) [Promille]", data: [],
		 type: 4, window:4, plottype: "lines", plotLog: false, 
		 ytrafo: [1000, false,false], color:colIFR};


  // new curves/lines/bars

  this.dataG[23]={key: "Simulierte Neuinfizierte pro Tag (in 10)", data: [],
		 type: 4, window:2, plottype: "lines", plotLog: false, 
		 ytrafo: [0.01, true,false], color:colInfectedWin3};// real: scale*10

  this.dataG[24]={key: "Simulierte Neuinfizierte pro Tag (in 10)", data: [],
		 type: 4, window:3, plottype: "lines", plotLog: false, 
		 ytrafo: [0.1, false,false], color:colInfectedWin3};

  this.dataG[25]={key: "Simulierte Durchseuchung", data: [],
		 type: 4, window:1, plottype: "lines", plotLog: true, 
		 ytrafo: [1, false,false], color:colInfectedTot};

  this.dataG[26]={key: "Simulierte False Positives pro Tag", data: [],
		 //type: 4, window:3, plottype: "bars", plotLog: false, 
		 type: 4, window:3, plottype: "lines", plotLog: false, 
		 ytrafo: [1, false,false], color:colFalsePos};

  this.dataG[27]={key: "Simulierte Test-Positive pro Tag", data: [],
		 type: 4, window:3, plottype: "lines", plotLog: false, 
		 ytrafo: [1, false,false], color:colSimCases};




// quantity selector for the different display windows

  this.qselect=[];

  //this.qselect[0]=[0,1,2,3,4,5,6,7];
  this.qselect[0]=[0,1,2,4,5,6];  // without cum posRate
  this.qselect[1]=[8,9,12,13,15,25];
  this.qselect[2]=[16,17,23];
  this.qselect[3]=[18,19,24,26,27];
  this.qselect[4]=[20,21,22];


  this.label_y_window=[countryGer+": Personenzahl (in Tausend)",
	       countryGer+": Personenzahl",
	       countryGer+": Personen pro Tag",
	       countryGer+": taegliche Zahlen",
	       countryGer+": Anteil [% oder Promille]"];


  // initialize data feed and fonts at drawSim/drawAxes since sometimes
  // data fetch not yet finished/canvas not yet sized at construction time

  console.log("end drawsim cstr: windowG=",windowG);
 
}


DrawSim.prototype.setWindow=function(windowG){
  var displayRecovered=( (country==="Germany")
			     ||(country==="Austria")
			     ||(country==="Czechia")
			     ||(country==="Switzerland")
			     ||(country==="India"));

  if(!displayRecovered){
    this.qselect[0]=[0,2,4,6];
  }



  this.clear();
  this.drawAxes(windowG);

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


// windowG in [0,4]

DrawSim.prototype.drawAxes=function(windowG){


  // update the font (drawAxes called at first drawing and after all 
  // canvas/display changes)

  ctx.font = textsize+"px Arial"; 



  // define x axis label positions and strings, time starts Mar 20

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

  // calculate  x axis ticks/labels by selecting from string array
  // with variable tick intervals dweek

  var dweek=(itmax<itmaxCrit) ? 1 : (itmax<itmaxCrit2) ? 2 : 4;
  var iwinit=0; // MT 2020-08
  for(var itick=0; itick<Math.round(timeTextW.length/dweek); itick++){
    days[itick]=7*(iwinit+dweek*itick);
    timeText[itick]=timeTextW[iwinit+dweek*itick];
    timeRel[itick]=days[itick]/(itmax);
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
  //console.log("drawAxes new: dy=",dy," ny=",ny);



  // draw 3 px wide lines as coordinates
  // remaining hack: mirrored graphics cases/deaths: yPix0,hPix w/o "this"

  var yPix0=(windowG==2) 
    ? 0.5*(this.yPix0+this.yPixMax) : this.yPix0;
  var hPix=(windowG!=2) ? this.hPix : 0.5*this.hPix;

  ctx.fillStyle="rgb(0,0,0)";
  ctx.fillRect(this.xPix0, yPix0-1.5, this.wPix, 3);
  ctx.fillRect(this.xPix0-1.5,this.yPix0, 3, this.hPix);// y axis always orig!



  // draw grid (inside drawAxes)

  ctx.strokeStyle="rgb(0,0,0)";

  for(var ix=0; days[ix]<=itmax; ix++){
    this.drawGridLine("vertical", timeRel[ix]);
  }

  if(windowG!=2){
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
   for(var ix=0; days[ix]<=itmax; ix++){
    var xpix=this.xPix0+timeRel[ix]*this.wPix+dxShift;
    var ypix=this.yPix0+dyShift;
    ctx.setTransform(cphi,-sphi,+sphi,cphi,xpix,ypix);
    ctx.fillText(timeText[ix],0,0);
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

  if(windowG!=2){ 
    for(var iy=0; iy<=ny; iy++){
      var valueStr=(windowG!=1)  ? iy*dy : "10^"+iy;
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




  
  // draw key

  var yrelTop=(windowG==1) // 1=log
    ? -4.5*(1.2*textsize/this.hPix) : 0.95;
  var xrelLeft=(windowG==0) ? 0.02 : 0.40; 
  var dyrel=-1.2*textsize/this.hPix;
  var ikey=0;

  for (var iq=0; iq<this.qselect[windowG].length; iq++){

    var q=this.qselect[windowG][iq];

    // no key for sim graphics when calibr./valid. points are plotted

    if(!((windowG<2)&&(this.dataG[q].type<3))){

      ctx.fillStyle=this.dataG[q].color;
      ctx.fillText(this.dataG[q].key,
	           this.xPix0+xrelLeft*this.wPix,
		   this.yPix0+(yrelTop-ikey*dyrel)*this.hPix);
      ikey++;
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
  this.dataG[3].data[it]=n0*corona.z/corona.xt
  this.dataG[8].data[it]=log10(n0*corona.xAct);
  this.dataG[9].data[it]=log10(n0*corona.xt);
  this.dataG[10].data[it]=log10(n0*corona.y);
  this.dataG[12].data[it]=log10(n0*corona.z);
  this.dataG[22].data[it]=IFRfun_time(betaIFR,it); //!! new!
  this.dataG[23].data[it]=n0*corona.x[0]; // x[0]=infected at infection age 0
  this.dataG[24].data=this.dataG[23].data;
  this.dataG[25].data[it]=log10(n0*corona.xyz); // "Durchseuchung"
  this.dataG[26].data[it]=n0*corona.dxtFalse; // sim number of false positives
  this.dataG[27].data[it]=n0*corona.dxt; // sim number of positive tests


  // get yt  from balance xt past, zt=z
  var itPast=it-tauRecover;
  var nxtPast=(it<tauRecover)
    ? data_cumCases[it-tauRecover+data_idataStart]
    : this.dataG[0].data[itPast];
  this.dataG[1].data[it]=nxtPast-n0*corona.z; // balance past infected-deaths
  this.dataG[11].data[it]=log10(this.dataG[1].data[it]);

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

// windows 0,1

  this.dataG[4].data=data_cumCases;  // by reference
  this.dataG[5].data=data_cumRecovered;
  this.dataG[6].data=data_cumDeaths;
  this.dataG[7].data=data_cumCfr;
 
  for(var i=0; i<data_cumCases.length; i++){ // by value because of log10:
    this.dataG[13].data[i]=log10(data_cumCases[i]);
    this.dataG[14].data[i]=log10(data_cumRecovered[i]);
    this.dataG[15].data[i]=log10(data_cumDeaths[i]);
  }


  // windows 2-4

   //kernel=[1]; //!!
   kernel=[1/4,2/4,1/4];
  //kernel=[1/9,2/9,3/9,2/9,1/9];
    //kernel=[1/16,2/16,3/16,4/16,3/16,2/16,1/16];
    //kernel=[1/25,2/25,3/25,4/25,5/25,4/25,3/25,2/25,1/25];

  var dnSmooth=smooth(data_dn,kernel);
  var dxtSmooth=smooth(data_dxt,kernel);
  var dzSmooth=smooth(data_dz,kernel);
  var posRateSmooth=smooth(data_posRate,kernel);
  var cfrSmooth=smooth(data_cfr,kernel);
  //var ifrSmooth=smooth(data_ifr,kernel);

  

  this.dataG[16].data=dxtSmooth; // by reference
  this.dataG[17].data=dzSmooth; 

  this.dataG[18].data=dxtSmooth; // the same as [16]
  this.dataG[19].data=dnSmooth; 

  this.dataG[20].data=posRateSmooth;
  this.dataG[21].data=cfrSmooth;
  //this.dataG[22].data=ifrSmooth;//!!!

  if(false){
    console.log("\n\nDrawSim.transferRecordedData:");
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

  //console.log("\ndrawsim.checkRescaling: it=",it," itmax=",itmax);
  var erase=false;


  // (1) possible rescaling in x

  if(it>itmax){
    itmax=it;
    erase=true;
  }

  if(erase || (it==0)){
    for(var i=0; i<=itmax; i++){
      this.xPix[i]=this.xPix0+i*(this.xPixMax-this.xPix0)/itmax;
    }
  }



  // (2) possible rescaling in y for all the graph windows

  for(var iw=0; iw<5; iw++){ //windows
    for(iq=0; iq<this.qselect[iw].length; iq++){ // quantity selector
      var q=this.qselect[iw][iq];
      var data=this.dataG[q].data;
      var i=(this.dataG[q].type<3) ? it+data_idataStart : it;
      var scaling=this.dataG[q].ytrafo[0];
      var type=this.dataG[q].type;
      var value=data[i]*scaling;

      if(value>this.ymaxType[iw]){
	this.ymaxType[iw]=value;
	erase=true;
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
  this.ymaxType[0]=Math.max(this.ymaxType[0], 10); // abs lin to 20

  // (4) do actions

  if(erase){
    this.clear();
    this.drawAxes(windowG);
  }

  //console.log("leaving checkRescaling: this.ymaxType=",this.ymaxType);
}// DrawSim.checkRescaling=


//######################################################################
DrawSim.prototype.drawREstimate=function(it){
//######################################################################

  //console.log("in DrawSim.drawREstimate: it=",it);

  ctx.fillStyle="#888888";// vertical period separation lines
  var x0=this.xPix0;
  var y0=this.yPix0+0.3*this.hPix;

  ctx.setTransform(0,-1,1,0,x0+1.0*textsizeR,y0);
  var str_R="R="+R_hist[0].toFixed(2)
      +( (RsliderUsed||otherSliderUsed)
	 ? "" : (" +/- "+sigmaR_hist[0].toFixed(2)));
  ctx.fillText(str_R,0,0);
  ctx.setTransform(1,0,0,1,0,0);

  for(var ical=0; ical<=getIndexCalib(it); ical++){ 
    var itR=getIndexTimeFromCalib(ical);
    x0=this.xPix[itR];
    ctx.fillRect(x0-1,this.yPix0,3,this.hPix);

    ctx.setTransform(0,-1,1,0,x0+1.0*textsizeR,y0);
    if(false){
      console.log("drawSim.draw: it=",it," itR=",itR,
		" R_hist.length=",R_hist.length,
		" sigmaR_hist.length=",sigmaR_hist.length,
		" itmaxinit=",itmaxinit,
		" R_hist[itR]=",R_hist[itR],
		" sigmaR_hist[itR]=",sigmaR_hist[itR],
		"");
    }
    str_R="R="+R_hist[itR].toFixed(2)
      +( (RsliderUsed||otherSliderUsed||(itR>=data_itmax))
     // +((true) // if sigma_R undefiuned
	? "" : (" +/- "+sigmaR_hist[itR].toFixed(2)));

 
    ctx.fillText(str_R,0,0);
    ctx.setTransform(1,0,0,1,0,0);
  }
}




//######################################################################
DrawSim.prototype.draw=function(it,q){
//######################################################################

 // console.log("\n\nin DrawSim.draw: it=",it," textsize=",textsize);


  // global vars canvas.width, canvas.height,
  // viewport.width, viewport.height
  // textsize, textsizeR (for the R values) set by 
  // canvas_gui.canvas_resize()

  // must update canvas boundaries since canvas may be resized

  if(hasChanged){
    this.xPix0=0.12*canvas.width;
    this.xPixMax=0.98*canvas.width;
    this.yPix0=(isSmartphone) ? 0.85*canvas.height : 0.90*canvas.height;
    this.yPixMax=0.02*canvas.height;
    this.wPix=this.xPixMax-this.xPix0;
    this.hPix=this.yPixMax-this.yPix0;  //<0
    for(var i=0; i<=itmax; i++){
      this.xPix[i]=this.xPix0+i*(this.xPixMax-this.xPix0)/itmax;
    }
  }

  // initialize: transfer new data and redraw whole graphics

  this.transferSimData(it);
  if(it==0){this.transferRecordedData()}; 
 
  if((it==0)||hasChanged){
    this.clear();
    this.drawAxes(windowG);
  }



  // check for possible scaling/rescaling due to new data on x and y axis 
  // and redraw if needed (local erase=true)

  this.checkRescaling(it);




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
    //if(it==20){
      console.log("draw: it=",it," i=",i,
		  " windowG=",windowG,
		  " q=",q," type=",type,
		  " scaling=",scaling," half=",half," downwardsw=",downwards,
		  " plottype=",plottype," wline=",wLine,
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

  // draw R estimates for windows qith simulations

  if(windowG<3){
    this.drawREstimate(it);
  }


  }

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
  for (var ig=0; ig<=it; ig++){
    var i=iDataStart+ig; // i=iData
    var value=data_arr[i]*scaling;
    if((i>0)&&(value>=yminDraw) &&(value<=ymaxDraw)){
      var valueOld=data_arr[i-1]*scaling;
      var yrel=(value-yminDraw)/(ymaxDraw-yminDraw);
      var yrelOld=(valueOld-yminDraw)/(ymaxDraw-yminDraw);
      var yPix=yPix0+yrel*(yPixMax-yPix0);
      var yPixOld=yPix0+yrelOld*(yPixMax-yPix0);

      var phi=Math.atan((yPix-yPixOld)/
			(this.xPix[ig]-this.xPix[ig-1]));
      var cphi=Math.cos(phi);
      var sphi=Math.sin(phi);

      ctx.beginPath(); //!! crucial; otherwise latest col used for ALL
      ctx.moveTo(this.xPix[ig-1]-wLine*sphi, yPixOld+wLine*cphi);
      ctx.lineTo(this.xPix[ig-1]+wLine*sphi, yPixOld-wLine*cphi);
      ctx.lineTo(this.xPix[ig]+wLine*sphi,   yPix-wLine*cphi);
      ctx.lineTo(this.xPix[ig]-wLine*sphi,   yPix+wLine*cphi);
      ctx.closePath();  // !! crucial, otherwise latest col used for ALL
      ctx.fill();

      if(false){
        //wLine=0.5;//!
	var arg0=[this.xPix[ig-1]-wLine*sphi, yPixOld+wLine*cphi];
	var arg1=[this.xPix[ig-1]+wLine*sphi, yPixOld-wLine*cphi];
	var arg2=[this.xPix[ig]+wLine*sphi,   yPix-wLine*cphi];
	var arg3=[this.xPix[ig]-wLine*sphi,   yPix+wLine*cphi];

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
    var value=data_arr[i]*scaling;
    if((i>0)&&(value>=yminDraw) &&(value<=ymaxDraw)){
      var yrel=(value-yminDraw)/(ymaxDraw-yminDraw);
      var yPix=yPix0+yrel*(yPixMax-yPix0);
      var r=Math.max(0.006*sizeminCanvas, 1);
      if(pointType==0){
        ctx.beginPath(); //!! crucial; otherwise latest col used for ALL
        ctx.arc(this.xPix[ig], yPix, r, 0, 2 * Math.PI);
        ctx.fill();
      }
      else{
	var r=Math.max(0.006*sizeminCanvas, 1);
        ctx.beginPath(); //!! crucial; otherwise latest col used for ALL
        ctx.moveTo(this.xPix[ig]-r,yPix-r);
        ctx.lineTo(this.xPix[ig]-r,yPix+r);
        ctx.lineTo(this.xPix[ig]+r,yPix+r);
        ctx.lineTo(this.xPix[ig]+r,yPix-r);
        ctx.lineTo(this.xPix[ig]-r,yPix-r);
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
	arg0=[this.xPix[ig]-r,yPix-r];
	arg1=[this.xPix[ig]-r,yPix+r];
	arg2=[this.xPix[ig]+r,yPix+r];
	arg3=[this.xPix[ig]+r,yPix-r];
	arg4=[this.xPix[ig]-r,yPix-r];
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

  for (var ig=1; ig<=it; ig++){ // first bar it=0 would cover y axis
    var i=iDataStart+ig; // i=iData
    var value=data_arr[i]*scaling;
    if((i>0)&&(value>=yminDraw) &&(value<=ymaxDraw)){
      var yrel=(value-yminDraw)/(ymaxDraw-yminDraw);
      var yPix=yPix0+yrel*(yPixMax-yPix0);
      ctx.fillRect(this.xPix[ig]-0.5*w, yPix0, w, yPix-yPix0);
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
