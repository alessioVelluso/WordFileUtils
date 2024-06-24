# Word File Utils

`v0.0.2`

This is a package i made for myself but can surely be helpful to others, feel free to contribute if you like it

## Install:

```
npm install word-file-utils
```



The package is just a class exporting as default, feel free to use all the OOP intuition to override / delete / edit however you want the original class.

At the moment, the interface of the class is as it follows:

```ts

export interface IGenericUtils {
    parseDate: (date?:string) => string
    catchRes: <T>(isOk:false, response:T | null, error?:string | null) => CatchedResponse<T>
    isAxiosOk: (res:{ status:number, [Key:string]: GenericType} /* pass an AxiosResponse */) => boolean;
    isStringValid: (str?:string) => boolean
}


interface  IWordFileUtils {
	separator:string;
	errorTranslationValue:string;
	translationColumnName:string;


	parseCsvToObjectList:<T  extends  Record<string, string | number | boolean | Date> = GenericObject>(csvFilepath:string, separator?:string) =>  T[];
	parseObjectListToCsv:<T  extends  GenericObject = GenericObject>(data:T[], separator?:string) =>  string
	writeCsv:<T  extends  GenericObject = GenericObject>(outputCsv:string, data:T[], separator?:string) =>  Promise<void>
	createWorkbook: <T  extends  GenericObject = GenericObject>(worksheets:WfuWorksheet<T>[]) =>  Promise<Workbook>;
	writeWorkbook:<T  extends  GenericObject = GenericObject>(output:string, worksheets:WfuWorksheet<T>[]) =>  Promise<void>;

	translateValue:(value:string, localeIn:string, localeOut:string) =>  Promise<string>;
	translateObjectList:<T  extends  GenericObject = GenericObject>(data:T[], { translatingCol, cultureFrom, cultureTo }:TranslationConfig) =>  Promise<T[]>
	translateCsv:(data:TranslateCsvConfig) =>  Promise<void>;

	findWords: (folderToRead:string, desiredExtensions:string[], excludeDir:string[], wordToFind:RegExp) =>  string[],
	writeJson:<T  extends  GenericObject = GenericObject>(outputCsv:string, data:T[]) =>  void
}
```


## Initialize the class

```ts
import { WordFileUtils, GenericUtils } from "word-file-utils"
```
I suggest you to create a generic utils class extending mine (GenericUtils) if you want a solid way to store all your utils functions or whatever.
You can find an example in the `test3/utils.ts` file in this repo.

For the WordFileUtils class i reccomand you to initialize a new object everytime you require it.
The constructor of WordFileUtils follows this interface:
```ts
constructor(data:TranslationMakerConstructor = {})
interface TranslationMakerConstructor {  separator?:string, errorTranslationValue?:string, translationColumnName?:string }
```

The **separator** can be defined here or in any method that requires it as an optional parameter.
The **errorTranslationValue** and **translationColumnName** are specific to the translations method.

Feel free to omit all of the three params if you don't require them.



## A brief explanation of the methods:

##### 1. Parse Csv To Object List
```js
parseCsvToObjectList:<T  extends  Record<string, string | number | boolean | Date> = GenericObject>(csvFilepath:string, separator?:string) =>  T[];
```

Parse a csv in an array of object, having the key as column name:

```csv
Col1,Col2
Value1,Value2
Value3,Value4
```

This is gonna be parsed as

```js
[
	{ Col1:  Value1, Col2:Value2 },
	{ Col1:  Value3, Col2:Value4 },
]
```

##### 2. Parse Object List To Csv
```js
parseObjectListToCsv:<T  extends  GenericObject = GenericObject>(data:T[], separator:string) => string
```
Returns a string ready to be written down with the specific `writeCsv<T = GenericObject>(outputCsv:string, data:T, separator?:string)`or passed in an api

##### 3. Create Workbook
```js
createWorkbook: <T  extends  GenericObject = GenericObject>(worksheets:WfuWorksheet<T>[]) =>  Promise<Workbook>;
```
Returns an ExcelJs.Workbook ready to be passed with an api


```ts
const  wfu = new  Wfu({ separator:  "|" });

const data = [{col1:"Test1",col2:"Test2"},{col1:"Test3",col2:"Test4"}]
wfu.createWorkbook<{ Key:string, Value:string }>([
	{
		name:  "Worksheet1", data,
		prepend: {
			title:  "Details", rows:1,
			data: { Test:  "A Text", Test2:  543543, "Test_Date":  new  Date() }
		}
	}
]);
```
**LOOK AT THE TEST REPO FOR EXAMPLES**


##### 4. Write Csv
```js
writeCsv:<T  extends  GenericObject = GenericObject>(outputCsv:string, data:T[], separator?:string) =>  Promise<void>
```

Write a csv locally with an object list parameter, having the column as the object keys.
It uses the related `parseObjectListToCsv` method


##### 5. Write Workbook
```js
writeWorkbook:<T  extends  GenericObject = GenericObject>(output:string, worksheets:WfuWorksheet<T>[]) =>  Promise<void>;
```

Write a workbook locally using the related method `createWorkbook`
**WRITE THE OUTPOUT WITHOUT THE FINAL EXTENSION LIKE:**
```ts
writeWorkbook("../Files/test", [...])
```


##### 6. Translate Value
```js
translateObjectList:<T  extends  GenericObject = GenericObject>(data:T[], { translatingCol, cultureFrom, cultureTo }:TranslationConfig) =>  Promise<T[]>
```

Simply translating a word to the desired one


##### 8. Translate Object List
```js
translateObjectList:(data:GenericObject[], { translatingCol, cultureFrom, cultureTo }:TranslationConfig) =>  Promise<GenericObject[]>
```

After specifying the target column, the func return the same object list with an added key of the translation


##### 9. Translate Csv
```js
translateCsv:(data:TranslateCsvConfig) =>  Promise<void>
```

Take a csv as input and write the same csv with an added translated_value column.
It uses the related `parseCsvToObjectList`,`translateObjectList` and `writeCsv` methods



##### 10. Find Words
```js
findWords: (folderToRead:string, desiredExtensions:string[], wordToFind:RegExp) =>  string[]
```

This will search along the whole project, in specified extensions files, and return a list of all the words matching a specified RegExp pattern.


##### 11. Write Json
```js
writeJson:<T  extends  GenericObject = GenericObject>(outputCsv:string, data:T[]) =>  void
```

Easily write a local json


## Types

```ts
import { Column } from "exceljs"
import { GoogleTranslateLocales } from "./translate.types"



// --- Generic Utils
export interface GenericObject { [Key:string]: string | number | boolean | Date | GenericObject }

export type GenericType = string | number | boolean | Date | GenericObject

export interface CatchedResponse<T> { isOk:boolean, response: T | null, error?:string | null }



// --- Word File Utils
export interface TranslationConfig { translatingCol:string, cultureFrom:GoogleTranslateLocales, cultureTo:GoogleTranslateLocales }

export interface TranslateCsvConfig extends TranslationConfig { csvFilepath:string, outFilepath:string, separator?:string }

export interface TranslationMakerConstructor {  separator?:string, errorTranslationValue?:string, translationColumnName?:string }

export interface WfuExcelColumn extends Partial<Column> { name:string, parse?: 'date' };

export type WfuWorksheetDetails = { title:string, rows?:number, data: GenericObject, patternColor?: string }
export interface WfuWorksheet<T extends GenericObject = GenericObject> {
    name: string,
    data:T[],
    prepend?: WfuWorksheetDetails
    append?: WfuWorksheetDetails,
}

```
