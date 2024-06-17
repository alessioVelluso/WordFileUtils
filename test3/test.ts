import WordFileUtils from "../package/src/WordFileUtils"

const wfu = new WordFileUtils();

wfu.translateCsv({
    csvFilepath:"../Files/Test_ITA.csv",
    outFilepath:"../Files/Test_EN.csv",
    translatingCol:"Value",
    separator: "|",
    cultureFrom:"it",
    cultureTo:"en"
});
