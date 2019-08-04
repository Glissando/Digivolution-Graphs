const axios = require('axios');
const request = require('request');
const cheerio = require('cheerio');
const readline = require('readline');
const fs = require('fs');

const writeStream = fs.createWriteStream('cyber-sleuth.json');

//Write Headers
//writeStream.write('Title,Link,Date \n');

var index = 1;
const dbSize = 342;
var db = [];
var url = 'http://digidb.io/digimon-search/?request=' + index;

function loadDigimon() {
    axios.get(url)
        .then(response => {
            var html = response.data;
            db.push(setupDB(html));
            index++;
            if(index==dbSize){
                writeStream.write(JSON.stringify(db));
                console.log("\nFinished Updating database");
            }
            else{
                url = 'http://digidb.io/digimon-search/?request=' + index;
                loadDigimon();
            }
        })
        .catch(error => {
            console.log(error);
        })
}
    
function setupDB(html){
    const $ = cheerio.load(html);
    var digimon = {};
    //Name
    digimon.name = $('.digiheader', '#topinfo').find('span').text();
    console.log(digimon.name);

    //Stage
    digimon.stage = $('.digiheader', '#topinfo').text().replace(digimon.name,"");
    console.log(digimon.stage);

    var s = false;
    digimon.info = [];
    //Other info
    $('tr', '#topinfo').each(function(){
        if(s == true){
            var children = $(this).children();
            digimon.info.push($(children[0]).text());
            digimon.info.push($(children[1]).text());
            console.log($(children[0]).text());
            console.log($(children[1]).text());
        }
        s = true;
    });
    
    console.log('Digivolves From:');
    digimon.dedigivolutions = [];
    $('div', '.digiinfo').find('a').each(function(){
        var str = $(this).attr('href');
        if(str.includes('digimon')){
            str = +str.replace(/[^0-9]/g,'') - 1;
            console.log(str);
            digimon.dedigivolutions.push(str);
        }
    });

    console.log('Digivolves Into:');
    digimon.digivolutions = [];
    $('a', '.digiinfo').each(function(){
        var str = $(this).attr('href');
        if(str.includes('digimon') && !$(this).parent().is('div')){
            str = +str.replace(/[^0-9]/g,'') - 1;
            console.log(str);
            digimon.digivolutions.push(str);
        }
    });

    return digimon;
}

function setupImage(html){
    const $ = cheerio.load(html);
    var imageLocation = $('#topimg').attr('src');
    request.get({url: imageLocation, encoding: null}, function (err, response, body) {
    fs.writeFile("data/images/"+index+".png", body, 'binary', function(err) {
    if(err)
      console.log(err);
    else
      console.log("The file was saved!");
  }); 
});
}

loadDigimon();
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

var running = true;
while(running){
    rl.question("1. Rebuild Digimon Databse for Cyber Sleuth \n 2. Rebuild Image Databse for Cyber Sleuth \n 3. Quit \n", function(answer) {
    // TODO: Log the answer in a database
    if(answer == "1"){
        loadDigimon();
       }
    else if(answer == "2"){

    }
    else if(answer == "3"){
        running = false;
        rl.close();
    }
    else{
        console.log("I could not understand your choice: ", answer);
    }
  });
}