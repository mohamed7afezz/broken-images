const fs = require('fs');
var convert = require('xml-js');
const fetch = require('cross-fetch');

var xml = fs.readFileSync('./imagesitemap.xml', { encoding: 'utf8', flag: 'r' });
var xmlData = convert.xml2json(xml, {
    compact: true, 
    space: 4
});

let urlsToTest = JSON.parse(xmlData).urlset.url;
for(let i = 0; i < urlsToTest.length; i++){ 
    const pageUrl = urlsToTest[i].loc._text; 
    const images = urlsToTest[i]['image:image'];
    if(!images)
    {
        continue;
    }
    Array.from(images).map(item => item['image:loc']._text).forEach(imageUrl => {
        fetch(imageUrl).then((res) => {
            if (res.status == 200) {
                return;
            }
            fs.appendFileSync('broken-images.csv', `${imageUrl},${pageUrl}\r\n`);
            console.log(i + " : " + urlsToTest.length);
        }).catch((err) => {
            // do something !
        });
    });
}
