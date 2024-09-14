const fs = require('fs');
const path = require('path');

function TaskOnceImage(Name){
    const filePath = path.join(__dirname, 'Image', Name);
    return filePath
}

module.exports = TaskOnceImage