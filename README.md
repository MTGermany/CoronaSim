# mtreiber.de/CoronaSim/
Source code for the interactive Javascript simulation at
[mtreiber.de/CoronaSim](https://mtreiber.de/CoronaSim)

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


## Programm Files and Structure

The javascript code uses the pseudo objects `CoronaSim` and
`DrawSimin` that do what is expected by their names. Particularly,
both have a method `.updateOneDay` that defines the timestep:
one day:

### The model and the pseudo-class CoronaSim

TODO

### Pseudo-class DrawSim

### GUI: file corona_gui.js

