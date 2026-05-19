const routesFiles = [
  "events",
  "insights",
  "timeline"
];

module.exports = (app) => 
  routesFiles.forEach((name) => 
    require(`./${name}.routes`)(app));