#!/bin/bash

#####################################################################
# get data from the covid.ourworldindata website
#####################################################################

# first link recommended but does not allow wget
# wget https://covid.ourworldindata.org/data/owid-covid-data.json

#wget https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.json --output-document=data/githubWithTests.json
#cp data/githubWithTests.json data/githubWithTests_orig.json


cp data/githubWithTests_orig.json data/githubWithTests.json

# delete irrelevant/redundant data lines

perl -i -p -e 's/^.*new_.*\n//g' data/githubWithTests.json
perl -i -p -e 's/^.*_per_.*\n//g' data/githubWithTests.json
perl -i -p -e 's/^.*tests_units.*\n//g' data/githubWithTests.json
perl -i -p -e 's/^.*stringency_index.*\n//g' data/githubWithTests.json

# separate countries in lines: make a single line and use the pattern
# "]    }," at the end of a countrie's entry to make one line per country


perl -i -p -e 's/\n//g' data/githubWithTests.json # make a single line
perl -i -p -e 's/\]    \}\,/\]    \},\n/g' data/githubWithTests.json

# filter countries

grep Germany data/githubWithTests.json > data/tmp.json
 grep Austria data/githubWithTests.json >> data/tmp.json
 grep Czech data/githubWithTests.json >> data/tmp.json
 grep France data/githubWithTests.json >> data/tmp.json
 grep "United Kingdom" data/githubWithTests.json >> data/tmp.json
 grep Italy data/githubWithTests.json >> data/tmp.json
 grep Poland data/githubWithTests.json >> data/tmp.json
 grep Spain data/githubWithTests.json >> data/tmp.json
 grep Sweden data/githubWithTests.json >> data/tmp.json
 grep Switzerland data/githubWithTests.json >> data/tmp.json
 grep India data/githubWithTests.json >> data/tmp.json
 grep Russia data/githubWithTests.json >> data/tmp.json
 grep USA data/githubWithTests.json >> data/tmp.json

# add variable name and neceesary '  ' between rhs of var

sed -e "1i\dataGitLocalTests=\'\{" data/tmp.json > data/tmp2.json
echo "}'" >> data/tmp2.json

# first remove newlines

perl -i -p -e 's/\n//g' data/tmp2.json

# remove commas before } and much space after {

perl -i -p -e "s/\,(\s*)\}/\}/g"  data/tmp2.json
perl -i -p -e "s/\{(\s*)/\{/g"  data/tmp2.json


#perl -i -p -e 's/\n//g' data/tmp2.json
rm data/tmp.json
mv data/tmp2.json data/githubWithTests.json
# tail }        ]    }}'

exit

#####################################################################
# get data w/o test from another github website
#####################################################################

wget https://pomber.github.io/covid19/timeseries.json --output-document=data/github.json
#cp data/github.json.orig data/github.json

# separate countries in lines: all lines off, then ] => ]\n

perl -i -p -e 's/\n//g' data/github.json
perl -i -p -e 's/\]\,/\],\n/g' data/github.json

# filter countries

grep Germany data/github.json > data/tmp.json
grep Austria data/github.json >> data/tmp.json
grep Czechia data/github.json >> data/tmp.json
grep France data/github.json >> data/tmp.json
grep "United Kingdom" data/github.json >> data/tmp.json
grep Italy data/github.json >> data/tmp.json
grep Poland data/github.json >> data/tmp.json
grep Spain data/github.json >> data/tmp.json
grep Sweden data/github.json >> data/tmp.json
grep Switzerland data/github.json >> data/tmp.json
grep India data/github.json >> data/tmp.json
grep Russia data/github.json >> data/tmp.json
grep US data/github.json >> data/tmp.json

# add variable name and neceesary '  ' between rhs of var

sed -e "1i\dataGitLocal=\'\{" data/tmp.json > data/tmp2.json
echo "}'" >> data/tmp2.json

# remove last comma

perl -i -p -e 's/\n//g' data/tmp2.json
perl -i -p -e "s/\]\,\}/\]\}/g"  data/tmp2.json
rm data/tmp.json
mv data/tmp2.json data/github.json

# tail  }  ]}'
upload2public_html.sh

exit


#####################################################################
# get data from the eu opendata website
#####################################################################

# get data. For some strange reason, target name needs to be entered twice

wget https://opendata.ecdc.europa.eu/covid19/casedistribution/json/ --output-document=data/coronaWorldwide.json

# transform from DOS to unix text

perl -pi -e 's/\r\n/\n/g' data/coronaWorldwide.json

# aus irgendeinem FUCK Grund erkennt perl \n mit folgenden string nicht
# => Brute force mit nochmal alle \n weg

perl -i -p -e 's/\n//g' data/coronaWorldwide.json

perl -i -p -e 's/\}\,\s+\{/\}\,\n\{/g' data/coronaWorldwide.json
grep Germany data/coronaWorldwide.json > data/tmp

sed -e '1i\data=[' data/tmp > data/coronaWorldwide.json
perl -i -p -e "s/data=\[/data=\'\[/g" data/coronaWorldwide.json
echo "]'" >> data/coronaWorldwide.json
perl -i -p -e "s/\n//g" data/coronaWorldwide.json

perl -i -p -e 's/\}\,\]/\}\]/g' data/coronaWorldwide.json


