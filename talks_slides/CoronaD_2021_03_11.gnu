


###############################################
# dashed no longer works (2020)
###############################################

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

set style line 11 lt 1 lw 3 pt 7 ps 1.9  lc rgb "#000000" 
set style line 12 lt 1 lw 3 pt 2 ps 1.5 dt 2 lc rgb "#CC0022" 
set style line 13 lt 8 lw 3 pt 4 ps 1.2  lc rgb "#FF3300"
set style line 14 lt 6 lw 3 pt 4 ps 1.5  lc rgb "#FFAA00"
set style line 15 lt 1 lw 3 pt 5 ps 1.5  lc rgb "#00DD22"
set style line 16 lt 5 lw 3 pt 7 ps 1.5  lc rgb "#00AAAA"
set style line 17 lt 1 lw 3 pt 7 ps 1.5  lc rgb "#1100FF"
set style line 18 lt 4 lw 3 pt 8 ps 1.5  lc rgb "#220088"
set style line 19 lt 7 lw 3 pt 9 ps 1.5  lc rgb "#999999"



##############################################################
# Beispiele fuer Funktionen 
##############################################################

max(x,y)    = (x>y) ? x : y
min(x,y)    = (x>y) ? y : x
mod(x,interval)=x-(floor(x/interval)*interval) # x%interval for reals
round(x) = x - floor(x) < 0.5 ? floor(x) : ceil(x)
filterData(data,number)=(data==number) ? 1 : NaN


##############################################################
#set term post eps enhanced color solid "Helvetica" 20
#set term png notransparent truecolor medium font "Helvetica, 12"
set term pngcairo enhanced color notransparent crop font "Helvetica, 12" #better
#set term post eps enhanced color dashed "Helvetica" 20
# set out "test.eps"
# set out "test.png"
# Ubuntu18: bug with wide line ending in png. workaround: set samples 300
##############################################################

y(p)=p/(1.-p)
p(y)=y/(1+y)
rycalc(dDays, pOld, pNew)=1./dDays*log(y(pNew)/y(pOld))
ratioMutWildcalc(tauR, dDays, pOld, pNew)=tauR*rycalc(dDays, pOld, pNew)+1
R0wildcalc(R0,p,ratioMutWild)=R0/(1+p*(ratioMutWild-1))
yTime(t,ry,t0,y0)=y0*exp(ry*((t-t0)/86400))
pTime(t,ry,t0,p0)=p(yTime(t,ry,t0,y(p0)))
R0(R0wild, R0mut,p)=(1-p)*R0wild+p*R0mut


sec2021_01_01=(51*365+13)*86400 # seconds since 1970-01-01:00:00

sec2021_02_11=sec2021_01_01+41*86400
sec2021_03_04=sec2021_01_01+62*86400
dt=(sec2021_03_04-sec2021_02_11)/86400

pold=0.176
pnew=0.460
told=sec2021_02_11
tnew=sec2021_03_04
tPresent=sec2021_03_04+8*86400
R0present=2.01
tauR=7


ry=rycalc(dt, pold, pnew)
ratioMutWild=ratioMutWildcalc(tauR, dt, pold, pnew)
pPresent=pTime(tPresent,ry,told,pold)
R0wild=R0wildcalc(R0present,pPresent,ratioMutWild)
R0mut=R0wild*ratioMutWild
print "ry=",ry

##############################################################
# Time Format using internal Gnuplot-Time seconds since 01.01.1970
##############################################################



set out "p117.png"
print "plotting p117.png"
set xdata time
#set format x '%d.%m.%Y'         #21.03.2021
#set format x '%d.%m.,%H:00'     #21.03,00:00
set format x '%d.%m'     #21.03
tmin=sec2021_01_01
tmax=sec2021_03_04+40*86400

print "pTime(told,ry,told,pold)=",pTime(told,ry,told,pold)
print "pTime(tmax,ry,told,pold)=",pTime(tmax,ry,told,pold)
set xtics 86400*14
set key box top left
set xlabel "Zeit"
set ylabel "B.1.1.7-Anteile und Gesamt-R_0-Wert"
plot [t=tmin:tmax]\
 t, 100*pTime(t,ry,told,pold) t "Anteil B.1.1.7 [%]" w l ls 7,\
 t, 100*(R0(R0wild, R0mut, pTime(t,ry,told,pold))/R0wild-1)\
    t "Anstieg R_0/R_{0,wild}-1 [%]" w l ls 2,\
 tPresent, 100*(t-tmin)/(tmax-tmin) t "Gegenwart" w l ls 11

quit








##############################################################
# revert;
# !!! must do ALL xdata and format, xtics and xrange !!!
# check with show xdata; show format; show xtics
##############################################################

set xdata; set format; set xtics auto; set auto x
set out "testRevertNormal.png"
print "plotting testRevertNormal.png"
plot [t=0:42]\
 t, 2*t t "test" w l ls 2









##############################################################
#String-Konstanten:
##############################################################

#strParams=sprintf("lveh=%1.1f, v0=%1.0f, T=%1.1f, s0=%1.1f, s1=%1.1f, delta=%i",\
 lveh,v0,T,s0,s11,delta)
