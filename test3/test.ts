import { WordFileUtils } from "word-file-utils"
import gu from "./utils";
import { CatchedResponse } from "../package/types/generic.types";

// --- V1.0.1 --- //

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




// --- V1.0.2 --- //

gu.log("Hello there, this is a log", "blue");

gu.logFile("Hello there", "log", false);
gu.logFile("An Error", "error");

const res = (function test():CatchedResponse<boolean> {
    try
    {
        throw new EvalError("Test")
        return { isOk:true, response:true }
    }
    catch(err)
    {
        return gu.catchResError(err);
    }
})()

gu.log(res, "cyan");
