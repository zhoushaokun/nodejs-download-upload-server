const axios = require('axios');
const fs = require('fs');
const path = require('path');


async function getFileAndSave(fileUrl, filename) {
  try {
    console.log('saving uploaded file');
    let file = path.join(__dirname, 'download', filename)
    const writer = fs.createWriteStream(file);

    const res = await axios.get(fileUrl, {
      responseType: "stream",
    })

    res.data.pipe(fs.createWriteStream(file));
    return "";
  } catch (error) {
    throw error;
  }


}

module.exports = {
  getFileAndSave
};