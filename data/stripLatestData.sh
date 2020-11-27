#!/bin/bash

# strips of latest entries of the
# github.json and githubWithTests.json files

# usage: stripLatestData.sh yyyy-mm-dd <github file><githubWithTest file>
# returns github_casesyyyy-mm-dd and github_testsyyyy-mm-dd


# input

if ( (($#!=3)) );
then echo "usage: stripLatestData.sh yyyy-mm-dd <github file><githubWithTest file>";
     echo "will produce github_casesyyyy-mm-dd and github_testsyyyy-mm-dd";
     echo "example: stripLatestData.sh 2020-11-01 github.json githubWithTests.json" 
     exit -1;
fi
lastDate=$1
casesIn=$2
testsIn=$3
casesOut="github_cases-${lastDate}.json"
testsOut="github_tests-${lastDate}.json"
echo "casesOut=$casesOut"
echo "testsOut=$testsOut"


# do the stripping on output

cp $casesIn $casesOut
cp $testsIn $testsOut


# make dates consistent by filling out 2020-2-3 -> 2020-02-03
# (need it to do twice)

perl -i -p -e 's/\-(\d)(\D)/\-0\1\2/g' $casesOut $testsOut
perl -i -p -e 's/\-(\d)(\D)/\-0\1\2/g' $casesOut $testsOut 

# do the actual stripping

lastYear=${lastDate:0:4}
lastMonth=${lastDate:5:2}
lastDay=${lastDate:8:2}
lastMonthStripped=$(echo $lastMonth | sed 's/^0*//')
lastDayStripped=$(echo $lastDay | sed 's/^0*//')
echo "lastYear=$lastYear"
echo "lastMonth=$lastMonth, lastMonthStripped=$lastMonthStripped"
echo "lastDay=$lastDay, lastDayStripped=$lastDayStripped"

# strip last days of a month


# github.json:
# 

# githubWithTests.json:
# 
# dataGitLocalTests='{"Germany": {"continent": "Europe",        "location": "Germany",        "population": 83783945.0,        "population_density": 237.016,        "median_age": 46.6,        "aged_65_older": 21.453,        "aged_70_older": 15.957,        "cardiovasc_death_rate": 156.139,        "diabetes_prevalence": 8.31,        "female_smokers": 28.2,        "male_smokers": 33.1,        "life_expectancy": 81.33,        "human_development_index": 0.936,                               "data": [  {"date": "2019-12-31",  ..., "reproduction_rate": 2.95}, {"date": "2020-01-01", ... }, {"date": "2020-11-23", ... }        ]    },    "England": {"continent": "Europe",  ... , "data": [  {"date": ...},  ... , {"date": ...} ]    }, {"country": {"metadata": value, ..., "data": [ { ... } ] }}'



for dd in 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23 23 24 25 26 27 28 29 30 31; do
    ddStripped=$(echo $dd | sed 's/^0*//')
    if (("$ddStripped" > "$lastDayStripped"));
      then echo "ddStripped=$ddStripped > $lastDayStripped";
      perl -i -p -e "s/\{[^\{]+${lastYear}\-${lastMonth}\-${dd}[^\{]+\}\,//g" $casesOut $testsOut
    fi
done



# strip last months of a year

for mm in 01 02 03 04 05 06 07 08 09 10 11 12; do
    mmStripped=$(echo $mm | sed 's/^0*//')
    if (("$mmStripped" > "$lastMonthStripped"));
      then echo "mmStripped=$mmStripped > $lastDayStripped";
      perl -i -p -e "s/\{[^\{]+${lastYear}\-${mm}[^\{]+\}\,//g" $casesOut $testsOut
    fi
done


# strip last years

for yyyy in 2021 2022 2023 2024; do
    if (("$yyyy" > "$lastYear"));
      then echo "yyyy=$yyyy > $lastYear";
      perl -i -p -e "s/\{[^\{]+${yyyy}\-\d\d[^\{]+\}\,//g" $casesOut $testsOut
    fi
done

# strip the last entry (not cought by above regexp)

# cases: },    { ...  }  ]  => } ]
#  or     ,    { ...  }  ]  =>  ]
perl -i -p -e "s/\,\s*\{[^\{]+\}\s*\]/ ]/g" $casesOut


# tests: For some f...... reason, the  " }        ]    },"
# sequence at the end of a country globbed up
# search long empty string to insert them again at end of country

perl -i -p -e "s/\}\,\s{20}\s+\"/\} ] \},          \"/g" $testsOut

# treat end of file

perl -i -p -e "s/\}\,\s+\{\"date\"[^\{]+\}\s*\]\s*\}\}/ \} ] \}\}/g" $testsOut
