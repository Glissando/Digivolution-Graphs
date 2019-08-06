//const cytoscape = require('cytoscape');
//const fs = require('fs');
var db = [];

function ABI(a,b,level){
  var base = Math.floor(level/5);
  if(stageToRow(b.stage) > stageToRow(a.stage)){
    if(b.stage == "Mega"){
      return base + 5;
    }
    else if(b.stage == "Ultimate"){
      return base + 4;
    }
    else if(b.stage == "Champion"){
      return base + 3;
    }
    else if(b.stage == "Rookie"){
      return base + 2;
    }
    else{
      return base + 1;
    }
  }
  else{
    return base;
  }
}

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
  var i=1;
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
        row: row,
        img: "images/digimon/"+ i +".png"
      }
    });
    i++;
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
var layouts = [function(){
  var layout = cy.layout({
    name: 'circle',
    spacingFactor: 2
  });
  layout.run(); 
},
function(){
  var layout = cy.layout({
    name: 'concentric'
  });

  layout.run(); 
},
function(){
  var layout = cy.layout({
    name: 'grid',
    rows: 7,
    spacingFactor: 5,
    position: function( node ){ return { row:node.data('row'), col:node.data('col')}; } 
  });

  layout.run(); 
}];
var currentLayout = 0;
var request = new XMLHttpRequest();
request.open('GET', 'cyber-sleuth.json');
request.responseType = 'json';
request.send();
request.onload = function() {
    db = request.response;
    cy = cytoscape({
      container: document.getElementById('cy'),
    
      elements: constructGraph(),
    
      layout: {
        name: 'grid',
        rows: 7,
        spacingFactor: 5,
        position: function( node ){ return { row:node.data('row'), col:node.data('col')}; } 
      },
    
      // so we can see the ids
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(id)',
            'color': '#ffffff',
            'background-color': '#ffffff',
            'background-image': function(ele){ return ele.data().img; },
            'background-fit': 'contain'
          }
        },
        {
          selector: '.highlight',
          style: {
            'padding': '3px'
          }
        },
        {
          selector: '.selected',
          style: {
            'border-style': 'solid',
            'border-width': '3px',
            'border-color': 'green'
          }
        }
      ]
    });
    path(cy.nodes()[0], cy.nodes()[327]);
    
    cy.cxtmenu({
      selector: 'node',

      commands: [
        {
          content: 'Neighbours',
          select: function(ele){
            ele.outgoers().select();
          }
        },

        {
          content: 'Select All',
          select: function(ele){
            cy.$('node').select();
            cy.$('edge').select();
          },
        },
      ]
    });

    cy.cxtmenu({
      selector: 'core',

      commands: [
        {
          content: 'Layout',
          select: function(){
            layouts[currentLayout]();
            currentLayout = (currentLayout + 1) % layouts.length;
          }
        },

        {
          content: 'Path',
          select: function(){
            var elem = cy.elements('node:selected');
            if(elem.length > 1){
              path(elem[0], elem[1]);
            }
          }
        },

        {
          content: 'Image',
          select: function(){
            cy.jpg();
          }
        }
      ]
    });

    cy.on('tap', 'node', function(evt){
      var node = evt.target;
      var label = document.getElementById('digimon');
      var data = node.data();
      label.innerHTML = node.id() + " | " + data.info[0] + " | " + data.info[1] + " | " + data.info[2] + " | " + data.info[3];
      node.addClass('selected');
    });
    cy.on('unselect', 'node', function(e){
      var sel = e.target;
      if(sel == null)
        return;
      cy.elements().removeClass('semitransp');
      sel.removeClass('selected');
    });
    cy.on('mouseover', 'node', function(e){
      var sel = e.target;
      if(sel == null)
        return;
      cy.elements().difference(sel.outgoers()).not(sel).addClass('semitransp');
      sel.addClass('highlight');
    });
    cy.on('mouseout', 'node', function(e){
      var sel = e.target;
      if(sel == null)
        return;
      cy.elements().removeClass('semitransp');
      sel.removeClass('highlight');
    });
}


function path(a, b){
  var aStar = cy.elements().aStar({ root: a, goal: b });
  var str = "";
  var path = aStar.path;
  for(var i=0; i < path.length; i += 2){
    var s = path[i].id();
    str += s.substring(s.indexOf(' ') + 1) + ((i == path.length - 1) ? '' : ' > ');
  }
  document.getElementById('info').innerHTML = str;
  aStar.path.select();
}


/*fs.readFile('cyber-sleuth.json','utf8', function(err, data) {
    if(err) throw err;

    db = JSON.parse(data);
    console.log(db[0]);
});*/
