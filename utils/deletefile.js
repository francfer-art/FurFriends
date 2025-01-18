const fs = require('fs');
const path = require('path');

const deleteFile = (file, folder) => {
  const filePath = path.join(__dirname, '../public/images', folder, file);
  try {
    fs.unlinkSync(filePath);
    console.log('Borrado OK');
  } catch(error) {
    console.log('Error');
  }
}

module.exports = deleteFile;