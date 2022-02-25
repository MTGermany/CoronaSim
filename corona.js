
/* Deutsches Intensivregister!! 
//wget https://diviexchange.blob.core.windows.net/%24web/bundesland-zeitreihe.csv
// JSON implemented, not yet used (DIVI most up-to-date but consistent with OWID (up to 10 days delayed)


TODO 2021-11-15
// references/2021-10-25_vaccEfficiency_Lancet.pdf

(1) check booster data & introduce if avaiable  DONE
(2) add booster data to javaScript variable
(3) Implement new immunity calculation for IVacc=(1-alpha^2)g 
    for net factor (1-Ivacc), cf change 2021-11-05 for infection dynamics
(4) introduce longer time scales for endpoint death (IVaccDeath)

CHANGE HISTORY

2021-11-05. Implemented non-sterility of vacc people: Factors
            R0g/R0=alpha  decrease R0 for transmissions vacc->nonvacc
            Rg0/R0=alpha decrease R0 for transmissions nonvacc->vacc
            Rgg/R0=alpha^2  decrease R0 for transmissions vacc->vacc
            resulting in vacc reduce factor (1-g+alpha^2g)
            = (1-(1-alpha^2)*g), g=percentage fully vacc
            instead of (1-IVacc)

BUGS/BUGFIXES

// 2021-11-05 
// 2021-06-10 WATCH OUT: NaN Bug in England? No: The truth
// 2021-06-10 ANNOYING Warum syst zu niedrig am Ende? Werden die letzten
//            Daten nicht beruecksichtigt???
//            DONE: Probably stringency index that relaxes too slow =>
// 2021-06-10 ANNOYING stringencyIndex relaxes too slow
//            DONE => quick hack fixStringencyLastVals=true;
// 2021-06-10 ANNOYING Warum in England R0/R=6 so hoch?
//            DONE: OK
// 2021-06-10 ANNOYING missing update of data in France since 2021-05-20
//            DONE => data just remains constant while
//                    data2 jumps back in the total cases
//                    cannot be sensibly tackled
// 2021-06-22 ANNOYING: Falls Null Inzidenz, mehrere 0/0 und x/0-Fehler, 
   die auch die kum Inzidenz zu NaN werden lassen
=> Line 4281 debug: this.xt in Israel from 838033 to NaN in it-itPresent=-1
   d.h. vor Stop und projection! Fehler in alpha-betafehlerberechnung 
=> "update 2"
// 2021-07-10 WIEDER MAX ANNOYING: Syst wieder zu niedrig am Ende!!

TODO 
 (1) slider fuer Zeit 0...itmax, overrides Go button, danach mit Go weiter

NEW COUNTRIES, ex. Brasilien/Brasil, Australien

(1) check github_orig.json (emacs OK) how the country is named:
=> "Brazil", "Australia". 
This will be the relevant names because github is always loaded online

(2) check githubWithTests_orig.json (only vi!)
=> "BRA", "Brazil", "AUS", "Australia

(3) edit updateCoronaInput.sh consolidating all names to online-loaded names

grep AUS data/githubWithTests.json >> data/tmp.json
grep BRA data/githubWithTests.json >> data/tmp.json

perl -i -p -e "s/AUS/Australia/g" data/tmp2.json
perl -i -p -e "s/BRA/Brazil/g" data/tmp2.json

grep Australia data/github.json >> data/tmp.json
grep Brazil data/github.json >> data/tmp.json

(4) run updateCoronaInput.sh

(5) edit index.html with value=master country name:
  <option value="Australia">Australien</option>
  <option value="Brazil">Brasilien</option>

(6) edit ger2eng.sh

(7) edit corona.js

const countryGerList:
   "Australia": "Australien",
   "Brazil": "Brasilien",

const n0List:
   => https://www.populationpyramid.net - select country - 
      get n and download csv
     "Australia"     :   25700000,
     "Brazil"        :   211049518,

const ageProfileListPerc:
  cd ~/versionedProjects/CoronaSim/populationStructure 
  move csv to this dir and rename .csv to the master names: Brazil.csv 
  !! comment out title line (otherwise heineous bug)
  run.sh (no changes needed) and copy/paste results:
  "Australia"  : [13,12,13,15,13,12,10,7,3,1],
  "Brazil"     : [14,15,16,16,14,11,8,4,2,0.1],

guesses for other country lists:
const fracDieInitList:
  "Australia"     : 0.0040,
  "Brazil"        : 0.0040,
const tauDieList:
  "Australia"     : 19,
  "Brazil"        : 19,
fracICUinitList:
  "Australia"     : 0.07,
  "Brazil"        : 0.07,
tauICUList:
  "Australia"     : 16,
  "Brazil"        : 16,
tauRecoverList: (not really needed, just to be sure)
  "Australia"     : 25,
  "Brazil"        : 25,
timeShiftMutationDeltaRefGB: (soon be needed with omicron, edit then again!)
  "Australia"     : 40,
  "Brazil"        : 40,

If master country name is two words/differ between the two .json file, add 
a case in the def of country2 (here not needed):
   country2=(country==="United Kingdom") ? "England" :
    (country==="South Africa") ? "SouthAfrica" :country;

If country is on Southern hemisphere, add a Pi shift to seasons:
  if((country==="South Africa")||(country==="Australia")
     ||(country==="Australia")||(country==="Brazil")){
    phase+=Math.PI; // Southern hemisphere
  }


*/


//##################################################################
// general global variables affecting global appearance
//##################################################################


// useLiveData=true: Obtain github data "live" via the fetch command
// Unfortunately, the fetch command is sometimes unstable
// and not working on my ipad

// useLiveData=false: obtained data server-side 
// via script updateCoronaInput.sh. Stable but need to upload once a day

var useLiveDataInit=true;  //!! will be changed by upload script, 2 versions
var useLiveData=useLiveDataInit;

var loggingDebug=false; //!! global var for testing functions inside calibr

var measuresView=true;  // false: R0 and parameter view
                    // true: "measures" view

var showCoronaSimulationDe=true; // bottom right
var useTestnumberRestriction=true; //!!! restrict such that pos rate <=50%
                                   // if test rate data_dnSmoothMax assumed


// debugApple=true for debugging of devices w/o console (ipad) redirect
// it to a html element using console-log-html.js
// copy corona.js to coronaDebugApple.js and 
// use indexDebugApple.html for these purposes 
// (contains addtl <div id="logDiv">)

var debugApple=false;

var activateAnnotations=true; // if true, lines/curves can be drawn with mouse


var country="Germany";
var country2=""; // needed if the two databases have different country abbrev
var countryGer="Deutschland";
// var useLandkreise=false; // MT 2021-11: Deactivated since
// permanent problems. If reactivate, get unique format for all at
// initializeData(country,..)


document.getElementById("title").innerHTML=
    "Simulation der Covid-19 Pandemie "+ countryGer;


const ln10=Math.log(10);
const TINY_VAL=1e-8;

// graphical window at start, 

// new window: 
// (1) define qselect[window] by selecting from drawsim.dataG[], 
// (2) update initialisator of drawsim.yminType[], *ymax*: "this.yminType=["
// (3) check various "windowG==", "windowG!=", "windowG<" etc conditions

// initial window; consolidate with first option value of html!!
// windows: variable windowG:
// 0=cum,1=log,2=casesReal,3=tests,4=rates,5=casesDaily,6=incid,7=causeEffect

var windowG=6; 


var myRun;
var isStopped=true



//######################################################################
// global time simulation vars (see also "data related global variables")
//######################################################################

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
 - add 50 days: date.setDate(date.getDate() + 50); or
                date.setTime(date.getTime() + 50*oneDay_ms);
 - Operator >, < works as expected
 - console.log(date) -> like "Wed Mar 25 2015 01:00:00 GMT+0100 (CET)"
 - date.toDateString() -> Fri Jun 05 2020
 - var options = {month: "short", day: "2-digit"};
   date.toLocaleDateString("en-us",options) -> Jun 05;
*/

var fpsstart=50;
var fps=fpsstart;  // controlled @ doSimulationStep()

var dayStartMarInit=8; //!! can also exceed 31, date initializer takes it
var dayStartMar=dayStartMarInit; 

var dayStartYear=dayStartMar+59;
var dateStart=new Date(2020,02,dayStartMar); // months start @ zero, days @ 1
var present=new Date();   // time object for present
var dateGraphicsStart=new Date("2021-11-01"); //!!! fast sim before

var it=0; //!!
const oneDay_ms=(1000 * 3600 * 24);

var itPresentInit=Math.floor(
    (present.getTime() - dateStart.getTime())/oneDay_ms); 
                // itPresent=days(present-dateStart)
                // floor because dateStart time is 00:00 of given day
var itPresent=itPresentInit;

var itGraphicsStartInit=Math.floor(
  (dateGraphicsStart.getTime() - dateStart.getTime())/oneDay_ms);
var itGraphicsStart=itGraphicsStartInit;


//######################################################################
// Data related global variables
//######################################################################

// fetch with https://pomber.github.io/covid19/timeseries.json
// or load as a variable server-side (if useLiveData=false)

var dataGit=[];  // json: loaded just in time; also used for data for validation
var dataGit2=[]; // json: addtl test, stringency, vacc data (prepared by script)
var dataRKI=[];  // json: RKI data for Saxonian regions (prepared by script); 

var dataGit_orig=[]; // normal data and reference for validation
var dataGit2_orig=[];
var dataRKI_orig=[];


// data related

// !! do not use last datum (report delay bias in GER and FRA)
var knockoffLastDatumGerFra=true; 

var data_idataStart; //!! dataGit dataset index for dayStartMar
var data_itmax;  // !! with respect to dayStartMar=data.length-data_idataStart

var data2_idataStart; // same for dataGit2 set  containing the corona-test data
var data2_itmax;
var di2=0;  // i2-i for same date FROM THE END
            // since e.g., Czech data weekly at begin

var data_date=[];
var data_cumCases=[];
var data_cumCasesSmooth=[]; //!!! test calibr: 1-week smoothing


var data_cumDeaths=[];
var data_cumRecovered=[];
var data_cumCfr=[];

var data_cumVacc=[];     // >=1 vacc or booster, no smoothing, sometimes n.a.
var data_cumBoost=[];     // data_cumVaccFully not used
var data_stringencyIndex=[];  // degree of measures/lockdown in [0,100]
var data_rVacc=[];     // fraction of pop per day, smoothed !! check if needed
var data_rBoost=[];   

// derived data in data time order

var data_cumTestsCalc=[]; // better calculate  from posRate
var data_dn=[];
var data_dnSmooth=[]; // 1-week smoothing
var data_dnSmoothMax=0; //
var data_dxt=[];
var data_dyt=[];
var data_dz=[];
var data_posRate=[];
var data_cfr=[];
var data_pTestModel=[]; // sim. "Hellfeld" P(tested|infected) if f(#tests)=true


const pTestInit=0.30;     // P(Tested|infected)  if !f(#tests) assumed
const pTestMin=0.04;   // if calculated by sqrt- or propto model
const testExponent=0.3; //!!! 0.5: sqrt-model data_pTestModel
                        // propto sqrt(dn), 1: lin model, 0: no test influence
const tauInfectious_fullReporting=Math.pow(1000,testExponent); // test interval [d] for full reporting

var data_dxIncidence=[]; // weekly incidence per 100 000 from data
var data_dzIncidence=[]; // weekly incidence per 100 000 from data
var data_icuIncidence=[]; // ICU patients/100 000 (intensive quant) from data
var data_R=[]; // do not use OWID number because it assumes too high gen time
var pTest_weeklyPattern=[]; // constant extrapolation with weekly pattern
var dn_weeklyPattern=[];  // constant extrapolation of #tests "


//#########################################################
// Fixed socioeconomic data of the simulated countries
//#########################################################


const countryGerList={
  "Germany": "Deutschland",
  "Austria": "Oesterreich",
  "Australia": "Australien",
  "Brazil": "Brasilien",
  "Czechia": "Tschechien",
  "France": "Frankreich",
  "United Kingdom": "England",
  "Italy": "Italien",
  "Poland": "Polen",
  "Spain": "Spanien",
  "Sweden": "Schweden",
  "Denmark": "Daenemark",
  "Switzerland": "Schweiz",
  "Greece"     : "Griechenland",
  "Portugal": "Portugal",
  "Israel": "Israel",
  //  "China": "China",
  "India": "Indien",
  //  "Japan": "Japan",
  "Russia": "Russland",
  //  "Turkey": "Tuerkei",
  "US": "USA",
  "South Africa": "Suedafrika",
  "LK_Erzgebirgskreis": "LK Erzgebirgskreis",
  "LK_Osterzgebirge": "LK Osterzgebirge",
  "SK_Dresden": "Dresden"
}

const n0List={
  "Germany"       :   83200000,
  "Austria"       :    8920000,
  "Czechia"       :   10700000,
  "France"        :   67400000,
  "United Kingdom":   67200000,
  "Italy"         :   59300000,
  "Poland"        :   37800000,
  "Spain"         :   47400000,
  "Sweden"        :   10400000,
  "Denmark"       :    5840000,
  "Switzerland"   :    8637000,
  "Greece"        :   10700000,
  "Portugal"      :   10300000,
  "Israel"        :    9220000,
  "India"         : 1380000000,
  "Russia"        :  144100000,
  "US"            :  329500000,
  "Australia"     :   25700000,
  "Brazil"        :   211049518,
  "South Africa"  :   59308690,
  "LK_Erzgebirgskreis": 334948,
  "LK_Osterzgebirge"  : 245586,
  "SK_Dresden"        : 556780
}

var n0=n0List["Germany"];  // #persons in Germany

// cd ~/versionedProjects/CoronaSim/populationStructure 
// goto https://www.populationpyramid.net - select country - download csv
// - move to this dir and name countries as in the .json files
// !! comment out title line (otherwise heineous bug, one line too many
// run.sh (no changes needed)

const ageProfileListPerc={ // age groups [0-10,-20,-30,-40,-50,-60,-70,-80,-90, 90+]
  "Australia"  : [13,12,13,15,13,12,10,7,3,1],
  "Austria"    : [10,10,13,14,13,16,11,9,4,1],
  "Brazil"     : [14,15,16,16,14,11,8,4,2,0.1],
  "Czechia"    : [10,10,11,14,17,12,13,9,3,1],
  "France"    : [12,12,11,12,13,13,12,8,5,1],
  "Germany"    : [9,10,11,13,12,16,12,9,6,1],
  "Greece"    : [9,10,10,13,15,14,12,9,6,1],
  "India"    : [17,18,17,16,12,9,6,3,1,0.1],
  "Israel"    : [19,16,14,13,12,9,8,5,2,1],
  "Italy"    : [8,9,10,12,15,16,12,10,6,1],
  "Poland"    : [10,10,12,16,14,12,14,7,4,1],
  "Portugal"    : [8,10,11,12,16,14,13,10,6,1],
  "Russia"    : [13,10,11,17,14,13,12,6,3,1],
  "South Africa" : [20,17,17,17,12,8,5,2,1,0.1],
  "Spain"    : [9,10,10,13,17,15,11,8,5,1],
  "Sweden"    : [12,11,13,13,13,13,11,10,4,1],
  "Denmark"    : [11,12,13,11,13,14,11,10,4,1],
  "Switzerland"    : [10,10,12,14,14,15,11,9,4,1],
  "United Kingdom" : [12,11,13,14,13,14,11,8,4,1],
  "US"    : [12,13,14,13,12,13,12,7,3,1],
  "LK_Erzgebirgskreis": [9,10,11,13,12,16,12,9,6,1], // as Germany
  "LK_Osterzgebirge"  : [9,10,11,13,12,16,12,9,6,1],
  "SK_Dresden"        : [9,10,11,13,12,16,12,9,6,1]
}
  

  
// will be only relevant if "xyz no longer <<1 ("Durchseuchung")
// will be later changed to fracDie=fracDieInit*pTest/pTestInit;
const fracDieInitList={
  "Germany"       : 0.005, // init
  "Austria"       : 0.0031,
  "Australia"     : 0.0040,
  "Brazil"        : 0.0040,
  "Czechia"       : 0.0027,
  "France"        : 0.0040,
  "United Kingdom": 0.0040,
  "Italy"         : 0.0040,
  "Poland"        : 0.0040,
  "Spain"         : 0.0040,
  "Sweden"        : 0.0040,
  "Denmark"       : 0.0040,
  "Switzerland"   : 0.0055,
  "Greece"        : 0.0055,
  "Portugal"      : 0.0055,
  "Israel"        : 0.0055,
  "India"         : 0.0045,
  "Russia"        : 0.0040,
  "US"            : 0.0055,
  "Australia"     : 0.0040,
  "South Africa"  : 0.0060,
  "LK_Erzgebirgskreis": 0.005,
  "LK_Osterzgebirge"  : 0.005,
  "SK_Dresden"        : 0.005
}



const tauDieList={
  "Germany"       : 19, //19
  "Austria"       : 19,
  "Australia"     : 19,
  "Brazil"        : 19,
  "Czechia"       : 19,
  "France"        : 19,
  "United Kingdom": 21,
  "Italy"         : 14,
  "Poland"        : 19,
  "Spain"         : 14,
  "Sweden"        : 19,
  "Denmark"       : 19,
  "Switzerland"   : 19,
  "Greece"        : 14,
  "Portugal"      : 17,
  "Israel"        : 17,
  "India"         : 17,
  "Russia"        : 17,
  "US"            : 17,
  "Australia"     : 17,
  "South Africa"  : 17,
  "LK_Erzgebirgskreis": 10,  // too short; overcome data inconsistency
  "LK_Osterzgebirge"  : 10,
  "SK_Dresden"        : 10
}


const fracICUinitList={
  "Germany"       : 0.07, // init
  "Austria"       : 0.07,
  "Australia"     : 0.07,
  "Brazil"        : 0.07,
  "Czechia"       : 0.07,
  "France"        : 0.07,
  "United Kingdom": 0.07,
  "Italy"         : 0.07,
  "Poland"        : 0.07,
  "Spain"         : 0.07,
  "Sweden"        : 0.07,
  "Denmark"       : 0.07,
  "Switzerland"   : 0.07,
  "Greece"        : 0.07,
  "Portugal"      : 0.07,
  "Israel"        : 0.07,
  "India"         : 0.07,
  "Russia"        : 0.07,
  "US"            : 0.07,
  "Australia"     : 0.07,
  "South Africa"  : 0.07
}

// Infection time at time 0.5*(tICUentry+tICUexit)
// tauICU must be greater than 0.5*tauICUstay=0.5*(tICUexit-tICUentry)
const tauICUlist={ 
  "Germany"       : 16, //16
  "Austria"       : 25,
  "Australia"     : 16,
  "Brazil"        : 16,
  "Czechia"       : 16,
  "France"        : 16,
  "United Kingdom": 16,
  "Italy"         : 16,
  "Poland"        : 16,
  "Spain"         : 16,
  "Sweden"        : 16,
  "Denmark"       : 16,
  "Switzerland"   : 16,
  "Greece"        : 16,
  "Portugal"      : 16,
  "Israel"        : 16,
  "India"         : 16,
  "Russia"        : 16,
  "US"            : 16,
  "Australia"     : 16,
  "South Africa"  : 16,
  "LK_Erzgebirgskreis": 16,  // too short; overcome data inconsistency
  "LK_Osterzgebirge"  : 16,
  "SK_Dresden"        : 16
}



const tauRecoverList={
  "Germany"       : 16,
  "Austria"       : 16,
  "Australia"     : 25,
  "Brazil"        : 25,
  "Czechia"       : 30,
  "France"        : 20,
  "United Kingdom": 25,
  "Italy"         : 25,
  "Poland"        : 25,
  "Spain"         : 25,
  "Sweden"        : 25,
  "Denmark"       : 25,
  "Switzerland"   : 18,
  "Greece"        : 18,
  "Portugal"      : 18,
  "Israel"        : 18,
  "India"         : 18,
  "Russia"        : 18,
  "US"            : 18,
  "Australia"     : 18,
  "South Africa"  : 18,
  "LK_Erzgebirgskreis": 16,
  "LK_Osterzgebirge"  : 16,
  "SK_Dresden"        : 16
}


/* ######################################################################
 country-specific mutation spread (omicron)

https://www.gisaid.org/hcov19-variants/
Links Variants of Concern auswaehlen (Wildtyp gibt es nicht)
rechts Zeitraum einstellen und irrelevante Laender abklicken in Legende

https://twitter.com/MadsAlbertsen85/status/1470766064539783191
https://twitter.com/trvrb/status/1470420195567030274
https://twitter.com/AlastairGrant4/status/1470491762296827909
https://covid19.ssi.dk/virusvarianter/omikron

England:   2021-12-06 from infections 2021-12-03: 5%
Daenemark: 2021-12-06 from infections 2021-12-03: 5.1%
SA:        2021-12-06 from infections 2021-12-03: 50%
D:         2021-12-06 from infections 2021-12-03: 3%
######################################################################*/

const time_pMutList=new Date("2021-12-16"); //!!!

// fraction pMut @ reftime_pMut (must assume nonzero data0
// because simulation with mutation now needed because of
// dependent immunities)
const pMutList={ 
  "Germany"       : 0.05,
  "Austria"       : 0.20, // rest (w/o OK flag) speculation at best
  "Czechia"       : 0.10,
  "France"        : 0.50,
  "United Kingdom": 0.75, 
  "Italy"         : 0.80,
  "Poland"        : 0.05,
  "Spain"         : 0.60,
  "Sweden"        : 0.50,
  "Denmark"       : 0.80,
  "Switzerland"   : 0.40,
  "Greece"        : 0.65,
  "Portugal"      : 0.50,
  "Australia"     : 0.30,
  "Brazil"        : 0.10,
  "Israel"        : 0.80,
  "India"         : 0.60,
  "Russia"        : 0.30,
  "US"            : 0.75,
  "Australia"     : 0.70,
  "South Africa"  : 0.99
}



  

//#########################################################
// slider-related variables
//#########################################################

var slider_R0_moved=false;         // only possibly data-driven sliders 
var slider_stringency_moved=false; // need such a state variable
var slider_pTest_moved=false;      // if true, pTest =f(#tests)
var slider_rVacc_moved=false; 
var slider_rBoost_moved=false;
var otherSlider_moved=false;   // coupled sliders such as tauRstart/tau_Rend


var includeInfluenceTestNumber=true; // if true, pTest =f(#tests)
// var useSqrtModel=true; // => testExponent
  
var tauRstartInit=2;   // active infectivity begins [days since infection]//1
var tauRendInit=10;    // active infectivity ends [days since infection]//10
var tauTestInit=7;     // time delay [days] test-infection //8

var tauRstart=tauRstartInit;
var tauRend=tauRendInit;  
var pTest=pTestInit;       // percentage of tested infected persons 
var tauTest=tauTestInit;
var stringency=0;  // 0..100, from data_stringencyIndex
var stringency_hist=[]; stringency_hist[0]=stringency; // one element PER DAY


//###############################################################
// not slider-controlled infection-dynamics and test parameters
//###############################################################

// after Fixed socioeconomic data of the simulated countries!

// reset to fracDieInit*pTest/pTestInit at restart but NOT during simulation
var fracDieInit=fracDieInitList.Germany; 
var fracDie=fracDieInit;           
var tauDie=tauDieList.Germany; // time from infection to death

var fracDieFactor=0.15; // reduction factor of simulated IFR
var itReduceBegin=10;
var tauReduce=210; // about 2*tauDie

var fracICUinit=fracICUinitList.Germany; // !!! prob ICU|infct; 2b calibrated
var fracICU=fracICUinit;
var tauICU=parseFloat(tauICUlist.Germany); // 0.5*(tICUleave+tICUenter)
var tauICUstay=7; // average #days tICUleave-tICUenter (uneven!)

var tauAvg=5;      // smooth interv for tauTest,tauDie,tauRecover (uneven!)

var tauRecover=16; // time from infection to full recovery
var tauSymptoms=7;  // incubation time 

var taumax=Math.max(tauDie+tauAvg,tauRecover+tauAvg,
		    tauICU+Math.floor(tauICUstay/2))+1; //!!!

var alphaTest=0.0; // !! alpha error of test (false negative)
var betaTest=0.00; // beta error (false positive) after double testing

// constant R0 influencing factors (asides from data-mutations)
// investigation 2021-03-27:
// (1) linear better than sqr in stringencyFactor(stringencyIndex)
// measures ARE effective!
// (2) season_relAmplitude=0.15 relativ. robust w/resp to other params
// (3) season_fracYearPeak=-0.10 relativ. robust w/resp to other params
//     but CZ autumn/winter impact artifact => shift to zero (01.01.)



const stringencySensitivityLin=0.65; // lin decr. R[%] per icr. stringency[%]
                                    // GER 0.70, AUT 0.75, FRA 0.70, CZ 0.70

const season_fracYearPeak=0.08;   // peak of season dependence of R0
                                  //!! -0.1 better but CZ impact artifact
                                  // GER,AUT 0; FRA 0.10, 
                                  // SA 0.35, US 0.10, IND 0.35, CZ 0.10
const season_relAmplitude=0.10;   // GER 0.15, AUT 0.20, FRA 0.10,
                                  // SA 0.30, US 0.10, IND 0.10, CZ 0.20

const str_sensitivStart="2020-04-10";// GER,AUT: 2020-04-01,
                                     // all others: 2020-05-10
const str_sensitivEnd="2021-01-10";  // all because of mut.

const stringencySensitivitySqr=0.70;  // [sqr: R *=(1-str...Sqr) if stri=100%]



//######################################################################
// variables related to previous simulation for comparison 
//######################################################################

// (taken from from drawsim)


var usePreviousGlob=true; // wether comparison is active
var usePrevious=false; // if *Glob=false,
   // usePrevious true in, e.g., validation or Mutation simulation

var simCount=0; // usePrevious only=true if usePreviousGlob&&(simCount>1)

var itmaxPrev=0;     // maximum it reached in previous simulation
var simPrevious=[]; // store previous sim data outside DrawSim (created anew)
                    // needed for validation or if doing mutation scenario
