//const cytoscape = require('cytoscape');
//const fs = require('fs');
var db = [];

function stageToRow(stage){
  if(stage == "Baby"){
    return 0;
  }
  else if(stage=="In-Training"){
    return 1;
  }
  else if(stage=="Rookie"){
    return 2;
  }
  else if(stage == "Champion"){
    return 3;
  }
  else if(stage == "Ultimate"){
    return 4;
  }
  else if(stage == "Mega"){
    return 5;
  }
  else if(stage == "Ultra"){
    return 6;
  }
  else{
    return 7;
  }
}

function constructGraph(){
  var elements = {};
  elements.nodes = [];
  elements.edges = [];
  var col = [0,0,0,0,0,0,0,0];
  var row = stageToRow(db[0].stage);
  for(var d of db){
    row = stageToRow(d.stage);
    col[row]++;
    elements.nodes.push({
      data: {
        id: d.name,
        info: d.info,
        stage: d.stage,
        col: col[row],
        row: row
      }
    });

    for(j of d.digivolutions){
      var digi = db[j];
      elements.edges.push({
        data: {
          id: d.name + digi.name,
          source: d.name,
          target: digi.name
        }
      });
    }
  }
  return elements;
}

var cy;
var request = new XMLHttpRequest();
request.open('GET', 'cyber-sleuth.json');
request.responseType = 'json';
request.send();
request.onload = function() {
    db = request.response;
    console.log(db);
    cy = cytoscape({
      container: document.getElementById('cy'),
    
      elements: constructGraph(),
    
      layout: {
        name: 'grid',
        rows: 7,
        spacingFactor: 5,
        position: function( node ){ return {row:node.data('row'), col:node.data('col')}; } 
      },
    
      // so we can see the ids
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(id)'
          }
        }
      ]
    });
    console.log(cy.nodes()[0].id());
    path(cy.nodes()[0], cy.nodes()[127]);
}


function path(a, b){
  var aStar = cy.elements().aStar({ root: a, goal: b });
  aStar.path.select();
}
/*fs.readFile('cyber-sleuth.json','utf8', function(err, data) {
    if(err) throw err;

    db = JSON.parse(data);
    console.log(db[0]);
});*/
