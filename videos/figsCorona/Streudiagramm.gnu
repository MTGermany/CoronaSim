
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
set style line 2 lt 1 lw 2 pt 9 ps 2.5 dt 1 lc rgb "#CC0022" #closedUpTriang
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

set term pngcairo enhanced color notransparent crop\
 font "Helvetica, 14" size 1000,600 

filter(x,val)=(x==val) ? 1 : NaN

##############################################################
set out "2021_11_19_full.png"
print "plotting 2021_11_19_full.png"
##############################################################


set noparam
#set key box at screen 0.42,0.94
set key box top left
set xlabel "Fully vaccinated [%]"
set ylabel "Weekly incidence [cases/100 000]"
set yrange [0:1060]
plot\
  "2021_11_19_Impfquote-Inzidenz.csv" u ($3):($6) t "" w p ls 2

##############################################################
set out "2021_11_19_full_coded.png"
print "plotting 2021_11_19_full_coded.png"
##############################################################

dx=-2
dy=50
set label "Germany"  at 70.6+1.4*dx,370+dy textcolor rgb "#ff0000"
set label "Austria"  at 65.6+dx,1000-0.8*dy textcolor rgb "#ff0000"
set label "Poland"   at 51.8+dx,300+dy  textcolor rgb "#ff0000"
set label "Czechia"  at 57.0+dx,820+dy   textcolor rgb "#ff0000"

set label "Israel"   at 67.6+dx,40+dy   textcolor rgb "#0000cc"
set label "India"    at 49+dx,8+dy      textcolor rgb "#0000cc"
set label "Russia"   at 33.8+dx, 180+dy textcolor rgb "#0000cc"
set label "USA"      at 66+dx,200+dy    textcolor rgb "#0000cc"
set label "S-Africa" at 21.8+dx,1+dy    textcolor rgb "#0000cc"

plot\
  "2021_11_19_Impfquote-Inzidenz.csv" u (filter($2,0)*$3):($6)\
    t "traffic-simulation.de Europa" w p ls 2,\
  "2021_11_19_Impfquote-Inzidenz.csv" u (filter($2,1)*$3):($6)\
    t "restliche Laender" w p ls 7

##############################################################
set out "2021_11_19_europa.png"
print "plotting 2021_11_19_europa.png"
##############################################################

set param
set key top right
unset label
xmin=50
xmax=90
set xrange [xmin:xmax]

plot[t=0:1]\
  "2021_11_19_Impfquote-Inzidenz.csv" u (filter($2,0)*$3):($6)\
    t "traffic-simulation.de Europa" w p ls 2,\
  xmin+t*(xmax-xmin), 870-920*t t "Linear Fit" w l ls 2
