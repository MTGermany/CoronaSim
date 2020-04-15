#!/bin/bash

# get data from the eu opendata website
wget data/coronaWorldwide.json https://opendata.ecdc.europa.eu/covid19/casedistribution/json/ --output-document=data/coronaWorldwide.json

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
exit

