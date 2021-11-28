
# (jan14)
# full statistic definitions now in gnuTemplate_fullStatistics.gnu!

############ Keywords ####################
# dashed Ubuntu 18 (=> dashtype) and before
# String-Konstanten
# Beliebig rotierte Labels
# rotierte Bilder
# Time Format using internal Gnuplot-Time: time_second in hh:mm etc
# Time Format using gnuplot's "set timefmt":  yyyymmdd -> Mar 18  Apr 18 etc
# String-Variablen
# (Labels mit) beliebige(n) rechteckige Boxen
# Defined clippings (to eliminate clipping bugs)
# rgba-Farben
# Colored palette plots and single-color 2d plots in one
# Make .dat files
# Vector fields
# Baender analyt Fkt im Param-Mode (mit Daten analog)
# Box-Styles
# Skalierung/Autoskalierung ohne zusaetzlichen Raum bis Tick-Vielfaches
# candlesticks
# Datenfiltern, auch mit lines
##########################################

# TODO check "palette" linestyle in 2 d plots; general procedure


# von  ~/info/gnuTemplate.gnu
# siehe auch
# ~/info/gnuplot,   
# ~/info/gnuTemplate42.gnu,  
# ~/info/gnuColoredContour/*.gnu

# http://www.gnuplot.info/docs_4.2/
# http://www.gnuplot.info/
# http://gnuplot.sourceforge.net/demo_4.6/


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

#####################################################################
# dashed now explicit with dt (implicit over "dashed" + ls no longer works)
######################################################################

# post eps dashed no longer works but dashtype (dt) in ls
# specs! dt 1 = solid
 
set style line 1 lt 1 lw 2 pt 7 ps 1.9 dt 1 lc rgb "#000000" #schwarz, bullet
set style line 2 lt 1 lw 2 pt 9 ps 1.5 dt 1 lc rgb "#CC0022" #closedUpTriang
set style line 3 lt 1 lw 2 pt 4 ps 1.2 dt 1 lc rgb "#FF3300" #closedSquare
set style line 4 lt 1 lw 2 pt 4 ps 1.5 dt 1 lc rgb "#FFAA00" #gelb,
set style line 5 lt 1 lw 2 pt 5 ps 1.5 dt 1 lc rgb "#00DD22" #gruen,
set style line 6 lt 1 lw 2 pt 4 ps 1.5 dt 1 lc rgb "#00AAAA"
set style line 7 lt 1 lw 2 pt 4 ps 2.0 dt 7 lc rgb "#1100FF" #blau,
set style line 8 lt 1 lw 2 pt 8 ps 1.5 dt 1 lc rgb "#220088"
set style line 9 lt 1 lw 2 pt 9 ps 1.5 dt 9 lc rgb "#999999" #grau

set style line 11 lt 1 lw 6 pt 7 ps 1.9  lc rgb "#000000" 
set style line 12 lt 1 lw 6 pt 2 ps 1.5 dt 2 lc rgb "#CC0022" 
set style line 13 lt 8 lw 6 pt 4 ps 1.2  lc rgb "#FF3300"
set style line 14 lt 6 lw 6 pt 4 ps 1.5  lc rgb "#FFAA00"
set style line 15 lt 1 lw 6 pt 5 ps 1.5  lc rgb "#00DD22"
set style line 16 lt 5 lw 6 pt 7 ps 1.5  lc rgb "#00AAAA"
set style line 17 lt 1 lw 6 pt 7 ps 1.5  lc rgb "#1100FF"
set style line 18 lt 4 lw 6 pt 8 ps 1.5  lc rgb "#220088"
set style line 19 lt 7 lw 6 pt 9 ps 1.5  lc rgb "#999999"




##############################################################
#set term post eps enhanced color solid "Helvetica" 20
#set term png notransparent truecolor medium font "Helvetica, 12"
#set term pngcairo enhanced color notransparent crop font "Helvetica,12" #better

# groesseres Oututbild. Ueberschreibt "set size", einige Bugs bei clipping
set term pngcairo enhanced color notransparent crop\
 font "Helvetica, 14" size 1000,600 
##############################################################

# Ubuntu18: bug with wide line ending in png. workaround: set samples 300


##############################################################
set out "efficiency.png"
print "plotting efficiency.png"
##############################################################

I0=0.80     # initial efficiency (including effect of previous vacc)
Imax=0.88   # max efficiency
tauIncrease=25   # approx time where max efficiency approx Imax reached
tauHalf=180 # time after vacc where waning is strongest
dtau=40     # typical half-timescale of waning of efficiency

I0boost=0.40
ImaxBoost=0.92
tauIncreaseBoost=14

efficiencyInfectFun(x)=(I0-Imax)*exp(-x/tauIncrease)\
+Imax*(1+exp((0-tauHalf)/dtau)) / (1+exp((x-tauHalf)/dtau));


#efficiencyInfectBoosterFun(x)=(I0boost-ImaxBoost)*exp(-x/tauIncreaseBoost)\
#+ImaxBoost*(1+exp((0-tauHalf)/dtau)) / (1+exp((x-2*tauHalf)/(2*dtau)))

## two tanh functions



efficiencyInfectBoosterFun(x)=I0boost\
+0.5*(ImaxBoost-I0boost)\
*(tanh(2*(x-0.5*tauIncreaseBoost)/tauIncreaseBoost)+1)\
+ImaxBoost*((1+exp((0-tauHalf)/dtau)) / (1+exp((x-2*tauHalf)/(2*dtau)))-1)



set noparam
set key

set xlabel "Days since full vaccination or booster"
set xrange [0:300]
set xtics 30
set ylabel "Vaccine effectiveness (infectious infection)"
#set yrange [0:1]

plot\
  efficiencyInfectFun(x) t "Vaccinations" w l ls 2,\
  efficiencyInfectBoosterFun(x) t "Boosters" w l ls 4

