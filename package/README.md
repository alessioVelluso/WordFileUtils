# Word File Utils

`v2.0.2`
This is a package i made for myself but can surely be helpful to others, feel free to contribute if you like it.

> [!WARNING]
> If you need excel js install [fast-js-excel](https://github.com/alessioVelluso/FastExcel) or take a look at [utils-stuff](https://github.com/alessioVelluso/UtilsStuff) wich is the lighter package.
> **DO NOT INSTALL ALL THREE LIBS CAUSE ONE IS THE "PARENT" OF THE OTHER:**
> 1. `utils-stuff`
> 2. `word-file-utils` (including utils-stuff)
> 3. `fast-js-excel` (including exceljs, word-file-utils (including utils-stuff))
>
>So if you install word-file utils you can use the classes of utils-stuff and so on, choose the one for your pourpose.

## Install:
```bash
npm install word-file-utils
```
The `WordFileUtils` extends a simple class with a simple function using the [statickidz/node-google-translate-skidz](https://github.com/statickidz/node-google-translate-skidz) api.
With this package comes the [alessiovelluso/utils-stuff](https://www.npmjs.com/package/utils-stuff), a package of server/client utilities that can be helpful, be sure to check the library for all the different utilities you can use. This one has basically two different classes `GenericUtils` & `ClientFilters`, you can import them just as explained from the lib documentation but using "word-file-utils" like
```ts
import { GenericUtils } from "word-file-utils"
```



At the moment, the interface of the class is as it follows:
```ts
interface  IWordFileUtils {
	separator:string;
	errorTranslationValue:string;
	translationColumnName:string;


	parseCsvToObjectList:<T extends Record<string, string | number | boolean | Date> = GenericObject>(csvFilepath:string, separator?:string) => T[];
	parseObjectListToCsv:<T extends  GenericObject = GenericObject>(data:T[], separator?:string) => string
	writeCsv:<T extends GenericObject = GenericObject>(outputCsv:string, data:T[], separator?:string) => Promise<void>

	translateValue:(value:string, localeIn:string, localeOut:string) => Promise<string>;
	translateObjectList:<T extends GenericObject = GenericObject>(data:T[], { translatingCol, cultureFrom, cultureTo }:TranslationConfig) => Promise<T[]>
	translateCsv:(data:TranslateCsvConfig) => Promise<void>;


	findWords: (folderToRead:string, desiredExtensions:string[], excludeDir:string[], wordToFind:RegExp) => string[],
	writeJson:<T extends GenericObject = GenericObject>(outputCsv:string, data:T[]) => void
}
```


## Initialize the class
```ts
import { WordFileUtils } from "word-file-utils"
```
I raccomand you to initialize a new object every file that requires it.
The constructor of WordFileUtils follows this interface:
```ts
constructor(data?:TranslationMakerConstructor)
interface TranslationMakerConstructor { separator?:string, errorTranslationValue?:string, translationColumnName?:string }
```
The **separator** can be defined here or in any method that requires it as an optional parameter.
The **errorTranslationValue** and **translationColumnName** are specific to the translations method.


## A brief explanation of the methods:
##### 1. Parse Csv To Object List
```js
parseCsvToObjectList:<T extends Record<string, string | number | boolean | Date> = GenericObject>(csvFilepath:string, separator?:string) => T[];
```
Parse a csv in an array of object, having the key as column name:
```
Col1,Col2
Value1,Value2
Value3,Value4
```
This is gonna be parsed as
```ts
[
	{ Col1:  Value1, Col2:Value2 },
	{ Col1:  Value3, Col2:Value4 },
]
```


##### 2. Parse Object List To Csv
```ts
parseObjectListToCsv:<T extends GenericObject = GenericObject>(data:T[], separator:string) => string
```
Returns a string ready to be written down with the specific `writeCsv<T = GenericObject>(outputCsv:string, data:T, separator?:string)`or passed in an api



##### 3. Write Csv
```ts
writeCsv:<T extends GenericObject = GenericObject>(outputCsv:string, data:T[], separator?:string) => Promise<void>
```
Write a csv locally with an object list parameter, having the column as the object keys.
It uses the related `parseObjectListToCsv` method


##### 4. Translate Value
```ts
translateObjectList:<T extends GenericObject = GenericObject>(data:T[], { translatingCol, cultureFrom, cultureTo }:TranslationConfig) => Promise<T[]>
```
Simply translating a word to the desired one


##### 5. Translate Object List
```ts
translateObjectList:(data:GenericObject[], { translatingCol, cultureFrom, cultureTo }:TranslationConfig) => Promise<GenericObject[]>
```
After specifying the target column, the func return the same object list with an added key of the translation


##### 6. Translate Csv
```ts
translateCsv:(data:TranslateCsvConfig) => Promise<void>
```
Take a csv as input and write the same csv with an added translated_value column.
It uses the related `parseCsvToObjectList`, `translateObjectList` and `writeCsv` methods


##### 7. Find Words
```ts
findWords: (folderToRead:string, desiredExtensions:string[], wordToFind:RegExp) => string[]
```
This will search along the whole project, in specified extensions files, and return a list of all the words matching a specified RegExp pattern.


##### 8. Write Json
```ts
writeJson:<T extends GenericObject = GenericObject>(outputCsv:string, data:T[]) => void
```
Easily write a local json



## Types
```ts
import { GoogleTranslateLocales } from  "./translate.types"


export  interface  TranslationConfig { translatingCol:string, cultureFrom:GoogleTranslateLocales, cultureTo:GoogleTranslateLocales }

export  interface  TranslateCsvConfig  extends  TranslationConfig { csvFilepath:string, outFilepath:string, separator?:string }

export  interface  TranslationMakerConstructor { separator?:string, errorTranslationValue?:string, translationColumnName?:string }
```
