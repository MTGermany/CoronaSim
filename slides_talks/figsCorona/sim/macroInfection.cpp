
/*
  Template fuer main() Programm; Ort:
  
  ~/versionedProjects/lib/templates/templateMain.cpp

  makefile dazu:
  
  ~/versionedProjects/lib/templates/makefile
 
  Achtung! Auch ohne .h File muss man bei $OBJECTS immer auch das 
  File mit der Main-Methode dazunehmen!
  (sonst "ld: undefined reference to main"
*/


// c
#include <stdio.h>
#include <math.h>
#include <stdlib.h>
#include <string.h>

//alternatively there is <cstdio> which declares
//everything in namespace std
//but the explicit "using namespace std;" puts
//everything in global namespace


// c++ 
#include <iostream>
using namespace std;

// own
#include "general.h"

#include "Statistics.h"
#include "RandomUtils.h" // contains, e.g.,  myRand()
#include "InOut.h"


// constants

static const int NDATA_MAX=5000;// max. number of data points
static const int MAXSTR=500;// max. number of data points


//#####################################################
//#####################################################
int main(int argc, char* argv[]) {

  // SI model:   no R can be specified, timescale 1/beta
  // SIR model:  R=beta/gamma, timescale (1/gamma) / ln(R)
  // SEIR model: R=beta/gamma, timescale (1/gamma+1/alpha) / ln(R)


  double betaSI=0.1;   // infection rate #infected per day if everybody is S

  double betaSIR=0.2;  
  double gammaSIR=0.1;  // inv lifetime of the "I" status (contagious)

  double betaSEIR=0.4;
  double gammaSEIR=0.2;
  double alphaSEIR=0.2;  // inv incubation time (only SEIR)

  double beta,gamma,alpha;

  double initS=0.999; //initial infection percentage

  double dt=0.1;   // internal time step
  int tmax=500;

  //#####################################################
  // SI model
  //#####################################################


  beta=betaSI;

  // simulation

  int ndt=int(1./dt+0.5);
  int nData=tmax;
  double arrI[nData];
  double arrS[nData];
  double arrTime[nData];
  double initI=1.-initS;
  arrS[0]=initS;
  arrI[0]=initI;
  arrTime[0]=0;
  double S=initS;
  double I=initI;

  for(int i=1; i<ndt*tmax; i++){
    double Iold=I;
    double Sold=S;

    double Ipred=Iold+dt*beta*Iold*Sold;
    double Spred=1-Ipred;
    I+=dt*beta*0.5*(Iold*Sold+Ipred*Spred);
    S=1-I;

    if(i%ndt==0){
      arrTime[i/ndt]=i/ndt;
      arrS[i/ndt]=S;
      arrI[i/ndt]=I;
      cout <<"t="<<i*dt<<" I="<<I<<endl;
    }
  }

  // output

  InOut inout;
  char   fnameOut[MAXSTR];
  char   titleStr[MAXSTR];

  sprintf(fnameOut,"%s","modelSI.dat");
  sprintf(titleStr,"#SI model beta=%2.4f  produced by macroInfection[.cpp]\n#time[days]\tS\t\tI", beta);

  cout <<" writing to "<<fnameOut<<" ..."<<endl;
  inout.write_array(fnameOut, nData, arrTime, arrS, arrI, titleStr);


  //#####################################################
  // SIR model
  //#####################################################

  beta=betaSIR;
  gamma=gammaSIR;


  double arrR[nData];  // percentage of recovered/removed
  double R;
  S=arrS[0]=initS;
  I=arrI[0]=initI;
  R=arrR[0]=0;
  //S=arrS[0]=gamma/beta-0.1;
  //I=arrI[0]=0.001;
  //R=arrR[0]=1-S-I;

  arrTime[0]=0;

  for(int i=1; i<ndt*tmax; i++){
    double Iold=I;
    double Sold=S;

    double Spred=Sold - dt*beta*Iold*Sold;
    double Ipred=Iold + dt*beta*Iold*Sold - dt*gamma*Iold;

    S+= -dt*beta*0.5*(Iold*Sold+Ipred*Spred);
    I+=  dt*beta*0.5*(Iold*Sold+Ipred*Spred) - dt*gamma*0.5*(Iold+Ipred);
    R=1-S-I;

    if(i%ndt==0){
      arrTime[i/ndt]=i/ndt;
      arrS[i/ndt]=S;
      arrI[i/ndt]=I;
      arrR[i/ndt]=R;
    }
  }

  // output

  sprintf(fnameOut,"%s","modelSIR.dat");
  sprintf(titleStr,"#SIR model beta=%2.4f gamma=%2.4f  produced by macroInfection[.cpp]\n#time[days]\tS\tI\tR", beta, gamma);

  cout <<" writing to "<<fnameOut<<" ..."<<endl;
  inout.write_array(fnameOut, nData, arrTime, arrS, arrI, arrR, titleStr);


  //#####################################################
  // SEIR model susceptible-exposed-infectious-ecovered/removed
  //#####################################################

  // S ->beta-> E ->alpha-> I ->gamma->R
  // R0=beta/gamma

  beta=betaSEIR;
  gamma=gammaSEIR;
  alpha=alphaSEIR;

  double arrE[nData];  // percentage of recovered/removed
  double E;

  E=arrE[0]=1.0*(1-initS);
  I=arrI[0]=1.0*(1-initS);
  S=arrS[0]=1-E-I;
  R=arrR[0]=0;

  //S=arrS[0]=gamma/beta-0.00;
  //E=arrE[0]=0.001;
  //I=arrI[0]=0.001;
  //R=arrR[0]=1-E-S-I;

  for(int i=1; i<ndt*tmax; i++){
    double Sold=S;
    double Eold=E;
    double Iold=I;

    double Spred=Sold - dt*beta*Iold*Sold;
    double Epred=Eold + dt*beta*Iold*Sold - dt*alpha*Eold;
    double Ipred=Iold + dt*alpha*Eold     - dt*gamma*Iold;

    S+= -dt*beta*0.5*(Iold*Sold+Ipred*Spred);
    E+=  dt*beta*0.5*(Iold*Sold+Ipred*Spred) - dt*alpha*0.5*(Eold+Epred);
    I+=  dt*alpha*0.5*(Eold+Epred) - dt*gamma*0.5*(Iold+Ipred);
    R=1-S-E-I;

    if(i%ndt==0){
      arrTime[i/ndt]=i/ndt;
      arrS[i/ndt]=S;
      arrE[i/ndt]=E;
      arrI[i/ndt]=I;
      arrR[i/ndt]=R;
    }
  }

  // output

  sprintf(fnameOut,"%s","modelSEIR.dat");
  sprintf(titleStr,"#SEIR model beta=%2.4f gamma=%2.4f alpha=%2.4f  produced by macroInfection[.cpp]\n#time[days]\tS\tE\tI\tR", beta, gamma, alpha);

  cout <<" writing to "<<fnameOut<<" ..."<<endl;
  inout.write_array(fnameOut, nData, arrTime, arrS, arrE, arrI, arrR, 
		    titleStr);


  //#####################################################
  // Seasonal SEIR model: beta=gamma*arrR0[i]
  //#####################################################

  double R0min=0.8;
  double R0max=2;
  double tstartYear=59; // start at tstartYear'th day of year
  double arrR0[nData];

  for(int i=0; i<nData; i++){
    double phi=2*PI*(tstartYear+i)/365.;
    arrR0[i]=0.5*(R0max+R0min)+0.5*(R0max-R0min)*cos(phi);
  }

  E=arrE[0]=1.0*(1-initS);
  I=arrI[0]=1.0*(1-initS);
  S=arrS[0]=1-E-I;
  R=arrR[0]=0;
  beta=gamma*arrR0[0];

  for(int i=1; i<ndt*tmax; i++){
    double Sold=S;
    double Eold=E;
    double Iold=I;

    beta=gamma*arrR0[i/ndt]; //!!! season effect

    double Spred=Sold - dt*beta*Iold*Sold;
    double Epred=Eold + dt*beta*Iold*Sold - dt*alpha*Eold;
    double Ipred=Iold + dt*alpha*Eold     - dt*gamma*Iold;

    S+= -dt*beta*0.5*(Iold*Sold+Ipred*Spred);
    E+=  dt*beta*0.5*(Iold*Sold+Ipred*Spred) - dt*alpha*0.5*(Eold+Epred);
    I+=  dt*alpha*0.5*(Eold+Epred) - dt*gamma*0.5*(Iold+Ipred);
    R=1-S-E-I;

    if(i%ndt==0){
      arrTime[i/ndt]=i/ndt;
      arrS[i/ndt]=S;
      arrE[i/ndt]=E;
      arrI[i/ndt]=I;
      arrR[i/ndt]=R;
    }
  }

  // output

  sprintf(fnameOut,"%s","modelSEIRseason.dat");
  sprintf(titleStr,"#SEIR model beta=gamma*R0(t), gamma=%2.4f alpha=%2.4f, R0min=%1.2f, R0max=%1.2f  produced by macroInfection[.cpp]\n#time[days]\tS\tE\tI\tR\tR0", gamma, alpha, R0min, R0max);

  cout <<" writing to "<<fnameOut<<" ..."<<endl;
  inout.write_array(fnameOut, nData, arrTime, arrS, arrE, arrI, arrR, arrR0, 
		    titleStr);

// #########################################################
// iterated map model (here time step dt=1, not 0.1)
// #########################################################

  int tauI=7;
  int tauR=18;
  double arrIt[tmax]; // fraction of infected only at day i
  double R0=1.4;

  // init the tauI memory steps

  for(int i=0; i<tauI; i++){
    arrIt[i]=1-initS;
    arrI[i]=(i+1)*(1-initS);
    arrS[i]=1-arrI[i];
    arrR[i]=0;
  }

  // regular loop

  for(int i=tauI; i<tmax; i++){
    arrIt[i]=R0*arrS[i-tauI]*arrIt[i-tauI];
    arrS[i]=arrS[i-1] - arrIt[i];
    arrR[i]=arrR[i-1]+( (i<tauR) ? 0 : arrIt[i-tauR]);
    arrI[i]=1-arrS[i]-arrR[i];  // =sum_{j=i-tauI+1}^i arrIt[j]
  }

  // output

  sprintf(fnameOut,"%s","modelSIRiterated.dat");
  sprintf(titleStr,"#SIR iterated, tauI=%i tauR=%i R0=%.2f  produced by macroInfection[.cpp]\n#time[days]\tS\tI\tR", tauI, tauR, R0);

  cout <<" writing to "<<fnameOut<<" ..."<<endl;
  inout.write_array(fnameOut, tmax, arrTime, arrS, arrI, arrR, 
		    titleStr);



  return(0);
}

// #########################################################







