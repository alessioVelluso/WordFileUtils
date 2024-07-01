import { WordFileUtils, CatchedResponse, ClientFilter, ClientFilters } from "word-file-utils"
import gu from "./utils";
import {  } from "../package/types/generic.types";

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

function testCatch():CatchedResponse<boolean> {
    try {
        throw new EvalError("Test")
    }
    catch(err) {
        return gu.catchResError(err);
    }
}

gu.log(testCatch(), "cyan"); // Whatever is not string, is not colored

interface ExampleFilter extends ClientFilter { startDate:Date, endDate:Date, type:number, active?:boolean }
const filter = new ClientFilters<ExampleFilter>({
    startDate: new Date(),
    endDate: new Date(),
    type: 2,
});

filter.values.active = true;
gu.log(filter.currentParams, "cyan");


filter.values.active = undefined;
filter.values.startDate = new Date("5/30/2024 15:00")
gu.log(filter.currentParams, "cyan");
