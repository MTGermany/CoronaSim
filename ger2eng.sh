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


perl -i -p -e 's/Simulation der Covid-19 Pandemie/Simulation of the Covid-19 Pandemics/g' *_eng.html *_eng.js

perl -i -p -e 's/\"de\"/\"en\"/g' *_eng.html


perl -i -p -e 's/Ursache\-Wirkung/Cause\-Effect/g' *_eng.html
perl -i -p -e 's/kumulierte F\&auml\;lle/Cumulated cases/g' *_eng.html
perl -i -p -e 's/F\&auml\;lle vs\. Infizierte/Cases vs\. infected/g' *_eng.html
perl -i -p -e 's/T\&auml\;gliche F\&auml\;lle/Daily cases/g' *_eng.html
perl -i -p -e 's/Daten\: Tests/Tests/g' *_eng.html

perl -i -p -e 's/Infektionsraten/Infection rates/g' *_eng.html


perl -i -p -e 's/Reproduktionszahl/Base R value/g' *_eng.html
perl -i -p -e 's/Ansteckungsstart/Start infect\. period/g' *_eng.html
perl -i -p -e 's/Ansteckungsende/End infect\. period/g' *_eng.html
perl -i -p -e 's/Test nach/Test after/g' *_eng.html
perl -i -p -e 's/Aktuelles Hellfeld/Percentage reported/g' *_eng.html
perl -i -p -e 's/Kalibriere neu\!/Re-calibrate\!/g' *_eng.html
perl -i -p -e 's/Validiere/Validate/g' *_eng.html
perl -i -p -e 's/Validierung der/Validation of the last/g' *_eng.js
perl -i -p -e 's/letzten//g' *_eng.js
perl -i -p -e 's/corona\.js/corona_eng\.js/g' *_eng.html
perl -i -p -e 's/corona_gui\.js/corona_gui_eng\.js/g' *_eng.html

perl -i -p -e 's/ohne alles/without vacc+measures/g' *_eng.html *_eng.js
perl -i -p -e 's/Ignoriere/Ignore/g' *_eng.html *_eng.js
perl -i -p -e 's/Ber\&uuml\;sichtige/Consider/g' *_eng.html *_eng.js
perl -i -p -e 's/Testh\&auml\;ufigkeit/test frequency/g' *_eng.html *_eng.js
perl -i -p -e 's/Infektions \-/Infection/g' *_eng.html *_eng.js
perl -i -p -e 's/Parameter/parameter/g' *_eng.html *_eng.js
perl -i -p -e 's/Ma\&szlig;nahmen\-/Measures/g' *_eng.html *_eng.js
perl -i -p -e 's/Ma\&szlig;nahmen/measures/g' *_eng.html *_eng.js
perl -i -p -e 's/Massnahmen\-/Measures/g' *_eng.html *_eng.js
perl -i -p -e 's/Massnahmen/measures/g' *_eng.html *_eng.js
perl -i -p -e 's/Ansicht/view/g' *_eng.html *_eng.js
perl -i -p -e 's/ansicht/view/g' *_eng.html *_eng.js
perl -i -p -e 's/Normale/Normal/g' *_eng.html *_eng.js
perl -i -p -e 's/Vollst\. geimpft/Fully vaccinated/g' *_eng.html *_eng.js
perl -i -p -e 's/Geimpft/Vaccinated/g' *_eng.html *_eng.js
perl -i -p -e 's/Geboostert/Boosters/g' *_eng.html *_eng.js
perl -i -p -e 's/Infiziert/Infected/g' *_eng.html *_eng.js
perl -i -p -e 's/Impf\-Immunitaet/Immunity by vacc./g' *_eng.html *_eng.js
perl -i -p -e 's/Gesamt\-Immunitaet/Total immunity/g' *_eng.html *_eng.js
perl -i -p -e 's/Sim\. Impfdurchbrueche/Breakthrough vacc\./g' *_eng.html *_eng.js
perl -i -p -e 's/Teil\-/Partial /g' *_eng.html *_eng.js
perl -i -p -e 's/Abstand/Distance/g' *_eng.html *_eng.js
perl -i -p -e 's/Maske/mask/g' *_eng.html *_eng.js
perl -i -p -e 's/wie 2019/as 2019/g' *_eng.html *_eng.js
perl -i -p -e 's/Halli Galli/Endless parties/g' *_eng.html *_eng.js
perl -i -p -e 's/Import\-F&auml;lle/Imported cases/g' *_eng.html *_eng.js
perl -i -p -e 's/Kumul\. Faelle/Total cases/g' *_eng.html *_eng.js
perl -i -p -e 's/W\&ouml\;chentliche Impfrate/Weekly vaccination rate/g' *_eng.html
perl -i -p -e 's/W\&ouml\;chentliche Boostrate/Weekly booster rate/g' *_eng.html
perl -i -p -e 's/Fall-Import/Imported cases/g' *_eng.html *_eng.js
perl -i -p -e 's/Einw\./inh./g' *_eng.html *_eng.js