for (var iq=0; iq<=48; iq++){simPrevious[iq]=[];} // !! def simPrevious
var nDaysValid=0;     // validation days (default=0=no validation)


//######################################################################
// variables related to comparison with other country (Czech)
//######################################################################

var countryComparison=false;
var countryCmp="Czechia";
var dataCmp_cumCases=[]; // for comparison with, e.g., Czechia
var dataCmp_dxIncidence=[]; // compare weekly incidence per 100 000 from data




/* ######################################################################
 Mutation Dynamics (see also immunity.evadeMutFactor)
######################################################################*/

// define mutationDynamics and determine
// date where present mutation dynamics starts and calibration ends
// dynamics locked afterwards! Better switch off if no actual mutation

var mutationDynamics=new MutationDynamics();   

// !! control mutation dynamics
// Starting mutation dynamicxs at the very begiining
// not good at beginning of new wave
// because then p grows logistically while Rcalib approx const
// R10 and R20 decrease drastically because of R10=R0/(1+p*tau*r)

//!! useMutationIfAvailable must be true since w/o no longer works
// because of the mutation dependent immunities
const useMutationIfAvailable=true; //!!!

const use_startMutRel=true; 
const dit_startMut2presentRel=8; //  8 if variable mut starting time
const time_startMut=new Date("2021-12-24"); // if fixed mut starting time

const rMutStart=0.20; // !!! make variable! 0.25-0.30 initial growth rate of odds y/(1-y)

const factor_generationtime2=0.8; //!!! Omicron has shorter generation time
var strFactStartMut=1; // change Om sensitivity to measures with reference
                       // at start of mut dynamics

const dit_list2present
    =Math.floor((present.getTime()-time_pMutList.getTime())/oneDay_ms); 

const dit_startMut2presentAbs
    =Math.floor((present.getTime()-time_startMut.getTime())/oneDay_ms); 


// following updated in initializeData(country) if new country 

var dit_startMut2present = (use_startMutRel)
    ? dit_startMut2presentRel
    : dit_startMut2presentAbs;

var itStartMut=itPresent-dit_startMut2present;
var pMutRef=pMutList[country];
var simulateMutation=useMutationIfAvailable && (pMutRef>1e-6);

var dtshift=dit_list2present-dit_startMut2present;
var pMutStart=(simulateMutation)
    ? estimate_pMut_timeShift(pMutRef,rMutStart,dtshift): 0;

console.log("very start: coutry=",country," pMutRef=",pMutRef,
	    " pMutStart=",pMutStart,
	    " dit_list2present=",dit_list2present,
	    " dtshift=",dtshift,
	    " simulateMutation=",simulateMutation);






//###############################################################
// Immunity dynamics (see also immunity.evadeMutFactor for Omicron)
// Parameters like this.Imax=0.95 (Biontec)
// or this.vaccmax=[...];
// (age-specific max vacc rate due to vacc deniers/impossible to vacc)
// are data elements of Immunity
//###############################################################

var immunity=new Immunity();   // in initializeData(country): new Immunity();
var pVacc=0;        // vaccination fraction in [0,1]
var pVaccFull=0;    // assume 2 necessary vaccs in interval Immunity.tau0
var pBoost=0;        // boost fraction in [0,1]
var rVaccInit=0;    // pVacc'(t) [fraction per day]
var rVacc=rVaccInit;
var rBoostInit=0;    // pBoost'(t) [fraction per day]
var rBoost=rBoostInit;

// actual population immunity factor from vaccinations/boosters
// !! calib: get from IvaccArray; sim: from immunity.updateVacc(.)

var Ivacc1=0;   // old/standard variant     
var Ivacc2=0;   // new variant if applicable  

var IvaccArray=[]; 
for(var it=0; it<=itPresent; it++){ 
  IvaccArray[it]=0;
}

var corrIFR=1.11; // correction factor IFR/IFR65 (value in Germany w/o vacc: 2)
var corrIFRarr=[]; //!!
for(var it=0; it<=itPresent; it++){ 
  corrIFRarr[it]=1.11; // profile of IFR/IFR65 as f(vaccination history)
}



//###############################################################
// External inflow
//###############################################################

var casesInflowInit=0; // inported cases per day and 100 000 inhabitants
var casesInflow=casesInflowInit;





var country="Germany";               // Germany, Czechia

var countryGer=countryGerList[country]; 



document.getElementById("title").innerHTML=
    "Simulation der Covid-19 Pandemie "+ countryGer;


//###############################################################
// calibration related parameters/variables
//###############################################################

/* Procedure:

* calibrated quantity: R0 implicitely including new mutations, explicitely 
  excluding everything else 
  (seasons, vacc, lockdown)

* smallest calibr unit for one R0 value = one calibInterval [e.g. 7 days]

* calibrated in chunks of calibInterval*nChunk days [7*6];
  the last chunk can vary between [7*6+6] days and [7*6+6-7*dn] days

* chunks overlap by nOverlap*calibInterval days [7*4]
  => advancement dn=nChunk-nOverlap intervals 
  per chunk [2 intervals, 14 days] 

* in each chunk, the first R0 value is taken from the previous chunk 
  (unless the first chunk where it is calibrated as well);
  the last Rinterval_last_min days [28] have the same R0 value 
  (in the last interval, between [28+6] days and [28+6-7*dn] days)
  => nChunk-Rinterval_last_min days/calibInterval [2] R0 values
  newly calibrated per chunk (one more for the first chunk)

* Explicit mutation dynamics NOT part of calibration; 
  should be reflected implicitly by the calibration results

*/

var inCalibration=false;  // if true, other calc of vacc and
                          // explicit mutation dynamics ignored in 
                          // in CoronaSim.updateOneDay 
var itmin_calib; // start calibr time interval w/resp to dayStartMar
                 //     = dataGit_idataStart+1
var itmax_calib; //  end calibr time interval =^ data_itmax-1 
                 // should be split if there are more than approx 
                 // 15 weeks of data
var icalibmin;  // getIndexCalib(itmin_c)
var icalibmax;  // getIndexCalibmax(itmax_c);

//!!
const calibInterval=4;  // !!! 4 or 8; calibr time interv [days] for one R0 value 
                        // better not in sync with week cycle (=7)
const nLastUnchanged=3; // !! 3 or 4; <= nChunk-dn=nOverlap,>=3
                        // (may work otherwise but not safe)
                        // !! with nLastUnchanged=3 some wiggles in the new ICU:
                        // leave at 4!
const nChunk=6;         // 6; multiples of calibInterval
                        // >max(nLastUnchanged,nOverlap)
const nOverlap=4;       // 4; multiples of calibInterval
                        // >=max(1,nLastUnchanged)
                        // <nChunk

var R0=1.42;    // init interactive R for slider corona_gui.js (overridden)
var R0_actual=R0;
var R0time=[];   // !! calibrated R0
                // initialize in function initialize() (then data available)

var R0_hist=[]; R0_hist[0]=R0; // one element PER DAY
var sigmaR0_hist=[]; sigmaR0_hist[0]=0; 


var useInitSnap;
var firstR0fixed=false; //if first R0 element firstR0 is fixed @ calibr 
var firstR0=0;



var IFRinit=0.006;
var IFRinterval=11; //21 //!!!
var IFRinterval_last_min=11;  //21
var IFR_dontUseLastDays=1;    //regular: all data used
var IFR65time=[];

var fracICUinit=0.06;
var fracICUinterval=9; //28 //!!!
var fracICUinterval_last_min=7;  //21
var fracICU_dontUseLastDays=1;    //last data "Meldeverzug"
var fracICUtime=[];



//##########################################################
// global graphical vars
//##########################################################

var canvas;
var ctx;
var xPixLeft,yPixTop;
var xPix,yPix;
var xPixOld, yPixOld;
var sizeminViewport;
var sizeminCanvas;

var textsize=14; // changed in corona_gui.js
var hasChanged=false;
var isSmartphone=false;
var isLandscape=true;




// ##############################################################
// directly from https://pomber.github.io/covid19/timeseries.json
//
// loadData called ONLY in the html <body onload="..."> callback
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

function loadData() {
  var log=false;
  if(log) console.log("in loadData");

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

  // deep copy to dataGit_orig,dataGit2_orig,dataRKI_orig
  // for reference at validation AT RESPECTIVE PLACES be of annoy time order

  dataGit2 = JSON.parse(dataGitLocalTests); // must be different name!!
  dataGit2_orig=JSON.parse(JSON.stringify(dataGit2));

  console.log("dataGit2=",dataGit2);
  console.log("dataGit2.Germany.data[0]=",dataGit2.Germany.data[0]);
  var ndataTest2=dataGit2.Germany.data.length;
  console.log("dataGit2.Germany.data[0]=",dataGit2.Germany.data[0]);

  if(false){
    for(var i=ndataTest2-11; i<ndataTest2; i++){
      console.log("i=",i," dataGit2.Germany.data[i]=",
		  dataGit2.Germany.data[i]);
    }
  }

  dataDIVI_Germany=JSON.parse(dataDIVI_Germany_string);
  console.log("dataDIVI_Germany=",dataDIVI_Germany);
  
  dataRKI = JSON.parse(dataRKI_string); // must be different name!!
  dataRKI_orig=JSON.parse(JSON.stringify(dataRKI));
  console.log("dataRKI=",dataRKI);
  console.log("dataRKI[SK_Dresden][190]=",dataRKI["SK_Dresden"][190]);

  // other data can be brought life by fetch on modern browsers

  if(useLiveData && !(typeof fetch === "undefined")){

    console.log("loadData(): fetch defined");

    fetch("https://pomber.github.io/covid19/timeseries.json")
      //.then((response1) => {
      .then(function(response1){
	return response1.json();
      })

      //.then((data1) => {
      .then(function(data1){
        dataGit=data1;
	dataGit_orig=JSON.parse(JSON.stringify(dataGit)); // full clone
        console.log("in fetch function:\n dataGit=",dataGit);
	console.log("end loadData(..) live alternative");
        initializeData(country); //!! MUST remain inside; extremely annoying
	//setMutationSim(simulateMutation); // only html

      });
  }

  // fallback: use also main data from server (-> cron-job!)

  else{
    if(useLiveData){
      useLiveData=false;
      console.log("You are using an old Browser that does not understand Javascript's fetch");
    }
    dataGit = JSON.parse(dataGitLocal); // known since html->data/github.json
    dataGit_orig=JSON.parse(JSON.stringify(dataGit)); // full clone
    console.log("useLiveData=false, get data locally:\n dataGit=",dataGit);
    console.log("end loadData(..) non-live alternative");
    initializeData(country); //!! MUST repeat because of annoying time order
    fracDie=IFRinit; // use IFR start array for init()
    corona.init(0);
  }

  
} // loadData called ONLY in the <body onload>  event




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



//##############################################################
// getData: get the data
//!! also called in validation, so do not use reset validation operations
// if called inside validation, insideValidation should be true
//##############################################################

