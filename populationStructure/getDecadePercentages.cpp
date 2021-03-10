
/*
  (mar18)
  Template fuer main() Programm; Ort:
  
  ~/versionedProjects/lib/templates/templateMain.cpp

  makefile dazu:
  
  ~/versionedProjects/lib/templates/makefile
 
  Achtung! Auch ohne .h File muss man bei $OBJECTS immer auch das 
  File mit der Main-Methode dazunehmen!
  (sonst "ld: undefined reference to main"
*/

using namespace std;

// c
#include <stdio.h>
#include <math.h>
#include <stdlib.h>
#include <string.h>

//alternatively there is <cstdio> which declares
//everything in namespace std
//but the explicit "using namespace std;" puts
//everything in global namespace


// c++  (the first is nearly always needed)
#include <iostream>
#include <fstream>
#include <string>
#include <sstream>
#include <iomanip> //!! <feb19>


// own (delete if not needed)
#include "general.h"
#include "Statistics.h"
#include "RandomUtils.h" // contains, e.g.,  myRand()
#include "InOut.h"
#include "Math.h"


// constants

static const int NDATA_MAX=500;// max. number of data points
static const int MAXSTR=500;// max. string length


//#####################################################
//#####################################################
int main(int argc, char* argv[]) {



  //###############################
  // Example cmd-line args
  // ##############################

  char   projectName[MAXSTR];
  if (argc!=2){
    cerr <<"\nUsage: templateMain <countryName>\n";
    cerr <<"Example: getDecadePercentages France-2019"<<endl<<endl
	 <<"reads <countryName>.csv and outputs <countryName>.fractions"
	 <<endl;
    exit(-1);
  }
  else {
    sprintf(projectName,"%s",argv[1]);
 }



//#####################################################
// input
//#####################################################

  char   fnameIn[MAXSTR];
  sprintf(fnameIn,"%s.csv",projectName);

  InOut inout;

  double n5male[NDATA_MAX];
  double n5female[NDATA_MAX];
  int nData;

    // t(s)   iveh    x(m)    v(m/s)          s(m)    a(m/s^2)

  inout.get_col(fnameIn, 2, nData, n5male);
  inout.get_col(fnameIn, 3, nData, n5female);

//#####################################################
// calc
//#####################################################

  
  double n0=0;
  double frac10[nData];
  
  for(int i=0; i<nData; i++){
    n0+=n5male[i];
    n0+=n5female[i];
  }

  for(int i2=0; i2<nData/2; i2++){
    frac10[i2]=n5male[2*i2]+n5male[2*i2+1]+n5female[2*i2]+n5female[2*i2+1];
    if(i2==nData/2-1){frac10[i2]+= n5male[2*i2+2]+n5female[2*i2+2];} //100+
    frac10[i2]/=n0;
  }

//#####################################################
// output
//#####################################################

  char   fnameOut[MAXSTR];
  sprintf(fnameOut,"%s.fractions",projectName);
  int decade[nData/2];
  for(int i2=0; i2<nData/2; i2++){
    decade[i2]=i2;
  }

  char titleStr[MAXSTR];
  sprintf(titleStr, "%s", "Decade\tpercentage male+female");
  inout.write_array(fnameOut, nData/2, decade, frac10, titleStr);
  cout<<"\nwrote "<<fnameOut<<endl;

  char country[MAXSTR];
  sprintf(country,"\"%s\"    :",projectName);
  if((projectName[0]=='U')&&(projectName[1]=='n')){
    sprintf(country,"%s", "\"United Kingdom\" :");}
  if((projectName[0]=='S')&&(projectName[1]=='o')){
    sprintf(country,"%s", "\"South Africa\" :");}

  
  //cout<<"\ncorresponding line of ageProfileListPerc for\n"
  //    <<"age groups [0-30,-40,-50,-60,-70,-80,-90, 90+]:\n\n";
  double frac0_30=frac10[0]+frac10[1]+frac10[2];
  cout<<"  "<<country<<" ["<<int(100*frac0_30+0.5)<<",";
  for(int i2=3; i2<nData/2; i2++){
    int x=int(100*frac10[i2]+0.5);
    cout <<((x>0) ? x : 0.1);
    if(i2<nData/2-1){cout<<",";}
  }
  cout<<"],"<<endl;
  
  return(0);
}

// #########################################################







