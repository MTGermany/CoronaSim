// https://de.wikipedia.org/wiki/COVID-19-Pandemie_in_Deutschland#März_2020
// see corona_observations.txt


// global operative simulation vars 

var myRun;
var isStopped=true
var it=0;
var itmaxinit;  // #days init simulation; to be determined by js Date() object
var itmax;      // can be >itmaxinit during interactive simulation

var n0=80.e6;  // #persons in Germany
var nxtStart=10000; // number of positively tested infections@start
                    // (mar20, begin lockdown, nxt=13957)

var R01=3;     // varying R0 rates calibrated to data
var R02=1.7;
var R03=1.2;
var nxt1=2000;
var nxt2=10000;
var nxtR0=30000;

var dayStartMar=19; //!!!
var startDay=new Date(2020,02,dayStartMar); // months start with zero, days with 1
var oneDay_ms=(1000 * 3600 * 24);

var ln10=Math.log(10);
var displayType="lin"; // "lin" or "log"; consolidate with html

// data-related variable (opendata. ... .eu)
// see also 
// https://de.wikipedia.org/wiki/COVID-19-Pandemie_in_Deutschland#März_2020

var data_date_ddmmyyyy=[];
var data_diff2start=[];
var data_cases=[];
var data_cumCases=[];
var data_deaths=[];
var data_cumDeaths=[];
var data_deathsCases=[];

var dataGit_istart;
var dataGit_date=[];
var dataGit_cumCases=[];
var dataGit_cumDeaths=[];
var dataGit_cumRecovered=[];
var dataGit_deathsCases=[];


// fetch with https://pomber.github.io/covid19/timeseries.json
// !!! does not work with old browsers

var dataGit_Germany=[];
var dataGit_dateBegin;
// global simulation  parameters (global to avoid alsways writing "this.")


// now controlled by sliders

var fps=10;
var R0=0.73;          // infection rate with measures
var tauRstart=1;     // active infectivity begins [days since infection]
var tauRend=10;       // active infectivity ends [days since infection]//10
var pTestInit=0.1;   // initial percentage of tested infected persons 
var pTest=0.1;       // percentage of tested infected persons 
var tauTest=10;  // time delay [days] test-infection
var tauAvg=5;      // smoothing interval for tauTest,tauDie,tauRecover

// not controlled, set statically here

var fracDieInit=0.0040;  // fracDie for initial setting of pTest
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


//##############################################################
// function for variable replicationrate R0 as a function of 
// fraction xt of observed cases
//##############################################################

function R0fun(xt){
  return (n0*xt<nxt1) ? R01 : 
    (n0*xt<nxt2) ? R02 :
    (n0*xt<nxtR0) ? R03 : R0;  // R0 controlled by sliders
}



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
// ##############################################################


function getGithubData() {//called ONLY in the <body onload> event

  fetch("https://pomber.github.io/covid19/timeseries.json")
    .then((response1) => {
      return response1.json();
    })
    .then((data1) => {
      console.log("data1=",data1);
      dataGit_Germany=data1["Germany"];
      console.log("inner: dataGit_Germany[0]=",dataGit_Germany[0]);
      var dateInitStr=dataGit_Germany[0]["date"];
      dataGit_dateBegin=new Date(dateInitStr);
      dataGit_istart=Math.round(
	(startDay.getTime() - dataGit_dateBegin.getTime() )/oneDay_ms);

      var itmaxData=dataGit_Germany.length;
      for(var it=0; it<itmaxData; it++){
	dataGit_date[it]=dataGit_Germany[it]["date"];
	dataGit_cumCases[it]=dataGit_Germany[it]["confirmed"];
	dataGit_cumDeaths[it]=dataGit_Germany[it]["deaths"];
	dataGit_cumRecovered[it]=dataGit_Germany[it]["recovered"];
	dataGit_deathsCases[it]=(dataGit_cumCases[it]==0)
	  ? 0 : dataGit_cumDeaths[it]/dataGit_cumCases[it];
	if(true){
	  console.log("it=",it," dataGit_date=",dataGit_date[it],
		      "\n dataGit_cumCases=",dataGit_cumCases[it],
		      " dataGit_cumDeaths=",dataGit_cumDeaths[it],
		      " dataGit_cumRecovered=",dataGit_cumRecovered[it]);
	}
      }

      console.log(
	"\n\n\n",
	"end fetch statement: dateInitStr=",dateInitStr,
	" dataGit_dateBegin=",dataGit_dateBegin,
	"dataGit_istart=",dataGit_istart,
	"\n dataGit_cumCases.length=",dataGit_cumCases.length,
	"\n dataGit_date[dataGit_istart]",dataGit_date[dataGit_istart],
	"\n dataGit_date[dataGit_istart+34]=",dataGit_date[dataGit_istart+34],
	"\n\n\n");
    });

  console.log("outer: dataGit_Germany[0]=",dataGit_Germany[0]);
}


