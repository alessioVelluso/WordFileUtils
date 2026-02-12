import fs from "fs"
import path from 'path'
import { TranslateCsvConfig, TranslationConfig, TranslationMakerConstructor } from "../types/generic.types.js";
import { GenericObject } from "utils-stuff";
import GoogleTranslateApi from "./GoogleTranslate";
import { GoogleTranslateLocales } from "../types/translate.types.js";





interface IWordFileUtils {
    separator:string;
    errorTranslationValue:string;
    translationColumnName:string;

    parseCsvToObjectList:<T extends GenericObject = GenericObject>(csvFilepath:string, separator?:string) => T[];
	parseObjectListToCsv:<T extends GenericObject = GenericObject>(data:T[], separator?:string) => string
	writeCsv:<T extends GenericObject = GenericObject>(outputCsv:string, data:T[], separator?:string) => void

	translateValue:(value:string, localeIn:GoogleTranslateLocales, localeOut:GoogleTranslateLocales) => Promise<string>;
    translateObjectList:<T extends GenericObject = GenericObject>(data:T[], { translatingCol, cultureFrom, cultureTo }:TranslationConfig) => Promise<T[]>
    translateCsv:(data:TranslateCsvConfig) => Promise<void>;

	findWords: (folderToRead:string, desiredExtensions:string[], excludeDir:string[], wordToFind:RegExp) => string[],
	writeJson:<T extends GenericObject = GenericObject>(outputCsv:string, data:T[]) => void
}





export default class WordFileUtils extends GoogleTranslateApi implements IWordFileUtils
{

	// --- Data
  	public errorTranslationValue = "xxx-ERROR-xxx";
  	public translationColumnName = "translated_value"
  	public separator = ","

	constructor(data:TranslationMakerConstructor = {}) {
		super();
		if (data?.separator) this.separator = data.separator;
		if (data.errorTranslationValue) this.errorTranslationValue = data.errorTranslationValue
		if (data.translationColumnName) this.translationColumnName = data.translationColumnName
	}


	/* ------------------------- */
	/* -------- GENERIC -------- */
	/* ------------------------- */

	// --- CSV - Excel

	public parseCsvToObjectList = <T extends GenericObject = GenericObject>(csvFilepath:string, separator:string = this.separator):T[] => {
		const csvContent = fs.readFileSync(csvFilepath, 'utf-8');

		const rows:string[] = csvContent.split('\n');
		const cols = rows.splice(0,1)[0].split(separator).map(x => x.trim().replace(/[\r\n\t\v\f\0]/g, ''));

		const result = rows.map(line => {
			const result = {} as T

			if (line.replaceAll(separator, "").trim() !== "")
			{
				const rowArray = line.split(separator);
				if (rowArray.length > 0) rowArray.forEach((x, i) => (result as GenericObject)[cols[i]] = x.trim().replace(/[\r\n\t\v\f\0]/g, ''))
			}

			return result
		});

		return result;
	}


	public parseObjectListToCsv = <T extends GenericObject = GenericObject>(data:T[], separator:string = this.separator):string => {
		const cols = Object.keys(data[0])
		const stringedArray = data.map(row => {
			const stringed = cols.map(x => row[x]).join(separator)
			return stringed
		})


		const parsedCsv = cols.join(separator) + '\n' + stringedArray.join('\n');
		return parsedCsv;
	}




	// --- Translations

  	public translateValue = async (value:string, localeIn:GoogleTranslateLocales, localeOut:GoogleTranslateLocales):Promise<string> => {
    	const translation:string = await this.translate({ text: value, from: localeIn, to: localeOut });
    	return translation;
  	}


  	public translateObjectList = async <T extends GenericObject = GenericObject>(data:T[], { translatingCol, cultureFrom, cultureTo }:TranslationConfig):Promise<T[]> => {
    	let j = 0;
    	const length = data.length;
		for (let row of data) {
			try
			{
				if (!row[translatingCol]) {
					console.log(`[${j + 1}/${length}] => ROW UNDEFINED`);
					continue;
				}
				const translation = await this.translateValue(`${(row as GenericObject)[translatingCol]}`, cultureFrom, cultureTo);
				(row as GenericObject)[this.translationColumnName] = translation;
				console.log(`[${j + 1}/${length}] => ${row[translatingCol]} === ${translation}`);
			}
			catch (err)
			{
				console.error(`[${j + 1}/${length}] => ${row[translatingCol]} === Error:`, err);
				(row as GenericObject)[this.translationColumnName] = this.errorTranslationValue;
			}

			j++;
		}

		return data;
  	}



	/* ------------------------- */
	/* -------- WRITING -------- */
	/* ------------------------- */

	public findWords = (folderToRead:string, desiredExtensions:string[], excludeDir:string[], wordToFind:RegExp) => {
        const allWords:string[] = [];

        const files:string[] = fs.readdirSync(folderToRead, { encoding: 'utf-8', recursive: true });
        const filteredFiles = files.filter(file => desiredExtensions.some(x => file.includes(x)) && !excludeDir.some(x => file.includes(x)))

        const length = filteredFiles.length
        for (let i = 0; i < length; i++) {

            const text = fs.readFileSync(path.join(folderToRead, filteredFiles[i])).toString();
            const fileWords = [...text.matchAll(wordToFind)].map(x => x[1])
            console.log(`[${i+1}/${length}] => ${filteredFiles[i]} founded words:`, fileWords, '\n');

            allWords.push(...fileWords)
        }

        return allWords;
    }


	public writeJson = <T extends GenericObject = GenericObject>(outputCsv:string, data:T[]):void => {
		try
		{
			const json = JSON.stringify(data, null, 2);
			fs.writeFileSync(outputCsv, json);
		}
		catch(err)
		{
			console.error(err);
		}
	}


	public writeCsv = <T extends GenericObject = GenericObject>(outputCsv:string, data:T[], separator:string = this.separator):void => {
		const parsedCsv = this.parseObjectListToCsv(data, separator)
		fs.writeFile(outputCsv, parsedCsv, (err:string) => {
			if (err) console.error('Error:', err);
			else console.log('File saved in ' + outputCsv);
		});
	}


	public translateCsv = async ({csvFilepath, outFilepath, translatingCol, cultureFrom, cultureTo, separator = this.separator }:TranslateCsvConfig) => {
		const objectListCsv = this.parseCsvToObjectList(csvFilepath, separator);
		const translatedObjectList = await this.translateObjectList(objectListCsv, { translatingCol, cultureFrom, cultureTo });

		this.writeCsv(outFilepath, translatedObjectList, separator);
	}
}
