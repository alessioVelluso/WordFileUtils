import fs from "fs"
import path from 'path'
import translate from 'node-google-translate-skidz';
import { GenericObject, TranslateCsvConfig, TranslationConfig, TranslationMakerConstructor, WfuWorksheet } from "./types/types.js";
import ExcelJS, { Alignment, Fill, FillPattern, FillPatterns, Font, Row } from 'exceljs';





interface IWordFileUtils {
    separator:string;
    errorTranslationValue:string;
    translationColumnName:string;

    translateValue:(value:string, localeIn:string, localeOut:string) => Promise<string>;
    parseCsv:<T extends Record<string, string | number | boolean> = GenericObject>(csvFilepath:string, separator:string) => T[];
    translateObjectList:<T extends GenericObject = GenericObject>(data:T[], { translatingCol, cultureFrom, cultureTo }:TranslationConfig) => Promise<T[]>
    writeCsv:<T extends GenericObject = GenericObject>(outputCsv:string, data:T[], separator:string) => Promise<void>
    translateCsv:(data:TranslateCsvConfig) => Promise<void>
	findWords: (folderToRead:string, desiredExtensions:string[], wordToFind:RegExp) => string[]
	createWorkbook: <T extends GenericObject = GenericObject>(name:string, worksheets:WfuWorksheet<T>[]) => void;
}





export default class WordFileUtils implements IWordFileUtils {

	// --- Data
  	public errorTranslationValue = "xxx-ERROR-xxx";
  	public translationColumnName = "translated_value"
  	public separator = ";"

	constructor(data:TranslationMakerConstructor = {}) {
		if (data?.separator) this.separator = data.separator;
		if (data.errorTranslationValue) this.errorTranslationValue = data.errorTranslationValue
		if (data.translationColumnName) this.translationColumnName = data.translationColumnName
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


	public parseCsv<T extends GenericObject = GenericObject>(csvFilepath:string, separator:string = this.separator):T[] {
		const csvContent = fs.readFileSync(csvFilepath, 'utf-8');

		const rows = csvContent.split('\n');
		const cols = rows.splice(0,1)[0].split(separator);

		const result = rows.map(line => {
			const rowArray = line.split(separator);
			const result = {} as T
			rowArray.forEach((x, i) => (result as GenericObject)[cols[i]] = x)

			return result
		});


		return result;
	}


  	public async translateObjectList<T extends GenericObject = GenericObject>(data:T[], { translatingCol, cultureFrom, cultureTo }:TranslationConfig):Promise<T[]> {
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


	public async writeCsv<T extends GenericObject = GenericObject>(outputCsv:string, data:T[], separator:string = this.separator):Promise<void> {
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


	public async createWorkbook<T extends GenericObject = GenericObject>(name:string, worksheets:WfuWorksheet<T>[]):Promise<void> {
		const workbook = new ExcelJS.Workbook();
		const initialY = 2
		const initialX = 2;

		for (const ws of worksheets)
		{
			const worksheet = workbook.addWorksheet(ws.name);
			const offsetCellAddress:string = worksheet.getRow(initialY).getCell(initialX).address;

			if (ws.data.length === 0)
			{
				const messageCells:string = worksheet.getRow(initialY + 2).getCell(initialX + 2).address;
				worksheet.mergeCells(`${offsetCellAddress}:${messageCells}`);

				worksheet.getCell(offsetCellAddress).value = 'no data found';
				worksheet.getCell(offsetCellAddress).alignment = { vertical: 'middle', horizontal: 'center' };
			}
			else
			{
				const columns = Object.keys(ws.data[0]).map(x => ({ name: x, filterButton: true }))
				const rows = ws.data.map(row => Object.values(row))
				worksheet.addTable({
					name: `Table_${ws.name}`,
					ref: offsetCellAddress,
					headerRow: true,
					totalsRow: true,
					style: { theme: 'TableStyleDark3', showRowStripes: true },
					columns,
					rows
				});

				columns.forEach((col, i) => {
					let maxLength = col.name.length;
					rows.forEach(row => {
						const cellValue = row[i] ? row[i].toString() : '';
						maxLength = Math.max(maxLength, cellValue.length);
					});

					worksheet.getColumn(i + initialX).width = maxLength + 2;
				});
			}
		}


		await workbook.xlsx.writeFile(name + '.xlsx')
		console.log(`File saved in ${name}.xlsx`);
	};
}
