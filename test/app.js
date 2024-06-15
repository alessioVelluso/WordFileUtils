const WordFileUtils = require("word-file-utils")
const fs = require("fs")



// --- Translation
const wfu = new WordFileUtils({ separator: "|" });
// wfUtils.translateCsv({
//     csvFilepath: "../Files/Test_ITA.csv",
//     cultureFrom: "it",
//     cultureTo: "en",
//     translatingCol: "Value",
//     outFilepath: "../Files/Test_EN.csv"
// })



// --- File reading
const objList = wfu.parseCsvToObjectList("../Files/MockData.csv", ",");
wfu.writeJson('../Files/MockData.json', objList);

let data = fs.readFileSync('../Files/MockData.json', 'utf8');
data = JSON.parse(data)
console.log(typeof data)
wfu.writeCsv("../Files/MockDataAgain.csv", data, ",")
