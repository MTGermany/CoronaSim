#!/bin/bash


#####################################################################
# get data from the github website
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


upload2public_html.sh
