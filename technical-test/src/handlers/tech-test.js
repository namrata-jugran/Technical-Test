const axios = require('axios');

exports.handler = async (event, context) => {
    const res = await axios.get('https://topaz-chill.glitch.me/data.txt');
    console.log('Res: ', res);

    var lines = res.data.split('\n');
    console.log('Lines: ', lines);

    var dataArray = [];
    var tempArray = [];

    lines.forEach(line => {
        if (line.includes('$')) {
            line = line.replace(/(?<=\S)\s+(?=\S)/g, ' ');
            line = line.trim();
            tempArray = line.split(' ');
            
            var lastIndex = tempArray.length - 1;
            var pointer = lastIndex;
            var dataObject = {};
            dataObject.unitPrice = parseFloat(tempArray[lastIndex].substr(1));

            if (tempArray[lastIndex - 1].toLowerCase() === 'g') {
                dataObject.amount = parseInt(tempArray[lastIndex - 2]);
                pointer = lastIndex - 3;
            } else if (tempArray[lastIndex - 1].toLowerCase() === 'kg') {
                dataObject.amount = parseInt(tempArray[lastIndex - 2] * 1000);
                pointer = lastIndex - 3;
            } else if (tempArray[lastIndex - 1].toLowerCase().includes('kg')) {
                dataObject.amount = parseInt(tempArray[lastIndex - 1].slice(0, -2)) * 1000;
                pointer = lastIndex - 2;
            } else {
                dataObject.amount = parseInt(tempArray[lastIndex - 1].slice(0, -1))
                pointer = lastIndex - 2;
            }

            if (pointer === 0) {
                dataObject.productName = tempArray[0];
            } else if (pointer === 1) {
                dataObject.productName = tempArray[0] + ' ' + tempArray[1];
            }
            
            if (dataObject.amount >= 750) {
                dataArray.push(dataObject);
            }            
        }
    });
    
    dataArray = dataArray.filter((dataArray, index, self) => 
        index === self.findIndex((x) => x.productName === dataArray.productName)
    );
    dataArray.sort((a, b) => b.unitPrice - a.unitPrice);
    console.log('Data Array: ', dataArray);

    var output = lines[0] + '\n' + lines[1] + '\n';
    dataArray.forEach(data => {
        output += data.productName.padEnd(25, ' ');
        output += data.amount + ' g'.padEnd(15, ' ');
        output += '$' + data.unitPrice + '\n';
    });

    return {
        statusCode: res.status,
        body: output
    }
}
