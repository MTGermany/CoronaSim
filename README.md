# MTGermany/CoronaSim

Source code for the interactive Javascript simulation at
[corona-simulation.de](https://corona-simulation.de)

## Running the Simulation

This simulation uses JavaScript together with html5.

The simulation is driven by `index.html` which starts the actual
simulation coded in `corona.js` and `corona_gui.js`

At initialization, the canvas referenced by
```
 <canvas id="myCanvas"...>some text for old browsers </canvas>
```
is defined and its size adapted to the viewport. Furthermore, the html
drives some initialization via

```
 <body onload="startup()"> 
```

## Data Used

This project uses the [Covid-19
data](https://pomber.github.io/covid19/timeseries.json) that have been
brought into the `json` format by the ressources of the Github repo [pomber/covid19](https://github.com/pomber/covid19)

## Programm Files and Structure

The javascript code uses the pseudo objects `CoronaSim` and
`DrawSim` that do what is expected by their names. Particularly,
both have a method `.updateOneDay` that defines the timestep:
one day:

### The model and the pseudo-class CoronaSim

TODO

### Pseudo-class DrawSim

### GUI: file corona_gui.js

