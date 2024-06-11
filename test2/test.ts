import Wfu from "../package/src/WordFileUtils"

const wfu = new Wfu({ separator: "|" });
const data = wfu.parseCsv<{ Key:string, Value:string }>("../Files/Test_ITA.csv")

wfu.createWorkbook<{ Key:string, Value:string }>("../Files/TestWorkbook", [
    { name: "Worksheet1", data }
])
