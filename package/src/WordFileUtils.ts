import fs from "fs"
import path from 'path'
import translate from 'node-google-translate-skidz';
import { GenericObject, TranslateCsvConfig, TranslationConfig, TranslationMakerConstructor } from "./types.js";




interface IWordFileUtils {
    separator:string;
    errorTranslationValue:string;
    translationColumnName:string;

    translateValue:(value:string, localeIn:string, localeOut:string) => Promise<string>;
    parseCsv:(csvFilepath:string, separator:string) => GenericObject[];
    translateObjectList:(data:GenericObject[], { translatingCol, cultureFrom, cultureTo }:TranslationConfig) => Promise<GenericObject[]>
    writeCsv:(outputCsv:string, data:GenericObject[], separator:string) => Promise<void>
    translateCsv:(data:TranslateCsvConfig) => Promise<void>
	findWords: (folderToRead:string, desiredExtensions:string[], wordToFind:RegExp) => string[]
}





export default class WordFileUtils implements IWordFileUtils {

	// --- Data
  	public errorTranslationValue = "xxx-ERROR-xxx";
  	public translationColumnName = "translated_value"
  	public separator = ";"

	constructor({ separator, errorTranslationValue, translationColumnName }:TranslationMakerConstructor) {
		if (separator) this.separator = separator;
		if (errorTranslationValue) this.errorTranslationValue = errorTranslationValue
		if (translationColumnName) this.translationColumnName = translationColumnName
	}



	// --- Methods
	public findWords = (folderToRead:string, desiredExtensions:string[], wordToFind:RegExp) => {
        const allWords:string[] = [];

        const files = fs.readdirSync(folderToRead, { encoding: 'utf-8', recursive: true });
        const filteredFiles = files.filter(file => desiredExtensions.some(x => file.includes(x)))

        const length = filteredFiles.length
        for (let i = 0; i < length; i++) {
            console.log(`[${i+1}/${length}] => File ${filteredFiles[i]} read`);

            const text = fs.readFileSync(path.join(folderToRead, filteredFiles[i])).toString();
            const fileWords = [...text.matchAll(wordToFind)].map(x => x[1])
            console.log(`[${i+1}/${length}] => ${filteredFiles[i]} founded words:`, fileWords, '\n');

            allWords.push(...fileWords)
        }

        return allWords;
    }


  	public async translateValue(value:string, localeIn:string, localeOut:string):Promise<string> {
    	const translation:string = await translate({ text: value, source: localeIn, target: localeOut });
    	return translation;
  	}


	public parseCsv(csvFilepath:string, separator:string = this.separator):GenericObject[] {
		const csvContent = fs.readFileSync(csvFilepath, 'utf-8');

		const rows = csvContent.split('\n');
		const cols = rows.splice(0,1)[0].split(separator);

		const result = rows.map(line => {
			const rowArray = line.split(separator);
			const result: { [Key:string]:string } = {}
			rowArray.forEach((x, i) => result[cols[i]] = x)

			return result
		});


		return result;
	}


  	public async translateObjectList(data:GenericObject[], { translatingCol, cultureFrom, cultureTo }:TranslationConfig):Promise<GenericObject[]> {
    	let j = 0;
    	const length = data.length;
		for (let row of data) {
			try
			{
				if (!row[translatingCol]) {
					console.log(`[${j + 1}/${length}] => ROW UNDEFINED`);
					continue;
				}
				const translation = await this.translateValue(row[translatingCol], cultureFrom, cultureTo);
				row[this.translationColumnName] = translation;
				console.log(`[${j + 1}/${length}] => ${row[translatingCol]} === ${translation}`);
			}
			catch (err)
			{
				console.error(`[${j + 1}/${length}] => ${row[translatingCol]} === Error:`, err);
				row[this.translationColumnName] = this.errorTranslationValue;
			}

			j++;
		}

		return data;
  	}


	public async writeCsv(outputCsv:string, data:GenericObject[], separator:string = this.separator):Promise<void> {
		const cols = Object.keys(data[0])
		const stringedArray = data.map(row => {
			const stringed = cols.map(x => row[x]).join(separator)
			return stringed
		})


		const parsedCsv = cols.join(separator) + '\n' + stringedArray.join('\n');
		fs.writeFile(outputCsv, parsedCsv, (err) => {
			if (err) console.error('Error:', err);
			else console.log('File saved in ' + outputCsv);
		});
	}



	public async translateCsv({csvFilepath, outFilepath, translatingCol, cultureFrom, cultureTo, separator = this.separator }:TranslateCsvConfig) {
		const objectListCsv = this.parseCsv(csvFilepath, separator);
		const translatedObjectList = await this.translateObjectList(objectListCsv, { translatingCol, cultureFrom, cultureTo });

		this.writeCsv(outFilepath, translatedObjectList, separator);
	}
}
