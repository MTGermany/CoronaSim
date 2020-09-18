
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

// graphical window at start, 0=lin,1=log,2=cases,3=tests,4=rates 

var windowG=0; // consolidate with first option value of html!!


var myRun;
var isStopped=true



// global time simulation vars (see also "data related global variables")

var dayStartMar=20; //!! you can also exceed 31, date obj initializer takes it
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
var itmax_calib; // !!! end calibr time interval =^ data_itmax-1 
                 // should be split if there are more than approx 
                 // 20 weeks of data

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

// will be only relevant if "xyz no longer <<1 ("Durchseuchung")
// will be later changed to fracDie=fracDieInit*pTest/pTestInit;
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
var R0=1.42;    // init interactive R for slider corona_gui.js (overridden)
var Rtime=[];   // !!! calibrated R; one element PER 2 WEEKS
                // initialize in function startup() (then data available)
var R_hist=[]; R_hist[0]=R0; // one element PER DAY
var sigmaR_hist=[]; sigmaR_hist[0]=0; 







// global simulation  parameters

var fps=50;

// (i) controlled by sliders (apart from R0)


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
        corona.init(0); //!! only then ensured that data loaded! it=1 as result
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
    corona.init(0); 
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


  // !!! check what changes 
  // if smoothing data_cumCases, the objective to calibrate

  if(false){
    kernel=[1/9,2/9,3/9,2/9,1/9];
    var data_cumCasesSmooth=smooth(data_cumCases,kernel);
    data_cumCases=data_cumCasesSmooth;
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
  var tauPos=7;
  var gamma=0.05;
  var alpha=0;
  var beta=0;


  for(var i=0; i<itmaxData; i++){
    data_dxt[i]=data_cumCases[i]-data_cumCases[i-1];
    data_dyt[i]=data_cumRecovered[i]-data_cumRecovered[i-1];
    // in spain the def of deaths changed -> cum deaths reduced, dz<0
    data_dz[i]=Math.max(data_cumDeaths[i]-data_cumDeaths[i-1], 0.);
    data_xtAct[i]=data_cumCases[i]-data_cumRecovered[i]-data_cumDeaths[i];
  }

  // need new loop because of forward ref at cfr, ifr

  for(var i=0; i<itmaxData; i++){
    data_posRate[i]=data2_posRate[i+di];
    //data_dn[i]=data2_cumTests[i+di]-data2_cumTests[i+di-1];
    data_dn[i]=data_dxt[i]/data_posRate[i];
    var dnTauPos=data2_cumTestsCalc[i+di]-data2_cumTestsCalc[i+di-tauPos];
    var pit=(data2_posRate[i+di]-beta)/(1-alpha-beta); // prob infected|tested
 
    // denom tauPos because not tested people have a period tauPos
    // to be tested positive 
    // (!! if tauPos=7, also cancels out weekly pattern)

    data_dx[i]=(pit*dnTauPos + gamma*pit*(n0-dnTauPos))/tauPos;

    var dxtTauPos=data_cumCases[i]-data_cumCases[i-tauPos];

    var dztTauPos=Math.max(data_cumDeaths[i]-data_cumDeaths[i-tauPos],0.);

    // if tauPos=7 days average  cancels out weekly pattern
    data_cfr[i]=Math.max(data_cumDeaths[i+tauDie-tauTest]
		 -data_cumDeaths[i+tauDie-tauTest-tauPos],0.)/dxtTauPos;
    data_ifr[i]=Math.max(data_cumDeaths[i+tauDie]
		 -data_cumDeaths[i+tauDie-tauPos],0.)/(tauPos*data_dx[i]);
  }


  if(false){
    console.log("");
    //for(var i=0; i<itmaxData; i++){
    for(var i=itmaxData-5; i<itmaxData; i++){
    //if((i>itmaxData-30)&&(i<itmaxData)){
      console.log(
	insertLeadingZeroes(data[i]["date"]),": iData=",i,
	" data_xtAct=",Math.round(data_xtAct[i]),
	" data_dn=",Math.round(data_dn[i]),
	" data_dx=",Math.round(data_dx[i]),
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



 //##############################################################
 // !! for inline nondynamic  testing: add testcode here
 //##############################################################

  if(false){
    var Rtest=[0.9485972290755083, 0.579953251679159, 0.7226759352548395, 0.7014451815219522, 0.8074914584533439, 1.2476826711037865, 0.8196206675854572, 1.2297994838996873, 1.1199730711576068, 1.5872223560093257, 1.0573596644821395, 1.044553507363983, 1.2235760917721668];

// 14 days later
    var Rtest14=[0.579953251679159, 0.7226759352548395, 0.7014451815219522, 0.8074914584533439, 1.2476826711037865, 0.8196206675854572, 1.2297994838996873, 1.1199730711576068, 1.5872223560093257, 1.0573596644821395, 1.044553507363983, 1.2235760917721668];

// 28 days later
    var Rtest28=[0.7226759352548395, 0.7014451815219522, 0.8074914584533439, 1.2476826711037865, 0.8196206675854572, 1.2297994838996873, 1.1199730711576068, 1.5872223560093257, 1.0573596644821395, 1.044553507363983, 1.2235760917721668];

// 56 days later
    var Rtest56=[0.8074914584533439, 1.2476826711037865, 0.8196206675854572, 1.2297994838996873, 1.1199730711576068, 1.5872223560093257, 1.0573596644821395, 1.044553507363983, 1.2235760917721668];

    console.log("\n\ninline nondy. Testing: Rtest=",Rtest);
    var sse=SSEfunc(Rtest,null,true,0);
    console.log("\nSSEfunc(Rtest,null,true,0)=",sse);

    console.log("\n\nRtest14=",Rtest14);
    var sse14=SSEfunc(Rtest14,null,true,14);
    console.log("\nSSEfunc(Rtest14,null,true,14)=",sse14);

    console.log("\n\nRtest28=",Rtest28);
    var sse28=SSEfunc(Rtest28,null,true,28);
    console.log("\nSSEfunc(Rtest28,null,true,28)=",sse28);

    console.log("\n\nRtest56=",Rtest56);
    var sse56=SSEfunc(Rtest56,null,true,56);
    console.log("\nSSEfunc(Rtest56,null,true,56)=",sse56);
    var sse56cut=SSEfunc(Rtest56,null,true,56,itmax-28);
    console.log("\nSSEfunc(Rtest56,null,true,56,itmax-28)=",sse56cut);

    console.log("\nend initializeData: country=",country);
    //alert('stopped simulation with alert');
    //setTimeout(function(){  alert('hello');}, 3000);  
    //alert('hi');
  }

} // initializeData(country);


//##############################################################
// function for variable replication rate R as a function of time
// t=tsim-date(2020-03-19) [days] from t to t+1
//##############################################################

function Rfun_time(t){
  var iPresent=data_idataStart+t;
  var iTest    =iPresent+Math.round(tauTest);
  var iTestPrev=iPresent+Math.round(tauTest-0.5*(tauRstart+tauRend));

  if(t<0){ // direct estimate from data 
    var nxtNewnum  =1./2.*(data_cumCases[iTest+1]-data_cumCases[iTest-1]);
    var nxtNewdenom=1./2.*(data_cumCases[iTestPrev+1]
			  -data_cumCases[iTestPrev-1]);

    // no data if iTestPrev<0
    var R=(iTestPrev<0) ? 3 : 1.02*nxtNewnum/nxtNewdenom;

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

} //Rfun_time




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
@global itmin_calib start of calibr intervals (days since dayStartMar)
@global itmax_calib end of calibr intervals (days since dayStartMar)

NOTICE: fmin.nelderMead needs one-param SSEfunc SSEfunc(R_arr):
        "sol2_SSEfunc=fmin.nelderMead(SSEfunc, Rguess);"
 ##############################################################*/

 //!! use separate array Rarr instead of global array Rtime
 // for optimization if not whole array optimized.

 // Rtime => used in Rfun_time(t)=Rfun_time(it) if it>=0
 //                  Rfun_time(t) data driven if t<0

function SSEfunc(Rarr, fR, logging, itStart, itMax) {

  //console.log("in SSE func: Rarr=",Rarr);

  if( typeof fR === "undefined"){
    fR=[]; for(var j=0; j<Rarr.length; j++){fR[j]=0;}
    //console.log("inside: fR=",fR);
  }
  if( typeof logging === "undefined"){logging=false;}
  if( typeof itStart === "undefined"){itStart=itmin_calib;}
  if( typeof itMax === "undefined"){itMax=itmax_calib;}

  var idataStart=data_idataStart+itStart;


  //if(true){console.log("SSEfunc: itStart=",itStart,
  if(logging){console.log("SSEfunc: itStart=",itStart,
			  " itMax=",itMax,
			  " data_itmax=",data_itmax," itmax=",itmax);}

  // simulation init get right structure of this.x[] 
  // and scales up/down to nxtStart at itStart

  var nxtStart=data_cumCases[idataStart];
  corona.init(itStart, logging); 
  //corona.init(itStart, false); 

  // calculate SSE

  var sse=0;
  if(logging){
    console.log("SSEfunc: i=0, nxt=n0*corona.xt=",n0*corona.xt,
		" data: nxtStart=",nxtStart," nyt=",n0*corona.yt);
  }

  if(logging){console.log("Rtime=",Rtime);}
  for(var it=itStart; it<itMax; it++){

    var inCalib=((it>=itmin_calib)&&(it<itmax_calib)); 
    //var inCalib=true;
    var indexRarr=Math.min(getIndexCalib(it-itStart),Rarr.length-1);
    var indexRtime=Math.min(getIndexCalib(it),Rtime.length-1);
    var indexCalib=Math.min(getIndexCalib(it)-getIndexCalib(itmin_calib),
			    Rarr.length-1);
    var R_actual=(inCalib) ? Rarr[indexRarr] : Rtime[indexRtime];

    var nxtData=data_cumCases[data_idataStart+it];
    var nxtSim=n0*corona.xt;
    if(logging&&((it<itStart+5)||(it>itMax-5))){
    //if(logging&&true){
    //if(logging&&false){
      console.log("SSEfunc before update: it=",it,
		  " R_actual=",R_actual.toFixed(2),
		  " Rarr[indexRarr]=",Rarr[indexRarr].toFixed(2),
		  " Rtime[indexRtime]=",Rtime[indexRtime].toFixed(2),
		  " nxtData=",nxtData,
		  " nxtSim=",Math.round(nxtSim),
		  " nytSim=",Math.round(n0*corona.yt),
		  "");

    }

    corona.updateOneDay(R_actual); 

    if(inCalib){ //!!
      sse+=Math.pow(Math.log(nxtData)-Math.log(nxtSim),2); //!! Math.log
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

  //if(true){console.log("SSEfunc: returning SSE=",sse);}
  if(logging){console.log("SSEfunc: returning SSE=",sse);}
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
    Rtime[0]=3; // start with high reproduction rate in first week 
    for(var index=1; index<=getIndexCalibmax(itmaxinit); index++){
      Rtime[index]=1;
    }
    
  }
 

  // =============================================================
  // initialize CoronaSim
  // =============================================================

  corona=new CoronaSim();

  if(!useLiveData){corona.init(0);} // !! now inside fetch promise


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
  return 14*ical; //!! only here changes of time interv of one calibr point
}

function getIndexCalib(itime){
  return Math.floor(itime/getIndexTimeFromCalib(1));     // MT 2020-08
}

// last calibration interval must have at least 10 days
function getIndexCalibmax(itime){
  return getIndexCalib(itime-10); 
}


// =================================================
// determines calibrated Rtime[]
// HERE inside calibrate() the control!
// =================================================

function calibrate(){


  var Rcalib=[]; 
  var itmin_c=0;            // basis
  var itmax_c=data_itmax-1; //basis

  var calibrateOnce=true; //!!!

  if(calibrateOnce){ //worse SSE but better fit near the end
    itmin_c=0;            
    itmax_c=data_itmax-1; 
    indexcalibmin=getIndexCalib(itmin_c);
    indexcalibmax=getIndexCalibmax(itmax_c);// *max: >=10d cal intv
    Rcalib=[]; // init
    for(var indexcalib=indexcalibmin; indexcalib<=indexcalibmax; indexcalib++){
      Rcalib[indexcalib-indexcalibmin]=(indexcalib==0) ? 1.2 : 1; //!!
    }
    estimateR(itmin_c, itmax_c, Rcalib); // also transfers Rcalib to Rtime
    estimateErrorCovar_Rhist_sigmaRhist(itmin_c, itmax_c, Rtime); 
  }


  else{ // !! finally works, one day of work!!
    itmin_c=0; 
    itmax_c=42;
    indexcalibmin=getIndexCalib(itmin_c);
    indexcalibmax=getIndexCalibmax(itmax_c);// *max: >=10d cal intv
    Rcalib=[]; // init
    for(var indexcalib=indexcalibmin; indexcalib<=indexcalibmax; indexcalib++){
      Rcalib[indexcalib-indexcalibmin]=(indexcalib==0) ? 1.2 : 1; 
    }
    estimateR(itmin_c, itmax_c, Rcalib); // also transfers Rcalib to Rtime

    itmin_c=42; 
    itmax_c=data_itmax-1;
    indexcalibmin=getIndexCalib(itmin_c);
    indexcalibmax=getIndexCalibmax(itmax_c);// *max: >=10d cal intv
    Rcalib=[]; // init
    for(var indexcalib=indexcalibmin; indexcalib<=indexcalibmax; indexcalib++){
      Rcalib[indexcalib-indexcalibmin]=(indexcalib==0) ? 1.2 : 1; 
    }
    estimateR(itmin_c, itmax_c, Rcalib); // also transfers Rcalib to Rtime


    estimateErrorCovar_Rhist_sigmaRhist(0, data_itmax-1, Rtime); // uses calibrated Rtime[]
  }




  var logging=false;
  //var logging=true;

  if(logging){
    console.log("leaving calibrate: final synthesized R values+fit quality:");
    SSEfunc(Rtime,null,true,0,data_itmax);
    console.log("Rtime=", Rtime);
  }

}//calibrate()




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
// =============================================================

function estimateR(itmin_c, itmax_c, Rcalib){

  var indexcalibmin=getIndexCalib(itmin_c);
  var indexcalibmax=getIndexCalibmax(itmax_c);// *max: >=10d cal intv

  // set global variables itmin_calib, itmax_calib needed for 
  // fmin.nelderMead

  itmin_calib=itmin_c;
  itmax_calib=itmax_c;


  console.log("\n\nestimateR: after initializing: Rcalib=",Rcalib);

  for(var ic=0; ic<2; ic++){ // One round (ic<1) sometimes not enough


    // ##############################################################
    // THE central estimation with global vars itmin/max_calib
    sol2_SSEfunc=fmin.nelderMead(SSEfunc, Rcalib);
    // ##############################################################

    //console.log("\nafter iter ",ic+1,": Rcalib=",Rcalib);
 
 }

  // copy tp global R table Rtime

  for(var j=0; j<Rcalib.length; j++){
    Rtime[j+indexcalibmin]=sol2_SSEfunc.x[j];
  }


 
  if(false){
    SSEfunc(Rcalib,null,true); // logging of SSEfunc
  }


  console.log("\n\nleaving estimateR: Rcalib=", Rcalib,
	      "\n\nRtime=", Rtime,"\n");

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

  if(log){console.log("in estimateErrorCovar(): Rcalib=",Rcalib);}

  var indexcalibmin=getIndexCalib(itmin_c);
  var indexcalibmax=getIndexCalibmax(itmax_c);// *max: >=10d cal intv


  var H=[]; // Hessian of actively estimated R elements
  for(var j=0; j<indexcalibmax+1-indexcalibmin; j++){H[j]=[];}

  var dR=0.000001;



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
    if(log){console.log("\n j=",j," Rcalib=",Rcalib,"\n Rp=",Rp,"\n Rm=",Rm,
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
  // getIndexTimeFromCalib(1) typically 14 (days)

  for(var it=itmin_c; it<itmaxinit; it++){//
    var j=Math.min(Math.floor( (it-itmin_c)/getIndexTimeFromCalib(1)),
		   Rcalib.length-1);
    sigmaR_hist[it]=sigmaR[j];
    R_hist[it]=Rcalib[j];
    if(log){console.log("it=",it," j=",j,
			" sigmaR_hist[it]=", sigmaR_hist[it]);}
  }





} // estimateErrorCovar_Rhist_sigmaRhist


 

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
  myRestartFunction();
} // selectDataCountry

 

function selectWindow(){ // callback html select box "windowGDiv"
  console.log("in selectWindow");
  windowG=document.getElementById("windows").value;

  drawsim.setWindow(windowG); // clear and draAxes in setDisplay..

  drawsim.transferSimData(it);

  drawsim.drawSim(it);
  //drawsim.drawOld(it,windowG,corona.xAct,corona.xt,
//		       corona.y,corona.yt,corona.z); // !! also scales anew
}


function myRestartFunction(){ 
  console.log("in myRestartFunction: itmax=",itmaxinit);
  itmax=itmaxinit;
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  fracDie=fracDieInit*pTest/pTestInit;
  //console.log("restart: fracDie=",fracDie);
  startup();
  corona.init(0); // because startup redefines CoronaSim() and data there here


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
    //corona.init(0);

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
  var R_actual=(RsliderUsed) ? R0 : Rfun_time(it);
  R_hist[it]=R_actual;

  if(false){
    console.log(" doSimulationStep before corona.update: it=",it,
		"data_cumCases[data_idataStart+it]=",
		data_cumCases[data_idataStart+it],
		" n0*corona.xt=",(n0*corona.xt).toPrecision(6),
		" R_actual=",R_actual.toPrecision(3));
  }

  drawsim.drawSim(it);
 
  var logging=false;  // doSimulationStep: logging "allowed"
  //var logging=(it<3);
  corona.updateOneDay(R_actual,logging);
  it++;

  //if(false){
  if(logging){
    console.log(" doSimulationStep after corona.update and it++: it=",it,
		"data_cumCases[data_idataStart+it]=",
		((it<itmaxinit-1) ? data_cumCases[data_idataStart+it]:"na"),
		" nxt=",Math.round(n0*corona.xt),
		" nyt=",Math.round(n0*corona.yt));
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
}



CoronaSim.prototype.init=function(itStart,logging){

  if( typeof logging === "undefined"){logging=false;}

  var idataStart=data_idataStart+itStart;
  var nxtStart=data_cumCases[idataStart]; // target number of cum cases at iStart

  //var idata0=data_idataStart+it0;



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
  this.yt=0; // fraction recovered data
  this.z=0;  // fraction dead (real=data)
  this.pTestDay=[]; // fraction of tested infected at day t
  for(var i=0; i<100; i++){ // just initialisation for the first few steps
    this.pTestDay[i]=pTest;
  }

  // init infection-age profile this.x[tau] with exponential
  // initial exponential rate r0 per day  (don't confuse r0 with R0)

  var tauR=0.5*(tauRstart+tauRend)// middle period for one repro cycle
  var r0=Math.log(Rfun_time(it0))/tauR;  // init reprod rate by stable Rfun_*
  var denom=0;

  for(var tau=0; tau<taumax; tau++){
    denom+=Math.exp(-r0*tau);
  }
  for(var tau=0; tau<taumax; tau++){
    this.x[tau]=this.xAct*Math.exp(-r0*tau)/denom;
    this.xohne[tau]=this.x[tau];
    if(logging){console.log("init: it0=",it0," R0=",Rfun_time(it0),
			    " r0=",r0," this.x[tau]=",this.x[tau]);}
  }

  // data-driven warmup

  for(it=it0; it<itStart; it++){ //!!! it reset (do NOT use var!)
    var Rt=Rfun_time(it);
    if(logging){console.log("corona.init warmup before update: it=",it,
			    " pTest=",pTest,
			    " R=",Rt.toFixed(2),
			    " nx=",n0*this.xAct,
			    " nxt=",n0*this.xt,
			    " nyt=",n0*this.yt,
			    "");}
    this.updateOneDay(Rt,logging); //!! do not use true!!because of calibr
  }



  
  // scale down to match init value of n0*this.xt 
  // exactly to data nxtStart
 
  var scaleDownFact=nxtStart/(n0*this.xt);
  this.xAct     *= scaleDownFact;
  this.xyz      *= scaleDownFact;
  this.xt       *= scaleDownFact;
  this.y        *= scaleDownFact;
  this.yt       *= scaleDownFact;
  this.z        *= scaleDownFact;
  for(var tau=0; tau<taumax; tau++){
    this.x[tau]     *= scaleDownFact;
    this.xohne[tau] *= scaleDownFact;
  }

  // reset it for start of proper simulation


  if(logging){console.log("CoronaSim.init after warmup: n0*this.xt=",n0*this.xt);}

}//init





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


  if(logging){  //filter needed because of called mult times in calibr!


    console.log("Enter CoronaSim.updateOneDay: it=",it," R=",R.toPrecision(2),
		" this.xAct=",this.xAct.toPrecision(3),
		" this.xyz=",this.xyz.toPrecision(3),
		" nxt=n0*this.xt=",Math.round(n0*this.xt),
		" nyt=n0*this.yt=",Math.round(n0*this.yt),
/*
		" this.z=",this.z.toPrecision(3),
		"\n  this.x[tauDie-1]=",this.x[tauDie-1].toPrecision(3),
		"\n  this.x[tauDie]=",this.x[tauDie].toPrecision(3),
		"\n  this.x[tauDie+1]=",this.x[tauDie+1].toPrecision(3),
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


  // test people (in updateOneDay)

  this.pTestDay[it]=pTest; // needed to determine fraction of 
                           // recovered among the tested later on
                           // sometimes this.pTestDay undefined !!

  tauAvg=5; //!!
  var dtau=Math.min(Math.floor(tauAvg/2),Math.round(tauTest));
 

  var f_T=1./(2*dtau+1);
  for(var tau=tauTest-dtau; tau<=tauTest+dtau; tau++){
    this.xt += pTest*f_T*this.xohne[tau]; 
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
    dz[tau-tauDie+dtau]=fracDie*f_D*this.xohne[tau]; //!! here xohne crucial
    dzsum+=dz[tau-tauDie+dtau];
    this.x[tau] -=dz[tau-tauDie+dtau];
  }

  for(var tau=tauRecover-dtau; tau<=tauRecover+dtau; tau++){
    var tauH=Math.min(it,tau);
    dy[tau-tauRecover+dtau]=(1-fracDie)*f_Rec*this.xohne[tau]; //!!
    dysum+=dy[tau-tauRecover+dtau];
    this.x[tau] -=dy[tau-tauRecover+dtau];
  }
  this.z   += dzsum;
  this.y   += dysum;
  var dayTested=Math.max(0,it-Math.round(tauRecover-tauTest));
  if(false){
  //if(logging){
    console.log("dayTested=",dayTested,
		" this.pTestDay[dayTested]=",this.pTestDay[dayTested]);
  }
  this.yt  +=(this.pTestDay[dayTested]-fracDie)/(1-fracDie)*dysum;


  // sum up the profile of infected people
  // xAct: sum of "actually infected" (neither recoverd nor dead)
  // xyz: cumulative sum of infected (incl recovered, dead)


  this.xyz+= this.x[0];

  this.xAct=0;  
  for(var tau=0; tau<taumax; tau++){
    this.xAct     += this.x[tau];
  }

  // control output (it is undefined here!)

  if(logging){ // filter needed because called in calibration!

    console.log("end CoronaSim.updateOneDay:",
		"  it=",it,
		" R=",R.toPrecision(2),
		" nxt=",Math.round(n0*this.xt),
		" nxAct=",(n0*this.xAct).toPrecision(6),
		" nxyz=",(n0*this.xyz).toPrecision(6),
		" ny=",(n0*this.y).toPrecision(5),
		" nyt=",(n0*this.yt).toPrecision(5),
		" nz=",(n0*this.z).toPrecision(5),
		""
	     );
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

  //console.log("drawSim created");

  this.unitPers=1000;  // persons counted in multiples of unitPers

  this.itR0=-1; // it value where n0*xt first exceeds nxtR0 (init val)
  this.yminType=[0,1,0,0,0];   // lin,log,act0,act1,act2
  this.ymaxType=[10,7,10,10,10];   // lin,log,act0,act1,act2
  this.ymaxPerc=20;
  this.ymaxLin=11;
  this.ymaxLog=7;

  this.xPix0  =0.12*canvas.width; // must update this block later on!!
  this.xPixMax=0.98*canvas.width;
  this.yPix0  =0.85*canvas.height;
  this.yPixMax=0.02*canvas.height;
  this.wPix=this.xPixMax-this.xPix0;
  this.hPix=this.yPixMax-this.yPix0;  //<0

  this.xPix=[];


 
  colInfected="rgb(255,90,0)";
  colTests="rgb(0,0,210)";
  colCases="rgb(233,0,0)";
  colRecov="rgb(60,255,40)";
  colRecovCases="rgb(0,150,40)";
  colDead="rgb(0,0,0)";  
  colPosrateCum="rgb(0,0,150)"; 
  colPosrate="rgb(255,0,255)"; 
  colCFR="rgb(100,0,180)";  
  colIFR="rgb(127,127,127)";



  // central conatiner for the graphics data

  this.dataG=[];

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
		 ytrafo: [0.1, true,false], color:colCases};

  this.dataG[17]={key: "Gestorbene pro Tag", data: [],
		 type: 0, window:2, plottype: "bars", plotLog: false, 
		 ytrafo: [1, true,true], color:colDead};



  // window 3: mirrored bar chart cases vs dead persons
  // ytrafo=[scalefact, half, mirrored]

  this.dataG[18]={key: "Positiv Getestete pro Tag", data: [],
		 type: 0, window:3, plottype: "bars", plotLog: false, 
		 ytrafo: [1, false,false], color:colCases};

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

  this.dataG[22]={key: "IFR (Infection fatality rate) [Promille]", data: [],
		 type: 2, window:4, plottype: "points", plotLog: false, 
		 ytrafo: [100, false,false], color:colIFR};


// quantity selector for the different display windows

  this.qselect=[];

  //this.qselect[0]=[0,1,2,3,4,5,6,7];
  this.qselect[0]=[0,1,2,4,5,6];  // without cum posRate
  this.qselect[1]=[8,9,10,11,12,13,14,15];
  this.qselect[2]=[16,17];
  this.qselect[3]=[18,19];
  this.qselect[4]=[20,21,22];


  this.label_y_window=[countryGer+": Personenzahl (in Tausend)",
	       countryGer+": Personenzahl",
	       countryGer+": Personen pro Tag",
	       countryGer+": taegliche Zahlen",
	       countryGer+": Anteil [% oder Promille]"];

  this.sizemin=Math.min(canvas.width,1.25*canvas.height);

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
    this.qselect[0]=[0,4];
    this.qselect[1]=[8,9,10,12,14,15];
  }

  // must update canvas boundaries since canvas may be resized
  this.xPix0  =0.12*canvas.width;
  this.xPixMax=0.98*canvas.width;
  this.yPix0  =0.85*canvas.height;
  this.yPixMax=0.02*canvas.height;
  this.wPix=this.xPixMax-this.xPix0;
  this.hPix=this.yPixMax-this.yPix0;  //<0


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

  this.sizemin=Math.min(canvas.width,1.25*canvas.height);
  this.textsize=(this.sizemin>400) ? 0.03*this.sizemin : 0.04*this.sizemin;
  ctx.font = this.textsize+"px Arial"; 



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


/*
 //define y2 axis tick/label positions (in y, not pix)//!!old?
//!!this.isActiveLin[5] undefined
  var ymin2=0;
  var ymax2=this.ymaxPerc;
  //var ymax2=Math.min(10,this.ymaxPerc);
  if((windowG==0)&&(this.isActiveLin[5])){
    var power10=Math.floor(log10(ymax2));
    var multiplicator=Math.pow(10, power10);
    var ymaxRange02=ymax2/multiplicator;
    var dy2=(ymaxRange02<2) ? 0.2*multiplicator
        :(ymaxRange02<5) ? 0.5*multiplicator : multiplicator;
    var ny2=Math.floor(ymax2/dy2);
  }
*/


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

  var dxShift=(phi<0.01) ? -1.1*this.textsize : -2.4*cphi*this.textsize;
  var dyShift=(1.5+2*sphi)*this.textsize;
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
		   this.xPix0-3.0*this.textsize,yPix);
  ctx.fillText(label_y,0,0);
  ctx.setTransform(1,0,0,1,0,0);

  // normal graphics

  if(windowG!=2){ 
    for(var iy=0; iy<=ny; iy++){
      var valueStr=(windowG!=1)  ? iy*dy : "10^"+iy;
      ctx.fillText(valueStr,
		   this.xPix0-2.5*this.textsize,
		   yPix0+(iy*dy-ymin)/(ymax-ymin)*hPix+0.5*this.textsize);
    }
  }

// draw double mirrored graphics scaling 10:1 
// hack remains: yPix0,hPix instead of this.yPix0, this.hPix

  else{
    for(var iy=0; iy<=ny; iy++){
      var valueStr=10*iy*dy;
      ctx.fillText(valueStr,
		   this.xPix0-2.5*this.textsize,
		   yPix0+(iy*dy-ymin)/(ymax-ymin)*hPix+0.5*this.textsize);
    }
    for(var iy=1; iy<=ny; iy++){
      var valueStr=iy*dy;
      ctx.fillText(valueStr,
		   this.xPix0-2.5*this.textsize,
		   yPix0-(iy*dy-ymin)/(ymax-ymin)*hPix+0.5*this.textsize);
    }
  }



  // draw name+value strings on y2 axis // !! still old

/*
  if((windowG==0)&&(this.isActiveLin[5])){//!!this.isActiveLin[5] undefined

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
*/

  
  // draw key

  var yrelTop=(windowG==1) // 1=log
    ? -4.5*(1.2*this.textsize/this.hPix) : 0.96;
  var xrelLeft=(windowG==0) ? 0.02 : 0.60; 
  var dyrel=-1.2*this.textsize/this.hPix;
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

  //console.log("transferSimData: it=",it," n0*corona.xt=",
//	      n0*corona.xt," n0*corona.yt=",n0*corona.yt);
  this.dataG[0].data[it]=n0*corona.xt;
  this.dataG[1].data[it]=n0*corona.yt;
  this.dataG[2].data[it]=n0*corona.z;
  this.dataG[3].data[it]=n0*corona.z/corona.xt
  this.dataG[8].data[it]=log10(n0*corona.xAct);
  this.dataG[9].data[it]=log10(n0*corona.xt);
  this.dataG[10].data[it]=log10(n0*corona.y);
  this.dataG[11].data[it]=log10(n0*corona.yt);
  this.dataG[12].data[it]=log10(n0*corona.z);

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

    //kernel=[1];
    //kernel=[1/4,2/4,1/4];
  kernel=[1/9,2/9,3/9,2/9,1/9];
    //kernel=[1/16,2/16,3/16,4/16,3/16,2/16,1/16];
    //kernel=[1/25,2/25,3/25,4/25,5/25,4/25,3/25,2/25,1/25];

  console.log("dnSmooth...");
  var dnSmooth=smooth(data_dn,kernel);
    //var dnSmooth=avgArithm(data_dn,7);
  console.log("dxtSmoot...");
  var dxtSmooth=smooth(data_dxt,kernel);
  // var dytSmooth=smooth(data_dyt,kernel); // often no useful data
  var dzSmooth=smooth(data_dz,kernel);
  var posRateSmooth=smooth(data_posRate,kernel);
  var cfrSmooth=smooth(data_cfr,kernel);
  var ifrSmooth=smooth(data_ifr,kernel);
  //console.log("cfrSmooth=",cfrSmooth," ifrSmooth=",ifrSmooth);//arrays!
  

  this.dataG[16].data=dxtSmooth; // by reference
  this.dataG[17].data=dzSmooth; 

  this.dataG[18].data=dxtSmooth; // the same as [16]
  this.dataG[19].data=dnSmooth; 

  this.dataG[20].data=posRateSmooth;
  this.dataG[21].data=cfrSmooth;
  this.dataG[22].data=ifrSmooth;

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

  //console.log("\nin checkRescaling: it=",it);
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

  ctx.setTransform(0,-1,1,0,x0+1.0*this.textsizeR,y0);
  var str_R="R="+R_hist[0].toFixed(2)
      +( (RsliderUsed||otherSliderUsed)
	 ? "" : (" +/- "+sigmaR_hist[0].toFixed(2)));
  ctx.fillText(str_R,0,0);
  ctx.setTransform(1,0,0,1,0,0);

  for(var ical=0; ical<=getIndexCalib(it); ical++){ //!!!
    var itR=getIndexTimeFromCalib(ical);
    x0=this.xPix[itR];
    ctx.fillRect(x0-1,this.yPix0,3,this.hPix);

    ctx.setTransform(0,-1,1,0,x0+1.0*this.textsizeR,y0);
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
DrawSim.prototype.drawSim=function(it,q){
//######################################################################

  //console.log("\n\nin DrawSim.drawSim: it=",it);

  // update  text properties 

  this.sizemin=Math.min(canvas.width,1.25*canvas.height);
  this.textsize=(this.sizemin>600) ? 0.02*this.sizemin : 0.03*this.sizemin;
  this.textsizeR=1.5*this.textsize;



  // initialize: transfer new data and redraw whole graphics

  this.transferSimData(it);
  if(it==0){this.transferRecordedData()}; 
 
  if(it==0){
    this.clear();
    this.drawAxes(windowG);
  }



  // check for possible scaling/rescaling due to new data on x and y axis 
  // and redraw if needed (local erase=true)

  this.checkRescaling(it);



  // draw R estimates for simulation windows

  if(windowG<2){
    this.drawREstimate(it);
  }


  // draw simulations and data for all windows

  // filter scaling, drawCurves with line thickness,
  //  plotPoints with point types , plotBars by parsing this.dataG[q]

  // qselect: quantity selector for windowG
  //console.log("\ndrawSim: it=",it," this.ymaxType=",this.ymaxType);

  for(var iq =0; iq<this.qselect[windowG].length; iq++){ 
    var q=this.qselect[windowG][iq];
    var data=this.dataG[q].data;
    var i=(this.dataG[q].type<3) ? it+data_idataStart : it;
    var scaling=this.dataG[q].ytrafo[0];
    var type=this.dataG[q].type;
    var plottype=this.dataG[q].plottype;
    var wLine=(type==3) ? 0.003*this.sizemin
	:(type==4) ? 0.0015*this.sizemin :  0.001*this.sizemin;
    wLine=Math.max(wLine,1);
    var color=this.dataG[q].color;
    var pointType=type;
    var actValue=scaling*this.dataG[q].data[i];
    if(false){
      console.log("drawSim: it=",it," i=",i,
		    " windowG=",windowG,
		    " q=",q," type=",type,
		    " plottype=",plottype," wline=",wLine,
		    " scaling=",scaling," actValue=",actValue);
    }

      // draw some data (the simulations) as lines/curves

    if(this.dataG[q].plottype=="lines"){
      this.drawCurve(it, 0, data, 
		     scaling, wLine, color, windowG);
    }

      // plot some data as points

    if(this.dataG[q].plottype=="points"){
      this.plotPoints(it, data_idataStart, data, 
		      scaling, pointType, color, windowG);
    }

      // plot some data as bars

    if(this.dataG[q].plottype=="bars"){
      var half=((q==16)||(q==17));
      var downwards=(q==17);
      this.plotBars(it, data_idataStart, data, 
		      scaling, half,downwards, color, windowG);

    }


  }

} //DrawSim.drawSim





//######################################################################
DrawSim.prototype.drawCurve=function(it, iDataStart, data_arr, scaling, 
				     wLine, color, windowG){
//######################################################################

  var yminDraw=this.yminType[windowG];
  var ymaxDraw=this.ymaxType[windowG];

  // !! check if I want to retain this

  //if((windowG==0)&&(q==5)){ 
  if(false){
    yminDraw=this.yminPerc; ymaxDraw=this.ymaxPerc;
  }

  ctx.fillStyle=color;
  for (var ig=0; ig<=it; ig++){
    var i=iDataStart+ig; // i=iData
    var value=data_arr[i]*scaling;
    if((i>0)&&(value>=yminDraw) &&(value<=ymaxDraw)){
      var valueOld=data_arr[i-1]*scaling;
      var yrel=(value-yminDraw)/(ymaxDraw-yminDraw);
      var yrelOld=(valueOld-yminDraw)/(ymaxDraw-yminDraw);
      var yPix=this.yPix0+yrel*(this.yPixMax-this.yPix0);
      var yPixOld=this.yPix0+yrelOld*(this.yPixMax-this.yPix0);

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
DrawSim.prototype.plotPoints=function(it, iDataStart, data_arr, scaling, 
				      pointType, color, windowG){
//######################################################################

  var yminDraw=this.yminType[windowG];
  var ymaxDraw=this.ymaxType[windowG];

  ctx.fillStyle=color;

  for (var ig=0; ig<=it; ig++){ 
    var i=iDataStart+ig; // i=iData
    var value=data_arr[i]*scaling;
    if((i>0)&&(value>=yminDraw) &&(value<=ymaxDraw)){
      var yrel=(value-yminDraw)/(ymaxDraw-yminDraw);
      var yPix=this.yPix0+yrel*(this.yPixMax-this.yPix0);
      var r=Math.max(0.008*sizemin, 1);
      if(pointType==0){
        ctx.beginPath(); //!! crucial; otherwise latest col used for ALL
        ctx.arc(this.xPix[ig], yPix, r, 0, 2 * Math.PI);
        ctx.fill();
      }
      else{
	var r=Math.max(0.008*sizemin, 1);
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
	console.log("plotPoints, it=",it);
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

  var w=1*(this.xPix[1]-this.xPix[0]);

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
