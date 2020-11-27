#!/bin/bash

# copies corona.js -> corona_eng.js
# copies index.html -> index_eng.html
# and replaces some words

cp corona.js corona_eng.js
cp corona_gui.js corona_gui_eng.js

rm *eng.html
for f in `ls index*.html`; do
    baseFile=`basename $f .html`
    cp $f ${baseFile}_eng.html
done

perl -i -p -e 's/flagUSA/flagGermany/g' *_eng.html
perl -i -p -e 's/myRedirectEng/myRedirectGer/g' *_eng.html


perl -i -p -e 's/Simulation der Covid-19 Pandemie/Simulation of the Covid-19 Pandemics/g' *_eng.html corona_eng.js

perl -i -p -e 's/\"de\"/\"en\"/g' *_eng.html

perl -i -p -e 's/Deutschland/Germany/g' *_eng.html
perl -i -p -e 's/\&Ouml\;sterreich/Austria/g' *_eng.html
perl -i -p -e 's/Tschechien/Czechia/g' *_eng.html
perl -i -p -e 's/Frankreich/France/g' *_eng.html
perl -i -p -e 's/England/UK/g' *_eng.html
perl -i -p -e 's/Italien/Italy/g' *_eng.html
perl -i -p -e 's/Polen/Poland/g' *_eng.html
perl -i -p -e 's/Spanien/Spain/g' *_eng.html
perl -i -p -e 's/Schweden/Sweden/g' *_eng.html
perl -i -p -e 's/Schweiz/Swizzerland/g' *_eng.html
perl -i -p -e 's/Indien/India/g' *_eng.html
perl -i -p -e 's/Russland/Russia/g' *_eng.html

perl -i -p -e 's/kumulierte F\&auml\;lle/Cumulated cases/g' *_eng.html
perl -i -p -e 's/F\&auml\;lle vs\. Infizierte/Cases vs\. infected/g' *_eng.html
perl -i -p -e 's/F\&auml\;lle/Cases/g' *_eng.html
perl -i -p -e 's/Daten\: Tests/Tests/g' *_eng.html

perl -i -p -e 's/Infektionsraten/Infection rates/g' *_eng.html


perl -i -p -e 's/Reproduktionszahl/Base R value/g' *_eng.html
perl -i -p -e 's/Ansteckungsstart/Start infect\. period/g' *_eng.html
perl -i -p -e 's/Ansteckungsende/End infect\. period/g' *_eng.html
perl -i -p -e 's/Test nach/Test after/g' *_eng.html
perl -i -p -e 's/Hellfeld/Percentage reported/g' *_eng.html
perl -i -p -e 's/Kalibriere neu\!/Re-calibrate\!/g' *_eng.html
perl -i -p -e 's/corona\.js/corona_eng\.js/g' *_eng.html
perl -i -p -e 's/corona_gui\.js/corona_gui_eng\.js/g' *_eng.html

perl -i -p -e 's/Ignoriere Testhaeufigkeit/Ignore \#tests/g' *_eng.html corona_eng.js corona_gui_eng.js
perl -i -p -e 's/Beruecksichtige Testhaeufigkeit/Include \#tests/g' *_eng.html corona_eng.js corona_gui_eng.js



perl -i -p -e 's/\+ countryGer/\+ country/g' corona_eng.js
perl -i -p -e 's/Insgesamt positiv Getestete/Total cases/g' corona_eng.js
perl -i -p -e 's/Insg\. Genesene unter den Getesteten/Total recovered cases/g' corona_eng.js
perl -i -p -e 's/Insgesamt Genesene unter den Getesteten/Total recovered cases/g' corona_eng.js
perl -i -p -e 's/Insgesamt Gestorbene/Total deaths/g' corona_eng.js
perl -i -p -e 's/Tote ges/Total deaths/g' corona_eng.js
perl -i -p -e 's/positiv getestet ges/Total cases/g' corona_eng.js
perl -i -p -e 's/Aktuell real infizierte Personen/Actively infected/g' corona_eng.js
perl -i -p -e 's/Insgesamt Genesene unter allen Personen/Total recovered/g' corona_eng.js
perl -i -p -e 's/Positiv Getestete pro Tag/Cases per day/g' corona_eng.js
perl -i -p -e 's/Gestorbene pro Tag/Deaths per day/g' corona_eng.js
perl -i -p -e 's/Tests pro Tag/Tests per day/g' corona_eng.js
perl -i -p -e 's/Anteil positiver Tests/Fraction positive tests/g' corona_eng.js
perl -i -p -e 's/Simulierte Neuinfizierte pro Tag/Simulated daily new infected/g' corona_eng.js
perl -i -p -e 's/Simulierte Durchseuchung/Simulated contamination/g' corona_eng.js
perl -i -p -e 's/Simulierte False Positives pro Tag/Simulated daily false positives/g' corona_eng.js
perl -i -p -e 's/Simulierte Gestorbene pro Tag/Simulated daily deaths/g' corona_eng.js
perl -i -p -e 's/Simulierte Test-Positive pro Tag/Simulated daily cases/g' corona_eng.js
perl -i -p -e 's/Personenzahl/\# Persons/g' corona_eng.js
perl -i -p -e 's/Personen/Persons/g' corona_eng.js
perl -i -p -e 's/taegliche Zahlen/Daily figures/g' corona_eng.js
perl -i -p -e 's/Anteil/Percentage/g' corona_eng.js
perl -i -p -e 's/oder/or/g' corona_eng.js

perl -i -p -e 's/Durchseuchung/Contamination/g' corona_eng.js
perl -i -p -e 's/Aktuelles/Actual/g' corona_eng.js
perl -i -p -e 's/Tagen/days/g' corona_eng.js corona_gui_eng.js *_eng.html
perl -i -p -e 's/Tage/days/g' corona_eng.js corona_gui_eng.js *_eng.html
perl -i -p -e 's/pro Tag/per day/g' corona_eng.js corona_gui_eng.js
perl -i -p -e 's/Tag/day/g' corona_eng.js corona_gui_eng.js
perl -i -p -e 's/Simulierte/Simulated/g' corona_eng.js


echo "created *_eng.html corona_eng.js corona_gui_eng.js"













