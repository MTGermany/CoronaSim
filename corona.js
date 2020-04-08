// https://de.wikipedia.org/wiki/COVID-19-Pandemie_in_Deutschland#März_2020
// see corona_observations.txt


// global operative simulation vars 

var myRun;
var isStopped=true
var it=0;
var itmax=365;   // simulated duration [days] since 2020-03-20 [30*7];

var n0=80.e6;  // #persons in Germany
var R0=3;         // baseline infection rate (no measures, no one immune)
                  // for phase1 (nxt<nxtPhase2)
var R2=1.9;       // infection rate nxtPhase2<=nxt<nxtStart
var nxtPhase2=1000; // number of positively tested infections=13957
var nxtStart=11000; // number of positively tested infections=13957
                    // (mar20, begin lockdown)
// https://de.wikipedia.org/wiki/COVID-19-Pandemie_in_Deutschland#März_2020
//31 Todesfaelle at mar20

var ln10=Math.log(10);
//var displayType="lin";  // consolidate with html
var displayType="log"; 


// global simulation  parameters (global to avoid alsways writing "this.")


// now controlled by sliders

var fps=10;
var R=1.1;          // infection rate with measures
var tauRstart=1;     // active infectivity begins [days since infection]
var tauRend=10;       // active infectivity ends [days since infection]//10
var rTest=0.1;   // percentage of tested infected persons 
var tauTest=10;  // time delay [days] test-infection
var tauAvg=5;      // smoothing interval for tauTest,tauDie,tauRecover

// not controlled, set statically here

var fracDie=0.006;     // fraction of deaths by desease //0.004
var tauDie=25;      // time from infection to death in fracDie cases//!!!
var tauRecover=28; // time from infection to full recovery//!!!
var tauSymptoms=7;  // incubation time 

var taumax=Math.max(tauDie,tauRecover)+tauAvg+1;
 
// global graphical vars

var canvas;
var ctx;
var xPixLeft,yPixTop;
var xPix,yPix;
var xPixOld, yPixOld;



//##############################################################
// callbacks influencing the overall simulation operation/appearance
//##############################################################


//called in the <body onload> event ( <body onload="startup()")

function startup() {
  canvas = document.getElementById("myCanvas");
  ctx = canvas.getContext("2d");
  var rect = canvas.getBoundingClientRect();
  xPixLeft=rect.left;
  yPixTop=rect.top;

  corona=new CoronaSim();
  corona.init(); // it=1 at the end
  drawsim=new DrawSim();

  window.addEventListener("resize", canvas_resize);
  canvas_resize();


  console.log("initialized.");
  drawsim.setDisplayType(displayType);
  drawsim.drawAxes(displayType);
}


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
  startup();
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

function displayTypeCallback(){
  if(displayType=="lin"){
    displayType="log";
    document.getElementById("buttonDisplayType").innerHTML
      ="=> lineare Darstellung";
  }
  else{
    displayType="lin";
    document.getElementById("buttonDisplayType").innerHTML
      ="=> logarithmische Darstellung";
  }

  drawsim.setDisplayType(displayType); // clear and draAxes in setDisplay..
  drawsim.updateOneDay(it,displayType,corona.xtot,corona.xt,
		       corona.y,corona.yt,corona.z); // to redraw lines
  //myRestartFunction();
}



// ###############################################################
// do simulations and graphics
// ###############################################################


function simulationRun() {
  doSimulationStep();
  //console.log("simulationRun: it=",it," itmax=",itmax);
  if(it==itmax){
    clearInterval(myRun);
  }
}

// displayType in {"lin", "log"}

