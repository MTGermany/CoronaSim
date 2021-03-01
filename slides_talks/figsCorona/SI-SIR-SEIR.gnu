

##########################################################
# Line- und Punkttypen 
##########################################################

# MT 2020-03: Nun automatisch in ~/.gnuplot initfile

# set style line: linetype lt, point type pt

#gnuplot Ubuntu 18, Mai2019, Punkttypen
# pt 1:  +
# pt 2:  X
# pt 3:  hairs
# pt 4:  openSquare
# pt 5:  closedSquare
# pt 6:  ring
# pt 7:  bullet
# pt 8:  open upTriang
# pt 9:  closed upTriang
# pt 10: open downTriang
# pt 11: closed downTriang

# NEW 2020: post eps dashed no longer works but dashtype (dt) in ls
# specs! dt 1 = solid
# ex: set style line 2 lt 1 lw 2 pt 9 ps 1.5 dt 2 lc rgb "#CC0022"
# !! error on Ubuntu12=> not yet officially with dt

 
##############################################################
# Beispiele fuer Funktionen 
##############################################################

max(x,y)    = (x>y) ? x : y
min(x,y)    = (x>y) ? y : x
mod(x,interval)=x-(floor(x/interval)*interval) # x%interval for reals

##############################################################
# plotting
##############################################################

#set term post eps enhanced color solid "Helvetica" 20
set term pngcairo enhanced color notransparent crop font "Helvetica, 12"
set title font "Helvetica bold, 14"

##############################################################
# SI model
##############################################################

tmax=200  # days

set out "modelSI.png"
print "ploting modelSI.png"
set title "SI model, {/Symbol b}=0.1/day, I(0)=0.1%"
set xlabel "Time [days]"
set xrange [0:tmax]
set ylabel "percentage [%]"
set key

plot\
  "sim/modelSI.dat" u 1:(100*$2) t "Susceptible (S)" w l ls 7,\
  "sim/modelSI.dat" u 1:(100*$3) t "Infected (I)" w l ls 2


##############################################################
# SIR model
##############################################################

set out "modelSIR.png"
print "ploting modelSIR.png"
set title "SIR model, {/Symbol b}=0.2/day, {/Symbol g}=0.1/day =>R_0=2,     I(0)=0.1%"


plot\
  "sim/modelSIR.dat" u 1:(100*$2) t "Susceptible (S)" w l ls 7,\
  "sim/modelSIR.dat" u 1:(100*$3) t "Infected (I)" w l ls 2,\
  "sim/modelSIR.dat" u 1:(100*$4) t "Recovered/removed (R)" w l ls 5



##############################################################
# SEIR model
##############################################################

set xrange [0:tmax]
set out "modelSEIR.png"
print "ploting modelSEIR.png"
set title "SEIR, {/Symbol b}=0.4/day, {/Symbol g}={/Symbol a}=0.2/day =>R_0=2, E(0)=I(0)=0.1%"


plot\
  "sim/modelSEIR.dat" u 1:(100*$2) t "Susceptible (S)" w l ls 7,\
  "sim/modelSEIR.dat" u 1:(100*$3) t "Exposed (E)" w l ls 3,\
  "sim/modelSEIR.dat" u 1:(100*$4) t "Infected (I)" w l ls 2,\
  "sim/modelSEIR.dat" u 1:(100*$5) t "Recovered/removed (R)" w l ls 5



##############################################################
# SEIR model season
##############################################################

set out "modelSEIRseason.png"
print "ploting modelSEIRseason.png"

set size 1,0.85
set key top left

set xlabel "Time [days] since March01"
set xrange [0:480]
set ylabel "S,E,I, and R" offset 1,0
set yrange [0:4]
set y2label "R_0" offset -1,0
set y2range [0:4]
set y2tics
set title "SEIR model, {/Symbol b}={/Symbol g}R_0(t), {/Symbol g}={/Symbol a}=0.2/day,     E(0)=I(0)=0.1%"


plot\
  "sim/modelSEIRseason.dat" u 1:(1*$6)\
     t "Reproduction rate R_0" w l axes x1y2 ls 11,\
  "sim/modelSEIRseason.dat" u 1:(1*$2) t "Susceptible (S)" w l ls 7,\
  "sim/modelSEIRseason.dat" u 1:(100*$3) t "100*Exposed (E)" w l ls 3,\
  "sim/modelSEIRseason.dat" u 1:(100*$4) t "100*Infected (I)" w l ls 2,\
  "sim/modelSEIRseason.dat" u 1:(1*$5) t "Recovered/removed (R)" w l ls 5




##############################################################
# SIR iterated map
##############################################################

set size 1,0.9

set out "modelSIRiterated.png"
print "ploting modelSIRiterated.png"
set title "SIR iterated, {/Symbol t}_I=7 days, {/Symbol t}_R=18 days, I_t=0.001 for t<{/Symbol t}_I

set key top right

unset y2label
unset y2tics
set auto y

set xlabel "Time [days]"
set xrange [0:200]
set ylabel "S, I, R [%]"

plot\
  "sim/modelSIRiterated.dat" u 1:(100*$2) t "Susceptible (S)" w l ls 7,\
  "sim/modelSIRiterated.dat" u 1:(100*$3) t "Infected (I)" w l ls 2,\
  "sim/modelSIRiterated.dat" u 1:(100*$4) t "Recovered/removed (R)" w l ls 5