function initializeData(country,insideValidation){

  if( typeof insideValidation === "undefined"){insideValidation=false;}
  
  country2=(country==="United Kingdom") ? "England" :
    (country==="South Africa") ? "SouthAfrica" :country;
  
  
  useLiveData=useLiveDataInit;
  console.log("\n\n======================================================",
	      "\nin initializeData(country): country=",country,
	      " country2=",country2,
	      "\n========================================================");
  n0=parseInt(n0List[country]);


  //=========initializeData (1): adapt primary data "data" ==========
  
  // MT 2020-09  // [] access for strings works ONLY with "" or string vars
  // access ONLY for literals w/o string ""
  // extracting at point (4)

  var data=(insideValidation) ? dataGit[country] : dataGit_orig[country];
  
  
 
 // do not use last datum (report delay bias in GER and FRA)

  if(knockoffLastDatumGerFra&&(data.length>9)){
    var dxtFactor=(data[data.length-1]["confirmed"]
		   -data[data.length-2]["confirmed"])/
	(data[data.length-8]["confirmed"]
	 -data[data.length-9]["confirmed"]);
    var knockoffLast=(nDaysValid==0)
	&&(dataGit["Austria"].length==data.length)
	&&((country2==="Germany")||(country2==="France"))
	&&(dxtFactor<0.5);
    if(knockoffLast){
      data.pop();
      console.log(
        "\n\n##########################",
	"\n Germany and France delay data delivery=>knock of last point",
        "\n last date=",data[data.length-1].date,
        "\n#####################");
    }
  }


  
  //=========initializeData (2) set index shift di2 =====================
  
  // index shift di2 between secondary data "data2" (test+Vacc) and data
  // extracting at point (5)
  
  var data2=(insideValidation)
      ? dataGit2[country2].data : dataGit2_orig[country2].data;

  


  var dataMinDateStr=insertLeadingZeroes(data[0]["date"]);
  var dataMaxDateStr=insertLeadingZeroes(data[data.length-1]["date"]);
  var data2MinDateStr=data2[0]["date"];
  var data2MaxDateStr=data2[data2.length-1]["date"];

  
  // initializeData: define index shift di2=i2-i1 for same date
  // (define from the end since some data weekly (!) at very beginning)
  
  var dataMinDate=new Date(dataMinDateStr);
  var dataMaxDate=new Date(dataMaxDateStr);
  var data2MinDate=new Date(data2MinDateStr);
  var data2MaxDate=new Date(data2MaxDateStr);

  di2=data2.length-data.length
    -Math.round( (data2MaxDate.getTime()-dataMaxDate.getTime() )/oneDay_ms);

  console.log("\n\nFirst def: data2.length=",data2.length,
	      " data.length=",data.length,
	      "\n  data[data.length-1][\"date\"]=",
	      data[data.length-1]["date"],
	      "\n  data2[data2.length-1][\"date\"]=",
	      data2[data2.length-1]["date"],
	      "\n  dataMaxDateStr=",dataMaxDateStr,
	      "\n  data2MaxDateStr=",data2MaxDateStr,
	      "\n  dataMaxDate.getTime()=",dataMaxDate.getTime(),
	      "\n  data2MaxDate.getTime()=",data2MaxDate.getTime(),
	      " di2=",di2,"\n\n");
  //alert("stop!");

  
  //=========initializeData (3): define start of simulation ==========

  // !! re-initialize; otherwise consequential errors after switching back
  // to countries with more data
  
  dayStartMar=dayStartMarInit;
  dayStartYear=dayStartMar+59; // for calc_seasonFactor
  dateStart=new Date(2020,02,dayStartMar);
  itPresent=itPresentInit; // will possibly be changed below
  itGraphicsStart=itGraphicsStartInit;


  
  // define start date of the two data sources FROM THE END
  // since data2 sometimes only has weekly entries at the beginning

  data_idataStart=data.length-1 - Math.round( // absolute index
    (dataMaxDate.getTime()-dateStart.getTime() )/oneDay_ms);
  data2_idataStart=data_idataStart+di2;

  
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
    dateStart=new Date(2020,02,dayStartMar+daysForwards);
    dayStartYear+=daysForwards;
    itPresent -= daysForwards; // di2 unchanged
    itGraphicsStart -= daysForwards; // di2 unchanged
    console.log("Warning: no data >=ten days before sim start",
		"\n => shift start date by ",daysForwards,
		" days to ",data2[data2_idataStart]["date"]);
  }

 // define time shifts start date - start date of the two data sources 

  data_itmax=data.length-data_idataStart; 
  data2_itmax=data2.length-data2_idataStart;


  // initializeData(country):
  // update the time shift to the mutation reference list

  dit_startMut2present = (use_startMutRel)
    ? dit_startMut2presentRel
    : dit_startMut2presentAbs;
  itStartMut=itPresent-dit_startMut2present; // !!! check for validation
  pMutRef=pMutList[country];
  simulateMutation=useMutationIfAvailable && (pMutRef>1e-6);
  dtshift=dit_list2present-dit_startMut2present;
  pMutStart=(simulateMutation)
    ? estimate_pMut_timeShift(pMutRef,rMutStart,dtshift): 0;

  console.log("initializeData: Mutations: coutry=",country,
	      "\n present=", present,
	      " time_pMutList=",time_pMutList,
	      " pMutRef=",pMutRef,
	      " pMutStart=",pMutStart,
	      " dit_list2present=",dit_list2present,
	      " dtshift=",dtshift,
	      " simulateMutation=",simulateMutation);
  
  // testing the overall structure

  if(true){
    var nxtStart=data[data_idataStart]["confirmed"];

    console.log(
      "\nChecking times: ",
      "\n  dateStart=",dateStart,
      "\n  present=",present,
      "\n  itPresent=",itPresent,
      "\n\nTesting the overall read data structure:",
      "\n  data.length=",data.length,"  data2.length=",data2.length,
      "\n  data_idataStart=",data_idataStart,
      "  data2_idataStart=",data2_idataStart,
      "\n  data_itmax=",data_itmax,"  data2_itmax=",data2_itmax,
      "\n  data[0][\"date\"]=",data[0]["date"],
      "\n  data2[0][\"date\"]=",data2[0]["date"],
      "\n  dataMaxDateStr=",dataMaxDateStr,
      "\n  data2MaxDateStr=",data2MaxDateStr,
      "\n\ndi2=",di2,
      "\n  data[data.length-20][\"date\"]=",data[data.length-20]["date"],
      "  data2[Math.min(data.length-20+di2,data2.length-1)][\"date\"]=",data2[Math.min(data.length-20+di2,data2.length-1)]["date"],
      "\n  data[data.length-50][\"date\"]=",data[data.length-50]["date"],
      "  data2[Math.min(data.length-50+di2,data2.length-1)][\"date\"]=",data2[Math.min(data.length-50+di2,data2.length-1)]["date"],
      "\n  data[data_idataStart][\"date\"]=",data[data_idataStart]["date"],
      "  data2[data2_idataStart][\"date\"]=",data2[data2_idataStart]["date"],
      "\n  nxtStart=data[data_idataStart][\"confirmed\"]=",nxtStart,
      "\n  data[data_idataStart+data_itmax-1][\"date\"]=",
         data[data_idataStart+data_itmax-1]["date"],
      "\n  data2[data2_idataStart+data2_itmax-1][\"date\"]=",
         data2[data2_idataStart+data2_itmax-1]["date"],
      "\n"
    );
  }
  //alert("stop!");

  //=========initializeData (4): extract all quantities from "data" ====

  // reset all arrays since RKI sources have other length than country data

  data_date=[]; 
  data_cumCases=[];
  data_cumCasesSmooth=[];
  data_cumDeaths=[];
  data_cumRecovered=[];
  data_cumCfr=[];
  data_cumVacc=[];
  data_cumBoost=[]; // data_cumVaccFully not used
  data_stringencyIndex=[]; 


  // also for derived data (unless test numbers) used in simulation

  data_cumTestsCalc=[];
  data_dn=[];
  data_dnSmooth=[];
  data_dxt=[];
  data_dyt=[];
  data_dz=[];

  data_dxt[0]=0; 
  data_dyt[0]=0;
  data_dz[0]=0;

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

    // correct for ANNOYING inconsistent RKI data
    if((i>0)&&(data_cumCases[i]<data_cumCases[i-1])){
      data_cumCases[i]=data_cumCases[i-1]; 
    }

    // correct for ANNOYING missing update of data in France since 2021-05-20
    // as of 2021-06-10

    var i2=i+di2; // di2 defined earlier in this function initializeData
    //console.log("i2=",i2," data2[i2]=",data2[i2]);
    if((i2>=0)&&(i2<data2.length)
       &&(!(typeof data2[i2].total_cases === "undefined"))){
      data_cumCases[i]=Math.max(data_cumCases[i],data2[i2].total_cases);
    }


    
    data_cumDeaths[i]=data[i]["deaths"];
    data_cumRecovered[i]=data[i]["recovered"];
    data_cumCfr[i]=(data_cumCases[i]==0)
      ? 0 : data_cumDeaths[i]/data_cumCases[i];
  }


  for(var i=1; i<data.length; i++){
    data_dxt[i]=data_cumCases[i]-data_cumCases[i-1];
    data_dyt[i]=data_cumRecovered[i]-data_cumRecovered[i-1];
    // in spain the def of deaths changed -> cum deaths reduced, dz<0
    data_dz[i]=Math.max(data_cumDeaths[i]-data_cumDeaths[i-1], 0.);
  }


  if(true){
    console.log("initializeData (4): pure data:");
    for(var i=data.length-15; i<data.length; i++){
      console.log(data_date[i],": data_dxt=",Math.round(data_dxt[i]),
		  " data_cumCases=",Math.round(data_cumCases[i]));
    }
  }
   
  // initializeData (4a):
  // Correct erratically high forecasts caused by not reported
  // cases for over a week by shifting some later cases to the missing cases
  // do not consider the first 9-1=8 weeks

  var correctVeryHighCases=false;
  
  if(correctVeryHighCases){
    var growthFactCrit=2;
    for(var j=0; j<Math.floor(data.length/7)-9; j++){
      var i0=data.length-1-7*j;
      var dxtWeek=data_cumCases[i0]-data_cumCases[i0-7];
      var dxtLastWeek=data_cumCases[i0-7]-data_cumCases[i0-14];
      if(dxtWeek>growthFactCrit*dxtLastWeek){
        if(true){
          console.log("Warning: last date ",data_date[i0],
		    " correct missing reported cases in data_cumCases:",
		    " dxtWeek=",dxtWeek,
		    " dxtLastWeek=",dxtLastWeek,
		    "");
	}
        var fact=1/(2*growthFactCrit);
        for(var k=0; k<7; k++){
	  var ip=i0-13+k;
	  var im=i0-k;
	  var dxtShift=fact*data_dxt[im];
 	  data_dxt[im]-=dxtShift;
	  data_dxt[ip]+=dxtShift;
	}
	for(var i=i0-13;i<=i0; i++){ // inverse reconstr of data_cumCases
	  data_cumCases[i]=data_cumCases[i-1]+data_dxt[i];
	  //console.log("i=",i," data_dxt[i]=",data_dxt[i],
	  //	    " data_cumCases[i]=",data_cumCases[i]);
	}
      }
    }

    if(true){
      console.log("initializeData (4a) active: correct very high data:");
      for(var i=data.length-15; i<data.length; i++){
        console.log(data_date[i],": data_dxt=",Math.round(data_dxt[i]),
		  " data_cumCases=",Math.round(data_cumCases[i]));
      }
    }
  }

  
  // !!! initializeData (4b)
  // smoothing cumCases then differentiating for daily => artifacts at end
  // smoothing daily dxt then integrating for cum => opposite artifacts
  // => test arithmetic average of both procedures!!

  
 
  var calibrSmoothed=true;
  
  if(calibrSmoothed){
    console.log("\nSmooth cases and cumCases ...");
    var cumCasesSmooth1=[];
    var cumCasesSmooth2=[];
    var dailyCasesSmooth1=[];
    var dailyCasesSmooth2=[];
    
    cumCasesSmooth1=smooth(data_cumCases,
			       [1/7,1/7,1/7,1/7,1/7,1/7,1/7],false);
//			       [1/5,1/5,1/5,1/5,1/5],false);
//			       [1/4,1/4,1/4,1/4],false);
//			       [1/3,1/3,1/3],false); //!!

    dailyCasesSmooth1[0]=0;
    for(var i=1; i<data.length; i++){
      dailyCasesSmooth1[i]=cumCasesSmooth1[i]-cumCasesSmooth1[i-1];
    }
  
 
    dailyCasesSmooth2=smooth(data_dxt,
			       [1/7,1/7,1/7,1/7,1/7,1/7,1/7],false);
//			       [1/5,1/5,1/5,1/5,1/5],false);
//			       [1/4,1/4,1/4,1/4],false);
    //			       [1/3,1/3,1/3],false); //!!
    
    cumCasesSmooth2[0]=0;
    for(var i=1; i<data.length; i++){
      cumCasesSmooth2[i]=cumCasesSmooth2[i-1]+dailyCasesSmooth2[i];
    }
  
    for(var i=1; i<data.length; i++){ // i=0 already defined
      data_dxt[i]=0.5*(dailyCasesSmooth1[i]+dailyCasesSmooth2[i]);
      data_cumCases[i]=0.5*(cumCasesSmooth1[i]+cumCasesSmooth2[i]);
    }
    
    if(true){
      console.log("initializeData (4b) active: smooth daily and cum cases");
      for(var i=data.length-15; i<data.length; i++){
        console.log(data_date[i],": data_dxt=",Math.round(data_dxt[i]),
		    " data_cumCases=",Math.round(data_cumCases[i]));
      }
    }
  }
  

  //=========initializeData (5): extract  "data2" ===========

  // stringency index, test and vacination data
  // !! rely on positive_rate instead of total tests
  // (=> data_cumTestsCalc) because more often available

  // di2 defined at data initialisation


  for(var i=0; i<=Math.max(1,-di2); i++){ // !! 1 => always elem[0] defined
    data_cumTestsCalc[i]=0;
    data_posRate[i]=0;
    data_stringencyIndex[i]=0;
    data_cumVacc[i]=0;
    data_cumBoost[i]=0;
    data_icuIncidence[i]=0;
  }

  var i2_lastPosRate=0; // i2 for last defined posRate; needed for extrapol
  data2[0].positive_rate=0;  // to have always defined basis

  for(var i=Math.max(1,-di2); i<Math.min(data.length,data2.length-di2); i++){
    var i2=i+di2; // di2 defined at data initialisation
    //console.log("i2=",i2," data2[i2]=",data2[i2]);
    data_cumVacc[i]=(
      !(typeof data2[i2].people_vaccinated === "undefined"))
      ? data2[i2].people_vaccinated
      : data_cumVacc[i-1]
      + (data_cumVacc[i-1]-data_cumVacc[i-8])/7.; //!!
     // : 2*data_cumVacc[i-1]-data_cumVacc[i-2];
    data_cumBoost[i]=(
      !(typeof data2[i2].total_boosters === "undefined"))
      ? data2[i2].total_boosters
      : data_cumBoost[i-1]
      +(data_cumBoost[i-1]-data_cumBoost[i-8])/7.; //!!
     // : 2*data_cumBoost[i-1]-data_cumBoost[i-1];
    if(!(data_cumVacc[i]>=0)){ // NaN or other errors outside of undefined
      data_cumVacc[i]=data_cumVacc[i-1];
    }
    if(!(data_cumBoost[i]>=0)){ 
      data_cumBoost[i]=data_cumBoost[i-1];
    }
  
    data_icuIncidence[i]=
      (!(typeof data2[i2].icu_patients === "undefined"))
      ? data2[i2].icu_patients*100000/n0 : data_icuIncidence[i-1];


    data_stringencyIndex[i]=
      (!(typeof data2[i2].stringency_index === "undefined"))
      ? data2[i2].stringency_index : data_stringencyIndex[i-1];
  
    if( !(typeof data2[i2].positive_rate === "undefined")){ //is defined
      i2_lastPosRate=i2; 
    }
  
    data_posRate[i]=data2[i2_lastPosRate].positive_rate;
    
    //!!F.ck! ternary ? : expression MUST be in parentheses!!
    data_cumTestsCalc[i]=data_cumTestsCalc[i-1]
      + ((data_posRate[i]>0)
	 ? (data_cumCases[i]-data_cumCases[i-1])/data_posRate[i] : 0);
  }


  // if data2 is less up-to-date than data, fill data2 derived quantities
  // with constants or cum with lin extrapolation

  var iLast_data2=Math.min(data.length,data2.length-di2)-1;

  for(var i=iLast_data2+1; i<data.length; i++){
    data_cumTestsCalc[i]=data_cumTestsCalc[iLast_data2]
      + ((data_posRate[iLast_data2]>0)
	 ? (data_cumCases[i]-data_cumCases[iLast_data2])
	 /data_posRate[iLast_data2] : 0);
    data_posRate[i]=data_posRate[iLast_data2];
    data_stringencyIndex[i]=data_stringencyIndex[iLast_data2];
    data_cumVacc[i]=data_cumVacc[iLast_data2] + (i-iLast_data2)
      *(data_cumVacc[iLast_data2]-data_cumVacc[iLast_data2-7])/7.;
    data_cumBoost[i]=data_cumBoost[iLast_data2]+ (i-iLast_data2)
      *(data_cumBoost[iLast_data2]-data_cumBoost[iLast_data2-7])/7.;
    data_icuIncidence[i]=data_icuIncidence[iLast_data2];
    if(false){
      console.log("\ni=",i," iLast_data2=",iLast_data2,
		  " data_cumVacc[iLast_data2]=",
		  data_cumVacc[iLast_data2],
		  " data_cumVacc[iLast_data2-1]=",
		  data_cumVacc[iLast_data2-1],
		  "");
    }
  }


  //=========initializeData (6): calculate vaccination rates ==========

  // data_cumVacc = data2[i2].people_vaccinated
  // data2[i2].people_fully_vaccinated defined but not yet used (necessary?)

  var data_rVacc_unsmoothed=[]; // fraction of population per day
  var data_rBoost_unsmoothed=[];
  data_rVacc_unsmoothed[0]=0;
  data_rBoost_unsmoothed[0]=0;

  for(var i=1; i<data.length; i++){
    data_rVacc_unsmoothed[i]=(data_cumVacc[i]-data_cumVacc[i-1])/n0;
    data_rBoost_unsmoothed[i]=(data_cumBoost[i]-data_cumBoost[i-1])/n0;
    if(false){
      console.log("i=",i," date=",data[i]["date"],
		  " data_cumBoost[i]=",data_cumBoost[i],
		  " data_rBoost_unsmoothed[i]=",data_rBoost_unsmoothed[i]);
    }

  }
  
  kernel=[1/7,1/7,1/7,1/7,1/7,1/7,1/7]; 
  data_rVacc=smooth(data_rVacc_unsmoothed,kernel);
  data_rBoost=smooth(data_rBoost_unsmoothed,kernel);

  
  // correct artifacts near the end if rVacc unsmoothed=0 for last days

  for(var i=data.length-3; i<data.length; i++){
    var dVacc=data_cumVacc[i]-data_cumVacc[i-1]; // unsmoothed
    if(dVacc<1){data_rVacc[i]=data_rVacc[data.length-4]}; // rVacc smoothed
    dVacc=data_cumBoost[i]-data_cumBoost[i-1]; // unsmoothed
    if(dVacc<1){data_rBoost[i]=data_rBoost[data.length-4]}; // rBoost smoothed
  }
  
  if(false) for(var i=0; i<data.length; i++){
    console.log(data_date[i],": data_cumBoost=",
		data_cumBoost[i]," data_rBoost=", data_rBoost[i]);
  }
  
  // calculated immunity fraction profile IvaccArray using the dynamics of
  // Immunity() (!! related to it=i-data_idataStart)

  
  console.log("before immunity.initialize(country)");
  immunity.initialize(country);

  IvaccArray=immunity.calcIvaccArray(data_rVacc, data_rBoost);


  var rVaccData=0;
  for(var it=0; it<itPresent; it++){
    var i=it+data_idataStart;
    if(!( typeof data_rVacc[i] === "undefined")){
      //rVaccData=data_rVacc_unsmoothed[i]; // otherwise unchhanged
      rVaccData=data_rVacc[i]; // otherwise unchhanged
    }

    //!! immunity.updateAgeGroups needed for data-driven pre-calculation
    // of population-based IFR correction factors
    // (IvaccArray<-calcIvaccArray
    // used for the actual infection dynamics)
    
    immunity.updateAgeGroups(rVaccData,it);  
    corrIFRarr[it]=immunity.corrFactorIFR; 

    //if(it>itPresent-10){
    if(false){
      console.log("it=",it,
		  " IvaccArray[it]=",IvaccArray[it],
		  " corrIFRarr[it]=",corrIFRarr[it],
		 "");
    }
  }

  //=========initializeData (7): generate the data arrays ==========

  // (in data, not data2 time order) to be plotted

  // [assuming
  // (i) time interval tauTest where test is positive for infected people
  //     e.g. tauPos=7 from infection days 3-9 
  //     (start day here not relevant) 
  // (ii) the probability that not tested people are infected factor gamma
  //     of that for tested people
  // iii "Durchseuchung" <<1 (!! change later if xyz/n0 implemented!)
  // (iv) tests have certain alpha and beta errors
  // ]

  
  var tauPos=7; //!! keep const 1 week irresp. of tau sliders:
                // tauPos=7 cancels out weekly pattern



  // need new loop because of forward ref at cfr, ifr

 
  for(var i=0; i<data.length; i++){
    data_dn[i]=data_dxt[i]/data_posRate[i];// more stable
    if(!((data_dn[i]>0)&&(data_dn[i]<1e11))){data_dn[i]=0;}
    var dnTauPos=data_cumTestsCalc[i+di2]-data_cumTestsCalc[i+di2-tauPos];
   

    var dxtTauPos=data_cumCases[i]-data_cumCases[i-tauPos];

    var dztTauPos=Math.max(data_cumDeaths[i]-data_cumDeaths[i-tauPos],0.);

    data_cfr[i]=Math.max(data_cumDeaths[i+tauDie-tauTest]
		 -data_cumDeaths[i+tauDie-tauTest-tauPos],0.)/dxtTauPos;
  }

  // there is a var dnSmooth in graphics but this may be smoothed with
  // other kernel
  
  data_dnSmooth=smooth(data_dn,[1/7,1/7,1/7,1/7,1/7,1/7,1/7]);
  
 

  // proportional or  pow-like (special case sqrt-like) "Hellfeld" model:
  // dictated by testExponent
  // assume 100% "Hellfeld" if all n0 persons
  // are  tested within  tauInfectious_fullReporting days

  // use either normal smooth or supersmooth 
  
  var rSuperSmooth=1./21; // denom be longer than holiday special effects

  var pTestSuperSmooth=[];
  pTestSuperSmooth[0]=pTestInit;
  
  for(var i=0; i<data.length; i++){
    
    if((data_dn[i]>0)&&(data_dn[i]<1e11)){

      var pModel=Math.pow(tauInfectious_fullReporting*data_dn[i]/n0,
			  testExponent); 

	// corrections if very vew tests (only at beginning)
	// or pTest >1
	
      data_pTestModel[i]=pTestMin
	*Math.sqrt(1+Math.pow(pModel/pTestMin,2));
      data_pTestModel[i]=Math.min(data_pTestModel[i],1);

	// !! corrections if too strong daily dn jumps
	// (late cumulative data reporting)

        //if(false){
      if(i>0){
	  var pPrev=data_pTestModel[i-1];
	  data_pTestModel[i]
	    =Math.min(1.42*pPrev, Math.max(0.71*pPrev, data_pTestModel[i]));
      }
    }
    
    else{ // no valid dn data
      data_pTestModel[i]= (i>0) ? data_pTestModel[i-1] : pTestInit;
    }
  }
 

    
  // optionally EMA

  var useSuperSmooth=false; //!!!
  
  if(useSuperSmooth){
    for(var i=0; i<data.length; i++){
        if(i>0) pTestSuperSmooth[i]=rSuperSmooth*data_pTestModel[i] 
	  +(1-rSuperSmooth)*pTestSuperSmooth[i-1];
    }
    for(var i=0; i<data.length; i++){
	data_pTestModel[i]=pTestSuperSmooth[i];
    }
  }

  if(false){
    console.log("initializeData: modelled test probability \"Hellfeld\"",
		"for testExponent=",testExponent);
    for(var i=0; i<data.length; i++){
      console.log(
        insertLeadingZeroes(data[i]["date"]),
        " tauInfectious_fullReporting=",tauInfectious_fullReporting,
	" data_dn[i]=",data_dn[i],
	" n0=",n0,
	" data_pTestModel[i]=",data_pTestModel[i],
	" pTestSuperSmooth[i]=",pTestSuperSmooth[i],
	"");
    }
  }
 
  
 




  
  
  //kernel=[1/9,2/9,3/9,2/9,1/9];
  kernel=[1/7,1/7,1/7,1/7,1/7,1/7,1/7];  //  in initializeData

  data_pTestModelSmooth=smooth(data_pTestModel,kernel);
  loggingDebug=false; //!! global debug variable

  //=========initializeData (8): weekly pattern for pTestModel =========

  // weekly pattern for pTestModel and data_dn based on 3 periods

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


  //=========initializeData (9): determine maximum data_dn =========
  // for optional restriction of the test positives 

  for(var i=0; i<data_dnSmooth.length; i++){
    if(data_dnSmoothMax<data_dnSmooth[i]){data_dnSmoothMax=data_dnSmooth[i];}
  }

  //=========initializeData (10): final checks =================

  // (note: saisonal is always=6 at data.length-1)
 
  if(true){
    console.log(
      "\n\ninitializeData finished:",
      "\ndata[0][\"date\"]=",data[0]["date"],
      " data[data.length-1][\"date\"]=",data[data.length-1]["date"],
      "\ndata2[0][\"date\"]=",data2[0]["date"],
      " data2[data2.length-1][\"date\"]=",data2[data2.length-1]["date"],
      "data2.length=",data2.length);

    for(var i=0; i<data.length; i++){
      //var logging=true;
      //var logging=false;
      var logging=(i>data.length-10);
      //var logging=(i>data.length-4); 
      //var logging=(i==200);
      if(logging){
	var it=i-data_idataStart;
        var i2=i+data2_idataStart-data_idataStart;
	console.log("data2[i2]=",data2[i2]);
	var scheissData2Undefined=(typeof data2[i2] === "undefined");

	console.log(
	  " data: ",insertLeadingZeroes(data[i]["date"]),
	  " data2: ",((scheissData2Undefined)
		      ? "i2<0=>undefined" : data2[i2]["date"]),
	  " i=",i, " i2=",i2,
	  " data_dxt=",Math.round(data_dxt[i]),
	  " data_cumCases=",Math.round(data_cumCases[i]),
	  //" data_dyt=",Math.round(data_dyt[i]),
	  " data_dz=",Math.round(data_dz[i]),
	  "\n ",
	  " data_posRate[i]=",data_posRate[i], // primary from data
	  " data_cumTestsCalc=", Math.round(data_cumTestsCalc[i]),
	  " data_dn[i]=",data_dn[i].toFixed(1),
	  " data_pTestModel[i]=",data_pTestModel[i].toFixed(3),
	  " data_pTestModelSmooth[i]=",data_pTestModelSmooth[i].toFixed(3),
	  "\n ",
	  " data_cumVacc=",data_cumVacc[i].toFixed(0),
	  " data_cumBoost=",data_cumBoost[i].toFixed(0),
	  " data_rVacc=",data_rVacc[i].toFixed(5), // data_rVacc is smoothed
	  " data_rBoost=",data_rBoost[i].toFixed(5), // smoothed
	  " IvaccArray=",(it<0) ? 0 : IvaccArray[it].toFixed(3),
	  "\n ",
	  " data_posRate=",data_posRate[i],
	  " data_stringencyIndex=", Math.round(data_stringencyIndex[i]),
	  " data_icuIncidence=",data_icuIncidence[i].toFixed(2),
	  //" data_icuIncidence=",data_icuIncidence[i],
	  " "
	);
      }
    }
  }


  // !!! [2021-06-10 hack because stringency index is updated too sloppily
  // still no reduction as of 2021-06-10 although masive reductions throughout

  var fixStringencyLastVals=false; // no effect if false

  if(fixStringencyLastVals&&(nDaysValid<daysReduce)){
    var daysReduce=14;
    var factReduce=0.8;
    var istart=Math.min(data.length-daysReduce+nDaysValid, data.length-1);

    for(var i=istart; i<data.length; i++){
      var it=i-data_idataStart;      
      data_stringencyIndex[i]*=0.8;
    }
  }

  
  if(false){
    console.log("\ninitializeData finished: final weekly pattern:");
    for(var i=0; i<data.length; i++){
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


  // reset applicable sliders to data-driven state

  slider_R0_moved=false;
  otherSlider_moved=false;
  slider_stringency_moved=false;
  slider_pTest_moved=false;
  slider_rVacc_moved=false;
  slider_rBoost_moved=false;

  // reset not data-driven slider variables only in myResetFunction
  // (with the exception of casesInflow which is also reset=0 in calibration)

  casesInflow=0;
  if(slider_casesInflow!==null){
    setSlider(slider_casesInflow, slider_casesInflowText, casesInflow,
	      "/Tag");
  }
  

  //=========initializeData (10): compare with other country ===
  
  // just try: compare with other country
  // dataGit begin all at same date, in contrast to dataGit2

  console.log("in creating incidence for country to compare with:",
	      " countryCmp=",countryCmp,
	     // " dataGit[countryCmp]=",dataGit[countryCmp]
	     );
  dataCmp_cumCases=[];
  dataCmp_dxIncidence=[];
  var n0Cmp=parseInt(n0List[countryCmp]);
  for(var i=0; i<dataGit[countryCmp].length; i++){
    dataCmp_cumCases[i]=dataGit[countryCmp][i]["confirmed"];
  }

  for(var i=0; i<7; i++){
    dataCmp_dxIncidence[i]=dataCmp_cumCases[i]*100000/n0Cmp;
  }

  for(var i=7; i<dataCmp_cumCases.length; i++){
    dataCmp_dxIncidence[i]=(dataCmp_cumCases[i]-dataCmp_cumCases[i-7])
      *100000/n0Cmp;
    //if(i>dataCmp_cumCases.length-14){
    if(false){
      console.log("i=",i," date=",dataGit[countryCmp][i]["date"],
		  " dataCmp_dxIncidence[i]=",dataCmp_dxIncidence[i]);
    }
  }
  dataCmp_dxIncidence=smooth(
    dataCmp_dxIncidence,[1/7, 1/7, 1/7, 1/7, 1/7, 1/7, 1/7]);
  

  
 
  
  console.log("dataCmp_cumCases[300]=",dataCmp_cumCases[300]);

  //##############################################################
  //=========initializeData (11): calibrate
  //##############################################################

  // args set global vars itmin_calib, itmax_calib 
  // needed to control fmin.nelderMead

  casesInflow=0; // otherwise calibration instable
  calibrate(); // in initializeData(country);
  myRestartFunction(); // needed, otherwise strange effects


  if(false){
    console.log("\nend initializeData: country=",country,
		" insideValidation=",insideValidation,
		" ");
  }

} // initializeData(country);





//##############################################################
// factor dependence of R0 on political measures given as a 
// "stringencyIndex" in [0,100] in OWID 
//##############################################################

function stringencyFactor(stringencyIndex){
  //return 1-stringencySensitivitySqr*(Math.pow(stringencyIndex/100,2));
  return 1-0.01*stringencySensitivityLin*stringencyIndex;
  //return 1;
}

//##############################################################
// like influenca, covid19 is more active in winter [=>weather,climate]
// relate factor to present to make simple future projections
// deactivate season/winter/summer curve by relAmplitude=0;
//##############################################################

function calc_seasonFactor(it){
  var phase=2*Math.PI*((dayStartYear+it-365)/365. - season_fracYearPeak);

  if((country==="South Africa")||(country==="Australia")
     ||(country==="Australia")||(country==="Brazil")){
    phase+=Math.PI; // Southern hemisphere
  }

  var factor=1+season_relAmplitude*Math.cos(phase);

  if(country==="India"){
    factor=1; // no "normal seasons" in most of India
  }
  
  if(false){
  //if(it>itPresent){
    console.log("calc_seasonFactor: it=",it," itPresent=",itPresent,
		" phase/2pi=",phase/(2*Math.PI));
  }
  return factor;
}

//##############################################################
// general helper function
//##############################################################

function getArithmeticAverage(ydata,imin,imax){
  if (!((imin>=0)&&(imax>=imin)&&(imax<ydata.length))){
    console.log("getArithmeticAverage: error: ydata.length=",ydata.length,
		" indexMin=",imin," indexMax=",imax);
    return -1;
  }
  else{ // regular
    var sum=0;
    for(var i=imin; i<=imax; i++){sum+=ydata[i];}
    sum/=(imax-imin+1);
    return sum;
  }
}

function getVariance(ydata,imin,imax){
  if (!((imin>=0)&&(imax>imin)&&(imax<ydata.length))){
    console.log("getVariance: error: ydata.length=",ydata.length,
		" indexMin=",imin," indexMax=",imax);
    return -1;
  }
  else{ // regular
    var avg=getArithmeticAverage(ydata,imin,imax);
    var sum=0;
    for(var i=imin; i<=imax; i++){sum+=(ydata[i]-avg)*(ydata[i]-avg);}
    sum/=(imax-imin);  // (n-1 data points)
    return sum;
  }
}

// linear regression in time=index; returns [a,b,residualVariance]

function getTrendResidualVar(ydata,imin,imax){
  if (!((imin>=0)&&(imax>imin+1)&&(imax<ydata.length))){
    console.log("getTrendResidualVar: error: ydata.length=",ydata.length,
		" indexMin=",imin," indexMax=",imax);
    return -1;
  }
  else{ // regular
    var avgy=getArithmeticAverage(ydata,imin,imax);
    var avgx=0.5*(imin+imax);
    var sumxy=0;
    var sumxx=0;
    for(var i=imin; i<=imax; i++){
      sumxy+=(ydata[i]-avgy)*(i-avgx);
      sumxx+=(i-avgx)*(i-avgx);
    }
    var b=sumxy/sumxx;

    var a=avgy-b*avgx;
    var res=0;
    for(var i=imin; i<=imax; i++){
      res+=Math.pow(ydata[i]-a-b*i, 2);
    }

    res/=(imax-imin);
  }
  return [a,b,res];
}
  

// transforms an rgba color into an rgb color; leaves rgb colors unchanged
function rgba2rgb(color){

  // matches 1 or more digits [0-9], return an array of all instances
  // returns ["r","g","b","a1","a2"] if color="rgba(r,g,b,a1.a2)"
  var m=color.match(/\d+/g);
  return "rgb("+m[0]+","+m[1]+","+m[2]+")";
}


    

//##############################################################
// function for variable replication rate R0 as a function of time
// R0 includes virus strains but nothing else, not even season factor
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
    R0= Math.min(5, Math.max(0.2,R0));

    if(loggingDebug&&false){ //!! global variable; must be false in calibration
      console.log(
	"\n\nin R0fun_time: warmup: it=",it," iPresent=",iPresent,
	" iTest=",iTest," iTestPrev=",iTestPrev,
	"\n  data_cumCases[iTest+1]=",data_cumCases[iTest+1],
	" data_cumCases[iTest-1]=",data_cumCases[iTest-1],
	"\n  data_cumCases[iTestPrev+1]=",data_cumCases[iTestPrev+1],
	" data_cumCases[iTestPrev-1]=",data_cumCases[iTestPrev-1],
	"\n  nxtNewnum=",nxtNewnum,
	" nxtNewdenom=",nxtNewdenom,
	"\n  notice: undefined etc here OK; returning R0=",R0,
	"");
    }

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

  if(false&&logging){
    console.log("\nEntering SSE func:",
	//	" R0arr=",R0arr, "\n",
		"\n start calibr segment: itStart=",itStart,
		"\n end calibr segment: <itMax=",itMax,
		"\n max it in data: <data_itmax=",data_itmax,
		"\n present it: itPresent=",itPresent,
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
    if(false&&logging){
      console.log("SSEfunc; initializing with corona.snapshot: corona.snapshot.it=",corona.snapshot.it);
    }
    corona.setStateFromSnapshot();
  }

  else{
    
    fracDie=IFRinit;
    if(logging){
      console.log("SSEfunc; initializing from scratch with data: fracDie=",
		  fracDie);
    }
    corona.init(itStart, logging); 
    //corona.init(itStart, false); 
  }
  
  
  // SSEfunc: calculate SSE 

  //if(logging){ //!! always filter logging!!
  if(logging&&false){ //!! always filter logging!!
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

    // ! only R0arr used in SSEfunc;
    // R0fun_time uses info whether firstR0fixed
    // and, if so, init value firstR0
    var R0_actual= R0fun_time(R0arr,it-itStart); 
    corona.updateOneDay(R0_actual, it, logging); //in SSE; never logging=true!

    // increment SSE

    //  GoF function log(cumulative cases)

    var nxtSim=n0*corona.xt;
    var nxtData=data_cumCases[data_idataStart+it+1];  // sim from it to it+1

    //  GoF function log(new cases) !! not useful since drift @ cumulated

    //var nxtSim=n0*corona.dxt;
    //var nxtData=data_dxt[data_idataStart+it+1];  // sim from it to it+1


    // SSE increment
    
    var dsse=Math.pow(Math.log(nxtData)-Math.log(nxtSim),2); //!! Math.log

    // addtl penalty for negative R0 or R0 near zero
    var R0lowLimit=0.4; 
    var prefact=0.001; // 0.001
    if(R0_actual<R0lowLimit){
      dsse += prefact*Math.pow(R0lowLimit-R0_actual,2);
    }

    // addtl penalty for extreme R0
    prefact=1.e-12; 
    dsse += prefact*Math.pow(1-R0_actual,2); 

    // !! addtl penalty for differences !! some countries have daily diff!
    var dxtData=data_dxt[data_idataStart+it+1]/n0; 
    var dxtSim=corona.dxt;
    var dsseDiff=Math.pow(dxtData-dxtSim,2);

    if(it>itPresent-40){dsse+=1000*(it-itPresent+40)*dsseDiff;}

    // !! addtl mult near present

    if(true){
      var tau=20.;
      if(it>itPresent-tau){
        var mult=100*(1.-(itPresent-it)/tau);
        dsse *= mult;
      }
    }

    sse+=dsse;

    
    //if(logging&&(it<5)){
    if(logging&&(it>itPresent-5)){
    //if(logging&&true){
    //if(logging&&false){
      var dsseRaw=Math.pow(Math.log(nxtData)-Math.log(nxtSim),2);
      console.log("SSEfunc after update: it-itPresent=",it-itPresent,
		  " itSnap=",itSnap,
		  " R0_actual=",R0_actual.toFixed(2),
		  " nxtData=",nxtData,
		  " nxtSim=",Math.round(nxtSim),
		  "\n  dnxtData=",Math.round(n0*dxtData),
		  " dnxtSim=",Math.round(n0*dxtSim),
		  " dsseRaw=",dsseRaw,
		  " dsseDiff=",dsseDiff,
		  " dsse=",dsse,
		 "");
    }	 

  }

  // calculate the numerical gradient as side effect
  // only if gradient-based method. 


  if(logging&&false){console.log("SSEfunc: returning SSE=",sse,
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

  casesInflow=0; // otherwise side-effects with casesInflow > 0 after
  // graphics starts (for zero-covid szenarios if no external control)
  
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
  fracDie=IFRinit; // !! needed for corona.init
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

  setView(measuresView); // contains canvas_resize();

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

// last calibration interval must have at least
// calibInterval*nLastUnchanged days
function getIndexCalibmax(itime){
  return getIndexCalib(itime-calibInterval*nLastUnchanged); 
}


// =================================================
// determines calibrated R0time[]
// HERE inside calibrate() the control!
// location for inline nondynamic testing: search for these words
// =================================================

function calibrate(){

  inCalibration=true; // other calc of vacc in CoronaSim.updateOneDay 
  slider_rVacc_moved=false;
  slider_rBoost_moved=false;
  console.log("\n\n==================================================",
	      "\nEntering calibrate(): country=",country,
	      "\n====================================================");
 
  console.log("\nEntering calibration of R0 ...");
  R0time=[];  //!! must revert it since some countries may have less data!!
  IFR65time=[];  //!! must revert it since some countries may have less data!!
  fracICUtime=[];
  
  // !! new CoronaSim needed, otherwise side effects if nonzero vaccination
  
  corona=new CoronaSim();

  var R0calib=[]; 
 // for(var j=0; j<betaIFRinit.length; j++){ 
 //   betaIFR[j]=betaIFRinit[j];
 // }

  var itmin_c=0;            // basis
  var itmax_c=data_itmax-1; //basis



  // ############################################################
  // calibrate in multiple steps
  // ############################################################

  if(true){ 

    var logging=false; 


    var dn=nChunk-nOverlap;
    var nPeriods=Math.round((data_itmax-1-calibInterval*nLastUnchanged)
			    /(calibInterval*dn));
    var ditOverlap=nOverlap*calibInterval;
 
    for(var ip=0; ip<nPeriods; ip++){
      itmin_c=calibInterval*ip*dn; //=past itsnap
      itmax_c=itmin_c+calibInterval*nChunk;

      //step it calculates to it+1 and SSE needs data at it+1, hence itmax-1
      if(ip==nPeriods-1){itmax_c=data_itmax-1;console.log("SPECIAL CASE!!");}

      // global variables for the minimum SSE function

      itmin_calib=itmin_c;
      itmax_calib=itmax_c;
      useInitSnap=(ip>0); 
      var takeSnapshot=false; // taken separately at the end of a period


      icalibmin=getIndexCalib(itmin_c);
      icalibmax=getIndexCalibmax(itmax_c);


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

	//console.log("in calibr: itmin_c=",itmin_c," itmax_c=", itmax_c);
       //#####################################
        estimateR0(itmin_c, itmax_c, R0calib);  // also R0calib -> R0time
       //#####################################

        if(logging){console.log("after estimateR0: R0calib=",R0calib);}
 
        // calculate snapshot for init of next period

        var itsnap=Math.min(calibInterval*dn*(ip+1), itmax_c-1); //!!
        SSEfunc(R0calib,null,false,itmin_c,itmax_c,itsnap,useInitSnap);
        if(logging) console.log(" snapshot for initialiation in next period:",
		  corona.snapshot);
      } // if(icalibmax>icalibmin
    } // end calibration proper (several calibr steps) R0calib and R0time



    //R0time[R0time.length-1] *=1; // for some reason, last leg a bit low

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


  // ! here logging can be true for check of corona.update and corona.init

  var logging=false; 
  //var logging=true;

  if(logging){
    console.log("\nCalibration of R0 finished: testing SSEfunc calc. ...");
  }

  sse=SSEfunc(R0time,null,logging,0,data_itmax-1); // -1 because it: it->it+1
  console.log("calibrate(): calibrating R0 finished",
	      "\n final R0 values R0time=",R0time,
	      "\n fit quality sse=",sse);
  if(true){ //!!
    console.log("calibration details: nPeriods=",nPeriods,
		" data_itmax=",data_itmax);
    for(var j=R0time.length-6; j<R0time.length; j++){
      console.log("last vals: j=",j," R0time[j]=",R0time[j]);
    }
  }

  
  //console.log("itPresent=",itPresent,
//	      " getIndexCalibmax(itPresent)",getIndexCalibmax(itPresent));
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

  //################################################
  // check which lockdown sensitivity fits best the data, i.e., minimizes
  // variations of R0 before onset of new moutation Jan 2021
  //################################################
  
  if(true){
    var daySensitivStart=new Date(str_sensitivStart);
    var daySensitivEnd=new Date(str_sensitivEnd);

    var itSensitivStart=Math.floor(
      (daySensitivStart.getTime() - dateStart.getTime())/oneDay_ms);
    var itSensitivEnd=Math.floor(
      (daySensitivEnd.getTime() - dateStart.getTime())/oneDay_ms);
    var jmin=Math.max(0,getIndexCalib(itSensitivStart));
    var jmax=Math.min(getIndexCalib(itSensitivEnd), R0time.length-1);

    var R0_avg=getArithmeticAverage(R0time,jmin,jmax);
    var R0_var=getVariance(R0time,jmin,jmax);
    var trendResVar=getTrendResidualVar(R0time,jmin,jmax);
    if(false){
      console.log("daySensitivStart=",str_sensitivStart,
		"daySensitivEnd=",str_sensitivEnd,
		" stringencySensitivityLin=",stringencySensitivityLin,
		" season_fracYearPeak=",season_fracYearPeak,
		" season_relAmplitude=",season_relAmplitude,
		"\nR0-varcoeff=R0_stddev/R0_avg=",Math.sqrt(R0_var)/R0_avg,
		" R0_avg=",R0_avg," jmin=",jmin," jmax=",jmax,
		" R0time.length=",R0time.length,
		"\nvarcoeff_linregr=",Math.sqrt(trendResVar[2])/R0_avg," trendResVar=",trendResVar,
		  "");
    }
  }


   /** ##############################################################
  calibrate IFR estimate the infection fatality rate (IFR)
  in contrast to estimateR0 easy and only dependent on, 
  not interacting with, estimateR0
  ############################################################## */


  //console.log("\n\ncalibrate(): entering calibration of IFR ...");

  // depends on IFR_dontUseLastDays see beginning of corona.js
  var itmax_calibIFR=data_dz.length-data_idataStart-IFR_dontUseLastDays;
  
  // depends on IFRinterval_last_min see beginning of corona.js
  // last interval it in [(IFR_jmax-1)*IFRinterval,IFR_jmax*IFRinterval-1]
  // contains IFRinterval_last_min data points in extreme case,
  // generally more
  
  //var IFR_jmax=Math.ceil(
   // (itmax_calibIFR-IFRinterval_last_min)/IFRinterval);
  var IFR_jmax=Math.floor(itmax_calibIFR/IFRinterval);

  var itrest=itmax_calibIFR%IFRinterval;
  
  if(false){
    console.log("IFR calibration: IFR_dontUseLastDays=",IFR_dontUseLastDays,
		"\n  IFRinterval_last_min=",IFRinterval_last_min,
		"\n  itmax_calibIFR=",itmax_calibIFR,
		"\n  itPresent=",itPresent,
		"\n  IFR_jmax*IFRinterval=",IFR_jmax*IFRinterval,
		"\n  itrest=",itrest,
		"\n  IFRinterval*IFR_jmax+itRest-itmax_calibIFR=",
		IFRinterval*IFR_jmax+itrest-itmax_calibIFR,
		"");
  }
  
  IFR65time=[];
  for(var j=0; j<IFR_jmax; j++){IFR65time[j]=IFRinit;}

  var cumDeathsSim0=0;

  for(var j=0; j<IFR_jmax; j++){
    var it0=(j==0) ? 0 : itmax_calibIFR-(IFR_jmax-j)*IFRinterval;
    var it1=itmax_calibIFR-(IFR_jmax-j-1)*IFRinterval;
    var IFRcal=calibIFR(it0,it1); //!!!
    // average of old and new calibration, old IFRcal[1] in IFR65time[j]
    // !! start: IFRcal[1] better than IFRcal[0] in Germany 
    var IFR0=(j==0)
	? 0.5*(IFRcal[0]+IFRcal[1])
	: 0.5*(IFRcal[0]+IFR65time[j]);//
    var IFR1=IFRcal[1];
    cumDeathsSim0+=IFRcal[2];
    
    IFR65time[j]=IFR0;
    IFR65time[j+1]=IFR1; // time it=(j+1)*IFRinterval=IFR_jmax*IFRinterval
    // may be outside of data; no problem if j*IFRinterval inside
    
  }

  
  //!! ANNOYING slightest shift after any country choice back to Germany
  // approx rel error 10^{-3} in calibr R and IFR (no solution; forget...)

  if(false){
    console.log("IFR65time=",IFR65time);
    console.log("data_idataStart=",data_idataStart);
    console.log("dateStart=",dateStart);
    console.log("dayStartMar=",dayStartMar);
    console.log("dayStartYear=",dayStartYear);
    console.log("itPresent=",itPresent);
    console.log("calc_seasonFactor(0)=",calc_seasonFactor(0));
  }




  
   /** ##############################################################
  calibrate fracICU estimate of the infection ICU rate fracICU
  in contrast to estimateR0 easy and only dependent on, 
  not interacting with, estimateR0
  ############################################################## */


  //console.log("\n\ncalibrate(): entering calibration of fracICU ...");

  var itmax_calibICU=data_icuIncidence.length // as in fracICUfun_time(it)
      -data_idataStart-fracICU_dontUseLastDays;
  var ICU_jmax=Math.floor(itmax_calibICU/fracICUinterval);

  var itrest=itmax_calibICU%fracICUinterval;
  
  if(true){
    console.log("fracICU calibration: fracICU_dontUseLastDays=",
		fracICU_dontUseLastDays,
		"\n  fracICUinterval_last_min=",fracICUinterval_last_min,
		"\n  itmax_calibICU=",itmax_calibICU,
		"\n  itPresent=",itPresent,
		"\n  ICU_jmax*fracICUinterval=",ICU_jmax*fracICUinterval,
		"\n  itrest=",itrest,
		"\n  fracICUinterval*ICU_jmax+itRest-itmax_calibICU=",
		fracICUinterval*ICU_jmax+itrest-itmax_calibICU,
		"");
  }
  
  fracICUtime=[];
  for(var j=0; j<ICU_jmax; j++){fracICUtime[j]=fracICUinit;}

  for(var j=0; j<ICU_jmax; j++){
    var it0=(j==0) ? 0 : itmax_calibICU-(ICU_jmax-j)*fracICUinterval;
    var it1=itmax_calibICU-(ICU_jmax-j-1)*fracICUinterval;
    
    var ICUcal=calibICU(it0,it1); //!! [beta0,beta1,SSE]

    var ICU0=(j==0)
	? 0.5*(ICUcal[0]+ICUcal[1])
	: 0.5*(ICUcal[0]+fracICUtime[j]); // because of smooth not ICUcal[0] 
    var ICU1=ICUcal[1];

    fracICUtime[j]=ICU0;
    fracICUtime[j+1]=ICU1; 
    
  }


 
  if(true){ 
    console.log("IFR65time=",IFR65time);
    console.log("fracICUtime=",fracICUtime);
  }

  // test smoothing fracICUtime a bit
  // (since no cumulative numbers displayed, drift does not matter)
  // !!! still turned out to be bad ;-(
  
  if(false){
    fracICUtimeSmooth=smooth(fracICUtime,[1/3,1/3,1/3],false);
    //fracICUtimeSmooth=smooth(fracICUtime,[1/5,1/5,1/5,1/5,1/5],true);
    
    fracICUtime=fracICUtimeSmooth; // reference bu smoothing created new
    console.log("new fracICUtime=fracICUtimeSmooth=",fracICUtimeSmooth);
  }
  
  if(false){
    console.log("data_idataStart=",data_idataStart);
    console.log("dateStart=",dateStart);
    console.log("dayStartMar=",dayStartMar);
    console.log("dayStartYear=",dayStartYear);
    console.log("itPresent=",itPresent);
    console.log("calc_seasonFactor(0)=",calc_seasonFactor(0));
  }

  
  inCalibration=false; // use dynamic corona.immunity.update(...)

  
  
  //##############################################################
  // !! for inline nondynamic testing: add testcode here
  // outside of calibration
  //##############################################################

  
  if(false){
    console.log("end calibrate: in testing zone!");
    // enter testing code here
    //alert('stopped simulation with alert');
  }
  
}
//end calibrate()


/* =============================================================
!! simple local SSE calibration function for the deaths in [it0, it1-1] 
solves the 2-parameter regression problem 

dz[it] = beta1*IFRcorr[it]*(dxTau[it]*(1-r[it])
       + beta2*IFRcorr[it]*(dxTau[it]*r[it]
       =zData[it]

with 
 * parameters beta0,beta1 the IFR65s at begin/end 
 * dxTau[it] simulated daily infection increments tauD days earlier
   (no averaging over interval as in main sim)
 * (1-r[it]) decreasing weighting 1->0 and r[it] increasing 0->1

@ return:   vecIFR=(beta1,beta2,dCumDeathsSim)'
            beta1=vecIFR[0]=estimated IFR65 at it0
            beta2=vecIFR[1]=estimated IFR65 at it1-1
            dCumDeathsSim=simulated estimated addtl deaths in interval
            (needed for later correction of the drift due to local calibr

@param it0:   begin calibr time interval
@param it1-1: end calibr time interval
*/

function calibIFR(it0, it1){


  // weighting function

  var r=[];
  for(var i=0; i<it1-it0; i++){
    r[i]=i/(it1-it0);
  }

// matrix components of lin eq (beta1,beta2)'=A^{-1}(c1,c2)'

  var a11=0;
  var a12=0;
  var a22=0;
  var c1=0;
  var c2=0;

  var avec=[];
  var bvec=[];
  var corrIFRvec=[];
  for(var i=0; i<it1-it0; i++){

    // endogenous variable dz at time it=it0+i from data
    
    var idata=data_idataStart+it0+i;
    var dz=data_dz[Math.min(idata, data_dz.length-1)]; // rhs from data

    // exogenous variable dx weighted differently for beta1 and beta2
    // dx: infections at time it-tauDie causing deaths at it

    var dxTau=corona.dx_it[Math.max(it0+i-tauDie, 0)]; 
    var itTau=Math.max(0, Math.min(corrIFRarr.length-1,it0+i-tauDie));
    corrIFRvec[i]=corrIFRarr[itTau];
    avec[i]=n0*corrIFRvec[i]*(1-r[i])*dxTau;
    bvec[i]=n0*corrIFRvec[i]*r[i]*dxTau;
    a11+=avec[i]*avec[i];
    a12+=avec[i]*bvec[i];
    a22+=bvec[i]*bvec[i];
    c1+=dz*avec[i];
    c2+=dz*bvec[i];
    if(false){
    //if(it0==0){
      console.log("calibIFR: it0+i=",it0+i," idata=",idata, 
		  "\n n0*dxTau=",n0*dxTau," a=",avec[i]," b=",bvec[i]," z=",z);
    }
  }

  var detA=a11*a22-a12*a12;
  if(detA==0){
    console.log("calibIFR: error: determinant detA=0");
    return [0,0];
  }

  var vecIFR=[];

  // max, min: cope with all sorts of errors
  vecIFR[0]=(a22*c1-a12*c2)/detA;
  vecIFR[1]=(-a12*c1+a11*c2)/detA;

  // cope with all sorts of errors
  if(vecIFR[0]<=0){vecIFR[0]=0;} // cope with all sorts of errors
  if(vecIFR[1]<=0){vecIFR[1]=0;}

  // calculate cumulated increment [t0,t1]
  // avec and bvec contain corrIFRvec[i]!!
  if(false){
    
  var dCumDeathsSim=0;
  for(var i=0; i<it1-it0; i++){
    dCumDeathsSim+=avec[i]*vecIFR[0]+bvec[i]*vecIFR[1];
  }

    vecIFR[2]=dCumDeathsSim;
  }
  
  if(false){ // true OK here
    console.log("calibIFR: it0=",it0," it1-1=",it1-1,
		" data_itmax=",data_itmax,
		" data_dz.length=",data_dz.length,
		" data_idataStart=",data_idataStart,
		"\n it0: corrIFRvec[0]=",corrIFRvec[0],
		" it1-1:corrIFRvec[corrIFRvec.length-1]=",
		corrIFRvec[corrIFRvec.length-1], 
		"\n cum deaths in interval data: ",
		(data_cumDeaths[data_idataStart+it1-1]
		 -data_cumDeaths[data_idataStart+it0]),
		"\n cum deaths in interval sim: ",vecIFR[2],
		"\n return val vecIFR=",vecIFR,
		"");
  }
 
  return vecIFR;
} // calibIFR




/* =============================================================
local SSE calibration function for the ICU number in [it0, it1-1] 
linearly increasing/decreasing between it0 and it1
Assume ICU admission exactly tauICU after infection
!! Nearly identical to  more precise calc in updateOneDay: OK!

solves (with j=it0+i)

y_j=icuIncidence[j] = 100000 * beta0 * dx[j-tauICU]/n0 * (1-r[i])
                    + 100000 * beta1 * dx[j-tauICU]/n0 * r[i]

with increasing ramp r[i] from 0 to 1
and dx/n0 the fraction of new infected tauICU in the past (=corona.dx_it)


@ return:   vecICU=(beta0,beta1,SSE)'
Note: beta0,beta1 would denote the infection ICU rate (IIR) 
      for a stay of 1 day at the station at the begin/end of the period. 
      For 10 days, the estimated IIR would be =beta/10 

@param it0:   begin calibr time interval
@param it1-1: end calibr time interval
*/

function calibICU(it0, it1){


  // weighting ramp

  var r=[];
  for(var i=0; i<it1-it0; i++){
    r[i]=i/(it1-it0);
  }

// matrix components of lin eq (beta0,beta1)'=A^{-1}(c1,c2)'

  var a11=0;
  var a12=0;
  var a22=0;
  var c1=0;
  var c2=0;

  var prefact=100000;
  var yvec=[]; // endogenous var at different times
  var x0vec=[]; // exog var at different times
  var x1vec=[];
  
  for(var i=0; i<it1-it0; i++){

    // endogenous variable ICUincidence at time it=it0+i from data
    
    var idata=data_idataStart+it0+i;
    yvec[i]=data_icuIncidence[Math.min(idata, data_dz.length-1)];

    // exogenous variable dx weighted differently for beta0 and beta1
    // dx: infections at time it-tauICU causing deaths at it

    var dxTau=corona.dx_it[Math.max(it0+i-tauICU, 0)]; 
    x0vec[i]=prefact * dxTau * (1-r[i]);
    x1vec[i]=prefact * dxTau * r[i];
    a11+=x0vec[i]*x0vec[i];
    a12+=x0vec[i]*x1vec[i];
    a22+=x1vec[i]*x1vec[i];
    c1+=yvec[i]*x0vec[i];
    c2+=yvec[i]*x1vec[i];
    if(false){
    //if(it0==0){
      console.log("calibICU: it0+i=",it0+i," idata=",idata, 
		  "\n n0*dxTau=",n0*dxTau," x0vec=",x0vec[i],
		  " x1vec=",x1vec[i]," yvec=",yvec[i]);
    }
  }

  var detA=a11*a22-a12*a12;
  if(detA==0){
    console.log("calibIFR: error: determinant detA=0");
    return [0,0,0];
  }

  var beta=[];
  beta[0]=Math.max(0, Math.min(0.4, (a22*c1-a12*c2)/detA));
  beta[1]=Math.max(0, Math.min(0.4, (-a12*c1+a11*c2)/detA));

  // calculate SSE

  var SSE=0;
  for(var i=0; i<it1-it0; i++){
    SSE+=Math.pow(beta[0]*x0vec[i]+beta[1]*x1vec[i]-yvec[i],2);
  }
  beta[2]=SSE;
  
  if(false){ // true OK here
    console.log("calibIFR: it0=",it0," it1-1=",it1-1,
		" data_itmax=",data_itmax,
		" data_icuIncidence.length=",data_icuIncidence.length,
		" data_idataStart=",data_idataStart,
		"\n return val (beta',SSE)=",beta,
		"");
  }
  return beta;
} // calibICU





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

  icalibmin=getIndexCalib(itmin_c);
  icalibmax=getIndexCalibmax(itmax_c);// *max: >=10d cal intv

  // set global variables itmin_calib, itmax_calib needed for 
  // fmin.nelderMead

  itmin_calib=itmin_c;
  itmax_calib=itmax_c;


  if(false){console.log("\n\nestimateR0: after initializing: R0calib=",R0calib,
			" itmin_c=",itmin_c, " itmax_c=",itmax_c,
			" before fmin.nelderMead");}
	   

  /** ##############################################################
  !! THE central estimation 
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

  for(var ic=0; ic<1; ic++){ //!! 1 or 2

    // after nelderMead, R0calib nearly =sol2_SSEfunc.x
    //##############################################################
    sol2_SSEfunc=fmin.nelderMead(SSEfunc, R0calib);
    //##############################################################

  }

  //!! restrict R0 variations to +/- a value
  // use R0calib[] which is the same as R0calib[] to 0.001
  // unstable, forget it
  
  if(false){// do not touch the beginning with tmp R0=22 etc
  //if(icalibmin>10){// do not touch the beginning with tmp R0=22 etc
    var dR0max=1;
    R0calib[0]=Math.max(R0time[icalibmin]-dR0max,R0calib[0]);
    R0calib[0]=Math.min(R0time[icalibmin]+dR0max,R0calib[0]);
    for(var j=1; j<R0calib.length; j++){ 
    //for(var j=R0calib.length-1; j<R0calib.length; j++){ 
      R0calib[j]=Math.max(R0calib[j-1]-dR0max,R0calib[j]);
      R0calib[j]=Math.min(R0calib[j-1]+dR0max,R0calib[j]);
    }
  }
  
  // copy to global R0 table R0time

  //console.log("estimateR0 before new transfer: R0time=",R0time);
  if(firstR0fixed) for(var j=0; j<R0calib.length; j++){ 
     //R0time[j+1+icalibmin]=sol2_SSEfunc.x[j];
     R0time[j+1+icalibmin]=R0calib[j];
  }
  else for(var j=0; j<R0calib.length; j++){ // normal
     //R0time[j+icalibmin]=sol2_SSEfunc.x[j];
     R0time[j+icalibmin]=R0calib[j];
  }
  if(false){console.log("estimateR0 after new transfer: firstR0fixed=",
			firstR0fixed, " R0time.length=",R0time.length);
	   }


 
  if(true){
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

  icalibmin=getIndexCalib(itmin_c);
  icalibmax=getIndexCalibmax(itmax_c);// *max: >=10d cal intv


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




function IFRfun_time(it){ // uses IFR65time
  var itmax_calibIFR=data_dz.length-data_idataStart-IFR_dontUseLastDays;
  var IFR_jmax=IFR65time.length; // actually j<IFR_jmax
  var itrest=itmax_calibIFR%IFRinterval;
  var jlower=Math.max(0,Math.floor((it-itrest)/IFRinterval));
  var jhigher=jlower+1;
  var it0=(jlower==0) ? 0 : itmax_calibIFR-(IFR_jmax-jlower-1)*IFRinterval;
  var it1=itmax_calibIFR-(IFR_jmax-jhigher-1)*IFRinterval;
  var r=(it-it0)/(it1-it0);
  var ifr=((it<0)||(IFR65time.length==0)) ? IFRinit
    : (jlower+1>=IFR_jmax)
    ? IFR65time[IFR_jmax-1]
      : (1-r)*IFR65time[jlower]+r*IFR65time[jhigher];
  
  if(false){
  //if(!inCalibration){
    console.log("IFRfun_time: IFR65time.length=",IFR65time.length,
		" it=",it,
		" floor=",Math.floor((it-itrest)/IFRinterval),
		" itrest=",itrest,
		" jlower=",jlower,
		" it0=",it0," it1=",it1,
		" r=",r," ifr=",ifr);
  }
  return ifr;
}


// forecast reduction only in the graphics ("reduceFactOmicron")

function fracICUfun_time(it){ // uses fracICUtime
  var itmax_calibICU=data_icuIncidence.length
      -data_idataStart-fracICU_dontUseLastDays;
  var ICU_jmax=fracICUtime.length; // actually j<IFR_jmax
  var itrest=itmax_calibICU%fracICUinterval;
  var jlower=Math.max(0,Math.floor((it-itrest)/fracICUinterval));
  var jhigher=jlower+1;
  var it0=(jlower==0)
      ? 0
      : itmax_calibICU-(ICU_jmax-jlower-1)*fracICUinterval;
  var it1=itmax_calibICU-(ICU_jmax-jhigher-1)*fracICUinterval;
  var r=(it-it0)/(it1-it0);
  var fracICU=((it<0)||(fracICUtime.length==0)) ? fracICUinit
    : (jlower+1>=ICU_jmax)
    ? fracICUtime[ICU_jmax-1]
      : (1-r)*fracICUtime[jlower]+r*fracICUtime[jhigher];
  
  if(false){
  //if(!inCalibration){
    console.log("fracICUfun_time: fracICUtime.length=",fracICUtime.length,
		" it=",it,
		" floor=",Math.floor((it-itrest)/fracICUinterval),
		" itrest=",itrest,
		" jlower=",jlower,
		" it0=",it0," it1=",it1,
		" r=",r," ifr=",ifr);
  }
  return fracICU;
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
                              // "Deutschland"

  usePrevious=false;
  simCount=0;
  console.log("  selectDataCountry: usePrevious=",usePrevious);
  country=document.getElementById("countries").value;
  countryGer=countryGerList[country];
  n0=parseInt(n0List[country]);
  fracICUinit=parseFloat(fracICUinitList[country]);
  fracDieInit=parseFloat(fracDieInitList[country]);
  tauRecover=parseFloat(tauRecoverList[country]);
  tauICU=parseFloat(tauICUlist[country]);
  tauDie=parseFloat(tauDieList[country]);
  taumax=Math.max(tauDie+tauAvg,tauRecover+tauAvg,
		    tauICU+Math.floor(tauICUstay/2))+1; //!!!
  //setSlider(slider_R0,  slider_R0Text,  R0time[0].toFixed(2),"");
  setSlider(slider_stringency, slider_stringencyText,
	  Math.round(stringency)," %");
  //setSlider(slider_R0cp,  slider_R0cpText,  R0time[0].toFixed(2),"");
  rVacc=0;
  setSlider(slider_rVacc, slider_rVaccText, 700*rVacc, " %");
  rBoost=0;
  setSlider(slider_rBoost, slider_rBoostText, 700*rBoost, " %");
  document.getElementById("title").innerHTML=
    "Simulation der Covid-19 Pandemie "+ countryGer;

  if(true){console.log("\n\n\n\n\n\n\n\nin selectDataCountry",
		       "\n (only called in html select box callback",
		       " and in myResetFunction()):",
		       "\n country=",country,
		       " country2=",country2,
		       " itPresent=",itPresent,
		       " \n usePrevious=",usePrevious,
		       "");
	   }
  resetValidation();
  initializeData(country);
} // selectDataCountry

 

function selectWindow(){ // callback html select box "windowGDiv"
  console.log("in selectWindow");
  windowG=document.getElementById("windows").value;

  // hide country cmp button for all but window 6 (incidences)
  
  document.getElementById("buttonCmp").style.display=
    (windowG==6) ? "block" : "none"; 

  drawsim.setWindow(windowG); // clear and draAxes in setDisplay..

  drawsim.transferSimData(it);

  drawsim.draw(it);

}

// helper functions validation:

function resetValidation(){ //// check/explain why needed
  nDaysValid=0;
  document.getElementById("validateDays").value=nDaysValid;
  document.getElementById("headerValidText").innerHTML="";
  //revertWorkingData();
}

// undo stripping of working data of past validation

function revertWorkingData(){
    dataGit=JSON.parse(JSON.stringify(dataGit_orig)); // full clone
    dataGit2=JSON.parse(JSON.stringify(dataGit2_orig));
    dataRKI=JSON.parse(JSON.stringify(dataRKI_orig));
}


//#################################################################
function savePreviousSim(){ // save relevant data of drawsim for
  // use in the next simulation for comparison,
  // e.g., validate or Mutation simulation
//#################################################################
    // association see cstr drawSim
    // !! check "def simPrevious"

  if(false){ 
    console.log("in savePreviousSim: ",
		"itPresent=",itPresent," itmaxPrev=",itmaxPrev);
  }

  // in some combinations, drawsim not defined at the start
  if( typeof drawsim === "undefined"){drawsim=new DrawSim();}


  // !!! store data of previous sim for display at the next
  
  indicesPrev=[34,35,36,37,38,39,40,44,47,49,51];
  for(var iq=0; iq<indicesPrev.length; iq++){
    simPrevious[indicesPrev[iq]]=[];
  }

  // data quantities
  
  for(var it=0; it<itPresent; it++){
      simPrevious[34][it]=drawsim.dataG[0].data[it];  // "Insg pos Getestete"
      simPrevious[35][it]=drawsim.dataG[2].data[it];  // "Insgesamt Gestorbene"
  }

  // sim quantities
  
  for(var it=0; it<itmaxPrev; it++){
      simPrevious[36][it]=drawsim.dataG[23].data[it]; // "Sim Neuinfiz/Tag"
      simPrevious[37][it]=drawsim.dataG[28].data[it]; // "Sim Gestorbene"
      simPrevious[38][it]=drawsim.dataG[32].data[it]; //Sim weekly inc cases
      simPrevious[39][it]=drawsim.dataG[33].data[it]; //Sim weekly inc deaths
      simPrevious[40][it]=drawsim.dataG[29].data[it]; // "Sim Pos pro Tag"
      simPrevious[44][it]=drawsim.dataG[41].data[it]; // Grad Lockdown
      simPrevious[47][it]=drawsim.dataG[46].data[it]; // Booster
      simPrevious[49][it]=drawsim.dataG[48].data[it]; // Rt-Wert
      simPrevious[51][it]=drawsim.dataG[50].data[it]; // OK by reference
  }
}


//#################################################################
function validate(){ // callback html select box "validateDiv"
  //needs additional initializeData(country,true) with flagValid=true
  // and calls calibrate
//#################################################################



  // validate(1): how many days of forecast should be validated?
  
  nDaysValid=parseInt(document.getElementById("validateDays").value);

  var validText=((nDaysValid>0)&&((!isSmartphone) || isLandscape))
    ? "Validierung der "+nDaysValid+" letzten Tage" : "";
  document.getElementById("headerValidText").innerHTML=validText;
  usePrevious=(nDaysValid>0) ? true : usePreviousGlob;
  console.log("\n\nvalidate: nDaysValid=",nDaysValid,
	      " usePrevious=",usePrevious,
	      " itmaxPrev=",itmaxPrev);


  // validate (2): save past drawsim data in
  // validation reference data structure referenced by 
  // elements such as drawsim.dataG[34].
  // Need to store outside drawsim since drawsim created anew at restart

  savePreviousSim();
  
  // validate (3):
  // undo stripping of json input dataGit,dataGit2,dataRKI of past validation
  // using dataGit_orig, dataGit2_orig, dataRKI_orig

  revertWorkingData();


  // validate (4):
  // re-strip working input data dataGit,dataGit2,dataRKI
  // will later be copied to usual input arrays
  // in initializeData(country,true)

  for(var attribute in dataGit){
    var n_arr=dataGit[attribute].length;
    var lastDateStr=insertLeadingZeroes(dataGit[attribute][n_arr-1]["date"]);
    var lastDate=new Date(lastDateStr);
    var days2present
      =Math.floor((present.getTime()-lastDate.getTime())/oneDay_ms);
    if(false){
      console.log(
        "dataGit: attribute=",attribute,
        " n_arr=",n_arr," lastDateStr=",lastDateStr,
        //" present=",present," lastDate=",lastDate,
        " days2present=",days2present);
    }

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
    if(false){
      console.log(
        "dataGit2: attribute=",attribute,
        " n_arr=",n_arr," lastDateStr=",lastDateStr,
        " days2present=",days2present);
    }

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
    if(false){
      console.log(
        "dataGit: attribute=",attribute,
        " n_arr=",n_arr," lastDateStr=",lastDateStr,
        " days2present=",days2present);
    }

    for(var j=days2present; j<nDaysValid; j++){
      dataRKI[attribute].pop();
    }
  }

  console.log("dataGit=",dataGit," dataGit_orig=",dataGit_orig);
  console.log("dataRKI=",dataRKI," dataRKI_orig=",dataRKI_orig);

  initializeData(country,true); // insideValidation=true
  //calibrate(); // in initializeData(country);
  //myRestartFunction(); // in initializeData(country);

} // validate





//################################################
// callback stop & go
//################################################

function myStartStopFunction(){ //!! hier bloederweise Daten noch nicht da!!
  //console.log("in myStartStopFunction");
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

function myRestartFunction(){ // called if new country and other events
  //console.log("in myRestartFunction: itPresent=",itPresent);
  simCount++;
  if(simCount>1){
    savePreviousSim();
  }
  usePrevious=usePreviousGlob&&(simCount>1)&&(!isSmartphone);
  console.log("myRestart: usePrevious=",usePrevious);
  // MT 2021-11-16: reset all applicable sliders to data-driven state
  
  slider_rVacc_moved=false;
  slider_rBoost_moved=false;
  slider_stringency_moved=false;
  //setSlider(slider_rVacc, slider_rVaccText, 700*rVacc, " %");
  //setSlider(slider_rBoost, slider_rBoostText, 700*rBoost, " %");
  

  initialize();

  fps=fpsstart;
  it=0; //!! only instance apart from init where global it is reset to zero
        // cannot set it=itPresen if simulateMutation
        // because of dyn Vars vacc, x,y,z

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  fracDie=fracDieInit;
  corona.init(0,false); // because initialize redefines CoronaSim()

  clearInterval(myRun);

  
  //!!! skip sim start
  // corona.updateOneDay too low-level; need doSimulationStep
  // to update some graphics-related stuff and, e.g., fracDie

  while(it<itGraphicsStart){doSimulationStep(false);} // 

  
  drawsim.transferRecordedData(); // update graphics and scaling
  drawsim.checkRescaling(it); //
  
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
  //resetValidation(); //!!?? 
  slider_R0_moved=false;
  otherSlider_moved=false;
  slider_pTest_moved=false;
  slider_stringency_moved=false;
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

  stringency=0;
  setSlider(slider_stringency, slider_stringencyText,
	  Math.round(stringency)," %");

  rVacc=rVaccInit;
  setSlider(slider_rVacc, slider_rVaccText, 700*rVacc, " %");

  rBoost=rBoostInit;
  setSlider(slider_rBoost, slider_rBoostText, 700*rBoost, " %");

  casesInflow=casesInflowInit;
  if(slider_casesInflow!==null){
    setSlider(slider_casesInflow, slider_casesInflowText,casesInflow,"/Tag");
  }
  
  //measures=measuresInit;
  //slider_measures.value=measures; // setSlider does not fit here
  //slider_measuresText.innerHTML="&nbsp;"+str_measures(measures);


  selectDataCountry();  
  //myRestartFunction();
}


function myCalibrateFunction(){ // callback "Kalibriere neu!
  slider_R0_moved=false;
  otherSlider_moved=false;
  slider_pTest_moved=false;
  slider_stringency_moved=false;

  // calibration unstable with external source => must set to zero
  casesInflow=0;
  
  if(slider_casesInflow!==null){
    setSlider(slider_casesInflow, slider_casesInflowText,casesInflow,"/Tag");
  }
  
  // resets effect of past validations and defines all data derivatives
  // from the data*_orig data (containing all countries)
  // (because of the many derivatives, I need initializeData(country) here)
  resetValidation();
  initializeData(country); // includes calibrate(); myRestartFunction();
}


function myCountryComparison(){ // callback "Kalibriere neu!
  if(countryComparison){
    countryComparison=false;
    document.getElementById("buttonCmp").innerHTML="Start CZ Vergleich";
  }
  else{
    countryComparison=true;
    countryCmp="Germany";  //Czechia
    document.getElementById("buttonCmp").innerHTML="Stop CZ Vergleich";
 }
  myRestartFunction(); // in both cases; depends on countryComparison
}


// comment out document.getEl... if no button in html

function setMutationSim(withMutations){
  if(withMutations){
    useMutationIfAvailable=true;
    simulateMutation=useMutationIfAvailable && (pMutRef>1e-6);
    //document.getElementById("buttonMut").innerHTML="&Omicron; Mutation [stop]";
  }
  else{
    useMutationIfAvailable=false;
    simulateMutation=false;
    //document.getElementById("buttonMut").innerHTML="&Omicron; Mutation [start]";
  }
}


function toggleMutationSim(){ // callback (Delta) Mutation from html button
  setMutationSim(!simulateMutation); // toggles simulateMutation
  myRestartFunction();
}



// simulationRun only activated with setInterval after dateGraphicsStart

function simulationRun() {
  
  // set minimal imported cases per day and 100 000 inhabitants
  // if slider not present for Zero-Covid scenarios
  
  casesInflow=0.05; //!!!
  
  //console.log("simulationRun: before doSimulationStep: it=",it);
  var doDrawing=true;
  doSimulationStep(doDrawing); 

  /*
  if(!slider_R0_moved){
    setSlider(slider_R0, slider_R0Text, R0_actual.toFixed(2),"");
  }
  else{
    simulateMutation=false;
    document.getElementById("buttonMut").innerHTML="Start Mut. Delta Sim";
  }
  */
  
  if(!slider_stringency_moved){
    //console.log("setSlider(slider_stringency...): stringency=",stringency);
    setSlider(slider_stringency, slider_stringencyText,
	      Math.round(stringency)," %");
  }
  
  if((!slider_pTest_moved)&&includeInfluenceTestNumber){
    // if data_idataStart+it greater than data_itmax-1-3 use this value
    // to obtain full smoothing from -3 to 3
    // (last value not smoothed at all!)
    var idata=Math.min(data_idataStart+it, data_idataStart+data_itmax-1-3);
    setSlider(slider_pTest, slider_pTestText, 
	      //Math.round(100*pTest), " %");
	      (100*data_pTestModelSmooth[idata]).toFixed(2), " %");
  }

  if(!slider_rVacc_moved){
    setSlider(slider_rVacc, slider_rVaccText, (700*rVacc).toFixed(2), " %");
  }
  
  if(!slider_rBoost_moved){
    setSlider(slider_rBoost, slider_rBoostText, (700*rBoost).toFixed(2), " %");
  }
  

  // suffer one undefined at data_cumCases 
  // (doSimulationStep increments it so itPresent-2 would be correct)
  // to get full sim curves (first plot then update 
  // to get the initial point it=0) 

  if(it==itPresent){ // !! itPresent, not itPresent-1 represents present
    //console.log("before clearInterval: it=",it);
    clearInterval(myRun);myStartStopFunction();
  }
}

//#########################################
// only called at main run, not warmup
// !! need to plot first
// because warmup already produced start values for it=0
//#########################################

function doSimulationStep(doDrawing){ // logging "allowed" here !!

  //console.log("doSimulationStep: it=",it," R0=",R0);
  var itSlower=itPresent-42;
  var itFaster=itPresent+80;
  var changed_fps=((it==itSlower)||(it==itFaster));
  if(changed_fps){
    fps=(it==itSlower) ? 0.30*fpsstart : fpsstart;
    //console.log("doSimulationStep: changing fps, new fps=",fps);
    clearInterval(myRun);
    myRun=setInterval(simulationRun, 1000/fps);
  }
  fracDie= IFRfun_time(it);
  fracICU=fracICUfun_time(it);

  R0_actual=(slider_R0_moved) ? R0 : R0fun_time(R0time,it);
 
  R0_hist[it]=R0_actual; // for drawing

  var i=Math.min(data_idataStart+it, data_stringencyIndex.length-1);

  stringency_hist[it]=(slider_stringency_moved)
    ? stringency : data_stringencyIndex[i];


  if(false){ // doSimulationStep: logging "allowed"!!
  //if(it>itPresent-10){ // doSimulationStep: logging "allowed"!!
    console.log(" doSimulationStep before corona.update: it=",it,
		"data_cumCases[data_idataStart+it]=",
		data_cumCases[data_idataStart+it],
		" n0*corona.xt=",(n0*corona.xt).toPrecision(6),
		" R0_actual=",R0_actual.toPrecision(3),
		" fracDie=",fracDie.toPrecision(3),
		" corona.z=",Math.round(corona.z),
		"");
  }

  if(doDrawing){drawsim.draw(it);}


  
  corona.updateOneDay(R0_actual,it,true); // in doSimulationStep
  itmaxPrev=it;
  
  it++; //!!! ONLY it main update, after drawing (!!?)
 

  if(false){
    var idata=data_idataStart+it; // not "+1+" since after it++
    console.log(" it=",it,
		" pTest=",pTest.toPrecision(3),
		" dnxtFalse=",Math.round(n0*corona.dxtFalse),
		" data_dxt[idata]=",data_dxt[idata]);
  }

  if(false){// doSimulationStep: logging "allowed"
    //if(true){// doSimulationStep: logging "allowed"
  //if(it>=itPresent-10){
    var idata=data_idataStart+it; // not "+1+" since after it++
    console.log( "doSimulationStep: after it++: it=",it,
		 " R0=",R0_actual.toFixed(2),
		" pTest=",pTest.toPrecision(3),
		" n*dx=",Math.round(n0*corona.xtau[0]),
		" n*dxt=",Math.round(n0*corona.dxt),
		//" ndxtFalse=",Math.round(n0*corona.dxtFalse),
		//" nxt=",Math.round(n0*corona.xt),
		//" nxtData=",((it<itPresent-1) ? data_cumCases[idata]:"na"),
		//" fracDie=",fracDie.toPrecision(3),
		//" n0*corona.z=",Math.round(n0*corona.z),
		//" deathsData=",((it<itPresent-1) ? data_cumDeaths[idata]:"na"),
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

//################################################################
function estimate_pMut_timeShift(pIn,r,dt){
//################################################################

  // pIn: input pMut
  // r: assumed growth rate in odds ratio [1/days]
  // dt: time difference [days]

  if(pIn>=1){return 1;}
  var oddsIn=pIn/(1-pIn);
  var oddsOut=oddsIn*Math.exp(r*dt);
  return oddsOut/(1+oddsOut);
}


  
//################################################################
function MutationDynamics(){
//################################################################
  this.p_it=[];
  this.p=0;
  this.R10=1; // just dummies before initialize, for safety
  this.R20=1; 
}




// initialize MutationDynamics

/*
@param it0: time index where mutation dynamics takes over from calibr
@param p0:  Fraction p of new mutation at time index it0
@param r0:  growth rate of odds ratio p/(1-p) at time index it0
@param I10: pop immunity 1-(1-I10vacc)(1-I10infect) for old strain 1
@param I20: pop immunity for new strain 2
@param R0:  complex reproduction number old+new strain @ time index it0
            (taken from the calibrated value in the application)
*/

MutationDynamics.prototype.initialize=function(it0,p0,r0,I10,I20,R0){
  this.tauR=0.5*(tauRstart+tauRend); // if changed at the sliders
  this.y=(p0<1) ? p0/(1-p0) : 1e10;
  this.p_it[it0]=p0;
  this.p=p0;
  for(var it=0; it<it0; it++){
    exponent=r0*(it-it0);
    var ypast=this.y*Math.exp(exponent);
    this.p_it[it]=ypast/(1+ypast);
  }
  this.r0=r0;
  this.R10=R0/(1+p0*r0*this.tauR);
  this.R20=this.R10*(r0*this.tauR+1)*(1-I10)/(1-I20);
  if(false){
    console.log("MutationDynamics initialize: this.tauR=",this.tauR,
		" pMut=",p0,
		" this.y=",this.y,
		"\n R0=",R0," this.r0=",this.r0," this.R10=",this.R10,
		" this.R20=",this.R20);
  }
}

// update by Delta t=1 day !!! implement T2 !=T1, gamma!=1

MutationDynamics.prototype.update=function(I1,I2,it){
  var r= ( (this.R20*(1-I2))/(this.R10*(1-I1)) -1)/this.tauR;
  if(this.y<1e10){this.y *= Math.exp(r);}
  this.p=this.y/(1+this.y);
  this.p_it[it]=this.p;

 // console.log("MutationDynamics.update: this.R20=",this.R20," I1=",I1," I2=",I2," r=",r," pMut=",this.p_it[it]);
}
  




//################################################################
function Immunity(){
//################################################################

  // MT 2021-12  Immunity (renamed from Vaccination)
  // now also includes immunity by infection of up to 2 variants
  // and a possible waning of immunity by infection is set up as well
  
 
  // MT 2021-11
  // new variables for detailled efficiency waning and boosters
  // after second vacc/boost


  //################################################################
  // variables for immunity by infection (waning functions not yet set up)
  //################################################################

  this.I1infect=0;    // standard variant (2021-12: Delta)
  this.I2infect=0;    // new variant if applicable (2021-12: Omicron)


  //################################################################
  // variables for immunity by vaccination/boosters
  //################################################################

  this.evadeMutFactor=3; // (1-vacceff2)=max(0,1-evadeMutFactor*(1-vaceff1))
  this.I1vacc=0;      // vaccination immunity factor for standard strain
  this.I2vacc=0;      // ... for mutation (0=unprotected, 1=100% prot)

  
  // efficiency functions best fit to 2021-10-25_vaccEfficiency_Lancet.pdf
  // !! This is a bit more pessimistic than best fit to "Impfdurchbrueche"
  // but there all unknown vacc status is pidgeonholed as "not complete"
  
  this.tau0=30;     // #days between 1th and 2nd vacc 
  this.I0=0.82;     // efficiency 1-alpha^2 at second vacc time
                       // if R10=alpha*R00 (infection nonvacc->vacc)
                       //              R10=R10 (infection vacc->nonvacc)
                       //              R11=alpha^2*R00 (infection vacc->vacc)
  this.Iincrease=0.06; // further increase to peak after second vacc
  this.tauIncrease=25; // time scale of further increase

  this.I0boost=0.30    // assumed remaining efficicency at boosting time
  this.ImaxBoost=0.93  // assumed efficicency of booster
  this.tauIncrBoost=14; // time scale to max efficiency for boosters
  
  this.tauHalf=180;    // #days for reduced efficiency to 50% of I0
                       // !!! assuming double timescales
                       // for the boosters for now
  this.dtau=40;        // how fast (half-width #days) the reduct. takes place
  this.taumaxVacc=730;     // maximum memory of vaccinations or boosters
                       // (zero effect for longer times)
  this.IvaccTable=[];  // vaccination efficiency after index #days
  this.IboostTable=[]; // booster efficiency after index #days
  this.I2vaccTable=[];  // vaccination efficiency for Mutation
  this.I2boostTable=[]; // booster efficiency for Mutation
  this.rVaccHist=[];   // daily rate[it] of new first vaccs from data or sim
  this.rBoostHist=[];  // daily rate[it] of new boosters from data or sim
  this.pVaccmaxPop=0;  // pop-avg max vacc/boost rate (set in initialize)
  this.vaccmaxreached=false; // true if global pVacc >= this.pVaccmaxPop
                             // (for checks in projections,
                             // should not become true in data-driven state)



  // ##############################################################
  // old more global immunity w/o waning or boosters, only for mortality!!!
  // ##############################################################
  
  this.fAge=[];     // demographic profile of age groups
  this.ageGroup=0;   // will be overwritten in initialize
                    // [0-10,-20,-30,-40,-50,-60,-70,-80,-90, 90+]

  this.pVaccmaxAge=[0.70,0.80,0.85,0.90,0.92,0.95,0.95,0.95,0.95,0.94];//!!!
  //this.pVaccmaxAge=[1,1,1,1,1,1,1,1,1,1];
                     // 1-vacc deniers
                     // or med impossibilities in each age group

  this.pVaccTau=[]; // history[tau] of vacc percentage pVacc (first vacc.)
                     // global Var pVacc=pVaccTau[0] set in .update()
  this.pVaccTauAge=[]; // age-specific history[tau]

  this.immunityAge=[]; // immunity factor for endpoint death (!!! simplified)
                    // disaggregated into the age groups

  this.corrFactorIFR=1.11; // IFR(not immune pop average)/IFR(group60-70)
                           // ! just init; overridden
  this.corrFactorIFR0=1.11;
  this.iaRef=6;      // age index of reference age group 60-70
  this.multFactor10=3.2; //every 10 years older increases IFR by this factor

  // cannot use this.initialize here
}


//############################################################

Immunity.prototype.initialize=function(country){


  pVacc=0; // reset global variables also on display
  pVaccFull=0;
  pBoost=0; 
  this.rVaccHist[0]=0; // daily vacc rate at it=0;
  this.rBoostHist[0]=0; // daily vacc rate at it=0;
  this.I1vacc=0; // not really needed
  this.I2vacc=0; 
  this.I1infect=0; // needed
  this.I2infect=0; 
  
  // MT 2021-11: New detailled efficiency as f(time) and boosters
  // MT 2021-12: Not possible for infections because these depend on runs
  
  for(var tau=0; tau<this.taumaxVacc; tau++){
    this.IvaccTable[tau]= (tau<this.tau0)
      ? this.I0*tau/this.tau0
      : -this.Iincrease*Math.exp(-(tau-this.tau0)/this.tauIncrease)
      +(this.I0+this.Iincrease)*(1+Math.exp((0-this.tauHalf)/this.dtau))
      /(1+Math.exp((tau-this.tau0-this.tauHalf)/this.dtau));
    this.I2vaccTable[tau]
      =Math.max(0, 1-this.evadeMutFactor*(1-this.IvaccTable[tau]));
  }

  for(var tau=0; tau<this.taumaxVacc; tau++){
    var increasePart=this.I0boost
      + 0.5*(this.ImaxBoost-this.I0boost)
	* (Math.tanh(2*(tau-0.5*this.tauIncrBoost)/this.tauIncrBoost)+1);

    var decreasePart=this.ImaxBoost
      *((1+Math.exp((-this.tauHalf)/(this.dtau)))
	/(1+Math.exp((tau-2*this.tauHalf)/(2*this.dtau)))-1);
    
    this.IboostTable[tau]
      =increasePart+decreasePart;
    this.I2boostTable[tau]
      =Math.max(0, 1-this.evadeMutFactor*(1-this.IboostTable[tau]));
  }

  if(false){
    for(var tau=0; tau<300; tau++){
      console.log("Immunity initialize: tau=",tau,
		  " IvaccTable=",this.IvaccTable[tau].toFixed(4),
		  " I2vaccTable=",this.I2vaccTable[tau].toFixed(4),
		  " IboostTable=",this.IboostTable[tau].toFixed(4),
		  " I2boostTable=",this.I2boostTable[tau].toFixed(4));
    }
  }
  
  

  
  // before 2021-11: detailled age groups but no waning functions
  
  this.corrFactorIFR=1;
  var ageProfilePerc=ageProfileListPerc[country];
  for(var ia=0;ia<ageProfilePerc.length; ia++){
    this.pVaccTauAge[ia]=[];
    this.fAge[ia]=0.01*ageProfilePerc[ia];
  }

  this.pVaccmaxPop=0;
  for(var ia=0;ia<ageProfilePerc.length; ia++){
    this.pVaccmaxPop += this.fAge[ia]*this.pVaccmaxAge[ia];
  }
  
  for(var tau=0; tau<this.tau0; tau++){
    this.pVaccTau[tau]=0;
  }
  
  for(var ia=0;ia<ageProfilePerc.length; ia++){
    this.immunityAge[ia]=0;
    for(var tau=0; tau<this.tau0; tau++){
       this.pVaccTauAge[ia][tau]=0;
    }
  }
  this.updateAgeGroups(0,0); // to calculate this.corrFactorIFR for zero vacc

  this.corrFactorIFR0=this.corrFactorIFR;
  this.ageGroup=ageProfilePerc.length-1; // actual age group to be vacc

  if(true){console.log("\n\nImmunity.initialize: this.corrFactorIFR0=",
	      this.corrFactorIFR0, " this.pVaccmaxPop=",this.pVaccmaxPop,
	      " this.fAge=",this.fAge,
	     // " this.pVaccTauAge=",this.pVaccTauAge,
			"\n\n");}
}


/* MT 2021-12-15: central update
 @param rVacc:  daily relative rate of first vaccinations (assume second
                according to the vacc efficiency profile IvaccTable)
 @param rBoost: same for boosters
 @param dx:     daily number of new infected
 @param p:      actual fraction of new variant (set=0 if !simulateMutation)
 @param it:     time index (=0 at start time of simulation)
 @result:       updates combined population immunities I1 and I2
                to old and new variants due to vacc and infections
                (set p=0 if no mutations simulated)
*/

Immunity.prototype.update=function(rVacc,rBoost,dx,p,it){
  this.updateInfections(dx,p,it);
  this.updateVacc(rVacc,rBoost,it);
  this.I1=1-(1-this.I1infect)*(1-this.I1vacc);
  this.I2=1-(1-this.I2infect)*(1-this.I2vacc);
}


// MT 2021-12: Calculate immunity by past infections
// at the present stage past infections trivial,
// 100% same-type, 0% cross immunity
// updates this.I1vacc, this.I2vacc, this.I1infect, this.I2infect
// !!! future: define waning tables in initialize as in vaccin. immunity 
// !!! only used in simulation, not calibration!

// @param dx: daily number of new infected
// @param p:  actual fraction of new variant (set=0 if !simulateMutation)

Immunity.prototype.updateInfections=function(dx,p,it){
  this.I1infect=Math.min(this.I1infect+(1-p)*dx,0.9);
  this.I2infect=Math.min(this.I2infect+p*dx,0.9);
}




// MT 2021-11-15 Time dependent efficiency of vaccinations
// and (new!) boosters;
// rVacc, rBoost=daily increase in first vaccs and boosters
// from data or simulation
// output: sets this.I1vacc

Immunity.prototype.updateVacc=function(rVacc,rBoost,it){


  // update tables for rates of vaccs and boosters and pVaccFull for later use
  
  if(pVacc<this.pVaccmaxPop){
    this.rVaccHist[it]=Math.min(rVacc,this.pVaccmaxPop-pVacc);
    pVacc+=this.rVaccHist[it]; // glob var, also for display (find: "pVacc=")
  }
  else{
    this.rVaccHist[it]=0;
    console.log("Immunity.update: error: cannot vaccinate more than",
		" a fraction ",this.pVaccmaxPop," of people");
  }

  // "fully vaccinated"=14 days after second vacc
  // which is this.tau0 after the first (find: "pVaccFull=")
  pVaccFull+= this.rVaccHist[Math.max(it-this.tau0-14,0)]; 
  
  if(pBoost<=pVaccFull){ // maximum boosters in pop = max vaccinations
    this.rBoostHist[it]=Math.min(rBoost,pVaccFull-pBoost);
    pBoost+=this.rBoostHist[it]; // global var, also for display
  }
  else{
    this.rBoostHist[it]=0;
    pBoost=pVaccFull;
    console.log("Immunity.update: error: cannot boost more than",
		" already vaccinated people");
  }

 
  // do the update convolution
  // first (!) vaccinations are replaced by boosters.
  // So drop the pBoost oldest vacinations

  this.I1vacc=0;
  this.I2vacc=0;
  var pVaccPast=0;
  for(var its=Math.max(0,it-this.taumaxVacc+1); its<it; its++){
    pVaccPast+=this.rVaccHist[its];
    var includeVacc=(pVaccPast>pBoost);

    this.I1vacc
      +=((includeVacc) ? this.rVaccHist[its]*this.IvaccTable[it-its] : 0)
      + this.rBoostHist[its]*this.IboostTable[it-its];
    this.I2vacc
      +=((includeVacc) ? this.rVaccHist[its]*this.I2vaccTable[it-its] : 0)
      + this.rBoostHist[its]*this.I2boostTable[it-its];
  }

  
  // debug

  if(false){
  //if(it>=610){
    console.log("Immunity.updateVacc: it=",it,
		" rVacc=",rVacc.toFixed(5)," rBoost=",rBoost.toFixed(5),
		"\n pVacc=",pVacc.toFixed(4),
		" pVaccFull=",pVaccFull.toFixed(4),
		" pBoost=",pBoost.toFixed(4),
		" I1vacc=",this.I1vacc.toFixed(4),
		//" this.IvaccTable=",this.IvaccTable,
		//" this.rVaccHist=",this.rVaccHist,
	       "");
  }

}


    

  
// old: update vaccinations over age groups
// (not used in main Reff-dynamics, only when calculating IFR etc)
// vaccination brands modelled by this.I0)

Immunity.prototype.updateAgeGroups=function(rVacc,it){
  if(it>0){ // no vaccinations for it<=0

    // shift history by 1 day
    
    for(var tau=this.tau0-1; tau>0; tau--){ 
      this.pVaccTau[tau]=this.pVaccTau[tau-1];
      for(var ia=0;ia<this.fAge.length; ia++){
	this.pVaccTauAge[ia][tau]=this.pVaccTauAge[ia][tau-1];
      }
    }
     
    // add new daily first vaccination percentage globally
    
    this.pVaccTau[0]=Math.min(this.pVaccTau[1]+rVacc,this.pVaccmaxPop);


    // distribute new vaccinations top-down to the age groups

    var j=this.ageGroup;
    var p_remaining=this.fAge[j]*(this.pVaccmaxAge[j]-this.pVaccTauAge[j][1]);
    if(p_remaining>=rVacc){
      this.pVaccTauAge[j][0]=this.pVaccTauAge[j][1]+rVacc/this.fAge[j];
    }
    else{
      this.pVaccTauAge[j][0]=this.pVaccmaxAge[j];

      // check if max vaccination fraction is reached
      // following should be automatically true once global variable pVacc
      // (updated in this.updateVacc(.) reaches this.pVaccmaxPop
      
      if(this.ageGroup==0){
	this.vaccmaxreached=true; 
	//console.log("Warning: cannot vaccinate more than ",
	//	    (100*this.pVaccmaxPop).toFixed(1),"% of population" );
      }
      else{
        this.pVaccTauAge[j-1][0]=(rVacc-p_remaining)/this.fAge[j-1];
	this.ageGroup--;
      }
    }
      
    

    for(var ia=0;ia<this.fAge.length; ia++){
        this.immunityAge[ia] +=this.I0/(this.tau0-1) 
	  *(this.pVaccTauAge[ia][0]-this.pVaccTauAge[ia][this.tau0-1]);
    }

  } // if it>0

  else{ // !! it=0, initialize or re-initialize at start of interactive sim

    // ! otherwise bug if true during initializeData
    // => max number already reached
    this.vaccmaxreached=false;
    
    for(var ia=0; ia<this.fAge.length; ia++){
      this.immunityAge[ia]=0;
    }
  }

  
  // calculate this.corrFactorIFR=IFR(population)/IFR(age group 50-60)

  var num=0;
  var denom=0;
  for(var ia=0; ia<this.fAge.length; ia++){
    var factor=Math.pow(this.multFactor10, ia-this.iaRef);
    var fracSuscept=this.fAge[ia]*(1-this.immunityAge[ia]);
    num +=fracSuscept*factor;
    denom+=fracSuscept; 
    if(false){
      //if(rVacc>0){
	console.log(" ia=",ia," factor=",factor," fracSuscept=",fracSuscept,
		    " num=",num," denom=",denom);
      }
  }
    
  this.corrFactorIFR=num/denom;


    
    // debug

  if(false){
  //if(rVacc>0){
      console.log("Immunity.updateAgeGroups: this.tau0=",this.tau0," it=",it,
		  "\n pVacc=this.pVaccTau[0]=",this.pVaccTau[0],
		  " this.pVaccTau[this.tau0-1]=",this.pVaccTau[this.tau0-1],
		  " this.I1vacc=",this.I1vacc);
      var sum=0; 
      for(var ia=0; ia<this.fAge.length; ia++){
	sum+=this.fAge[ia]*this.immunityAge[ia];
	console.log("age group ",ia,": fAge=",this.fAge[ia],
		    " this.immunityAge[ia]=",this.immunityAge[ia],
		    " sum=",sum);
      }
      console.log("num=",num," denom=",denom,
		  " this.corrFactorIFR=",this.corrFactorIFR);

  }
}



// MT 2021-11-15 Calculate data-driven global vacc immunity
// as a fixed array for use in calibration
// input: arrays of first vaccination and booster rates in "data" format
// output: IvaccArray[it]

Immunity.prototype.calcIvaccArray=function(data_rVacc, data_rBoost){

  var IvaccArray=[];
  for(var it=0; it<itPresent; it++){
    var i=it+data_idataStart;
    if(!( typeof data_rVacc[i] === "undefined")){
      rVaccData=data_rVacc[i]; // otherwise unchhanged
    }
    if(!( typeof data_rBoost[i] === "undefined")){
      rBoostData=data_rBoost[i]; // otherwise unchhanged
    }
    this.updateVacc(rVaccData, rBoostData,it);
    IvaccArray[it]=this.I1vacc;

    if(false){
      console.log(
	"Immunity.calcIvaccArray: ",
	"\n it=",it," rVaccData=",rVaccData.toFixed(5),
	" rBoostData=",rBoostData.toFixed(5),
	" IvaccArray=",IvaccArray[it],
      "");
    }
    
  }
  return IvaccArray;
}








function CoronaSim(){
  //console.log("CoronaSim created");

  // arrays (scalar state variables such as this.z defied in init)
  this.xtau=[]; // age struture f(tau|it) of frac infected at given it
  this.xohne=[]; // age structure =f(tau) without deleting by recover,death 
                 // (!!needed for correct recovery rate and balance x,y,z!)
  this.dx_it=[]; // fraction new infected as f(timestep it),
  this.xnewShiftedTauDie=[]; // fraction new infected as f(timestep it),
  this.snapAvailable=false; // initially, no snapshot of the state exists
  this.Reff=1.11;    // need some start ecause otherwise bug at drawing
                     // undeterministic too early calling of drawsim 
}


//!! need to chose appropriate fracDie before!
// nxtStart target number of cum cases at iStart=^ local variable idataStart

CoronaSim.prototype.init=function(itStart,logging){

  if( typeof logging === "undefined"){logging=false;}

  var idataStart=data_idataStart+itStart;
  var nxtStart=data_cumCases[idataStart]; 



  // start warmup at a very early phase
  // !! start with n0*this.xAct>=1, otherwise infection dead
  // feature, not bug

  //##############################################################
  // !! it BEFORE warmup. Becaue this.xt is cumulative 
  // but this.xAct and this.xtau[] is not, need ALWAYS to start
  // at the very beginning also for large itStart
  // unless following is saved at it=itStart:

  // (1) this.xtau[] (this.xAct=sum(this.xtau[])
  // (2) this.y, this.z  (in contrast to xtau[] and xAct cumulative, 
  //                      => need to save as well 
  //                      although not contained in dynamics)
  // (2a) this.icu all present icu patient fraction, not just new admissions
  // (3) this.xyz (cumulated this.xtau[0] + this.y + this.z, IN dynamics
  //               canNOT be derived from the other quantities
  // (4) this.xt, this.yt (outside dynamics 
  //                       but needed for calibr, at least xt)
  //##############################################################


  //var it0=Math.max(-21, itStart-28); // it BEFORE warmup
  var it0=-21; // it BEFORE warmup //!! Must be <=-20 for some f... reason

  // xAct: sum of "actually infected" this.xtau[tau] (neither rec. nor dead)
  // xyz: cumulative sum of infected (incl recovered, dead)
  this.xAct=10/n0; // must be >1, otherwise eliminated
  this.xyz =this.xAct;
  this.xt  =0; // fraction of positively tested persons/n0 as f(t)

  this.y=0;  // cumulative fraction recovered real as a function of time
  this.z=0;  // cmuulative fraction dead (real=data)
  this.icu=0; // fraction of population in covid-19 icu stations as f(t)

  // init infection-age profile this.xtau[tau] with exponential
  // initial exponential rate r0 per day  (don't confuse r0 with R0)

  var tauR=0.5*(tauRstart+tauRend)// middle period for one repro cycle
  var r0=Math.log(R0fun_time(R0time,it0))/tauR;  // init reprod rate by stable R0fun_*
  var denom=0; 

  for(var tau=0; tau<taumax; tau++){
    denom+=Math.exp(-r0*tau);
  }
  for(var tau=0; tau<taumax; tau++){ // in init
    this.xtau[tau]=this.xAct*Math.exp(-r0*tau)/denom;
    this.xohne[tau]=this.xtau[tau];
    if(false){console.log("init: it0=",it0," R0=",R0fun_time(R0time,it0),
			    " r0=",r0," tau=",tau,
			    " this.xtau[tau]=",this.xtau[tau]);}
  }

  // data-driven warmup

  // loggingDebug and logging global variables
  // logging can be set controlled at "here logging can be true"
  loggingDebug=false; 
  //loggingDebug=logging; 

  if(loggingDebug){
    console.log("\n\n\ncorona.init warmup before loop:  it0=",it0,
		" itStart=",itStart,
		"\n R0time=",R0time);
  }

  for(var its=it0; its<itStart; its++){ 
    var Rt=R0fun_time(R0time,its); // !! uses loggingDebug as global variable

    if(loggingDebug){
      //if(logging&&false){
      
      console.log("\ncorona.init warmup before update: its=",its,
			    " R=",Rt.toFixed(2),
			    " pTest=",pTest.toPrecision(3),
			    " ndx=",(n0*this.xtau[0]).toPrecision(3),
			    " ndxt=",(n0*this.dxt).toPrecision(3),
			    " ndxtFalse=",(n0*this.dxtFalse).toPrecision(3),
		  "");
    }
    this.updateOneDay(Rt,its,logging); // in CoronaSim, data-driven warmup
  }


  if(loggingDebug){
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
  this.y        *= scaleDownFact; // y,z, may be >0, icu not needed (intens)
  this.z        *= scaleDownFact; // due to this.updateOneDay
  this.dxtFalse = 0; //!!
  //this.dxtFalse=(data_dn[data_idataStart]/n0 
//		 - pTest*this.xohne[tauTest])*betaTest;//!!

  for(var tau=0; tau<taumax; tau++){
    this.xtau[tau]     *= scaleDownFact;
    this.xohne[tau] *= scaleDownFact;
  }

  // reset it for start of proper simulation


  if(loggingDebug){
    console.log("CoronaSim.init after warmup: itStart=",itStart,
		"\n  n0*this.xtau[0]=",Math.round(n0*this.xtau[0]),
		"\n  n0*this.dxt=",Math.round(n0*this.dxt),
		"\n  n0*this.dxtFalse=",Math.round(n0*this.dxtFalse),
		"\n  n0*this.z=",Math.round(n0*this.z),
		"\n\n\n");
  }
  loggingDebug=false; 

 }//init




//#################################################################
  // save/set complete state (take snapshot of all the variables needed
  // to resume the simulation at a given timestep later on:

  // (1)  this.xtau[] (this.xAct=sum(this.xtau[]),
  // (2)  this.y, this.z  (in contrast to xtau[] and xAct cumulative, 
  //                      => need to save as well 
  //                      although not contained in dynamics)
  //      (intensive fraction this.icu not needed since intensiv q)
  // (3)  this.xyz (cumulated this.xtau[0] IN dynamics (herd immunity contrib)
  //               canNOT be derived from the other quantities
  // (4)  this.xt outside dynamics  but still needed for calibr
  // called by SSEfunc which is also in control of the time itsnap for it
//#################################################################

CoronaSim.prototype.takeSnapshot=function(it){
  this.snapAvailable=true;
  this.snapshot={
    it:   it,
    xtau: [],
    xohne:[],
    xAct: this.xAct,
    y:    this.y,
    z:    this.z,
    xyz:  this.xyz,
    xt:   this.xt
  }

  for(var tau=0; tau<taumax; tau++){ // copy by value
    this.snapshot.xtau[tau]=this.xtau[tau];
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
      "\n  this.snapshot.xtau[tauDie]=",this.snapshot.xtau[tauDie].toPrecision(3),
      "\n  this.snapshot.xohne[tauDie]=",this.snapshot.xohne[tauDie].toPrecision(3),
      "");
  }

}



CoronaSim.prototype.setStateFromSnapshot=function(){
  this.snapshot.it;
  for(var tau=0; tau<taumax; tau++){
    this.xtau[tau]=this.snapshot.xtau[tau];
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
      "\n  this.xtau[tauDie]=",this.xtau[tauDie].toPrecision(3),
      "\n  this.xohne[tauDie]=",this.xohne[tauDie].toPrecision(3),
      "");

    if(false) console.log("corona.setStateFromSnapshot: this.x=",this.x);

  }
}





//#################################################################
// central update step  ("o" means convolution)
// xtau[taumax]=0
// xtau[tau+1]=xtau[tau]
// xtau[0]=R*f_R o x * (1-(x+y+z))
// if(tauRecover>tauDie){
//   dz/dt=-dx[tauDie]/dt=fracDie*xtau[tauDie]
//   dy/dt=-dx[tauRecover]/dt=xtau[tauRecover] -> xtau[tauRecover]=0
// } otherwise, the other way round

//#################################################################

// control logging at "here logging can be true"
// and at "loggingDebug and logging global variables"
// filter because of calibr!

CoronaSim.prototype.updateOneDay=function(R0,it,logging){ 

  if( typeof logging === "undefined"){logging=false;}

  if(logging&&(it<-19)){
    console.log(
      "\n\nEnter CoronaSim.updateOneDay: it=",it," R0=",R0.toPrecision(2),
      " this.xAct=",this.xAct.toPrecision(2),
      " this.xyz=",this.xyz.toPrecision(2),
      " this.y=",this.y.toPrecision(2),
      " this.z=",this.z.toPrecision(2),
      "\n fracDie=IFR65=",fracDie.toPrecision(2),
      " nxt=n0*this.xt=",Math.round(n0*this.xt),
      " nzSim=n0*this.z=",Math.round(n0*this.z),
      "");
  }


  // ###############################################
  // updateOneDay: Do the true actual dynamics
  // ###############################################


  // ###############################################
  // true dynamics (0.1): 
  // calculate Reff inside calibration (no if condition, overriden if appl)
  // ###############################################
 
  var IvaccCalib=(it>=0) ? IvaccArray[it] : 0; 

  var i=Math.max(0, Math.min(
    data_stringencyIndex.length-1, it+data_idataStart));
  var stringencyCalib=data_stringencyIndex[i];

  this.Reff=R0 * (1-IvaccCalib) * (1-this.xyz) 
    * stringencyFactor(stringencyCalib) * calc_seasonFactor(it);


  

  // ###############################################
  // CoronaSim.updateOneDay: true dynamics (0.2): 
  // calculate Reff outside calibration incl mutation dynamics
  // ###############################################
 
  if( !inCalibration && (it>=0)){

    
    // NOTICE: whether slider_R0_moved is determined in higher level

    if(!slider_rVacc_moved){ // if slider moved, rVacc directly from slider
      var i=it+data_idataStart;
      if(i<0){rVacc=0;}
      rVacc=(i<data_rVacc.length-7) // last vacc data unreliable
	? data_rVacc[i] : data_rVacc[data_rVacc.length-7];
    }
    
    if(!slider_rBoost_moved){ // if slider moved, rBoost directly from slider
      var i=it+data_idataStart;
      if(i<0){rBoost=0;}
      rBoost=(i<data_rBoost.length-7) // last vacc data unreliable
	? data_rBoost[i] : data_rBoost[data_rBoost.length-7];
    }

    
    // CoronaSim.updateOneDay (0.2) (calc Reff outside calibration:)
    // update immunities and mutations
    // !!!! check itStartMut in validation
    
    var pMut=0; // default if simulateMutation=false or it<itStartMut;
    var R10=R0;
    var R20=R0;
    
    
    if(it==0){immunity.initialize(country);} // in doSimulationStep, !calibr
    if(simulateMutation){

      // !!! initialisation just to have access to mutationDynamics.p_it[it]
      // for graphics etc
      // NaN at R20 not relevant since later initialized again
      if(it==0){
	mutationDynamics.initialize(itStartMut,pMutStart,rMutStart,
				    immunity.I1, immunity.I2, R0);
	console.log("mutationDynamics.p_it[itPresent-20]=",
		    mutationDynamics.p_it[itPresent-20]);
      }
      
      if(it==itStartMut){ // R0=Rcalib at start of new variant
	console.log("mutationDynamics.initialize: pMutStart=",pMutStart);
        mutationDynamics.initialize(itStartMut,pMutStart,rMutStart,
				    immunity.I1, immunity.I2, R0);
	pMut=pMutStart;
	R10=mutationDynamics.R10;
	R20=mutationDynamics.R20;
	strFactStartMut=stringencyFactor(stringency);
	
      }
      
      if(it>itStartMut){
	mutationDynamics.update(immunity.I1, immunity.I2,it);
	pMut=mutationDynamics.p_it[it];
	R10=mutationDynamics.R10; // needed because initialized to R0
	R20=mutationDynamics.R20;
      }
    }
    
    var dx=(it==0) ? this.xyz : this.xtau[0]; // it=0: use accumulated incr.
    immunity.update(rVacc,rBoost,dx,pMut,it);

    var I1=immunity.I1;
    var I2=immunity.I2;

    
    // CoronaSim.updateOneDay (0.2): update age groups
    // not part of core simulation but of
    // slaved IFR calculations

    immunity.updateAgeGroups(rVacc,it); // outside calibr, needed for IFR
    
    corrIFRarr[it]=immunity.corrFactorIFR;
    corrIFR=(it>=tauDie)
      ? corrIFRarr[it-tauDie] : immunity.corrFactorIFR0; 



    // measures by stringency in [0,100] outside of calibration
    
    if(!slider_stringency_moved){
      var i=Math.max(0, Math.min(
        data_stringencyIndex.length-1, it+data_idataStart));
      stringency=data_stringencyIndex[i]; // otherwise glob var set by sliders
    }

    //!! MT 2021-12-30: Omicron shorter generation time
    // by factor_generationtime2 (e.g., 0.8)
    var strFact1=stringencyFactor(stringency);
    var strFact2=strFactStartMut
	*Math.pow(strFact1/strFactStartMut,1./factor_generationtime2);

    //!! still not implemented: the same for seasonFactor:
    // seasonFactor1=..., ...
    var Reff1=R10*(1-I1)*strFact1*calc_seasonFactor(it);
    var Reff2=R20*(1-I2)*strFact2*calc_seasonFactor(it);

    //##########  final Reff outside calibration ##################
    this.Reff=(simulateMutation) ? (1-pMut)*Reff1+pMut*Reff2 : R0 * (1-I1);
    //#############################################################
  
   
    //########################################################
    // test
    //########################################################


    //console.log("stringency=",stringency," rVacc=",rVacc);
    if(false){
    //if((it<10)||(it>=itPresent-10)){
    //if(it>=itPresent-10){
      console.log("update outside calib: it=",it,
		  " rVacc=",rVacc.toFixed(4),
		  " rBoost=",rBoost.toFixed(4),
		  " pVacc=",pVacc.toFixed(4),
		  " pVaccFull=",pVaccFull.toFixed(4),
		  " pBoost=",pBoost.toFixed(4),
		  "\n    I1vacc=",immunity.I1vacc.toFixed(4),
		  " I2vacc=",immunity.I2vacc.toFixed(4),
		  " this.xyz=",this.xyz.toFixed(4),
		  " I1infect=",immunity.I1infect.toFixed(4),
		  " I2infect=",immunity.I2infect.toFixed(4),
		  " n0*dx=",(n0*this.xtau[0]).toFixed(0),
		  " n0*dxt=",(n0*this.dxt).toFixed(0),
		  "\n    pMut=",pMut.toFixed(3),
		  " R0=",R0.toFixed(3),
		  " R10=",R10.toFixed(3),
		  " R20=",R20.toFixed(3),
		  " I1=",I1.toFixed(4),
		  " I2=",I2.toFixed(4),
		  " strFactStartMut=",strFactStartMut.toFixed(2),
		  " strFact1=",strFact1.toFixed(2),
		  " strFact2=",strFact2.toFixed(2),
		  "\n    Reff1=",Reff1.toFixed(2),
		  " Reff2=",Reff2.toFixed(2),
		  " pMut=",pMut.toFixed(2),
		  " this.Reff=",this.Reff,
		  "");
    }



    
  }// if(!inCalibration && (it>=0))



  

  // source term from external trips from returners of foreign regions

  var x0source=casesInflow/100000;

  
  // ###############################################
  // true dynamics (1): shift age profile of already infected by one
  // ###############################################


  for(var tau=taumax-1; tau>0; tau--){
    this.xtau[tau]=this.xtau[tau-1];
    this.xohne[tau]=this.xohne[tau-1];
    if(false){ //!! test very start
    //if(logging&&(it<-19)){
      console.log("tau=",tau," this.xtau[tau]=",this.xtau[tau],
		  " this.xohne[tau]=",this.xohne[tau]);
    }
  }


  // ###############################################
  // true dynamics (2): infect new people
  // ###############################################

  this.xtau[0]=x0source;
  var f_R=1./(tauRend-tauRstart+1);
  if(logging&&(it<-19)){console.log("1. this.xtau[0]=",this.xtau[0]," this.Reff=",this.Reff );}

  if(n0*this.xAct>=1){ // !! infection finally dead if xAct<1
    for(var tau=tauRstart; tau<=tauRend; tau++){
      this.xtau[0]+=this.Reff*f_R*this.xtau[tau];
    }
  }

  this.xohne[0]=this.xtau[0];
  if(logging&&(it<-19)){console.log("2. this.xtau[0]=",this.xtau[0]);}


  // ###############################################
  // true dynamics (3): let people die or recover
  // smooth  over tauAvg days
  // ###############################################

  // do not need Step 3 recovered/dead for R0 calibration
  // since infection dynamics only depends on this.xyz which is
  // always updated "+=this.xtau[0]
  

  if(!inCalibration){ 
    var dtau=Math.floor(tauAvg/2); // tauAvg is global uneven var, e.g.=5
    var f_D=1./tauAvg;

    this.dz=0;
    var dysum=0;

    for(var tau=tauDie-dtau; tau<=tauDie+dtau; tau++){
      var dztau=fracDie*corrIFR*f_D*this.xohne[tau]; //!! here xohne crucial
      this.dz+=dztau;
      this.xtau[tau] -=dztau; // xohne remains unsubtracted
    }


    var f_Rec=1./tauAvg;
    for(var tau=tauRecover-dtau; tau<=tauRecover+dtau; tau++){
      var dy=(1-fracDie)*f_Rec*this.xohne[tau]; //!! here xohne crucial
      dysum+=dy;
      this.xtau[tau] -=dy; // xohne remains unsubtracted
    }
    this.z   += this.dz;
    this.y   += dysum;

    // fraction of population in icu due to Covid-19
    // age structure summarily considered by corrIFR
    // TODO: take care of finite vacc effects and also tauICU<tauDie !!!
    // this.icu is intensive quantity=> can reset=0 at beginning

    this.icu=0;
    dtau=Math.floor(tauICUstay/2);
    var f_icu=1./tauICUstay;

    // do not use age structure corrfact corrIFR;
    // less dependent on vacc: cal!
    
    for(var tau=tauICU-dtau; tau<=tauICU+dtau; tau++){
      //this.icu+=fracICU*corrIFR*f_icu*this.xohne[tau];
      this.icu+=fracICU*1*f_icu*this.xohne[tau];
    }
    if(false){
      console.log("it=",it," this.icu=",this.icu);
    }
    
  }

  // ###############################################
  // (4) sum up the profile of infected people
  // xAct: relative sum of "actually infected" (neither recoverd nor dead)
  // xyz: relative cumulative sum of infected (incl recovered, dead)
  // ###############################################

  this.xyz+= this.xtau[0]; // cumulative fraction of newly infected

  this.xAct=0;  
  for(var tau=0; tau<taumax; tau++){
    this.xAct     += this.xtau[tau];
  }

  // MT 2020-12-23 fraction of newly infected at time it 
  // for later use direct calibr IFR
  // !! needed also in calibration, not clear why;
  // need addtl run for preparing data for IFR => just calc it always
 
  if((it>=0)&&(it<itPresent)){
    this.dx_it[it]=this.xtau[0];
  }


  //#####################################################
  // (5) Test people (in CoronaSim.updateOneDay)
  //#####################################################



  // (5.1) simulated positive tests
  // test time ~ U(tauTest-tauAvg/2,tauTest+tauAvg/2) over infection age

  // sim from it to it+1, hence "+1"
  var idata=Math.max(it+data_idataStart+1, 0); 

  
  // possibly override slider-controlled pTest with the square-root model;
  // in forecast mode constant trend  with seasonal pattern
  if(includeInfluenceTestNumber){ 
    if(idata<data_pTestModel.length){pTest=data_pTestModel[idata];} 
    else{
      //!! quick hack to avoid sudden drop cases 2021-02-22
      var factor=1.0
      pTest=factor*pTest_weeklyPattern[(idata-data_pTestModel.length)%7];
    }
    if(false){
    //if((!inCalibration)&&(it-itPresent>-25)){
      console.log("CoronaSim.updateOneDay: it-itPresent=",it-itPresent,
		  " pTest=",pTest);
    }
  }
  else{
    pTest=pTestInit;
  }


  
  
  //if(!inCalibration){console.log("pTest=",pTest);}

  var dtau=Math.min(Math.floor(tauAvg/2),Math.round(tauTest));
  var f_T=1./(2*dtau+1);
  this.dxt=0;
  for(var tau=tauTest-dtau; tau<=tauTest+dtau; tau++){
    this.dxt +=pTest*f_T*this.xohne[tau]*(1-alphaTest);
  }

  
  
  // (5.2) add beta error outside tau loop
  // (the test gets dn-pTest*n0*this.xohne
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
      var dn=n0*pTest*pTest/7.; // comes from sqrt model; obsolete!!!!
      var p=7*this.dxt/(n0*pTest); 
      this.dxtFalse=dn/n0*(1-p)*betaTest;
      this.dxtFalse=Math.min(this.dxtFalse, 0.9*this.dxt); 
    }

    if(idata==data_dn.length-1){// save relative value of false positives
      if(this.dxt==0){this.falseTrueRatio=0.1;} //!! standard value for future
      else{
	this.falseTrueRatio=Math.min(this.dxtFalse/this.dxt,0.2);//!! ad hoc
      }
    }
 
    //this.dxt still only true pos.; define this.dxtFalse before this!

    if(idata>=data_dn.length){
      this.dxtFalse=this.falseTrueRatio*this.dxt; 
    }
    this.dxt+=this.dxtFalse;

  }


  //!!!! (MT feb2022) override this.dxt if positive rate would be beyond 50%
  // (need 50% for "Freitesten")
  if(useTestnumberRestriction&&(it>=itPresent)){
    var rExceed=0.2; // smooth exceeding by a maximum of 100*rExceed percent
    //this.dxt=Math.min(this.dxt, 0.5*data_dnSmoothMax/n0);
    this.dxt=minSmooth(this.dxt, 0.5*data_dnSmoothMax/n0, rExceed);
  }
  this.xt += this.dxt;



  //##########################################################
  // !! HERE calibration debug output
  // (filter needed because called in calibration)
  //##########################################################

  //if(false){
  //if(!inCalibration){
  if((!inCalibration)&&(it>itPresent-50)){

    // debug Reff calculation
    if(false){
      console.log(" \nCoronaSim.updateOneDay: it-itPresent=",it-itPresent,
		" R0=",R0.toFixed(2),
		" (1-this.xyz)=",(1-this.xyz).toFixed(2),
		" seasonFac=",calc_seasonFactor(it).toFixed(2),
		" stringFact=",
		stringencyFactor(stringency).toFixed(2),
		" this.Reff=", this.Reff.toFixed(2));
    }

   // debug simulated (real and measured) infection numbers
    if(true){ // filter needed because called in calibration
      console.log(
	"\nend CoronaSim.updateOneDay: it=",it,
	//" R0=",R0.toPrecision(2),
      " this.xAct=",this.xAct.toPrecision(2),
      //" this.xyz=",this.xyz.toPrecision(2),
      //" this.y=",this.y.toPrecision(2),
      //" this.z=",this.z.toPrecision(2),
      //"\n fracDie=IFR65=",fracDie.toPrecision(2),
      //" corrIFR=",corrIFR,
      " nxt=n0*this.xt=",Math.round(n0*this.xt),
      " dnxt=n0*this.dxt=",Math.round(n0*this.dxt),
      //" nzSim=n0*this.z=",Math.round(n0*this.z),
	"");
    }
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


// kernel must have odd #points and normalized to sum=1
// although negative indices allowed, unstable: 
// length and initializer expect all indices starting at 0

function smooth(arr, kernel, debug){
  if(kernel.length%2==0){
    console.log("smooth: error: kernel.length=",kernel.length,
		" provided kernel must have an uneven number of points");
    return arr;
  }
  var debugSmooth=(typeof debug === "undefined") ? false : debug;
  var half=Math.round((kernel.length-1)/2);
  var smooth=[]; 
  for(var i=0; i<arr.length; i++){smooth[i]=0;}

  // smoothing in the central part where data at i-half...i+half
  
  for(var i=half; i<arr.length-half; i++){
    for(var di=-half; di<=half; di++){
      smooth[i]+=kernel[half+di]*arr[i+di];
    }
  }

  // lower and upper boundaries: symmetrically reduce kernel

  for(var i=0; i<half; i++){
    var kernelRed=[]; var sum=0;
    for(var j=0; j<2*i+1; j++){
      kernelRed[j]=kernel[half-i+j];
      sum+=kernelRed[j];
    }
    for(var j=0; j<2*i+1; j++){
      kernelRed[j]/=sum;
    }

    // actually smooth lower and upper boundary
   
    for(var di=-i; di<=i; di++){
      smooth[i]+=kernelRed[i+di]*arr[i+di];
      smooth[arr.length-i-1]+=kernelRed[i+di]*arr[arr.length-i-1+di];
    }
  }

  // !!! opt final touches: optionally consolidate 5 last data points
  // conserving
  // the trend sxy/sx^2|_last points (alternatively 3 points below or none)

  if(false){
    if((kernel.length>=5)&&(arr.length>=5)){
      var avg=(smooth[arr.length-1]+smooth[arr.length-2]+smooth[arr.length-3]
	       +smooth[arr.length-4]+smooth[arr.length-4])/5.;
      // trend=b=sxy/sx2=E((x-xbar)(y-ybar))/sx2=E((x-xbar)y)/sx2, sx2=10
      var trendLast=(2*smooth[arr.length-1]+smooth[arr.length-2]
		     -smooth[arr.length-4]-2*smooth[arr.length-5])/10.;
      for(var i=arr.length-5; i<arr.length; i++){
        smooth[i]=avg+trendLast*(i-(arr.length-3));
      }
    }
  }

  // !!! opt alt final touches: optionally consolidate 3 last data points
  // conserving
  // the trend sxy/sx^2|_last points (alt 5 points or none)

  if(true){
    if((kernel.length>=2)&&(arr.length>=2)){
      smooth[arr.length-1]=smooth[arr.length-2];
    }
  }

  // !!! alt final touches: last point is previous to last
  
  if(debugSmooth){
    console.log("debug smoothing:");
    for(var i=arr.length-21; i<arr.length; i++){
      console.log("  i=",i," arr[i]=",arr[i],
		  "kernel.length=",kernel.length," smooth[i]=",smooth[i]);
    }
  }

  return smooth;
}




//#################################################################
// Drawing class (graphics)
//#################################################################

function DrawSim(){

  //console.log("DrawSim created");

  // windowG={0=cum,1=log,2=casesReal,3=tests,4=rates,
  // 5=casesDaily,6=incid,7=causeEffect}

  this.magnFactorDeaths=100; // relevant for mirrored graphics
  
  this.unitPers=1000;  // persons counted in multiples of unitPers

  this.yminType=[0,1,0,0,0,0,0,0];  
  this.ymaxType=[1,6,2,2,2,2,1,1.5]; 

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
  colCasesBars="rgb(255,100,0)";  // main plots
  colCasesSim="rgb(255,150,0)";
  colCasesValid="rgb(255,200,100)";
  colFalsePos="rgb(0,220,0)";
  colDead="rgba(0,0,0,0.7)";  
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
  colStringency="rgb(200,0,200)";
  colStringencyValid="rgb(255,100,255)";
  colCmp="rgba(255,50,0,0.3)";
 // colVacc="rgba(50,255,50,0.2)";
 // colVaccValid="rgba(100,255,100,0.3)";
 // colBoost="rgba(0,150,150,0.7)";
 // colBoostValid="rgba(0,255,255,0.5)";
  colVacc="rgba(0,200,0)";
  colVaccValid="rgb(100,255,100)";
  colBoost="rgb(0,200,200)";
  colBoostValid="rgb(100,255,255)";
  colR="rgb(255,0,0)";
  colR0="rgb(180,0,0)";
  colRValid="rgb(255,150,150)";
  colCasesLog="rgba(255,120,0,0.8)";
  colCasesLogValid="rgba(255,150,30,0.3)";
  colICU="rgb(120,40,0)";
  colICUsim="rgb(160,80,0)";



  // central container for the graphics data
  // !! max index 53; also update all instances of simPrevious (2021-11-21)

  this.dataG=[];
  this.xtPast=0; // needed to derive yt from balance since no longer calc.


  // window 0 "Kumulierte Faelle" (sim+data cumulated)


  // cumulate data: data key not displayed
  this.dataG[0]={key: "Insgesamt positiv Getestete (Daten und Sim, in 1000)",
		 data: [],
		 type: 3, // 0=data dir (posCases),
                          // 1=solid deriv from data (CFR), 
                          // 2=more speculative derivation (IFR)
                          // 3=simulation, 4=speculative simulation
		 plottype: "lines",  // in "lines", "points", "bars"
		 ytrafo: [0.001, false,false],// [scalefact, half, mirrored]
		 color:colCasesCumSim
		}

  this.dataG[34]={key: "Insgesamt positiv Getestete (letzte Sim, in 1000)",
                                    //Insgesamt positiv Getestete (in 1000)"
		 data: simPrevious[34], // simPrevious[][] defined in validate()
		 type: 3, // 0=data dir (posCases),
                          // 1=solid deriv from data (CFR), 
                          // 2=more speculative derivation (IFR)
                          // 3=simulation, 4=speculative simulation
		 plottype: "lines",  // in "lines", "points", "bars"
		 ytrafo: [0.001, false,false],// [scalefact, half, mirrored]
		 color:colCasesCumValid
		}

  // cumulate data: data key not displayed
  this.dataG[1]={key: "Insg. Genesene unter den Getesteten (Daten und Sim, in 1000)",
		 data:[],
		 type: 3, plottype: "lines", 
		 ytrafo: [0.001, false,false],
		 color:colCasesRecovCumSim};

  // cumulate data: data key not displayed
  this.dataG[2]={key: "Insg. Gestorbene (Daten und Sim, in 10)", data: [],
		 type: 3, plottype: "lines",  
		 ytrafo: [0.1, false,false],
		 color:colDead};
  
  this.dataG[35]={key: "Insg. Gestorbene (letzte Sim, in 10)",
                                   //Insgesamt Gestorbene (in 100)", 
		  data: simPrevious[35], // simPrevious[][] defined in validate()
		  type: 3, plottype: "lines",  
		  ytrafo: [0.1, false,false],
		  color:colDeadValid};

  this.dataG[4]={key: "Insgesamt positiv Getestete (in 1000)",data: [],
		 type: 0, plottype: "points",  
		 ytrafo: [0.001, false,false], color:colCasesCum};

  // cumulate data: data key not displayed; "genesene" no longer dispayed
  this.dataG[5]={key: "Insg. Genesene unter den Getesteten (Daten, in 1000)",
		 data:[],
		 type: 0, plottype: "points",  
		 ytrafo: [0.001, false,false], color:colCasesRecovCum};

  this.dataG[6]={key: "Insgesamt Gestorbene (in 10)", data: [],
		 type: 0, plottype: "points",  
		 ytrafo: [0.1, false,false], color:colDead};

 // this.dataG[7]={key: "#Tote ges/#positiv getestet ges", data: [],
//		 type: 0, plottype: "points", 
//		  ytrafo: [1, false,false], color:colPosrateCum};



  
  // window 1 "Simulationen (log)" (sim+data log)


  this.dataG[8]={key: "Aktuell real infizierte Personen", data: [],
		 type: 4, plottype: "lines",  
		 ytrafo: [1, false,false],
		 color:colInfectedReal};

  this.dataG[9]={key: "Insgesamt positiv Getestete", data: [],
		 type: 3, plottype: "lines",  
		 ytrafo: [1, false,false],
		 color:colCasesCumSim};

  this.dataG[12]={key: "Insgesamt Gestorbene", data: [],
		  type: 3, plottype: "lines",  
		  ytrafo: [1, false,false],
		  color:colDead};

  this.dataG[13]={key: "Insgesamt positiv Getestete", data: [],
		  type: 0, plottype: "points",  
		  ytrafo: [1, false,false],
		  color:colCasesCum};

  // no longer displayed
  this.dataG[14]={key: "Insgesamt Genesene unter den Getesteten (Daten)", data: [],
		  type: 0, plottype: "points",  
		  ytrafo: [1, false,false], color: colCasesRecovCum};

  this.dataG[15]={key: "Insgesamt Gestorbene", data: [],
		  type: 0, plottype: "points",  
		  ytrafo: [1, false,false], color:colDead};

  this.dataG[25]={key: "Simulierte Durchseuchung", data: [],
		 type: 4, plottype: "lines",  
		 ytrafo: [1, false,false], color:colInfectedTot};



  // window 2: "Faelle vs Infizierte" mirrored bar chart cases vs dead persons
  // ytrafo=[scalefact, half, mirrored] 

  this.dataG[16]={key: "Test-Positive pro Tag und Million", data: [],
		 type: 0, plottype: "bars",  
		 ytrafo: [1, true,false], color:colCasesBars}; 
 
  this.dataG[17]={key: "Gestorbene pro Tag und Million", data: [],
		 type: 0, plottype: "bars",  
		  ytrafo: [this.magnFactorDeaths, true,true],
		  color:colDead};

  this.dataG[23]={key: "Neuinfizierte/Tag/Million (Sim, in 10)", data: [],
		 type: 4, plottype: "lines",  
		 ytrafo: [0.1, true,false], color:colInfectedLin};

  this.dataG[36]={key: "Neuinfizierte/Tag/Million (letzte Sim, in 10)",

                  data: simPrevious[36],
		 type: 4, plottype: "lines",  
		 ytrafo: [0.1, true,false], color:colInfectedLinValid};
                 // real: scale*10

  this.dataG[28]={key: "Gestorbene pro Tag und Million (Sim)", data: [],
		 type: 4, plottype: "lines",  
		  ytrafo: [this.magnFactorDeaths, true,true],
		  color:colDeadSim}; // mirror 2->5/0.1
  this.dataG[37]={key: "Gestorbene pro Tag und Million (letzte Sim)", // sim Gestorbene
                  data: simPrevious[37],
		  type: 4, plottype: "lines",  
		  ytrafo: [this.magnFactorDeaths, true,true], // mirror bottom 2->5/0.1
		  color:colDeadValid};




  // window 3: "Daten: Tests
  // ytrafo=[scalefact, half, mirrored]

  this.dataG[18]={key: "Test-Positive pro Tag und Million", data: [],
		 type: 0, plottype: "bars",  
		 ytrafo: [1, false,false], color:colCasesBars};

  this.dataG[19]={key: "Tests pro Tag und Million (in 10)", data: [],
		 type: 0, plottype: "points",  
		 ytrafo: [0.1, false,false], color:colTests};

  this.dataG[24]={key: "Neuinfizierte pro Tag und Million (Sim, in 10)", data: [],
		 type: 4, plottype: "lines",  
		 ytrafo: [0.1, false,false], color:colInfectedLin};

  this.dataG[26]={key: "Simulierte False Positives pro Tag und Million", data: [],
		 type: 4, plottype: "lines",  
		 ytrafo: [1, false,false], color:colFalsePos};

  this.dataG[27]={key: "Test-Positive pro Tag und Million (Sim)", data: [],
		 type: 3, plottype: "lines",  
		 ytrafo: [1, false,false], color:colCasesSim};


  // window 4: infection ratios

  this.dataG[20]={key: "Anteil positiver Tests [%]", data: [],
		 type: 0, plottype: "points",  
		 ytrafo: [100, false,false], color:colPosrate};

  this.dataG[21]={key: "CFR (Case fatality rate) [Promille]", data: [],
		 type: 1, plottype: "points",  
		 ytrafo: [1000, false,false], color:colCFR};

  this.dataG[22]={key: "Sim IFR65 (Infection fatality rate) [Promille]", data: [],
		 type: 4, plottype: "lines",  
		 ytrafo: [1000, false,false], color:colIFR};


// window 5: "Taegliche Faelle"  (plus this.dataG[16], [17], [28])


  this.dataG[29]={key: "Test-Positive pro Tag und Million (Sim)", data: [],
		 type: 3, plottype: "lines",  
		 ytrafo: [1, true,false], color:colCasesSim};

  this.dataG[40]={key: "Test-Positive pro Tag und Million (letzte Sim)",
		  data: simPrevious[40],
		  type: 3, plottype: "lines",  
		  ytrafo: [1, true,false], color:colCasesValid};


// window 6 weekly incidence

  this.dataG[30]={key: "Wocheninzidenz Faelle pro 100 000", data: [],
		 type: 0, plottype: "bars",  
		 ytrafo: [1, true,false], color:colCasesBars}; // real: scale*10

  this.dataG[31]={key: "Wocheninzidenz Gestorbene pro 100 000", data: [],
		 type: 0, plottype: "bars",  
		  ytrafo: [this.magnFactorDeaths, true,true], // mirror bot
		  color:colDead}; 


  this.dataG[32]={key: "Wocheninzidenz Faelle (Sim)", data: [],
		 type: 3, plottype: "lines",  
		 ytrafo: [1, true,false], color:colCasesSim};

  this.dataG[38]={key: "Wocheninzidenz Faelle (letzte Sim)", // Wocheninzidenz
		  data: simPrevious[38],
		  type: 3, plottype: "lines",  
		  ytrafo: [1, true,false], color:colCasesValid};

  this.dataG[33]={key: "Wocheninzidenz Gestorbene (Sim)", 
		  data: [],
		  type: 4, plottype: "lines",  
		  ytrafo: [this.magnFactorDeaths, true,true], // mirror bot
		  color:colDeadSim}; 

  this.dataG[39]={key: "Wocheninzidenz Gestorbene (letzte Sim)", 
		  data: simPrevious[39],
		  type: 4, plottype: "lines",  
		  ytrafo: [this.magnFactorDeaths, true,true], // mirror 
		  color:colDeadValid};

  this.dataG[41]={key: "10*Grad Lockdown [%]", data: [], // stringency in %
		 type: 3, plottype: "lines",  
		 ytrafo: [10, true,false], color:colStringency};

  this.dataG[42]={key: "Wocheninzidenz Faelle Vergleichsland", data: [],
		 type: 0, plottype: "bars",  
		 ytrafo: [1, true,false], color:colCmp}; // real: scale*10


  
  // MT 2021-11-21 window 7 cause-effect time series:
  // Grad Lockdown 43/44, Vacc 45, Boosters 46/47, 
  // Rt-Wert sim 48/49, (log) Inzidenz 50/51

  this.dataG[43]={key: "Grad Lockdown [0-1]",
		  data: this.dataG[41].data,
		  type: 4, // 0=data dir (posCases),
                           // 1=solid deriv from data (CFR), 
                           // 2=more speculative derivation (IFR)
                           // 3=simulation duenn, 4=specul sim thick
		  plottype: "lines",       // in "lines", "points", "bars"
		   
		  ytrafo: [0.01,false,false], // [data in %, half, mirrored]
		  color:colStringency};
  
  this.dataG[44]={key: "Grad Lockdown (letzte Sim)",
		  data: simPrevious[44],
		  type: 3, // 0=data dir (posCases),
                           // 1=solid deriv from data (CFR), 
                           // 2=more speculative derivation (IFR)
                           // 3=simulation, 4=speculative simulation
		  plottype: "lines",       // in "lines", "points", "bars"
		   
		  ytrafo: [1,false,false], // [scalefact, half, mirrored]
		  color:colStringencyValid};
  
  this.dataG[45]={key: "Vollst. Impfquote [0-1]", data: [],
		  //type: 3, plottype: "bars",  
		  type: 4, plottype: "lines",  
		  ytrafo: [1,false,false], color:colVacc};
  
  this.dataG[46]={key: "Boosterquote [0-1]", data: [],
		  //type: 3, plottype: "bars",  
		  type: 4, plottype: "lines",  
		  ytrafo: [1,false,false], color:colBoost};
  
  this.dataG[47]={key: "Boosterquote (letzte Sim)", data: simPrevious[47],
		  //type: 3, plottype: "bars",  
		  type: 3, plottype: "lines",  
		  ytrafo: [1,false,false], color:colBoostValid};

  /*
  this.dataG[48]={key: "Rt-Wert (Daten)", data: [],
		  type: 0, plottype: "lines", 
		  ytrafo: [1, false,false], color:colCasesSim};*/

  

  this.dataG[48]={key: "Rt-Wert (Sim)", data: [],
		  type: 3, plottype: "lines", 
		  ytrafo: [1, false,false], color:colR};

  this.dataG[49]={key: "Rt-Wert (letzte Sim)", data: simPrevious[49],
		  type: 3, plottype: "lines", 
		  ytrafo: [1, false,false], color:colRValid};

  this.dataG[54]={key: "0.25*R0 (ohne Saisonalitaet, sim)", data: [],
		  type: 4, plottype: "lines", 
		  ytrafo: [0.25, false,false], color:colR0};

  //this.dataG[50]={key: "log10(Wocheninzidenz)", data: [],
  this.dataG[50]={key: "Wocheninzidenz [%]", data: [],
		  type: 3, plottype: "bars", 
		  ytrafo: [1, false,false], color:colCasesLog};

  //this.dataG[51]={key: "log10(Wocheninzidenz) (letzte Sim)",
  this.dataG[51]={key: "Wocheninzidenz (letzte Sim)",
		  data: simPrevious[51],
		  type: 3, plottype: "bars", 
		  ytrafo: [1, false,false], color:colCasesLogValid};

  this.dataG[52]={key: "Intensivinzidenz pro 100 000", // similar to [31]
		  data: [],
		  type: 0, plottype: "bars", 
		  ytrafo: [this.magnFactorDeaths,true,true],  // mirror
		  color:colICU}; 

  this.dataG[53]={key: "Intensivinzidenz (Sim)", // similar to [33]
		  data: [],
		  type: 4, plottype: "lines", 
		  ytrafo: [this.magnFactorDeaths,true,true],   // mirror 
		  color:colICUsim}; 



// quantity selector for the different display windows
// array indices>=34: validation reference
// 0=cum,1=log,2=casesReal,3=tests,4=rates,5=casesDaily,6=incid,7=causeEffect

  // Grad Lockdown 43/44, Vacc 45, Boosters 46/47, 
  // Rt-Wert sim 48/49, (log) Inzidenz 50/51
  
  this.qselectRegular=[];
  this.qselectWithPrev=[];
  this.qselect=[];

  //  "Genesene"=entries 1,5,14 dropped since no longer meaningful
  
  this.qselectRegular[0]=[0,2,4,6];     // "kumulierte Faelle"
  this.qselectRegular[1]=[8,9,12,13,15,25]; // "Simulationen (log)"
  this.qselectRegular[2]=[16,17,23,28];     // "Faelle vs Infizierte"
  this.qselectRegular[3]=[18,19,24,26,27];  // "Daten: Tests"
  this.qselectRegular[4]=[20,21,22];        // "Infektionsraten"
  this.qselectRegular[5]=[16,17,28,29];     // "Taegliche Faelle"
  this.qselectRegular[6]=[30,32,52,53,31,33,41];  // "Wochen-Inzidenz"
  this.qselectRegular[7]=[50,45,46,43,48,54];  // "Ursache-Wirkung"

  if(countryComparison){this.qselectRegular[6]=[30,31,32,33,41,42];}
  
  this.qselectWithPrev[0]=[34,0,1,35,2,4,5,6]; // first past=>pres. overwrites
  this.qselectWithPrev[1]=[8,9,12,13,15,25];
  this.qselectWithPrev[2]=[16,17,23,36,28,37];
  this.qselectWithPrev[3]=[18,19,24,26,27];
  this.qselectWithPrev[4]=[20,21,22];
  this.qselectWithPrev[5]=[16,17,37,28,40,29];
  this.qselectWithPrev[6]=[30,32,38,52,53,31,33,39,41];
  this.qselectWithPrev[7]=[50,51,45,47,46,44,43,49,48,54];

  if(countryComparison){this.qselectWithPrev[6]=[30,31,38,32,39,33,41,42];}

  for(var iw=0; iw<this.qselectRegular.length; iw++){
    this.qselect[iw]=
      (usePrevious) ? this.qselectWithPrev[iw] : this.qselectRegular[iw];
  }

  //console.log("\nDrawSim Cstr: nDaysValid=",nDaysValid," this.itmin=",this.itmin);

  this.label_y_window=[countryGer+": Personenzahl (in Tausend)",
		       countryGer+": Personenzahl pro Million",
		       countryGer+": Personen pro Tag und Million",
		       countryGer+": Personen pro Tag und Million",
		       countryGer+": Anteil [% oder Promille]",
		       countryGer+": Personen pro Tag und Million",
		       countryGer+": Pers./Woche/100 000 Ew.",
		       countryGer+": Ursache-Wirkung (relativ)"
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
      var x0=this.xPix0+xyrel* this.wPix; // graph width; def corona_gui.js
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


// reference, e.g., R=1 as thick gray horiz line

DrawSim.prototype.drawReferenceLine=function(yrel){
  var x0=this.xPix0;
  var x1=x0+this.wPix;
  var y0=this.yPix0+yrel* this.hPix-0.01*this.hPix;
  var y1=y0+0.02*this.hPix;
  ctx.fillStyle="#CCCCCC";
  ctx.fillRect(x0,y0,this.wPix, 0.02*this.hPix);
}


// includes drawing axes proper, ticks, labels and key drawkey

// windowG:
// 0=cum,1=log,2=casesReal,3=tests,4=rates,5=casesDaily,6=incid,7=causeEffect

DrawSim.prototype.drawAxes=function(windowG){

  ctx.font = textsize+"px Arial"; 



  // define x axis label positions and strings, time starts Mar 20

  var timeTextW=[];
  var timeText=[];
  var days=[];
  var timeRel=[]; // days relative to this.itmax-this.itmin
  var options = {month: "short", day: "2-digit"};
  //var year=dateStart.getFullYear(); // no need; add year for whole January
  var phi=40 * Math.PI/180.; // to rotate date display anticlockw. by phi
  var cphi=Math.cos(phi);
  var sphi=Math.sin(phi);

  // calculate weekly date string array for every week after dateStart
  // !! here, setDate(date.getDate() + ... seems to work over months
  // but always? No real harm since only display is affected
  // => otherwise use getDate() [nicht Date()]
  // with millisecond-constructor using constant oneDay_ms 

  for(var iw=0; iw<Math.floor(this.itmax/7)+1; iw++){
    var date=new Date(dateStart.getTime()); // copy constructor
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



  //drawAxes: define y axis tick/label positions (in y, not pix)
  // actual label not defined here, from this.label_y_window[windowG]
  // windowG:
  //0=cum,1=log,2=casesReal,3=tests,4=rates,5=casesDaily,6=incid,7=causeEffect

  var ymin=this.yminType[windowG];
  var ymax=this.ymaxType[windowG];
  if(windowG==5){console.log("drawAxes: ymin=",ymin," ymax=",ymax);}

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



  // drawAxes: draw grid (inside drawAxes)

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



  // drawAxes: draw date strings on x axis

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




  // drawAxes: draw x-axis and y-axis caption+values strings on y1 axis
  // windowG:
  //0=cum,1=log,2=casesReal,3=tests,4=rates,5=casesDaily,6=incid,7=causeEffect

  var xPix_yAxisCaption=(windowG==3)
      ? this.xPix0-3.8*textsize : this.xPix0-3.0*textsize;
  
  var label_y=this.label_y_window[windowG];
  var yPix=(windowG!=1)
    ? this.yPix0+0.10*this.hPix : this.yPix0+0.20*this.hPix;
  ctx.setTransform(0,-1,1,0, xPix_yAxisCaption,yPix);
  ctx.fillText(label_y,0,0);
  ctx.setTransform(1,0,0,1,0,0);

  // y-axis: draw values on y1 axis: normal graphics

  var xPix_yAxisValStr=(windowG==3)
      ? this.xPix0-3.2*textsize : this.xPix0-2.5*textsize;
  
  if(!this.mirroredGraphics){ 
    for(var iy=0; iy<=ny; iy++){
      var valueStr=(windowG!=1)  ? Math.round(iy*dy) : "10^"+iy;
      if(windowG==7){valueStr=(iy*dy).toFixed(1);}
      //console.log("valueStr=",valueStr);
      ctx.fillText(valueStr, xPix_yAxisValStr,
		   yPix0+(iy*dy-ymin)/(ymax-ymin)*hPix+0.5*textsize);
    }
  }

// draw double mirrored graphics scaling this.magnFactorDeaths:1 
// hack remains: yPix0,hPix instead of this.yPix0, this.hPix

  else{  
    for(var iy=0; iy<=ny; iy++){ // mirror top: factor 1
      var valueStr=Math.round(1*iy*dy);
      ctx.fillText(valueStr, xPix_yAxisValStr,
		   yPix0+(iy*dy-ymin)/(ymax-ymin)*hPix+0.5*textsize);
    }
    for(var iy=1; iy<=ny; iy++){ // mirror bottom: factor 1/this.magnFactorDeaths
      var valueStr=Math.round(iy*dy)/this.magnFactorDeaths; 
      ctx.fillText(valueStr,                  // OK
		   xPix_yAxisValStr,
		   yPix0-(iy*dy-ymin)/(ymax-ymin)*hPix+0.5*textsize);
    }
  }




  
  // drawAxes: draw key drawkey (drawAxes)
  // windowG:
  //0=cum,1=log,2=casesReal,3=tests,4=rates,5=casesDaily,6=incid,7=causeEffect

  var dyrel=-1.2*textsize/this.hPix;
  var ikey=0;

  var yrelTopKey=(windowG==1) // 1=log=simView
      ? 9*dyrel : 0.97; // 8: lines above x axis
  var yrelTopVars=(windowG==1) ? yrelTopKey-4.5*dyrel :
      (windowG==0) ? yrelTopKey-6.5*dyrel :  // because of validation 2L more 
      (windowG==3) ? yrelTopKey-5.5*dyrel :
      (windowG==4) ? yrelTopKey-3.5*dyrel :
      (measuresView) ? 0.30 : 0.33;
  
  var xrelLeft=0.02;

  for (var iq=0; iq<this.qselect[windowG].length; iq++){

    var q=this.qselect[windowG][iq];

    // no key for sim graphics when calibr./valid. points are plotted

    if((windowG>=2)||(this.dataG[q].type>=3)){

      var colKey=rgba2rgb(this.dataG[q].color);
      ctx.fillStyle=colKey;
      ctx.fillText(this.dataG[q].key,
	           this.xPix0+xrelLeft*this.wPix,
		   this.yPix0+(yrelTopKey-ikey*dyrel)*this.hPix);
      ikey++;
    }
  }



    // calculate time string
    // set it+1 days ahead of dateStart (it=time BEFORE sim)

    var date=new Date(dateStart.getTime()); // copy constructor
    date.setDate(date.getDate() + it+1); 
    var options = {year: "numeric", month: "short", day: "2-digit"};
    var str_date=date.toLocaleDateString("de-de",options);

    // display date left upper corner

    var xrelLeftDate=-0.06;
    var yrelTopDate=(measuresView) ? 1.02 : 1.04;
    ctx.fillStyle="rgb(0,0,0)";
    ctx.fillText(str_date,
		 this.xPix0+xrelLeftDate*this.wPix,
		 this.yPix0+yrelTopDate*this.hPix);


    var xrelLeftDate=-0.06;
    var yrelTopDate=(measuresView) ? 1.02 : 1.04;
    ctx.fillStyle="rgb(0,0,0)";
    ctx.fillText(str_date,
		 this.xPix0+xrelLeftDate*this.wPix,
		 this.yPix0+yrelTopDate*this.hPix);

    // display corona-simulation.de right bottom corner

    if(showCoronaSimulationDe){
      var textsizeWeb=(isSmartphone) ? textsize : 1.4*textsize;
      ctx.font = "bold "+textsizeWeb+"px Arial";
      ctx.fillStyle="rgb(127,127,127)";
      ctx.fillText("corona-simulation.de",
		 this.xPix0+this.wPix-10*textsizeWeb,
		 this.yPix0-0.8*textsizeWeb);
      ctx.font = "normal "+textsize+"px Arial";
      ctx.fillStyle="rgb(0,0,0)";

    }

    

    
    // display other state variables anchored at xrelLeft,yrelTop
  if(windowG!=7){
    var Xperc=100*corona.xyz;
    var casesPerc=100*corona.xt;

    // line lines gap between curve keys and variable text
    // windowG:
    // 0=cum,1=log,2=casesReal,3=tests,4=rates,5=casesDaily,
    // 6=incid,7=causeEffect 

    var line=0.5;
    var i1=data_idataStart+it;
    var dn7days=((typeof data_dnSmooth === "undefined")||(i1<0)) ? 0
	: (i1<data_dnSmooth.length) ? data_dnSmooth[i1]
	: data_dnSmooth[data_dnSmooth.length-1];


    if(true){
      line++;

      var str_R0=((it<itStartMut)||(!simulateMutation))
	?", R0eff w/o O="+(R0_actual.toFixed(2))
	:", R0_Delta="+(mutationDynamics.R10.toFixed(2))
	+", R0_O="+(mutationDynamics.R20.toFixed(2))
	+", pOmicron="+(mutationDynamics.p.toFixed(2));
      
      ctx.fillStyle="red"; // "rgb(255,0,0)"
      ctx.fillText("Aktuelles R="+(corona.Reff.toFixed(2))+str_R0,
		   this.xPix0+xrelLeft*this.wPix,
		   this.yPix0+(yrelTopVars-(line)*dyrel)*this.hPix);
      ctx.fillStyle="black";
    }

      
    if(pVacc>0){
      line++;
      ctx.fillText("Geimpft: "+(100*pVacc).toFixed(1)
		   +" %, Vollst. geimpft: "+(100*pVaccFull).toFixed(1)
		   +" %, Geboostert: "+(100*pBoost).toFixed(1)
		   +" %, Infiziert:"+(Xperc.toFixed(1))+" %",
		 this.xPix0+xrelLeft*this.wPix,
		 this.yPix0+(yrelTopVars-(line)*dyrel)*this.hPix);
    }


    if(pVacc>0){
      line++;
      var pMut=(it>=itStartMut) ? mutationDynamics.p : 0;
      var I1=immunity.I1;
      var I2=immunity.I2;
      var I=(1-pMut)*I1+pMut*I2;
      var I1vacc=immunity.I1vacc;
      var I2vacc=immunity.I2vacc;
      var Ivacc=(1-pMut)*I1vacc+pMut*I2vacc;
      
      // not pVaccFull since also first vacc gives some immunity=> would be negative "Impfdurchbruchsrate" (can also calc exactly "Durchbruchsrate" w/respect to any vacc)
      var pd=Math.max(0, (0.5*(pVacc+pVaccFull)-Ivacc)/(1-Ivacc))

      var str_omicron=(pMut>0) ? ("%, Omicron "+(100*I2).toFixed(0)) : "";

      //console.log("pVaccFull=",pVaccFull," Ivacc=",Ivacc);
      ctx.fillText(
        // Impf-Immunitaeten: I-Delta="+(100*I1vacc).toFixed(0)
        // +"%, I-Omicron="+(100*I2vacc).toFixed(0)
	"Gesamt-Immunitaet: Delta "+(100*I1).toFixed(0)
	  +str_omicron
	  +"%, Sim. Impfdurchbrueche: "+(100*pd).toFixed(1)+"%",
	this.xPix0+xrelLeft*this.wPix,
	this.yPix0+(yrelTopVars-(line)*dyrel)*this.hPix);
    }

   
    if(casesInflow>0){
      line++;
      ctx.fillText("Fall-Import: "+(Math.round(casesInflow))
		   +"/Tag/100 000 Einw.",
		   this.xPix0+xrelLeft*this.wPix,
		   this.yPix0+(yrelTopVars-(line)*dyrel)*this.hPix);
    }

    if((!isSmartphone)&&(windowG!=1)){ // not if logarithm window
      line++;
        ctx.fillText("Testrate: "
		     +((dn7days*1e6/n0).toFixed(0))
		     +"/Wo/1 Mio"
		     +"; Kumul. Faelle:"+(casesPerc.toFixed(1)+" %"),
		     this.xPix0+xrelLeft*this.wPix,
		     this.yPix0+(yrelTopVars-(line)*dyrel)*this.hPix);

    }

    if((!isSmartphone)&&(windowG!=1)){
      line++;
      ctx.fillText("Insgesamt Gestorbene (sim.)="+(Math.round(n0*corona.z))
		   +" Aktuelle IFR65="+(100*IFRfun_time(it)).toFixed(2)+" %",
		   this.xPix0+xrelLeft*this.wPix,
		   this.yPix0+(yrelTopVars-(line)*dyrel)*this.hPix);
    }
    
    if(!isSmartphone&&(fracICU>0)&&(windowG!=1)){
      line++;
      ctx.fillText("ICU-Inzidenz/100 000 (sim.)="
		   +(100000*corona.icu).toFixed(1)
		   //+" IIR="+(100*fracICU/tauICUstay).toFixed(2)+" %"
		   +"",
		   this.xPix0+xrelLeft*this.wPix,
		   this.yPix0+(yrelTopVars-(line)*dyrel)*this.hPix);
    }
    
  } // windowG !=7

    //console.log("it=",it," mutationDynamicsOld=",mutationDynamicsOld);

  if(!(typeof mutationDynamicsOld === "undefined") // sometimes so at begin
     && simulateMutation &&(it>mutationDynamicsOld.itNew-63)){
      //console.log("it=",it);
      mutationDynamicsOld.update(it); //just graphics; double call does not harm
      var mutTopPix=this.yPix0+0.90*this.hPix;
      var mutLeftPix=this.xPix0+0.77*this.wPix;
      line=0;
      ctx.fillText("R0_Alpha="+mutationDynamicsOld.R0wild.toFixed(2),
		   mutLeftPix,mutTopPix);
      line++;
      ctx.fillText("R0_Delta="+mutationDynamicsOld.R0mut.toFixed(2),
		   mutLeftPix,mutTopPix-line*dyrel*this.hPix);
      line++;
      ctx.fillText("p_Delta="+Math.round(100*mutationDynamicsOld.p)+"%",
		   mutLeftPix,mutTopPix-line*dyrel*this.hPix);
      line++;
      ctx.fillText("R_0="+mutationDynamicsOld.R0.toFixed(2),
		   mutLeftPix,mutTopPix-line*dyrel*this.hPix);
      
  }// draw propagation of new mutation if actively simulated

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
  this.dataG[8].data[it]=log10(1e6*corona.xAct); // with n0 per country
  this.dataG[9].data[it]=log10(1e6*corona.xt);    // with 1e6 per million
  // this.dataG[10].data[it]=log10(1e6*corona.y); // obsolete
  this.dataG[12].data[it]=log10(1e6*corona.z);
  this.dataG[22].data[it]=IFRfun_time(it); //!! new! IFR
  this.dataG[23].data[it]=1e6*corona.xtau[0]; // xtau[0]=infected at infection age 0
  this.dataG[24].data=this.dataG[23].data;
  this.dataG[25].data[it]=log10(1e6*corona.xyz); // "Durchseuchung"
  this.dataG[26].data[it]=1e6*corona.dxtFalse; // sim number of false positives
  this.dataG[27].data[it]=1e6*corona.dxt; // sim number of positive tests
  this.dataG[28].data[it]=1e6*corona.dz; // sim number of deaths per day
  this.dataG[29].data[it]=1e6*corona.dxt; // sim number of positive tests
                                         // other scaling

  // weekly incidences per 100 000: sim_dxIncidence, sim_dzIncidence,
  // sim_icuIncidence;

  var xsimPastWeek=0;
  this.dataG[32].data[it]=100000/n0
    *(this.dataG[0].data[it]-this.dataG[0].data[Math.max(it-7,0)]);
  this.dataG[33].data[it]=100000/n0
    *(this.dataG[2].data[it]-this.dataG[2].data[Math.max(it-7,0)]);
  this.dataG[53].data[it]=100000*corona.icu;


  
  //!!! reduce ad-hoc weekly ICU incidences and deaths (not base [2], hack!!)
  // due to new Omicron variant
  // to do it real: need pMutArr[] for past pMut's

  if(false){
  //if(simulateMutation&&(it>=itPresent-calibrationDelay)){

    var reduceFactOmicron=0.99; // 0=zero ICUs, 1 is as many as Delta
    var calibrationDelay=14;
    var ICUDelay=10; // delay between infection and ICU

    // ICUs now relate to pMut 14 days ago
    // (note: p_it[it] not yet defined, only up to p_it[it-1])
    var pMut     =mutationDynamics.p_it[it-ICUDelay];
    var pMutStart=mutationDynamics.p_it[itPresent-calibrationDelay-ICUDelay];
    var reduceFactor=((1-pMut)+pMut*reduceFactOmicron)
	/ ((1-pMutStart)+pMutStart*reduceFactOmicron);
    this.dataG[33].data[it]*=reduceFactor;
    this.dataG[53].data[it]*=reduceFactor;
    //console.log("it-itPresent=",it-itPresent," reduceFactorRaw=", reduceFactorRaw," reduceFactor=",reduceFactor);
  }

  
  // MT 2021-11-21: new window 7: cause-effect

  this.dataG[43].data=this.dataG[41].data;
  this.dataG[45].data[it]=pVaccFull;
  this.dataG[46].data[it]=pBoost;
  this.dataG[48].data[it]=corona.Reff;
  this.dataG[54].data[it]=R0_actual;
  //this.dataG[50].data[it]=log10(this.dataG[32].data[it]);
  this.dataG[50].data[it]=0.001*this.dataG[32].data[it];
  
  // get yt  from balance xt past, zt=z

  var itPast=it-tauRecover;
  var nxtPast=(it<tauRecover)
    ? data_cumCases[it-tauRecover+data_idataStart]
    : this.dataG[0].data[itPast];
  //this.dataG[1].data[it]=nxtPast-n0*corona.z; // balance past infected-deaths
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
DrawSim.prototype.transferRecordedData=function(){ // only measured data
//######################################################################

  if(false){console.log("\nin drawsim.transferRecordedData: it=",it,
	      " for unnoying unknown reason repeated several times",
			" only at loading");}
// windows 0,1
  this.dataG[4].data=data_cumCases;  // by reference
  //this.dataG[5].data=data_cumRecovered;
  this.dataG[6].data=data_cumDeaths;
  //this.dataG[7].data=data_cumCfr;
 
  for(var i=0; i<data_cumCases.length; i++){ // by value because of log10:
    this.dataG[13].data[i]=log10(data_cumCases[i]*1e6/n0);
    //this.dataG[14].data[i]=log10(data_cumRecovered[i]);
    this.dataG[15].data[i]=log10(data_cumDeaths[i]*1e6/n0);
  }


  // windows 2-4

  kernel=[1]; //!! worldometer data too strong weekly changes, 
                 // more than RKI => slight smoothing
  //kernel=[1/4,2/4,1/4];

  //kernel=[1/9,2/9,3/9,2/9,1/9];
  //kernel=[1/16,2/16,3/16,4/16,3/16,2/16,1/16];
  //kernel=[1/25,2/25,3/25,4/25,5/25,4/25,3/25,2/25,1/25];

  var dnSmooth=smooth(data_dn,kernel);
  var dxtSmooth=smooth(data_dxt,kernel);
  var dzSmooth=smooth(data_dz,kernel);
  var posRateSmooth=smooth(data_posRate,kernel);
  var cfrSmooth=smooth(data_cfr,kernel);

  console.log("dnSmooth.length=",dnSmooth.length," data_cumCases.length=",data_cumCases.length);
  

  for(var i=0; i<data_cumCases.length; i++){
    this.dataG[16].data[i]=dxtSmooth[i]*1e6/n0; 
    this.dataG[17].data[i]=dzSmooth[i]*1e6/n0; // death

    this.dataG[18].data[i]=dxtSmooth[i]*1e6/n0; // the same as [16]
    this.dataG[19].data[i]=dnSmooth[i]*1e6/n0;

    if(i>data_cumCases.length-5){console.log("this.dataG[16].data[i]=",this.dataG[16].data[i]);}
  }

  
  this.dataG[20].data=posRateSmooth; // by reference
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

  // MT 2021-11-21 for data-driven reproduction rate

  var gen_time=0.5*(tauRstart+tauRend);
  var gen_di=Math.floor(gen_time);

  for(var i=0; i<data_dxt.length; i++){
     data_R[i]=(i<data_dxt.length-gen_di)
      ? Math.pow(data_dxIncidence[i+gen_di]/data_dxIncidence[i],
		 gen_time/gen_di)
      : data_R[i-1];
  }

  
  this.dataG[30].data=data_dxIncidence; // weekly data incidence by reference
  this.dataG[31].data=data_dzIncidence; // weekly death incidence
  this.dataG[52].data=data_icuIncidence; // ICU/100 000 (intensive quantity)
  this.dataG[41].data=stringency_hist;
  this.dataG[42].data=dataCmp_dxIncidence;


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
  // !! initialize this.ymaxType=[x,x,x...] to appropriate dimension!
  
  for(var iw=0; iw<this.qselect.length; iw++){ //windows
    for(iq=0; iq<this.qselect[iw].length; iq++){ // quantity selector
      var q=this.qselect[iw][iq];
      var data=this.dataG[q].data;
      var i=(this.dataG[q].type<3) ? it+data_idataStart : it;
      var iDropped=Math.max(0,i-this.timeWindow);
      var scaling=this.dataG[q].ytrafo[0];
      var type=this.dataG[q].type;
      var valueFirst=(!(typeof data === "undefined")) ? data[i]*scaling : 0;
 
      if(false){
	console.log("checkRescaling: iw=",iw," q=",q," scaling=",scaling,
		    " valueFirst=", valueFirst,
		    " this.ymaxType[iw]=",this.ymaxType[iw]);
      }
      if(valueFirst>this.ymaxType[iw]){ // if valueFirst=NaN etc never true
	this.ymaxType[iw]=valueFirst;
	if(false){
	  console.log(
	    "checkRescaling: new maximum! it=",it, "window iw=",iw,
	    " quantity q=",q," i=",i,
	    " type=",((type<3) ? "data" : "sim"),
	    " scaling=",scaling,
	    "\nnew max: this.ymaxType[iw]=",this.ymaxType[iw]
	  );
	}
      }
    }

    if(false){
      console.log("DrawSim.checkRescaling: it=",it," iw=",iw,
		  " this.ymaxType[iw]=",this.ymaxType[iw]);
    }
    
  }


 // (3) !!! restrict scalings for some windows

  //this.ymaxType[4]=Math.min(this.ymaxType[4], 35); // positive rate [%]
  //this.ymaxType[0]=Math.max(this.ymaxType[0], 1); 
  //this.ymaxType[7]=3; // upper limit for new window "Ursache-Wirkung"


  //console.log("leaving checkRescaling: this.ymaxType=",this.ymaxType);
}// DrawSim.checkRescaling=


//######################################################################
DrawSim.prototype.drawR0Estimate=function(it){
//######################################################################

  //console.log("in DrawSim.drawR0Estimate: it=",it);
  ctx.fillStyle="#888888";// vertical period separation lines
  var y0=this.yPix0+0.03*this.hPix;
  ctx.font = textsizeR0+"px Arial"; 
  var dxPix=Math.max(1,0.002*sizeminWindow);
  for(var ical=0; ical<=getIndexCalib(it); ical++){ 
    var itR0=getIndexTimeFromCalib(ical);
     // during calibration, linear interpolation
    // between old and new R0 value => in display -=calibInterval/2
    var i_xPix=itR0-this.itmin-Math.round(calibInterval/2);
    if((i_xPix>=0)&&(i_xPix<this.xPix.length)){
      var x0=this.xPix[i_xPix];
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
    }
    ctx.font = textsizeR0+"px Arial"; 
  }
  ctx.setTransform(1,0,0,1,0,0);
}




//######################################################################
DrawSim.prototype.draw=function(it){
//######################################################################

  //console.log("draw: simCount=",simCount," usePrevious=",usePrevious);
  for(var iw=0; iw<this.qselectRegular.length; iw++){
    this.qselect[iw]=
      (usePrevious) ? this.qselectWithPrev[iw] : this.qselectRegular[iw];
  }

  
  if(false){
    console.log("\nin DrawSim.draw: it=",it,
		" this.qselect[6]=",this.qselect[6],
		//" this.itmin=",this.itmin,
		//" this.itmax=",this.itmax,
		" usePrevious=",usePrevious,
		" actual sim: this.dataG[32].data.length=",
		this.dataG[32].data.length,
		" prev sim: this.dataG[38].data.length=",
		this.dataG[38].data.length,
		"");
  }

  // windowG:
  //0=cum,1=log,2=casesReal,3=tests,4=rates,5=casesDaily,6=incid,7=causeEffect

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

  if(windowG==7){
    var yminDraw=this.yminType[windowG];
    var ymaxDraw=this.ymaxType[windowG];
    this.drawReferenceLine((1-yminDraw)/(ymaxDraw-yminDraw));
  }

  // draw simulations and data for all windows

  // filter scaling, drawCurves with line thickness,
  //  plotPoints with point types , plotBars by parsing this.dataG[q]

  // qselect: quantity selector for windowG
  //console.log("\ndraw: it=",it," this.ymaxType=",this.ymaxType);

  for(var iq =0; iq<this.qselect[windowG].length; iq++){ 
    var q=this.qselect[windowG][iq];
    var data=this.dataG[q].data;
    var i=(this.dataG[q].type<3) ? it+data_idataStart : it;//!!!
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
    var actValue=scaling*data[i];



    if(q==16){
      console.log("drawsim.draw: q=",q," it=",it," i=",i,
		  " data[i]=",data[i], "actValue=",actValue,
		  "this.ymaxType[windowG]=",this.ymaxType[windowG]);
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


  // draw R0 estimates for windows with simulations
  
  if(this.mirroredGraphics && (!measuresView)){
  //if(this.mirroredGraphics){
    this.drawR0Estimate(it);
  }

  // at the end to have grid+labels at top layer
  
  this.drawAxes(windowG);  


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
    if((i>0)&&(value>=yminDraw)){
      var yrel=Math.min(1, (value-yminDraw)/(ymaxDraw-yminDraw));
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



// parabolic approximation allowing a flexible exceeding
// of the threshold xmax by a fraction r

function minSmooth(x,xmax,r){
  return (x<xmax) ? x
    : (x>xmax*(1+2*r)) ?  xmax*(1+r)
    : xmax+(x-xmax)*(1-0.25*(x-xmax)/(r*xmax));
}