perl -i -p -e 's/de\-de/en\-us/g' *_eng.js
perl -i -p -e 's/\+ countryGer/\+ country/g' *_eng.js
perl -i -p -e 's/Insgesamt positiv Getestete/Total cases/g' *_eng.js
perl -i -p -e 's/Insg\. Genesene unter den Getesteten/Total recovered cases/g' *_eng.js
perl -i -p -e 's/Insgesamt Genesene unter den Getesteten/Total recovered cases/g' *_eng.js
perl -i -p -e 's/Insgesamt Gestorbene/Total deaths/g' *_eng.js
perl -i -p -e 's/Tote ges/Total deaths/g' *_eng.js
perl -i -p -e 's/positiv getestet ges/Total cases/g' *_eng.js
perl -i -p -e 's/Aktuell real infizierte Personen/Actively infected/g' *_eng.js
perl -i -p -e 's/Insgesamt Genesene unter allen Personen/Total recovered/g' *_eng.js
perl -i -p -e 's/Positiv Getestete pro Tag/Cases per day/g' *_eng.js
perl -i -p -e 's/Gestorbene pro Tag/Deaths per day/g' *_eng.js
perl -i -p -e 's/Tests pro Tag/Tests per day/g' *_eng.js
perl -i -p -e 's/Anteil positiver Tests/Fraction positive tests/g' *_eng.js
perl -i -p -e 's/Simulierte Neuinfizierte pro Tag/Simulated daily new infected/g' *_eng.js
perl -i -p -e 's/Simulierte Durchseuchung/Simulated contamination/g' *_eng.js
perl -i -p -e 's/Sim\. Durchseuchung/Sim\. contamination/g' *_eng.js
perl -i -p -e 's/Simulierte False Positives pro Tag/Simulated daily false positives/g' *_eng.js
perl -i -p -e 's/Simulierte Gestorbene pro Tag/Simulated daily deaths/g' *_eng.js
perl -i -p -e 's/Test\-Positive/cases/g' *_eng.js
perl -i -p -e 's/Wocheninzidenz/Weekly incidence/g' *_eng.js
perl -i -p -e 's/Wochen\-Inzidenz/Weekly incidence/g' *_eng.js *_eng.html
perl -i -p -e 's/Wocheninzidenz pro/Weekly incidence per/g' *_eng.js
perl -i -p -e 's/Intensivinzidenz pro/Weekly ICU cases per/g' *_eng.js
perl -i -p -e 's/Intensivinzidenz/Weekly ICU cases/g' *_eng.js
perl -i -p -e 's/ICU\-Inzidenz/ICU incidence/g' *_eng.js
perl -i -p -e 's/Testrate/Tests/g' *_eng.js
perl -i -p -e 's/\/Wo/\/week/g' *_eng.js
perl -i -p -e 's/\/1 Mio/\/million/g' *_eng.js
perl -i -p -e 's/Grad Lockdown/Stringency index /g' *_eng.js
perl -i -p -e 's/Grad max\. Shutdown/Stringency index /g' *_eng.js *_eng.html