//##############################################################
// callbacks influencing the overall simulation operation/appearance
//##############################################################


//called in the html  <body onload> event and by myRestartFunction()

function startup() {
  console.log("begin <body onload -> startup(): dataGit_Germany[0]=",dataGit_Germany[0]);
 
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
  console.log("present=",present," startDay=",startDay," itmaxinit=",itmaxinit);





  // =============================================================
  // parse data from opendata. ... .eu obtained via updateCoronaInput.sh
  // =============================================================

  var mydata = JSON.parse(data);

  // mydata is ordered reverse chronological (ir=i reverse)
  var i=0;
  for(var ir=mydata.length-1; ir>=0; ir--){

    // get date object from mydata[i].dateRep (month is 0-based!)
    data_date_ddmmyyyy[i]=mydata[ir].dateRep;
    var dateParts = mydata[ir].dateRep.split("/");
    var dateObj=new Date(dateParts[2], dateParts[1] - 1, dateParts[0]); 

    // parse mydata to the relevant arrays

    data_diff2start[i]=Math.round(
      (dateObj.getTime() - startDay.getTime())/oneDay_ms);
    data_cases[i]=parseInt(mydata[ir].cases);
    data_deaths[i]=parseInt(mydata[ir].deaths);
    data_cumCases[i]=((i==0) ? 0 : data_cumCases[i-1]) + data_cases[i];
    data_cumDeaths[i]=((i==0) ? 0 : data_cumDeaths[i-1]) + data_deaths[i];
    data_deathsCases[i]=((i==0)||(data_cumCases[i]==0))
			  ? 0 : data_cumDeaths[i]/data_cumCases[i];
    if(false){
      console.log("i=",i," data_diff2start[i]=",data_diff2start[i],
		  " data_cumCases[i]=",data_cumCases[i],
		  " data_cumDeaths[i]=",data_cumDeaths[i]);
    }
    i++;
  }
  var istart=-data_diff2start[0];
  if(false){
    console.log(
      "measured data: istart=",istart," itmaxinit=",itmaxinit,
      "\n  data_date_ddmmyyyy[istart]=", data_date_ddmmyyyy[istart],
      " data_cumCases[istart]=",data_cumCases[istart],
      "\n  data_date_ddmmyyyy[istart+1]=", data_date_ddmmyyyy[istart+1],
      " data_cumCases[istart+1]=",data_cumCases[istart+1],
      "\n  data_date_ddmmyyyy[istart+1]=", data_date_ddmmyyyy[istart+2],
      " data_cumCases[istart+1]=",data_cumCases[istart+2],
      "\n  data_date_ddmmyyyy[istart+itmaxinit]=",data_date_ddmmyyyy[istart+itmaxinit],
      " data_cumCases[istart+itmaxinit]=",data_cumCases[istart+itmaxinit]
	       );
  }

  console.log("\n\nmiddle startup(): dataGit_Germany[0]=",dataGit_Germany[0],"\n\n");


  // =============================================================
  // initialize CoronaSim
  // =============================================================

  corona=new CoronaSim();
  console.log("\n\nstartup after new CoronaSim(): dataGit_Germany[0]=",dataGit_Germany[0],"\n\n");

  corona.init(); // it=1 at the end !!
  console.log("\n\nstartup after corona.init(): dataGit_Germany[0]=",dataGit_Germany[0],"\n\n");


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
  // actual startup
  // =============================================================

  console.log("initialized.");
  myStartStopFunction(); // starts simulation up to present !!
  console.log("end startup(): dataGit_Germany[0]=",dataGit_Germany[0]);



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
		       corona.y,corona.yt,corona.z); // to redraw lines
  //myRestartFunction();
}



// ###############################################################
// do simulations and graphics
// ###############################################################

