function simple2dfunc(X) {
  var x = X[0]+2, y = X[1]-0.5;
  return Math.sin(y) * x  + Math.sin(x) * (y)  +  x * x +  y *y;
}


// gradient fbeta needed only for conjugateGradient

function bananafunc(X, fxprime) {
    fxprime = fxprime || [0, 0];
    var x = X[0], y = X[1];
    fxprime[0] = 400 * x * x * x - 400 * y * x + 2 * x - 2;
    fxprime[1] = 200 * y - 200 * x * x;
    return (1 - x) * (1 - x) + 100 * (y - x * x) * (y - x * x);
}

function parabola(x,beta){return beta[0]+beta[1]*x+beta[2]*x*x;}


// gradient fbeta needed only for conjugateGradient

function SSEfunc(beta,fbeta) { 
  fbeta = fbeta || [0, 0, 0];  // crucial if fbeta missing!
  var data_x=[0,1,2,3,4,5,6,7,8,9];
  var data_y=[1,3,6,10,13,19,27,37,43,59];
  var eps=0.001;
  var sse=0;
  var sse0=0; sse1=0; sse2=0; // gradients
  var beta0p=[beta[0]+eps,beta[1], beta[2]];
  var beta0m=[beta[0]-eps,beta[1], beta[2]];
  var beta1p=[beta[0],beta[1]+eps, beta[2]];
  var beta1m=[beta[0],beta[1]-eps, beta[2]];
  var beta2p=[beta[0],beta[1], beta[2]+eps];
  var beta2m=[beta[0],beta[1], beta[2]-eps];

  for (var i=0; i<data_x.length; i++){
    sse += Math.pow(data_y[i]-parabola(data_x[i],beta), 2);
    sse0 += 0.5* (Math.pow(data_y[i]-parabola(data_x[i],beta0p),2)
		 -Math.pow(data_y[i]-parabola(data_x[i],beta0m),2))/eps;
    sse1 +=  0.5*(Math.pow(data_y[i]-parabola(data_x[i],beta1p),2)
		 -Math.pow(data_y[i]-parabola(data_x[i],beta1m),2))/eps;
    sse2 +=  0.5*(Math.pow(data_y[i]-parabola(data_x[i],beta2p),2)
		 -Math.pow(data_y[i]-parabola(data_x[i],beta2m),2))/eps;
  }
  fbeta[0]=sse0; fbeta[1]=sse1; fbeta[2]=sse2; 
  return sse;
}

console.log("SSEfunc([1,1,0])=",SSEfunc([1,1,0]));
console.log("SSEfunc([1,1,1])=",SSEfunc([1,1,1]));

function demo(){
  var initGuessSimple2d=[-3.5, 3.5];
  console.log("simple2dfunc: initGuessSimple2d=",initGuessSimple2d);
  var sol_simple2dfunc = fmin.nelderMead(simple2dfunc, initGuessSimple2d);
  console.log("  after optimisation Nelder Mead: ",
	      "\n  initGuessSimple2d=",initGuessSimple2d,
	      "\n sol_simple2dfunc=",sol_simple2dfunc.x);

 
  var initGuessBanana=[-3, 1.6];
  var guessBanana=initGuessBanana;
  console.log("\n\nbananafunc: guessBanana=",guessBanana);
  var sol1_bananafunc = fmin.conjugateGradient(bananafunc, guessBanana);

  // need to revert (deep copying) because side effect: guess optimized!
  guessBanana=[initGuessBanana[0], initGuessBanana[1]];
  console.log("\n\nbananafunc: guessBanana=",guessBanana);
  var sol2_bananafunc = fmin.nelderMead(bananafunc, guessBanana);
  console.log("  conjugateGradient: ",
	      "\n sol1_bananafunc=",sol1_bananafunc.x,
	      " func=",bananafunc(sol1_bananafunc.x));
  console.log("  nelderMead: ",
	      "\n sol2_bananafunc=",sol2_bananafunc.x);


  var initGuessSSE=[1,1,1];
  fbeta=[]; // gradient as side effect
  var guessSSE=initGuessSSE;
  console.log("\n\nSSEfunc: guessSSE=",guessSSE);
  var sol1_SSEfunc = fmin.conjugateGradient(SSEfunc, guessSSE);

  guessSSE=[initGuessSSE[0], initGuessSSE[1], initGuessSSE[2]];
  console.log("\nSSEfunc: guessSSE=",guessSSE);
  var sol2_SSEfunc = fmin.nelderMead(SSEfunc, guessSSE);

  guessSSE=[initGuessSSE[0], initGuessSSE[1], initGuessSSE[2]];
  console.log("\nSSEfunc: guessSSE=",guessSSE);
  var sol3_SSEfunc = fmin.gradientDescent(SSEfunc, guessSSE);
  console.log("  conjugateGradient: ",
	      "\n  sol1_SSEfunc=",sol1_SSEfunc.x,
	      " func=",SSEfunc(sol1_SSEfunc.x));

  // function arg fbeta only needed if side effect=calc fbeta wanted

  console.log("  nelderMead: ",
	      "\n  sol2_SSEfunc=",sol2_SSEfunc.x,
	      " func=",SSEfunc(sol2_SSEfunc.x,fbeta), // fbeta optional
	      "  \ngradient=",fbeta);

  console.log("  gradientDescent (not working, not for bananaFunc as well): ",
	      "\n  sol3_SSEfunc=",sol3_SSEfunc.x);

  console.log("\n\nSpeed: ");
  console.log("before 10000*fmin.conjugateGradient(SSEfunc, guessSSE)");
  for(var i=0; i<10000; i++){
    guessSSE=[initGuessSSE[0], initGuessSSE[1], initGuessSSE[2]];
    sol1_SSEfunc = fmin.conjugateGradient(SSEfunc, guessSSE);
  }
  console.log("\nafter conjugateGradient, before 10000*nelderMead");
  for(var i=0; i<10000; i++){
    guessSSE=[initGuessSSE[0], initGuessSSE[1], initGuessSSE[2]];
    sol2_SSEfunc = fmin.nelderMead(SSEfunc, guessSSE);
  }
  console.log("\nafter nelderMead");

}

