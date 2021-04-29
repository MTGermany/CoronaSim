#!/bin/bash

# get data

#echo ""
#echo "updateLandkreisData.sh, RKI data, 2021-01-05: WARNING! Inconsistent new format!"
#echo "Deactivated for the time being! I use old data from data2 until further notice!"
echo ""
#exit



wget https://github.com/jgehrcke/covid-19-germany-gae/blob/master/cases-rki-by-ags.csv --output-document=data/RKI_cases_Landkreise.csv
wget  https://github.com/jgehrcke/covid-19-germany-gae/blob/master/deaths-rki-by-ags.csv --output-document=data/RKI_deaths_Landkreise.csv



########################################################
# common preprocessing for _cases_ and _deaths_ files
########################################################

cp data/RKI_deaths_Landkreise.csv data/RKI_deaths_selected.csv
cp data/RKI_cases_Landkreise.csv data/RKI_cases_selected.csv

# delete anything till string "time_iso8601" (including)

# Sed usage: sed 'start,end[do]' file>outpufile
# start=[linenumber], e.g., 1, or a /pattern/
# end=[linenumber] or $ for last line or a /pattern/
# action=d ("delete line")

sed -i '1,/^.*time_iso8601/d' data/RKI_*_selected.csv
sed -i '/^.*table/,$d' data/RKI_*_selected.csv



###################################################################
# 2021-01-07 cases [Now _cases_ has DIFFERENT format!!!! ( _deaths_ not) ]
# 2021-04-29 now deaths same format as cases
###################################################################

# wrap up data (not header) in one line per time stamp


perl -i -p -e 's/^\s*\<\/tr\>\s*\n//g' data/RKI_*_selected.csv
perl -i -p -e 's/^\s*\<tr\>\s*\n//g' data/RKI_*_selected.csv
perl -i -p -e 's/^\s*\<td.*line\-number.*\<\/td\>\s*\n//g' data/RKI_*_selected.csv 
perl -i -p -e 's/^\s+\<td id=.+202([0-9]\-[0-9][0-9]\-[0-9][0-9])/202\1/g' data/RKI_*_selected.csv 

# select/filter cases to "Kreise": cases (now totally different format!)
# "LK Erzgebirgskreis"                  Kreis 14521, at 364th place
# "SK Dresden"                          Kreis 14612, at 368th place
# "LK Sächsische Schweiz-Osterzgebirge" Kreis 14628, at 372th place

cp  data/RKI_cases_selected.csv data/RKI_cases_Kreis14521.csv
cp  data/RKI_cases_selected.csv data/RKI_cases_Kreis14612.csv
cp  data/RKI_cases_selected.csv data/RKI_cases_Kreis14628.csv
cp  data/RKI_deaths_selected.csv data/RKI_deaths_Kreis14521.csv
cp  data/RKI_deaths_selected.csv data/RKI_deaths_Kreis14612.csv
cp  data/RKI_deaths_selected.csv data/RKI_deaths_Kreis14628.csv


# pattern: 202?-??-??*,<363 mal Zahl,>*$

perl -i -p -e 's/(^202.*[0-9])T.*0000\,([0-9]+\,){363}([0-9]+).*/\{\"date\"\: "\1\"\, \"cases\"\: \3\,/g' data/RKI_cases_Kreis14521.csv 

perl -i -p -e 's/(^202.*[0-9])T.*0000\,([0-9]+\,){367}([0-9]+).*/\{\"date\"\: "\1\"\, \"cases\"\: \3\,/g' data/RKI_cases_Kreis14612.csv 

perl -i -p -e 's/(^202.*[0-9])T.*0000\,([0-9]+\,){371}([0-9]+).*/\{\"date\"\: "\1\"\, \"cases\"\: \3\,/g' data/RKI_cases_Kreis14628.csv 


perl -i -p -e 's/(^202.*[0-9])T.*0000\,([0-9]+\,){363}([0-9]+).*/\{\"date\"\: "\1\"\, \"deaths\"\: \3\,/g' data/RKI_deaths_Kreis14521.csv 

perl -i -p -e 's/(^202.*[0-9])T.*0000\,([0-9]+\,){367}([0-9]+).*/\{\"date\"\: "\1\"\, \"deaths\"\: \3\,/g' data/RKI_deaths_Kreis14612.csv 

perl -i -p -e 's/(^202.*[0-9])T.*0000\,([0-9]+\,){371}([0-9]+).*/\{\"date\"\: "\1\"\, \"deaths\"\: \3\,/g' data/RKI_deaths_Kreis14628.csv 








##########################################################
# final merging and transforming to json
##########################################################

# merge 4 columns of *cases_Kreis* and the two columns of *deaths_Kreis*

for kreis in 14521 14612 14628; do
  paste data/RKI_cases_Kreis$kreis.csv data/RKI_deaths_Kreis$kreis.csv > data/RKI_Kreis$kreis.json;
done


# add appropriate structure for json

sed -i "1i dataRKI_string='\{\"LK_Erzgebirgskreis\":  [" data/RKI_Kreis14521.json
sed -i "1i \"SK_Dresden\":  [" data/RKI_Kreis14612.json
sed -i "1i \"LK_Osterzgebirge\":  [" data/RKI_Kreis14628.json
perl -i -p -e 's/^\s+\<\/tbody\>*\n/\]\}/g' data/RKI_Kreis*.json
cat data/RKI_Kreis*.json > data/RKI_selectedKreise.json

