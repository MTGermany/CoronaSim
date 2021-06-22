

#####################################################################
# dashed now explicit with dt (implicit over "dashed" + ls no longer works)
######################################################################

# post eps dashed no longer works but dashtype (dt) in ls
# specs! dt 1 = solid
 
set style line 1 lt 1 lw 2 pt 7 ps 1.9 dt 1 lc rgb "#000000" #schwarz, bullet
set style line 2 lt 1 lw 2 pt 9 ps 1.5 dt 1 lc rgb "#FF0000" #closedUpTriang
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
# Beispiele fuer Funktionen 
##############################################################

max(x,y)    = (x>y) ? x : y
min(x,y)    = (x>y) ? y : x
mod(x,interval)=x-(floor(x/interval)*interval) # x%interval for reals
round(x) = x - floor(x) < 0.5 ? floor(x) : ceil(x)


set term pngcairo enhanced color notransparent crop\
 font "Helvetica, 14" size 1000,600


##############################################################
set out "figsCorona/ageProfile3_ger.png"; print "plotting figsCorona/ageProfile3_ger.png"
##############################################################

f=1./1.7  # normalize percentage of deaths

# geht nur mit png, nicht eps
# png kann ruhig "notransparent" sein; betrifft nur Hintergrund
# rgba-Farben mit rgb "aarrggbb", NICHT rgba "aarrggbb" oder rgba "rrggbbaa"

set xlabel "Age [Years]" offset -2,0.6
set xrange [0:100]
set ylabel "|" offset 0,-1.7
set label 1 "Percentage m+f [%]" at screen 0.02,0.14 rotate by 90
set label 2 "IFR / IFR_{65},   Sterbeanteil" at screen 0.02,0.6 rotate by 90
set yrange [-33:50]
set key top left
#set size 1,0.9

plot[t=0:100]\
 "CoronaD_2021_03_Altersabh.dat" u (0.5*($1+$2)):(-$3) : (5)\
    t "Altersstruktur Deutschland  " with boxes fs solid 0.5 ls 8,\
 "CoronaD_2021_03_Altersabh.dat" u (0.5*($1+$2)):($4) : (7)\
    t "IFR / IFR_{65}" with boxes ls 2 fs transparent solid 0.5,\
 "CoronaD_2021_03_Altersabh.dat" u (0.5*($1+$2)):(f*$3*$4) : (5)\
    t "Anteil an den Covid19-Toten"\
    with boxes ls 1 fs transparent solid 0.50,\
    t,0 t "" w l ls 1


##############################################################
set out "figsCorona/ageProfile1_ger.png"; print "plotting figsCorona/ageProfile1_ger.png"
plot[t=0:100]\
 "CoronaD_2021_03_Altersabh.dat" u (0.5*($1+$2)):(-$3) : (5)\
    t "Altersstruktur Deutschland  " with boxes fs solid 0.5 ls 8,\
 t,0 t ""  w l ls 1

##############################################################
set out "figsCorona/ageProfile2_ger.png"; print "plotting figsCorona/ageProfile2_ger.png"
plot[t=0:100]\
 "CoronaD_2021_03_Altersabh.dat" u (0.5*($1+$2)):(-$3) : (5)\
    t "Altersstruktur Deutschland  " with boxes fs solid 0.5 ls 8,\
 "CoronaD_2021_03_Altersabh.dat" u (0.5*($1+$2)):($4) : (7)\
    t "IFR / IFR_{65}" with boxes ls 2 fs transparent solid 0.5,\
 t,0 t ""  w l ls 1

##############################################################

filterData(data,number)=(data<number) ? 1 : NaN
reduceData(data,number,fact)=(data<number) ? 1 : fact

set out "figsCorona/ageProfile4_ger.png"; print "plotting figsCorona/ageProfile4_ger.png"

plot[t=0:100]\
 "CoronaD_2021_03_Altersabh.dat" u (0.5*($1+$2)):(-$3)\
    : (5) t "Altersstruktur Deutschland  " with boxes fs solid 0.5 ls 8,\
 "CoronaD_2021_03_Altersabh.dat" u (0.5*($1+$2)):($4)\
    : (7) t "IFR / IFR_{65}" with boxes ls 2 fs transparent solid 0.5,\
 "CoronaD_2021_03_Altersabh.dat" u (0.5*($1+$2)):(f*$3*$4)\
    : (5*filterData($0,7))\
    t "Anteil an den Covid19-Toten" with boxes ls 1 fs transparent solid 0.50,\
 t,0 t ""  w l ls 1



