#!/bin/bash

target=$HOME/public_html/CoronaSim

# make 2 versions live (normal) and nonlive


cp corona.js tmp.js
perl -i -p -e 's/var useLiveData=true/var useLiveData=false/g' tmp.js
cp tmp.js $target/coronaNonlive.js
perl -i -p -e 's/var useLiveData=false/var useLiveData=true/g' tmp.js
cp tmp.js $target/corona.js

cp index.html indexNonlive.html
perl -i -p -e 's/corona\.js/coronaNonlive\.js/g' indexNonlive.html

cp corona_gui.js console-log-html.min.js $target
cp -r *.html *.css figs $target
# cp data/coronaWorldwide.json data/github.json $target/data
cp data/githubWithTests.json data/github.json $target/data
cp fmin/fmin.min.js fmin/LICENSE $target/fmin
cp fmin/examples/*.html  $target/fmin/examples
cp fmin/examples/*.js  $target/fmin/examples
cp mathjs/* $target/mathjs

chmod 604 `find $target -type f`
chmod 701 `find $target -type d` 

echo "copied simulation to $target"
