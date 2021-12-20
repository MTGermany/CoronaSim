

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
# Beispiele fuer Funktionen 
##############################################################

max(x,y)    = (x>y) ? x : y
min(x,y)    = (x>y) ? y : x

set term pngcairo enhanced color notransparent crop font "Helvetica,12"

# groesseres Oututbild. Ueberschreibt "set size", einige Bugs bei clipping
#set term pngcairo enhanced color notransparent crop\
# font "Helvetica, 14" size 1000,600 

##############################################################
set out "2021_12_20_DK_abs.png"
print "plotting 2021_12_20_DK_abs.png"
##############################################################

set key box top left
set xlabel "Days since 2021-12-01"
set ylabel "Confirmed cases"

plot\
  "2021_12_20_Daenemark.dat" u ($0-8):($2-$3) t "Delta" w lp ls 1,\
  "2021_12_20_Daenemark.dat" u ($0-8):($3) t "Omicron" w lp ls 2


##############################################################
set out "2021_12_20_DK_rel.png"
print "plotting 2021_12_20_DK_rel.png"
##############################################################

t2=14 #2021-12-14
t1=2  #2021-12-02

p2=0.387-0.02; y2=p2/(1-p2)
p1=0.013+0.001; y1=p1/(1-p1)

r=(log(y2)-log(y1))/(t2-t1)

ysim(t)=y1*exp(r*(t-t1))
psim(t)=ysim(t)/(1+ysim(t))

set ylabel "Fraction Omicron [%]"
set label sprintf("Growth rate r=%.2f days^{-1}",r)\
 at screen 0.3,0.77
set label sprintf("Doubling time ln(2)/r=%.2f days",log(2)/r)\
 at screen 0.3,0.7

plot[t=-8:15]\
  "2021_12_20_Daenemark.dat" u ($0-8):(100*$3/$2) t "Data" w p ls 2,\
  t, 100*psim(t) t "Logistic fit" w l ls 2

print "r=",r
print "doubling time dt=log(2)/r=",log(2)/r