##############################################################
set out "figsCorona/ageProfile5_ger.png"; print "plotting figsCorona/ageProfile5_ger.png"

plot[t=0:100]\
 "CoronaD_2021_03_Altersabh.dat" u (0.5*($1+$2)):(-$3)\
    : (5) t "Altersstruktur Deutschland  " with boxes fs solid 0.5 ls 8,\
 "CoronaD_2021_03_Altersabh.dat" u (0.5*($1+$2)):($4)\
    : (7) t "IFR / IFR_{65}" with boxes ls 2 fs transparent solid 0.5,\
 "CoronaD_2021_03_Altersabh.dat" u (0.5*($1+$2)):(f*$3*$4)\
    : (5*filterData($0,6))\
    t "Anteil an den Covid19-Toten" with boxes ls 1 fs transparent solid 0.50,\
 t,0 t ""  w l ls 1


##############################################################
set out "figsCorona/ageProfile6_ger.png"; print "plotting figsCorona/ageProfile6_ger.png"

plot[t=0:100]\
 "CoronaD_2021_03_Altersabh.dat" u (0.5*($1+$2)):(-$3)\
    : (5) t "Altersstruktur Deutschland  " with boxes fs solid 0.5 ls 8,\
 "CoronaD_2021_03_Altersabh.dat" u (0.5*($1+$2)):($4)\
    : (7) t "IFR / IFR_{65}" with boxes ls 2 fs transparent solid 0.5,\
 "CoronaD_2021_03_Altersabh.dat" u (0.5*($1+$2)):(f*$3*$4)\
    : (5*filterData($0,5))\
    t "Anteil an den Covid19-Toten" with boxes ls 1 fs transparent solid 0.50,\
 t,0 t ""  w l ls 1


##############################################################
set out "figsCorona/ageProfile7_ger.png"; print "plotting figsCorona/ageProfile7_ger.png"

plot[t=0:100]\
 "CoronaD_2021_03_Altersabh.dat" u (0.5*($1+$2)):(-$3)\
    : (5) t "Altersstruktur Deutschland  " with boxes fs solid 0.5 ls 8,\
 "CoronaD_2021_03_Altersabh.dat" u (0.5*($1+$2)):($4)\
    : (7) t "IFR / IFR_{65}" with boxes ls 2 fs transparent solid 0.5,\
 "CoronaD_2021_03_Altersabh.dat" u (0.5*($1+$2)):(f*$3*$4)\
    : (5*filterData($0,4))\
    t "Anteil an den Covid19-Toten" with boxes ls 1 fs transparent solid 0.50,\
 t,0 t ""  w l ls 1

##############################################################
set out "figsCorona/ageProfile8_ger.png"; print "plotting figsCorona/ageProfile8_ger.png"

plot[t=0:100]\
 "CoronaD_2021_03_Altersabh.dat" u (0.5*($1+$2)):(-$3)\
    : (5) t "Altersstruktur Deutschland  " with boxes fs solid 0.5 ls 8,\
 "CoronaD_2021_03_Altersabh.dat" u (0.5*($1+$2)):($4)\
    : (7) t "IFR / IFR_{65}" with boxes ls 2 fs transparent solid 0.5,\
 "CoronaD_2021_03_Altersabh.dat" u (0.5*($1+$2)):(f*$3*$4)\
    : (5*filterData($0,3))\
    t "Anteil an den Covid19-Toten" with boxes ls 1 fs transparent solid 0.50,\
 t,0 t ""  w l ls 1

##############################################################
set out "figsCorona/ageProfile9_ger.png"; print "plotting figsCorona/ageProfile9_ger.png"

plot[t=0:100]\
 "CoronaD_2021_03_Altersabh.dat" u (0.5*($1+$2)):(-$3) : (5)\
    t "Altersstruktur Deutschland  " with boxes fs solid 0.5 ls 8,\
 "CoronaD_2021_03_Altersabh.dat" u (0.5*($1+$2)):($4) : (7)\
    t "IFR / IFR_{65}" with boxes ls 2 fs transparent solid 0.5,\
 "CoronaD_2021_03_Altersabh.dat" u (0.5*($1+$2))\
    :(reduceData($0,3,0.2)*f*$3*$4):(5)\
    t "Anteil an den Covid19-Toten"\
    with boxes ls 1 fs transparent solid 0.50,\
    t,0 t "" w l ls 1





