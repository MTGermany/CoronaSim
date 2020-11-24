#!/bin/bash

# strips of latest entries of the
# github.json and githubWithTests.json files

# usage: stripLatestData.sh yyyy-mm-dd <github file><githubWithTest file>
# returns github_casesyyyy-mm-dd and github_testsyyyy-mm-dd


# input

if ( (($#!=3)) );
then echo "usage: stripLatestData.sh yyyy-mm-dd <github file><githubWithTest file>";
     echo "will produce github_casesyyyy-mm-dd and github_testsyyyy-mm-dd";
     echo "example: stripLatestData.sh 2020-11-01 github_cases2020_11_23.json github_tests2020_11_23.json" 
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

perl -i -p -e 's/\-(\d)(\D)/\-0\1\2/g' $casesOut
perl -i -p -e 's/\-(\d)(\D)/\-0\1\2/g' $casesOut

# do the actual stripping

perl -i -p -e 's/\{[^\{]+2020\-11\-02[^\{]+\}\,//g' $casesOut

