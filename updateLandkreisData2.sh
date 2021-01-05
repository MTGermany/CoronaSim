#!/bin/bash

# get data


#wget https://github.com/jgehrcke/covid-19-germany-gae/blob/master/cases-rki-by-ags.csv --output-document=data/RKI_cases_Landkreise.csv
#wget  https://github.com/jgehrcke/covid-19-germany-gae/blob/master/deaths-rki-by-ags.csv --output-document=data/RKI_deaths_Landkreise.csv



# !!! analyse changing data format: search for "2020-03-12T" in
# starting data: 
# grep 2020-03-12T data/RKI_cases_Landkreise.csv
# grep 2020-03-12T data/RKI_deaths_Landkreise.csv


cp data2/RKI_deaths_Landkreise.csv data2/RKI_deaths_selected.csv
cp data2/RKI_cases_Landkreise.csv data2/RKI_cases_selected.csv

# delete anything till string "time_iso8601" (including)

# Sed usage: sed 'start,end[do]' file>outpufile
# start=[linenumber], e.g., 1, or a /pattern/
# end=[linenumber] or $ for last line or a /pattern/
# action=d ("delete line")

sed -i '1,/^.*time_iso8601/d' data2/RKI_*_selected.csv
sed -i '/^.*table/,$d' data2/RKI_*_selected.csv


# select data column by the header "Kreis-id, e.g., 
# "LK Sächsische Schweiz-Osterzgebirge Kreis 14628, at 372th place#


#wrap up data (not header) in one line per time stamp

perl -i -p -e 's/\<td\>([0-9]+)\<\/td\>.*\n/<td>\1<\/td>/g' data2/RKI_*_selected.csv

# select/filtr for
# "LK Erzgebirgskreis"                  Kreis 14521, at 364th place
# "SK Dresden"                          Kreis 14612, at 368th place
# "LK Sächsische Schweiz-Osterzgebirge" Kreis 14628, at 372th place


cp  data2/RKI_cases_selected.csv data2/RKI_cases_Kreis14521.csv
cp  data2/RKI_cases_selected.csv data2/RKI_cases_Kreis14612.csv
cp  data2/RKI_cases_selected.csv data2/RKI_cases_Kreis14628.csv

cp  data2/RKI_deaths_selected.csv data2/RKI_deaths_Kreis14521.csv
cp  data2/RKI_deaths_selected.csv data2/RKI_deaths_Kreis14612.csv
cp  data2/RKI_deaths_selected.csv data2/RKI_deaths_Kreis14628.csv

perl -i -p -e 's/(\<td\>[0-9]+\<\/td\>\s+){363}(\<td\>[0-9]+\<\/td\>\s+)(\<td\>[0-9]+\<\/td\>\s+)*/\2/g' data2/RKI_*_Kreis14521.csv

perl -i -p -e 's/(\<td\>[0-9]+\<\/td\>\s+){367}(\<td\>[0-9]+\<\/td\>\s+)(\<td\>[0-9]+\<\/td\>\s+)*/\2/g' data2/RKI_*_Kreis14612.csv

perl -i -p -e 's/(\<td\>[0-9]+\<\/td\>\s+){371}(\<td\>[0-9]+\<\/td\>\s+)(\<td\>[0-9]+\<\/td\>\s+)*/\2/g' data2/RKI_*_Kreis14628.csv

# strip tr and td tags

perl -i -p -e 's/^.*tr id=.*\n//g' data2/RKI_*_Kreis*.csv
perl -i -p -e 's/^.*td id=.*\n//g' data2/RKI_*_Kreis*.csv

# bring cases files to beginning of array of list entries
# {"date": "2020-03-05", "cases": 1,

perl -i -p -e 's/^.*\<td\>(\d{4}-\d{2}-\d{2}).*\n/\{\"date\": \"\1\",/g' data2/RKI_cases_Kreis*.csv
perl -i -p -e 's/\,\s+\<td\>(\d+).*$/, \"cases\": \1,/g' data2/RKI_cases_Kreis*.csv

# bring deaths files to end of array of list entries
# "deaths": 0},

perl -i -p -e 's/^.*\<td\>(\d{4}-\d{2}-\d{2}).*\n//g' data2/RKI_deaths_Kreis*.csv
perl -i -p -e 's/\s+\<td\>(\d+).*$/ \"deaths\": \1\},/g' data2/RKI_deaths_Kreis*.csv

# strip headers down to (including) </thead>


sed -i '1,/^.*thead/d' data2/RKI_*_Kreis*.csv

# merge 4 columns of *cases_Kreis* and the two columns of *deaths_Kreis*

for kreis in 14521 14612 14628; do
  paste data2/RKI_cases_Kreis$kreis.csv data2/RKI_deaths_Kreis$kreis.csv > data2/RKI_Kreis$kreis.json;
done

# add appropriate structure for json

perl -i -p -e "s/^.*\<tbody.*$/dataRKI_string='\{\"LK_Erzgebirgskreis\":  [/g" data2/RKI_Kreis14521.json
perl -i -p -e "s/^.*\<tbody.*$/\"SK_Dresden\":  [/g" data2/RKI_Kreis14612.json
perl -i -p -e "s/^.*\<tbody.*$/\"LK_Osterzgebirge\":  [/g" data2/RKI_Kreis14628.json

perl -i -p -e "s/^.*\<\/tbody.*$/]\}/g" data2/RKI_Kreis*.json

cat data2/RKI_Kreis*.json > data2/RKI_selectedKreise.json

# do final touches on structure (eliminate newlines, some commas etc)

perl -i -p -e 's/\n//g' data2/RKI_selectedKreise.json

perl -i -p -e 's/\}\,\]\}\"/\}\]\,  \"/g' data2/RKI_selectedKreise.json
perl -i -p -e "s/\}\,\]\}/\}\]\}\'/g" data2/RKI_selectedKreise.json

# rename "cases" by "confirmed" since this is the name in github.json

perl -i -p -e 's/cases/confirmed/g' data2/RKI_selectedKreise.json

# clean up

# rm RKI_Kreis*.json RKI_*.csv


echo "produced data2/RKI_selectedKreise.json"



