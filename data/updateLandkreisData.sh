#!/bin/bash
curl -s https://github.com/jgehrcke/covid-19-germany-gae/blob/master/cases-rki-by-ags.csv -o Saxony_cases_orig.csv

curl -s https://github.com/jgehrcke/covid-19-germany-gae/blob/master/cases-rki-by-ags.csv -o Saxony_deaths_orig.csv


cp Saxony_cases_orig.csv test.csv

# delete anything till string "time_iso8601" (including)

# Sed usage: sed 'start,end[do]' file>outpufile
# start=[linenumber], e.g., 1, or a /pattern/
# end=[linenumber] or $ for last line or a /pattern/
# action=d ("delete line")

sed '1,/^.*time_iso8601/d' test.csv > test2.csv

# select data column by the header "Kreis-id, e.g., 
# "LK Sächsische Schweiz-Osterzgebirge Kreis 14628, at 372th place#


#wrap up data in one line per time stamp

perl -i -p -e 's/\<td\>([0-9]+)\<\/td\>.*\n/<td>\1<\/td>/g' test2.csv

# select "LK Sächsische Schweiz-Osterzgebirge Kreis 14628, at 372th place

perl -i -p -e 's/(\<td\>[0-9]+\<\/td\>\s+){371}//g' test2.csv

perl -i -p -e 's/^\s*(\<td\>[0-9]+\<\/td\>\s+)(\<td\>[0-9]+\<\/td\>\s+)*/\1/g' test2.csv

perl -i -p -e 's/^.*tr id=.*\n//g' test2.csv
perl -i -p -e 's/^.*td id=.*\n//g' test2.csv

perl -i -p -e 's/0000\<\/td\>.*\n/0000<\/td>/g' test2.csv

perl -i -p -e 's/^\s+//g' test2.csv
perl -i -p -e 's/\s+\<\/tr\>//g' test2.csv

# delete everything before and after the data

sed '1,/^.*tbody/d' test2.csv > test.csv
sed '/^.*tbody/,$d' test.csv > Osterzgebirge_cases.csv

rm test*

echo "produced Osterzgebirge_cases.csv"