function myStartStopFunction(){ 

  clearInterval(myRun);
  console.log("in myStartStopFunction: isStopped=",isStopped);


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


function myRestartFunction(){ 
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  fracDie=fracDieInit*pTest/pTestInit;
  console.log("restart: fracDie=",fracDie);
  startup();
  console.log("restart: after startup: dataGit_Germany[0]=",dataGit_Germany[0]);

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

function simulationRun() {
  doSimulationStep();

// the hell knows why i need "+2" and not "+1"//!!! 
// but it works, it's tested by numbers

  if(it==itmaxinit+1){ 
    clearInterval(myRun);myStartStopFunction();
  }
}

// displayType in {"lin", "log"}

function doSimulationStep(){
  if(false){
    console.log("doSimulationStep: it=",it,
		" dataGit_Germany[it][\"confirmed\"]=",
		dataGit_Germany[it]["confirmed"]);
  }
  corona.updateOneDay(R0fun(corona.xt));
  drawsim.updateOneDay(it,displayType, corona.xtot, corona.xt,
		       corona.y, corona.yt, corona.z);
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
  console.log("CoronaSim created");
  this.x=[]; // age struture of fraction infected at given timestep
  this.xohne=[]; // age structure without deleting by recover,death
}


CoronaSim.prototype.init=function(){

  // start warmup at a very early phase

  this.xtot=10/n0;  // cumulated fraction of infected as a function of time
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

  // do warmup until the required number of observed infections xt is reached

  for(it=1; (it<200)&&(n0*this.xt<nxtStart); it++){ //200
    var Rt=R0fun(this.xt);
    this.updateOneDay(Rt);
    if(false){
      console.log("warmup: it=",it,
		  " n0*this.xtot=",n0*this.xtot.toPrecision(3),
		  " n0*this.xt=",n0*this.xt.toPrecision(3),
		 // " n0*this.y=",n0*this.y.toPrecision(3),
		  //" n0*this.yt=",n0*this.yt.toPrecision(3),
		  //" n0*this.z=",n0*this.z.toPrecision(3),
		  "");
    }
  }
  if(it==200){console.log("required number of observed infections",
			 " not reached during maximum warmup period");}

 
  console.log("init: finished warmup period of ",it,"days");
  console.log("#observed infections : ", n0*this.xt);
  console.log("#observed infections : ", n0*this.xt);
  console.log("#total infections: n0*xtot=",n0*this.xtot);
  console.log("#recovered: ny=n0*y=",n0*this.y);
  console.log("#deceased: nz=n0*z",n0*this.z);

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
CoronaSim.prototype.updateOneDay=function(R){ //it++ at end
  if(false){console.log("Corona.updateOneDay: it=",it,
		       " dataGit_Germany[0]=",
		       dataGit_Germany[it]);
	  }

  if(false){
    console.log("Corona.updateOneDay: calib: it=",it,
		" nxObserved=",Math.round(n0*this.xt),
		" fracDeadObserved=",(this.z/this.xt).toPrecision(2)
	       )
  }

  if(false){
    console.log("Corona.updateOneDay: it=",it,
	//	"this.xtot=",this.xtot.toPrecision(3),
		"this.xt=",this.xt.toPrecision(3),
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
  if(n0*this.xtot>=1){ // infection finally dead if xtot<1
   for(var tau=tauRstart; tau<=tauRend; tau++){
    this.x[0]+=R*f_R*this.x[tau]
      *(1-(this.xtot+this.y+this.z));
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

  this.xtot=0;
  for(var tau=0; tau<taumax; tau++){
    this.xtot += this.x[tau];
  }


  // control output

  if(false){
    console.log("end CoronaSim.updateOneDay: it=",it,
		" xt=",this.xt.toPrecision(3),
		" xtot=",this.xtot.toPrecision(3),
		" y=",this.y.toPrecision(3),
		" yt=",this.yt.toPrecision(3),
		" z=",this.z.toPrecision(3)
	     );
  }


} // CoronaSim.updateOneDay





//#################################################################
// Drawing class (graphics)
//#################################################################

function DrawSim(){

  console.log("drawSim created");

  this.unitPers=1000;  // persons counted in multiples of unitPers

  this.itR0=-1; // it value where n0*xt first exceeds nxtR0 (init val)
  this.yminLin=0;
  this.ymaxLin=100; // unitPers=1000-> 100 corresp to 100 000 persons
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
  this.isActiveLog=[true,true,true,true,true,false];
  this.isActiveLin=[false,true,false,true,true,true];
  this.isActive=(displayType==="lin") ? this.isActiveLin : this.isActiveLog;
  this.xPix0  =0.12*canvas.width;
  this.xPixMax=((displayType==="lin") ? 0.90: 0.98) * canvas.width;
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
  console.log("itmax=",itmax," timeRel[5]=",timeRel[5]);

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
  var ymax2=Math.max(10,this.ymaxPerc);
  var power10=Math.floor(log10(ymax2));
  var multiplicator=Math.pow(10, power10);
  var ymaxRange01=ymax2/multiplicator;
  var dy2=(ymaxRange01<2) ? 0.2*multiplicator
      :(ymaxRange01<5) ? 0.5*multiplicator : multiplicator;
  var ny2=Math.floor(ymax2/dy2);



 
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
	       this.xPix0+0.4*this.wPix, this.yPix0+3*textsize);

  var dxShift=(itmax<itmaxCrit) ? -1.1*textsize : 0;
  for(var ix=0; (ix<timeRel.length)&&(timeRel[ix]<0.96); ix++){
    ctx.fillText(timeText[ix],
		 this.xPix0+timeRel[ix]*this.wPix+dxShift,
		 this.yPix0+1.5*textsize);
  }


  // draw name+values y1 axis

  var label_y=(displayType==="lin")
    ? "Personenzahl (in Tausend)" : "Personenzahl";


  ctx.setTransform(0,-1,1,0,
		   this.xPix0-3.0*textsize,this.yPix0+0.2*this.hPix);
  ctx.fillText(label_y,0,0);
  ctx.setTransform(1,0,0,1,0,0)
  for(var iy=ymin; iy<=ny; iy++){
    var valueStr=(displayType==="lin")  ? iy*dy : "10^"+iy;
    ctx.fillText(valueStr,
		 this.xPix0-2.5*textsize,
		 this.yPix0+(iy*dy-ymin)/(ymax-ymin)*this.hPix+0.5*textsize);
  }

  
  // draw name+values y2 axis if displayType="lin"

  if(displayType==="lin"){

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
  this.yDataLin[5][it]=(xt>1e-6) ? 100*z/xt : 0; // yDataLin[5] "rel"[%] 

  this.yDataLog[0][it]=log10(n0*xtot); 
  this.yDataLog[1][it]=log10(n0*xt);
  this.yDataLog[2][it]=log10(n0*y);
  this.yDataLog[3][it]=log10(n0*yt);
  this.yDataLog[4][it]=log10(n0*z);
  this.yDataLog[5][it]=(xt>1e-6) ? log10(100*z/xt) : 0;

  if(false){console.log("DrawSim.updateOneDay: it=",it,
		       " this.yDataLin[1][it]=",this.yDataLin[1][it],
		       " this.yDataLog[0][it]=",this.yDataLog[0][it]);}

// test possible rescaling due to new data

  var erase=false;

  if(it>itmax){
    itmax=it;
    erase=true;
  }
  // need to redefine x pixel coords if rescaling in x
  console.log("drawsim.updateOneDay: itmax=",itmax);
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


  if((displayType==="lin")&&(this.isActiveLin[1])){
    var i_dataGit=it+dataGit_istart;
      if(i_dataGit<dataGit_cumCases.length){
      if(dataGit_cumCases[i_dataGit]>this.unitPers*this.ymaxLin){
	//console.log("drawsim.ymaxLin=",this.ymaxLin);
	this.ymaxLin=dataGit_cumCases[i_dataGit]/this.unitPers;
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

// drawing vertical separation line R0 init->R0 slider

  if(this.unitPers*this.yDataLin[1][it]>=nxtR0){
    if(this.unitPers*this.yDataLin[1][it-1]<nxtR0){
      this.itR0=it;
    }
    if(this.itR0>-1){
      ctx.fillStyle="#888888";
      var x0=this.xPix[this.itR0];
      ctx.fillRect(x0-1,this.yPix0,3,this.hPix);
      var textsize=Math.min(0.030*canvas.width,0.045*canvas.height);

      ctx.setTransform(0,-1,1,0,x0+1.0*textsize,this.yPix0+0.5*this.hPix);
      ctx.fillText("R"+toSub(0)+" aktiv",0,0);
      ctx.setTransform(1,0,0,1,0,0);
    }
  }



  // drawing of data from opendata... .eu

  if(this.isActive[1]){ // xt
    this.plotPoints(it, 1, dataGit_cumCases, displayType); //!!!
  }

  if(this.isActive[3]){ // yt
    this.plotPoints(it, 3, dataGit_cumRecovered, displayType); //!!!
  }

  if(this.isActive[4]){ // z
    this.plotPoints(it, 4, dataGit_cumDeaths, displayType); //!!!
  }

  if(this.isActive[5]){ // z/xt
    this.plotPoints(it, 5, dataGit_deathsCases, displayType); //!!!
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
  if(q==1){console.log("DrawSim.drawCurve: it=",it);}

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
  if(q==1){console.log("DrawSim.plotPoints: it=",it);}
  ctx.fillStyle=this.colLine[q];

  for (var i=0; i<data_arr.length; i++){


    var itg=i-dataGit_istart; // !!global var difference to startDay

    // log 10 and, if lin, in 1000 =>*0.001, if perc *100

    var y=(displayType==="log") ? log10(data_arr[i]) : 0.001*data_arr[i];
    if(q==5){y=100*data_arr[i];}

    // actual plotting

    //if((itg>=0)&&(itg<=it)&&(y>=yminDraw) &&(y<=ymaxDraw)){//!!!
    if((itg>=0)&&(itg<=it)){
      if(false){console.log("it=",it," i=",i," itg=",itg,
			   " data_arr[i]=",data_arr[i]);}

      var yrel=(y-yminDraw)/(ymaxDraw-yminDraw);
      var dataPix=this.yPix0+yrel*(this.yPixMax-this.yPix0);
      ctx.beginPath(); //!! crucial; otherwise latest col used for ALL
      ctx.arc(this.xPix[itg],dataPix,0.015*sizemin, 0, 2 * Math.PI);
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
