const fs = require('fs');
var convert = require('xml-js');
const fetch = require('cross-fetch');
const { exit } = require('process');

var xml = fs.readFileSync('./imagesitemap.xml', { encoding: 'utf8', flag: 'r' });
var xmlData = convert.xml2json(xml, {
    compact: true, 
    space: 4
});

let urlsToTest = JSON.parse(xmlData).urlset.url;

const tasks = [];
let completedTasks = 0;

function checkIfComplete() {
    completedTasks++;
    console.log(completedTasks + ' completed ! from: ' + tasks.length);
    if (completedTasks == tasks.length) {
        console.log('finished');
        exit(0);
    }
}

for(let i = 0; i < urlsToTest.length; i++){ 
    const pageUrl = urlsToTest[i].loc._text; 
    const images = urlsToTest[i]['image:image'];
    if(!images)
    {
        continue;
    }
    const imagesUrl = Array.from(images).map(item => item['image:loc']._text);
    imagesUrl.forEach(imageUrl => {
        const task = (function(imageUrl){
            return function(){
                fetch(imageUrl).then((res) => {
                    if (res.status == 404) {
                        fs.appendFile('broken-images.csv', `${imageUrl},${pageUrl}\r\n`, appedFileHandler);
                        return;
                    }
                    fs.appendFile('good-images.csv', `${imageUrl},${pageUrl}\r\n`, appedFileHandler);
                }).catch(() => {
                    fs.appendFile('catch-images.csv', `${imageUrl},${pageUrl}\r\n`,appedFileHandler);
                }).finally(() => {
                    checkIfComplete();
                });
            }
        })(imageUrl);
        tasks.push(task);
    });
}

for (var index in tasks) {
    tasks[index](); 
}

function appedFileHandler (err) {
    if(err) {
        console.log('can not append!');
    }
}