function doSimulationStep(){
  corona.updateOneDay(R);
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

  // init infection-age profile this.x[tau] with exponential

  var r0=0.3; // initial exponential rate per day  (don't confuse with R0,R)
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
    var R=(n0*this.xt<nxtPhase2) ? R0 : R2;
    this.updateOneDay(R);
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

  if(n0*this.xt<150000){
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
		"\n  this.xt/rTest-this.y-this.z=",
		(this.xt/rTest-this.y-this.z).toPrecision(3),
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

  tauAvg//=5; //!!
  var dtau=Math.min(Math.floor(tauAvg/2),Math.round(tauTest));
 


  var f_T=1./(2*dtau+1);
  for(var tau=tauTest-dtau; tau<=tauTest+dtau; tau++){
    this.xt += rTest*f_T*this.xohne[tau];
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

    //if(true){
    if(false&&(it%20==tauDie-tauTest)){
      console.log("die: it=",it," tau=",tau," x[tau]=",this.xohne[tau],
		  "dz=",dz[tau-tauDie+dtau]);
    }
  }

  for(var tau=tauRecover-dtau; tau<=tauRecover+dtau; tau++){
    var tauH=Math.min(it,tau);
    //dy[tau-tauRecover+dtau]=(1-fracDie)*f_Rec*this.xold[tauH][0];
    dy[tau-tauRecover+dtau]=(1-fracDie)*f_Rec*this.xohne[tau];
    dysum+=dy[tau-tauRecover+dtau];

    if(false&&(it%20==tauRecover-tauTest)){
      console.log("recover: it=",it," tau=",tau," xohne[tau]=",this.xohne[tau],
		  "dyt=",rTest*dy[tau-tauRecover+dtau]);
    }
  }

  // subtract from x[tau] but not from xohne[tau]

  //this.x[tauDie]-=dzsum;
  //this.x[tauRecover]-=dysum;

  for(var tau=tauDie-dtau; tau<=tauDie+dtau; tau++){
    this.x[tau] -=dz[tau-tauDie+dtau];
  }
  for(var tau=tauRecover-dtau; tau<=tauRecover+dtau; tau++){
    this.x[tau] -=dy[tau-tauRecover+dtau];
  }


  //if(tauRecover>tauDie){dysum*=1/(1-fracDie);} //!!!
  //else{dysum*=1/(1-fracDie/(1+fracDie));}

  this.y   += dysum;
  this.yt  =rTest*this.y;
  this.z   += dzsum;
  //console.log("it=",it," xt=",this.xt," dysum=",dysum," dzsum=",dzsum);



  // sum up the profile of infected people

  this.xtot=0;
  for(var tau=0; tau<taumax; tau++){
    this.xtot += this.x[tau];
  }


  // control output

  if(false){
    console.log("end CoronaSim.updateOneDay: t_days=",it,
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

  this.itmaxDraw=4*7;
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
  this.xPix0  =0.12*canvas.width;
  this.xPixMax=((displayType==="lin") ? 0.90: 0.98) * canvas.width;
  this.yPix0  =0.85*canvas.height;
  this.yPixMax=0.02*canvas.height;
  this.wPix=this.xPixMax-this.xPix0;
  this.hPix=this.yPixMax-this.yPix0;  //<0

  if(displayType==="log"){this.isActive=[true,true,true,true,true,false]};
  if(displayType==="lin"){this.isActive=[false,true,false,true,true,true]};
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
  var dFirstDay=(this.itmaxDraw<itmaxCrit) ? 3 : 12;  //Mar23 or Apr1
  var dDays=(this.itmaxDraw<itmaxCrit) ? 7 : 30.4  // avg month has 30.4 days
  var timeText=(this.itmaxDraw<itmaxCrit)
    ? ["23.03", "30.03", "06.04", "13.04", "20.04", "27.04", 
       "04.05", "11.05", "18.05"]
    : ["Apr","Mai","Jun", "Jul", "Aug", "Sep", "Okt", 
       "Nov", "Dez", "Jan", "Feb", "Mar"];

  var timeRel=[];
  for(var i=0; i<timeText.length; i++){
    timeRel[i]=(dFirstDay+i*dDays)/this.itmaxDraw;
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

  ctx.fillText("Zeit (Start 20. Maerz 2020)",
	       this.xPix0+0.4*this.wPix, this.yPix0+3*textsize);

  for(var ix=0; (ix<timeRel.length)&&(timeRel[ix]<0.96); ix++){
    ctx.fillText(timeText[ix],
		 this.xPix0+timeRel[ix]*this.wPix,
		 this.yPix0+1.5*textsize);
  }


  // draw name+values y1 axis

  var label_y="Personenzahl (in Tausend)";


  ctx.setTransform(0,-1,1,0,
		   this.xPix0-3.0*textsize,this.yPix0+0.2*this.hPix);
  ctx.fillText(label_y,0,0);
  ctx.setTransform(1,0,0,1,0,0)
  for(var iy=ymin; iy<=ny; iy++){
    var valueStr=(displayType==="lin") ? iy*dy : "10^"+iy;
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
    console.log("ymin2=",ymin2," ymax2=",ymax2," ny2=",ny2);
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
    ctx.fillText("Genesene Personen (Daten)",
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


  // need to redefine x pixel coords if rescaling in x

  for(var i=0; i<this.itmaxDraw; i++){
    this.xPix[i]=this.xPix0+i*(this.xPixMax-this.xPix0)/(this.itmaxDraw-1);
  }


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

  if(false){console.log("it=",it,
		       " this.yDataLin[0][it]=",this.yDataLin[0][it],
		       " this.yDataLog[0][it]=",this.yDataLog[0][it]);}

// test possible rescaling due to new data

  var erase=false;

  if(it>this.itmaxDraw){
    this.itmaxDraw=it;
    erase=true;
  }

  
  for(var q=0; q<5; q++){
    if(this.isActive[q]){
      if((displayType==="lin")&&(this.yDataLin[q][it]>this.ymaxLin)){
        this.ymaxLin=this.yDataLin[q][it];
        erase=true;
      }
      if((displayType==="log")&&(this.yDataLog[q][it]>this.ymaxLog)){ 
        this.ymaxLog=this.yDataLog[q][it];
        erase=true;
        console.log("this.ymaxLog=",this.ymaxLog);
      }
    }
  }

  if(this.yDataLin[5][it]>this.ymaxPerc){ // yDataLin[5] =z/yt in percent
    this.ymaxPerc=this.yDataLin[5][it];
    erase=true;
  }

  if(erase){
    this.clear();
    this.drawAxes(displayType);
  }

  // actual drawing


  for(var q=0; q<6; q++){
    if(this.isActive[q]){
      this.drawCurve(it,q,displayType);
    }
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
  if(q==5){console.log("yminDraw=",yminDraw," ymaxDraw=",ymaxDraw);}
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


DrawSim.prototype.clear=function(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
