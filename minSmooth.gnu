

set term pngcairo enhanced color notransparent crop\
 font "Helvetica, 14" size 1000,600 

set out "minSmooth.png"; print "plotting minSmooth.png"
set noparam

minSmooth(x,xmax,r)=(x<xmax) ? x\
    : (x>xmax*(1+2*r)) ?  xmax*(1+r)\
    : xmax+(x-xmax)*(1-0.25*(x-xmax)/(r*xmax))

plot[x=0:2] minSmooth(x,1,0.2)