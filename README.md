# Word File Utils
`v0.0.1`
This is a package i made for myself but can surely be helpful to others, feel free to contribute if you like it
## Install:
```
npm install word-file-utils
```

The package is just a class exporting as default, feel free to use all the OOP intuition to override / delete / edit however you want the original class.
At the moment, the interface of the class is as it follows:
```js
interface IWordFileUtils {
    separator:string,
    errorTranslationValue:string,
    translationColumnName:string,

    translateValue:(value:string, localeIn:string, localeOut:string) => Promise<string>,
    parseCsv:(csvFilepath:string, separator:string) => GenericObject[],
    translateObjectList:(data:GenericObject[], { translatingCol, cultureFrom, cultureTo }:TranslationConfig) => Promise<GenericObject[]>,
    writeCsv:(outputCsv:string, data:GenericObject[], separator:string) => Promise<void>,
    translateCsv:(data:TranslateCsvConfig) => Promise<void>,
    findWords: (folderToRead:string, desiredExtensions:string[], wordToFind:RegExp) => string[]
}
```


## A brief explanation of the methods:

#### 1. Translate Value
```js
translateValue: (value:string, localeIn:string, localeOut:string) => Promise<string>;
```
Simply translating a word to the desired one

#### 2. Parse Csv
```js
parseCsv: (csvFilepath:string, separator:string) => GenericObject[];
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
    { Col1: Value1, Col2:Value2 },
    { Col1: Value3, Col2:Value4 },
]
```

#### 3. Translate Object List
```js
translateObjectList: (data:GenericObject[], { translatingCol, cultureFrom, cultureTo }:TranslationConfig) => Promise<GenericObject[]>
```
After specifying the target column, the func return the same object list with an added key of the translation

#### 4. Write Csv
```js
writeCsv: (outputCsv:string, data:GenericObject[], separator:string) => Promise<void>
```
Write a csv with an object list parameter, having the column as the object keys.

#### 5. Translate Csv
```js
translateCsv: (data:TranslateCsvConfig) => Promise<void>
```
Take a csv as input and write the same csv with an added translated_value column.

#### 6. Find Words
```js
findWords: (folderToRead:string, desiredExtensions:string[], wordToFind:RegExp) => string[]
```
This will search along the whole project, in specified extensions files, and return a list of all the words matching a specified RegExp pattern.


## Types
```ts
export type GenericObject = { [Key:string]: string }

export type TranslationConfig = { translatingCol:string, cultureFrom:string, cultureTo:string }

export type TranslateCsvConfig = TranslationConfig & { csvFilepath:string, outFilepath:string, separator?:string }

export type TranslationMakerConstructor = {  separator?:string, errorTranslationValue?:string, translationColumnName?:string }
```
