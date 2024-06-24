import { WordFileUtils } from "word-file-utils"
import gu from "./utils";


const randomDate = new Date().toISOString();
const parsedDate = gu.parseDate(randomDate);
const helloMessage = gu.hello("Alessio");
console.log(parsedDate, helloMessage);




const wfu = new WordFileUtils();
wfu.translateCsv({
    csvFilepath:"../Files/Test_ITA.csv",
    outFilepath:"../Files/Test_EN.csv",
    translatingCol:"Value",
    separator: "|",
    cultureFrom:"it",
    cultureTo:"en"
});


const data = wfu.parseCsvToObjectList("../Files/MockData.csv", ",");
wfu.writeWorkbook("../Files/Test", [
    { name: "Worksheet_1", data }
])
