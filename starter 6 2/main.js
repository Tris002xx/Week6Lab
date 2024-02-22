const path = require("path");

/*
 * Project: Milestone 1
 * File Name: main.js
 * Description:
 *
 * Created Date: 02/15/2024
 * Author: Tristan James Torres
 *
 */

const IOhandler = require("./IOhandler");
const zipFilePath = path.join(__dirname, "myfile.zip");
const pathUnzipped = path.join(__dirname, "unzipped");
const pathProcessed = path.join(__dirname, "grayscaled");

const main = async () => {
    try {
        const filter = await IOhandler.userFilter();
        await IOhandler.unzip(zipFilePath, pathUnzipped);
        const files = await IOhandler.readDir(pathUnzipped);
        IOhandler.grayScale(files, pathProcessed, filter);
    } catch (error) {
        console.error(error);
    }

};

main();