# rename "cases" by "confirmed" since this is the name in github.json

perl -i -p -e 's/cases/confirmed/g' data/RKI_selectedKreise.json

# add some missing closing braces

perl -i -p -e 's/\"confirmed\"\:\s*([0-9]+).+\"deaths/\"confirmed\"\: \1, \"deaths/g' data/RKI_selectedKreise.json
perl -i -p -e 's/\,$/\},/g' data/RKI_selectedKreise.json


# do final touches on structure (eliminate newlines, some commas etc)

perl -i -p -e 's/\n//g' data/RKI_selectedKreise.json

perl -i -p -e 's/\}\,\"/\}\]\,  \"/g' data/RKI_selectedKreise.json
perl -i -p -e "s/\,$/\]\}\'/g" data/RKI_selectedKreise.json


# clean up

 rm data/*_Kreis14[0-9]*.*


echo "produced data/RKI_selectedKreise.json"


exit


###################################################################
# deaths (<2021-04-29, old format unchanged) 
###################################################################

perl -i -p -e 's/\<td\>([0-9]+)\<\/td\>.*\n/<td>\1<\/td>/g' data/RKI_deaths_selected.csv

# strip everything away down to thead

sed -i '1,/^.*thead/d' data/RKI_deaths_selected.csv
perl -i -p -e 's/^\s*\<tbody\>.*\n//g' data/RKI_deaths_selected.csv

# select/filter deaths to "Kreise": deaths (unchanged)

# "LK Erzgebirgskreis"                  Kreis 14521, at 364th place
# "SK Dresden"                          Kreis 14612, at 368th place
# "LK Sächsische Schweiz-Osterzgebirge" Kreis 14628, at 372th place


cp  data/RKI_deaths_selected.csv data/RKI_deaths_Kreis14521.csv
cp  data/RKI_deaths_selected.csv data/RKI_deaths_Kreis14612.csv
cp  data/RKI_deaths_selected.csv data/RKI_deaths_Kreis14628.csv

perl -i -p -e 's/(\<td\>[0-9]+\<\/td\>\s+){363}(\<td\>[0-9]+\<\/td\>\s+)(\<td\>[0-9]+\<\/td\>\s+)*/\2/g' data/RKI_deaths_Kreis14521.csv

perl -i -p -e 's/(\<td\>[0-9]+\<\/td\>\s+){367}(\<td\>[0-9]+\<\/td\>\s+)(\<td\>[0-9]+\<\/td\>\s+)*/\2/g' data/RKI_deaths_Kreis14612.csv

perl -i -p -e 's/(\<td\>[0-9]+\<\/td\>\s+){371}(\<td\>[0-9]+\<\/td\>\s+)(\<td\>[0-9]+\<\/td\>\s+)*/\2/g' data/RKI_deaths_Kreis14628.csv

# strip tr and td tags

perl -i -p -e 's/^.*tr id=.*\n//g' data/RKI_deaths_Kreis*.csv
perl -i -p -e 's/^.*td id=.*\n//g' data/RKI_deaths_Kreis*.csv


# bring deaths files to end of array of list entries
# "deaths": 0},

perl -i -p -e 's/^.*\<td\>(\d{4}-\d{2}-\d{2}).*\n//g' data/RKI_deaths_Kreis*.csv
perl -i -p -e 's/\s+\<td\>(\d+).*$/ \"deaths\": \1\},/g' data/RKI_deaths_Kreis*.csv

###################################################################
# deaths test 2021-04-29
###################################################################



perl -i -p -e 's/^\s*\<\/tr\>\s*\n//g' data/RKI_deaths_selected.csv
perl -i -p -e 's/^\s*\<tr\>\s*\n//g' data/RKI_deaths_selected.csv
perl -i -p -e 's/^\s*\<td.*line\-number.*\<\/td\>\s*\n//g' data/RKI_deaths_selected.csv
perl -i -p -e 's/^\s+\<td id=.+202([0-9]\-[0-9][0-9]\-[0-9][0-9])/202\1/g' data/RKI_deaths_selected.csv

# select/filter deaths to "Kreise": deaths (now totally different format!)
# "LK Erzgebirgskreis"                  Kreis 14521, at 364th place
# "SK Dresden"                          Kreis 14612, at 368th place
# "LK Sächsische Schweiz-Osterzgebirge" Kreis 14628, at 372th place

cp  data/RKI_deaths_selected.csv data/RKI_deaths_Kreis14521.csv
cp  data/RKI_deaths_selected.csv data/RKI_deaths_Kreis14612.csv
cp  data/RKI_deaths_selected.csv data/RKI_deaths_Kreis14628.csv


# pattern: 202?-??-??*,<363 mal Zahl,>*$

perl -i -p -e 's/(^202.*[0-9])T.*0000\,([0-9]+\,){363}([0-9]+).*/\{\"date\"\: "\1\"\, \"deaths\"\: \3\,/g' data/RKI_deaths_Kreis14521.csv 

perl -i -p -e 's/(^202.*[0-9])T.*0000\,([0-9]+\,){367}([0-9]+).*/\{\"date\"\: "\1\"\, \"deaths\"\: \3\,/g' data/RKI_deaths_Kreis14612.csv 

perl -i -p -e 's/(^202.*[0-9])T.*0000\,([0-9]+\,){371}([0-9]+).*/\{\"date\"\: "\1\"\, \"deaths\"\: \3\,/g' data/RKI_deaths_Kreis14628.csv 


