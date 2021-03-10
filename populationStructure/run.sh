#!/bin/bash

for f in `ls *.csv`; do
    project=`basename $f .csv`
    getDecadePercentages $project
done
