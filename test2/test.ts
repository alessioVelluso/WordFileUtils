import Wfu from "word-file-utils"

const wfu = new Wfu({ separator: "|" });


// --- Excel
const data = wfu.parseCsvToObjectList<{ Key:string, Value:string }>("../Files/Test_ITA.csv")
wfu.createWorkbook<{ Key:string, Value:string }>("../Files/TestWorkbook", [
    {
        name: "Worksheet1", data,
        prepend: {
            title: "Details", rows:1,
            data: { Test: "A Text", Test2: 543543, "Test_Date": new Date() }
        }
    },
    {
        name: "Worksheet2", data:[],
        prepend: {
            title: "Details", rows:3,
            data: {
                Test: "A Text", Test2: 543543, "Test Date": `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
                Test4: "A little longer text", Test5: 543543, "Second Date": new Date(),
                Test7: 2, Test8: false,
            }
        }
    },
    {
        name: "Worksheet3", data,
        prepend: {
            title: "Details", rows:3,
            data: {
                Test: "A Text", Test2: 543543, "Test Date": `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
                Test4: "A little longer text", Test5: 543543, "Second Date": new Date(),
                Test7: 2, Test8: false,
            }
        },
        append: {
            title: "Footer", patternColor: "FF00AA",
            data: { "Written By": "Alessio Velluso" }
        }
    }
])


// --- Read Files
// Test("gfhfhfhgf")
const words = wfu.findWords(".", [ ".ts" ], ["node_modules"], /Test\("([^"]+)"\)/g)
const queries = words.map(word =>
    'INSERT INTO [db].[Schema].[TabName] ' +
    '(xyz, sbc, sdf, ert) ' +
    `VALUES (10005, 'en-US', '${word}', '${word}')`
);
console.log(queries.join("\n;"))
