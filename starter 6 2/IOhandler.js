/*
* Project: Milestone 1
* File Name: IOhandler.js
* Description: Collection of functions for files input/output related operations
*
* Created Date:
* Author:
*
*/

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
const unzipper = require("yauzl-promise"),
  fs = require("fs"),
  PNG = require("pngjs").PNG,
  path = require("path");
const { pipeline } = require('stream/promises');

/**
 * Description: decompress file from given pathIn, write to given pathOut
 *
 * @param {string} pathIn
 * @param {string} pathOut
 * @return {promise}
 */
const unzip = async (pathIn, pathOut) => {
  // const yauzl = require('yauzl-promise'),
  // fs = require('fs'),

  const zip = await unzipper.open(pathIn);
  try {
    for await (const entry of zip) {
      if (entry.filename.endsWith('/')) {
        await fs.promises.mkdir(`${pathOut}/${entry.filename}`, { recursive: true });
      } else {
        const readStream = await entry.openReadStream();
        const writeStream = fs.createWriteStream(
          `${pathOut}/${entry.filename}`
        );
        await pipeline(readStream, writeStream);
      }
    }
  } finally {
    await zip.close();
  }

};

/**
 * Description: read all the png files from given directory and return Promise containing array of each png file path
 *
 * @param {string} path
 * @return {promise}
 */
const readDir = async (dir) => {
  return new Promise((res, rej) => {
    fs.readdir(dir, (err, fileNames) => {
      if (err) rej(err);
      else {
        list_file = []
        fileNames.forEach(fileName => {
          if (`${path.extname(`${fileName}`)}` == `.png`) {
            list_file.push(`${dir}\\${fileName}`)
          }
        })
        res(list_file);
      }
    })
  })

};


/**
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
*
* @param {string} filePath
* @param {string} pathProcessed
* @return {promise}
* 
*/
const grayScale = async (pathIn, pathOut, filter) => {
  let x = -1;
  for (filePath of pathIn) {
    x += 1;
    const fileNme = pathIn[x]
    fs.createReadStream(filePath)
      .pipe(
        new PNG({
          filterType: 4,
        })
      )
      .on("parsed", function () {
        for (var y = 0; y < this.height; y++) {
          for (var x = 0; x < this.width; x++) {
            var idx = (this.width * y + x) << 2;
            if (filter.toUpperCase() === "INVERT") {
              // invert color
              this.data[idx] = 255 - this.data[idx];
              this.data[idx + 1] = 255 - this.data[idx + 1];
              this.data[idx + 2] = 255 - this.data[idx + 2];
            }
            if (filter.toUpperCase() === "SERPIA") {
              // Serpia
              const r = this.data[idx]
              const g = this.data[idx + 1]
              const b = this.data[idx + 2]
              const newR = 0.393 * r + 0.769 * b + 0.189 * g
              const newG = 0.349 * r + 0.686 * b + 0.168 * g
              const newB = 0.272 * r + 0.534 * b + 0.131 * g
              if (newR > 255) {
                this.data[idx] = 255
              }
              else {
                this.data[idx] = newR
              }
              if (newG > 255) {
                this.data[idx + 1] = 255
              }
              else {
                this.data[idx + 1] = newG
              }
              if (newB > 255) {
                this.data[idx + 2] = 255
              }
              else {
                this.data[idx + 2] = newB
              }
            }
            if (filter.toUpperCase() === "INKWELL") {
              const i = (y * 4) * this.width + x * 4;
              const avg = (this.data[i] + this.data[i + 1] + this.data[i + 2]) / 3;
              this.data[i] = avg;
              this.data[i + 1] = avg;
              this.data[i + 2] = avg;
            }
          }
        }
        // this.pack().pipe(fs.createWriteStream(`${pathOut}/${x}.png`));
        this.pack().pipe(fs.createWriteStream(`${pathOut}/${fileNme.replace(/^.*[\\/]/, '')}`));
        // this.pack().pipe(fs.createWriteStream(`${pathOut}/${pathIn[x].replace(/^.*[\\/]/, '')}`));
        console.log(`${filter.toLowerCase()} applied to ${fileNme.replace(/^.*[\\/]/, '')}!`)
      });
  }
};


/**
 * Description: Take input from terminal, and return filter 
 * 
 * @return {promise}
 * 
 * 
 */
const userFilter = async () => {
  return new Promise((res, rej) =>
    readline.question('Select filter: \n- Serpia\n- Invert\n- Inkwell\n', filter => {
      readline.close();
      const filters = ["SERPIA", "INVERT", "INKWELL"]
      if (filters.includes(filter.toUpperCase())) { res(filter) }
      else rej("Please choose from the list!")
    })
  );
}


module.exports = {
  unzip,
  readDir,
  grayScale,
  userFilter
};
