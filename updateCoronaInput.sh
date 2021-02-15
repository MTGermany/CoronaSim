#!/bin/bash

# get local data from some Saxony Landkreise

echo ""; echo "getting RKI Landkreis data ..."
updateLandkreisData.sh


#####################################################################
# get data from the covid.ourworldindata website
#####################################################################

# this link recommended but does not allow wget
# wget https://covid.ourworldindata.org/data/owid-covid-data.json


echo ""; echo "getting OWID data for tests ..."

wget https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.json --output-document=data/githubWithTests.json

cp data/githubWithTests.json data/githubWithTests_orig.json


 #only development!
# cp data/githubWithTests_orig.json data/githubWithTests.json 



# first make line for each country in order to select
# >=2021-01-11: now a single line !!

perl -i -p -e 's/\}\]\}\,/\}\]\},\n/g' data/githubWithTests.json

################################
# select countries OWID
################################

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
grep GRC data/githubWithTests.json >> data/tmp.json
grep ISR data/githubWithTests.json >> data/tmp.json
grep India data/githubWithTests.json >> data/tmp.json
grep Russia data/githubWithTests.json >> data/tmp.json
grep USA data/githubWithTests.json >> data/tmp.json
grep AUS data/githubWithTests.json >> data/tmp.json

################################
# filter useless entries OWID
################################

# make each day a line for elimination
perl -i -p -e 's/\}\,/},\n/g' data/tmp.json


# eliminate the manu useless "new_*" and "*_per_*" entries
perl -i -p -e 's/\,\"new_\w+\"\:[\d\.]+//g' data/tmp.json 
perl -i -p -e 's/\,\"new_\w+\"\:[\d\.]+//g' data/tmp.json # for some reason twice
perl -i -p -e 's/\,"\w+_per_\w+\"\:[\d\.]+//g' data/tmp.json

# eliminate other useless number entries
for variable in reproduction_rate total_vaccinations;
  do perl -i -p -e "s/\,\"${variable}\"\:[\d\.]+//g" data/tmp.json
done

# eliminate useless character entry "tests_units"
perl -i -p -e 's/\,\"tests_units\"\:\"[\w\s]+\"//g' data/tmp.json


################################
# final touches OWID
################################

# add variable name and necessary '  ' between rhs of var and } at the end

sed -e "1i\dataGitLocalTests=\'\{" data/tmp.json > data/tmp2.json
echo "}'" >> data/tmp2.json

# remove newlines
perl -i -p -e 's/\n//g' data/tmp2.json

# remove commas before } at the end of file
perl -i -p -e "s/\,\}/\}/g"  data/tmp2.json


# consolidate country names of *Test.json with github.json  file 
# (need to do this here, because other json is fetched online)

perl -i -p -e "s/DEU/Germany/g" data/tmp2.json
perl -i -p -e "s/AUT/Austria/g" data/tmp2.json
perl -i -p -e "s/CZE/Czechia/g" data/tmp2.json
perl -i -p -e "s/FRA/France/g" data/tmp2.json
perl -i -p -e "s/GBR/England/g" data/tmp2.json #cannot use space United Kingd
perl -i -p -e "s/ITA/Italy/g" data/tmp2.json
perl -i -p -e "s/POL/Poland/g" data/tmp2.json
perl -i -p -e "s/ESP/Spain/g" data/tmp2.json
perl -i -p -e "s/SWE/Sweden/g" data/tmp2.json
perl -i -p -e "s/CHE/Switzerland/g" data/tmp2.json
perl -i -p -e "s/GRC/Greece/g" data/tmp2.json
perl -i -p -e "s/ISR/Israel/g" data/tmp2.json
perl -i -p -e "s/IND/India/g" data/tmp2.json
perl -i -p -e "s/RUS/Russia/g" data/tmp2.json
perl -i -p -e "s/USA/US/g" data/tmp2.json
perl -i -p -e "s/AUS/Australia/g" data/tmp2.json


#####################################################################
# clean up
#####################################################################

mv data/tmp2.json data/githubWithTests.json
mv data/tmp.json data/githubWithTests_debug.json
#rm data/tmp.json data/githubWithTests_debug.json



#####################################################################
# get data w/o test from another github website
#####################################################################

echo ""; echo "getting pomber github data for cases and deaths"

wget https://pomber.github.io/covid19/timeseries.json --output-document=data/github.json
cp data/github.json data/github_orig.json

# separate countries in lines: all lines off, then ] => ]\n

perl -i -p -e 's/\n//g' data/github.json
perl -i -p -e 's/\]\,/\],\n/g' data/github.json

# filter countries of github.json file

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
grep Greece data/github.json >> data/tmp.json
grep Israel data/github.json >> data/tmp.json
grep India data/github.json >> data/tmp.json
grep Russia data/github.json >> data/tmp.json
grep US data/github.json >> data/tmp.json
grep Australia data/github.json >> data/tmp.json

# extract Germany data for development reference


# add variable name and neceesary '  ' between rhs of var

sed -e "1i\dataGitLocal=\'\{" data/tmp.json > data/tmp2.json
echo "}'" >> data/tmp2.json

# remove last comma
# tail should be }  ]}'

perl -i -p -e 's/\n//g' data/tmp2.json
perl -i -p -e "s/\]\,\}/\]\}/g"  data/tmp2.json


#####################################################################
# final bookkeeping
#####################################################################

rm data/tmp.json
mv data/tmp2.json data/github.json

# prepare full githubWithTests_orig for Germany with lines

cp data/githubWithTests_orig.json tmp2
perl -i -p -e 's/\}\]\}\,/\}\]\},\n/g' tmp2
grep Germany tmp2 > tmp
perl -i -p -e 's/\}\,/},\n/g' tmp # each day a line
perl -i -p -e 's/\,\"new_\w+\"\:[\d\.]+//g' tmp # eliminate useless
perl -i -p -e 's/\,"\w+_per_\w+\"\:[\d\.]+//g' tmp
#perl -i -p -e "s/\,\"total_vaccinations\"\:[\d\.]+//g" tmp
perl -i -p -e 's/\,\"tests_units\"\:\"[\w\s]+\"//g' tmp

rm tmp2
mv tmp data/githubWithTests_orig_Germany_lines.json

# save past json files to history
# (because of the sluggishly reported deaths)

dateStr=`date +"%Y_%m_%d"`
cp data/github.json history/github_$dateStr.json
cp data/githubWithTests.json history/githubWithTests_$dateStr.json
cp data/RKI_selectedKreise.json history/RKI_selectedKreise_$dateStr.json

# propagate changes

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


