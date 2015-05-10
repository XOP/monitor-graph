# monitor-graph

> Basic SPA to load data and build graphs, using sigma.js

## Sigma.js

Using git version, bower one seems to be stale.
Had to upgrade ```sigma.parsers.json.js``` in order to use raw JSON data instead of AJAX request.

## Installation

Nothing new here, except for sigma.js build. 

```
# install dependenies
npm install
bower install

# dev mode
gulp

# build
gulp build
```

### sigma.js

Two options here
- use sigma 'as is'
- clear sigma folder, ```git clone``` latest repo from [here](https://github.com/jacomyal/sigma.js) and follow installation instructions provided
