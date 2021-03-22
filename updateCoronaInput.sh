#!/bin/bash

#####################################################################
# 0. Parsing
#####################################################################

regular=true

if(($#==0)); then
    regular=true;
    echo ""; echo "updateCoronaInput.sh: regular call";
else
    regular=false;
    echo ""; echo "updateCoronaInput.sh: testing manipulations locally";
fi
echo "regular=$regular"
if [[ $regular == true ]];
then echo "in regular";
else echo "in testing";
fi


#####################################################################
# 1. get local data from some Saxony Landkreise
#####################################################################

if [[ $regular == true ]];
then
    echo ""; echo "getting RKI Landkreis data ...";
    updateLandkreisData.sh;
else
    echo "yet no updateLandkreisData.sh with testing option imple,mented"
fi



#####################################################################
# 2. get data from the covid.ourworldindata website
#####################################################################

# this link recommended but does not allow wget
# wget https://covid.ourworldindata.org/data/owid-covid-data.json

if [[ $regular == true ]];
then
  echo ""; echo "regular:wgetting OWID data with tests ..."

  wget https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.json --output-document=data/githubWithTests.json
  cp data/githubWithTests.json data/githubWithTests_orig.json;

else echo ""; echo "debug mode: copying OWID data from saved one";
  cp data/githubWithTests_orig.json data/githubWithTests.json;
fi



# first make line for each country in order to select
# >=2021-01-11: now a single line !!

perl -i -p -e 's/\}\]\}\,/\}\]\},\n/g' data/githubWithTests.json

################################
# 2.1 select countries OWID
################################

grep Germany data/githubWithTests.json > data/tmp.json
grep Austria data/githubWithTests.json >> data/tmp.json
grep Czech data/githubWithTests.json >> data/tmp.json
grep France data/githubWithTests.json >> data/tmp.json
# grep "United Kingdom" data/githubWithTests.json >> data/tmp.json
grep GBR data/githubWithTests.json >> data/tmp.json  # 3-Buchst Abk gehen auch
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
grep PRT data/githubWithTests.json >> data/tmp.json
grep ZAF data/githubWithTests.json >> data/tmp.json # Suedafrika


################################
# 2.2 filter useless entries OWID
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
# 2.3 final touches OWID
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
perl -i -p -e "s/PRT/Portugal/g" data/tmp2.json
perl -i -p -e "s/ZAF/SouthAfrica/g" data/tmp2.json # cannot use spaces


#####################################################################
# 2.4 clean up
#####################################################################

mv data/tmp2.json data/githubWithTests.json
mv data/tmp.json data/githubWithTests_debug.json
#rm data/tmp.json data/githubWithTests_debug.json




#####################################################################
# 3. get lean data w/o test from the pomber github website
#####################################################################

if [[ $regular == true ]];
then
    echo ""; echo "regular: getting pomber github data for cases and deaths"

    wget https://pomber.github.io/covid19/timeseries.json --output-document=data/github.json;
    cp data/github.json data/github_orig.json;
else
    echo ""; echo "debug mode: copying past downloaded pomber github data"
    cp data/github_orig.json data/github.json;
fi

    

# 3.1 separate countries in lines: all lines off, then ] => ]\n

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
grep Portugal data/github.json >> data/tmp.json
grep "South Africa" data/github.json >> data/tmp.json

# 3.2 extract Germany data for development reference

grep Germany data/github.json > data/github_debug_Germany.json
perl -i -p -e 's/\}\,/\}\,\n/g' data/github_debug_Germany.json
dateStr=`date +"%Y_%m_%d"`
cp data/github_debug_Germany.json history/github_debug_Germany_$dateStr.json


# 3.3 final touches

add variable name and neceesary '  ' between rhs of var

sed -e "1i\dataGitLocal=\'\{" data/tmp.json > data/tmp2.json
echo "}'" >> data/tmp2.json

# remove last comma
# tail should be }  ]}'

perl -i -p -e 's/\n//g' data/tmp2.json
perl -i -p -e "s/\]\,\}/\]\}/g"  data/tmp2.json

rm data/tmp.json
mv data/tmp2.json data/github.json

#####################################################################
# 4. final bookkeeping
#####################################################################


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
mv tmp data/githubWithTests_debug_Germany.json

# save past json files to history
# (because of the sluggishly reported deaths)



dateStr=`date +"%Y_%m_%d"`
cp data/github.json history/github_$dateStr.json
cp data/githubWithTests.json history/githubWithTests_$dateStr.json
cp data/RKI_selectedKreise.json history/RKI_selectedKreise_$dateStr.json

# cp data/githubWithTests_debug.json history/githubWithTests_debug_$dateStr.json
cp data/githubWithTests_debug_Germany.json history/githubWithTests_debug_Germany_$dateStr.json

echo ""; echo "saved files to history reference:"
ls -l history/github_$dateStr.json history/githubWithTests_$dateStr.json history/RKI_selectedKreise_$dateStr.json
echo ""
ls -l history/*debug*_$dateStr.json 




#####################################################################
# 5. propagate changes
#####################################################################

echo ""; echo "propagate to public_html directory"

upload2public_html.sh

exit


#####################################################################
# 3a. get data from the eu opendata website
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


