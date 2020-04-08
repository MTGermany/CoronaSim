#!/bin/bash

target=$HOME/public_html/CoronaSim

cp -r *.css *.js *.html figs $target
chmod 604 `find $target -type f`
chmod 701 `find $target -type d` 

echo "copied simulation to $target use upload2ionos.sh there"
