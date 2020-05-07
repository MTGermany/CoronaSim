#!/bin/bash

target=$HOME/public_html/CoronaSim

cp -r *.css *.js *.html figs $target
cp data/coronaWorldwide.json data/github.json $target/data
cp fmin/fmin.min.js fmin/LICENSE $target/fmin
cp fmin/examples/*.html  $target/fmin/examples
cp fmin/examples/*.js  $target/fmin/examples

chmod 604 `find $target -type f`
chmod 701 `find $target -type d` 

echo "copied simulation to $target use upload2ionos.sh there"