perl -i -p -e 's/W\&ouml\;chentlich Gestorbene pro/Weekly deaths per/g' *_eng.js
perl -i -p -e 's/Woechentlich Gestorbene pro/Weekly deaths per/g' *_eng.js

perl -i -p -e 's/Gestorbene/deaths/g' *_eng.js
perl -i -p -e 's/Personenzahl/\# Persons/g' *_eng.js
perl -i -p -e 's/Personen/Persons/g' *_eng.js
perl -i -p -e 's/taegliche Zahlen/Daily figures/g' *_eng.js
perl -i -p -e 's/Anteil/Percentage/g' *_eng.js
perl -i -p -e 's/oder/or/g' *_eng.js
perl -i -p -e 's/Vergleich/comparison/g' *_eng.js *_eng.html
perl -i -p -e 's/letzte Sim/last sim/g' *_eng.js
perl -i -p -e 's/\(Sim/\(sim/g' *_eng.js
perl -i -p -e 's/Neuinfizierte/New infected/g' *_eng.js

perl -i -p -e 's/Vollst\. Impfquote/Fraction fully vaccinated/g' *_eng.js
perl -i -p -e 's/Boosterquote/Fraction of boosters/g' *_eng.js
perl -i -p -e 's/Rt\-Wert/Rt value/g' *_eng.js
perl -i -p -e 's/R0 \(ohne Saisonalitaet\, sim\)/R0 \(w\/o seasonal effects\, sim\)/g' *_eng.js

perl -i -p -e 's/Daten und Sim/Data and sim/g' *_eng.js

perl -i -p -e 's/Durchseuchung/Contamination/g' *_eng.js
perl -i -p -e 's/Aktuelles/Actual/g' *_eng.js
perl -i -p -e 's/Aktuelle/Actual/g' *_eng.js
perl -i -p -e 's/Tagen/days/g' *_eng.js  *_eng.html
perl -i -p -e 's/Tage/days/g' *_eng.js  *_eng.html
perl -i -p -e 's/pro Tag/per day/g' *_eng.js 
perl -i -p -e 's/Tag/day/g' *_eng.js 
perl -i -p -e 's/Simulierte/Simulated/g' *_eng.js
perl -i -p -e 's/Faelle/cases/g' *_eng.js
perl -i -p -e 's/Pers\./pers\./g' *_eng.js
perl -i -p -e 's/Woche/week/g' *_eng.js
perl -i -p -e 's/Ew\./inhabitants/g' *_eng.js

perl -i -p -e 's/Deutschland/Germany/g' *_eng.html *_eng.js
perl -i -p -e 's/Oesterreich/Austria/g' *_eng.html *_eng.js
perl -i -p -e 's/\&Ouml\;sterreich/Austria/g' *_eng.html
perl -i -p -e 's/Tschechien/Czechia/g' *_eng.html *_eng.js
perl -i -p -e 's/Frankreich/France/g' *_eng.html *_eng.js
perl -i -p -e 's/England/UK/g' *_eng.html *_eng.js
perl -i -p -e 's/Italien/Italy/g' *_eng.html *_eng.js
perl -i -p -e 's/Polen/Poland/g' *_eng.html *_eng.js
perl -i -p -e 's/Spanien/Spain/g' *_eng.html *_eng.js
perl -i -p -e 's/Schweden/Sweden/g' *_eng.html *_eng.js
perl -i -p -e 's/Schweiz/Swizzerland/g' *_eng.html *_eng.js
perl -i -p -e 's/Griechenland/Greece/g' *_eng.html *_eng.js
perl -i -p -e 's/Indien/India/g' *_eng.html *_eng.js
perl -i -p -e 's/Russland/Russia/g' *_eng.html *_eng.js
perl -i -p -e 's/Ru\&szlig\;land/Russia/g' *_eng.html
perl -i -p -e 's/Australien/Australia/g' *_eng.html
perl -i -p -e 's/Brasilien/Brazil/g' *_eng.html


perl -i -p -e 's/ohne/without/g' *_eng.js *_eng.html

echo "created *_eng.html corona_eng.js corona_gui_eng.js"













