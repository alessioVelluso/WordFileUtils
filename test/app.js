const wfu = require("word-file-utils")




// --- Translation
const wfUtils = new wfu({ separator: "|" });
wfUtils.translateCsv({
    csvFilepath: "./Files/Test_ITA.csv",
    cultureFrom: "it",
    cultureTo: "en",
    translatingCol: "Value",
    outFilepath: "./Files/Test_EN.csv"
})



// --- File reading
// const words = wfUtils.findWords(".", [ ".ts" ], /File\("([^"]+)"\)/g)
// const queries = words.map(word =>
//     'INSERT INTO [db].[Schema].[TabName] ' +
//     '(xyz, sbc, sdf, ert) ' +
//     `VALUES (10005, 'en-US', '${word}', '${word}')`
// );

// console.log(queries.join("\n;"))
