import fs from "fs"
import path from 'path'
import translate from 'node-google-translate-skidz';
import { GenericObject, TranslateCsvConfig, TranslationConfig, TranslationMakerConstructor, WfuWorksheet, WfuWorksheetDetails } from "./types/types.js";
import ExcelJS, { Border, Borders, FillPattern, Workbook, Worksheet } from 'exceljs';





interface IWordFileUtils {
    separator:string;
    errorTranslationValue:string;
    translationColumnName:string;

    parseCsvToObjectList:<T extends Record<string, string | number | boolean | Date> = GenericObject>(csvFilepath:string, separator?:string) => T[];
	parseObjectListToCsv:<T extends GenericObject = GenericObject>(data:T[], separator?:string) => string
	writeCsv:<T extends GenericObject = GenericObject>(outputCsv:string, data:T[], separator?:string) => Promise<void>
	createWorkbook: <T extends GenericObject = GenericObject>(worksheets:WfuWorksheet<T>[]) => Promise<Workbook>;
	writeWorkbook:<T extends GenericObject = GenericObject>(output:string, worksheets:WfuWorksheet<T>[]) => Promise<void>;

	translateValue:(value:string, localeIn:string, localeOut:string) => Promise<string>;
    translateObjectList:<T extends GenericObject = GenericObject>(data:T[], { translatingCol, cultureFrom, cultureTo }:TranslationConfig) => Promise<T[]>
    translateCsv:(data:TranslateCsvConfig) => Promise<void>;

	findWords: (folderToRead:string, desiredExtensions:string[], excludeDir:string[], wordToFind:RegExp) => string[],
	writeJson:<T extends GenericObject = GenericObject>(outputCsv:string, data:T[]) => void
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


	/* ------------------------- */
	/* -------- GENERIC -------- */
	/* ------------------------- */

	// --- CSV - Excel

	public parseCsvToObjectList<T extends GenericObject = GenericObject>(csvFilepath:string, separator:string = this.separator):T[] {
		const csvContent = fs.readFileSync(csvFilepath, 'utf-8');

		const rows = csvContent.split('\n');
		const cols = rows.splice(0,1)[0].split(separator);

		const result = rows.map(line => {
			const rowArray = line.split(separator);
			const result = {} as T
			if (rowArray.length > 0) rowArray.forEach((x, i) => (result as GenericObject)[cols[i]] = x)

			return result
		});


		return result;
	}


	public parseObjectListToCsv<T extends GenericObject = GenericObject>(data:T[], separator:string = this.separator):string {
		const cols = Object.keys(data[0])
		const stringedArray = data.map(row => {
			const stringed = cols.map(x => row[x]).join(separator)
			return stringed
		})


		const parsedCsv = cols.join(separator) + '\n' + stringedArray.join('\n');
		return parsedCsv;
	}


	private manageWorksheetDetails(worksheet:Worksheet, detail:WfuWorksheetDetails,startY:number, startX:number):number {
		const constFill = { type: 'pattern', pattern: 'solid', fgColor:{ argb: detail.patternColor ?? 'E6E5E5' } } as FillPattern;
		const commonBorder:Partial<Border> = {style:'thin',color:{argb:'A9A6A7'}}
		const constBorders:Partial<Borders> = {top:commonBorder,left:commonBorder,bottom:commonBorder,right:commonBorder}

		const detailTitleCell = worksheet.getRow(startY).getCell(startX)
		detailTitleCell.style.fill = constFill
		detailTitleCell.style.border = constBorders
		detailTitleCell.value = ' ' + detail.title;
		startY++;

		const values = Object.entries(detail.data);
		const xLimit = Math.ceil(values.length / (detail.rows ?? 1));
		let x = 0, y = 0, i = 0;
		for (const value of values) {
			if (i === (xLimit * (y+1))) { y++; x = 0; }
			const relatedCell = worksheet.getRow(startY + y).getCell(startX + x);
			relatedCell.style.fill = constFill,
			relatedCell.style.border = constBorders
			relatedCell.value = ` ${value[0]}:  ${value[1]}`;

			x++; i++;
		}

		return startY + y;
	}

	public async createWorkbook<T extends GenericObject = GenericObject>(worksheets:WfuWorksheet<T>[]):Promise<Workbook> {
		const workbook = new ExcelJS.Workbook();

		for (const ws of worksheets)
		{
			const worksheet = workbook.addWorksheet(ws.name);
			let initialY = 2
			let initialX = 2;

			if (ws.prepend) {
				const newY = this.manageWorksheetDetails(worksheet, ws.prepend, initialY, initialX)
				initialY = newY + 2;
			}

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
					style: { theme: 'TableStyleMedium2', showRowStripes: true },
					columns,
					rows
				});

				initialY += rows.length + 3;
			}

			if (ws.append) {
				const newY = this.manageWorksheetDetails(worksheet, ws.append, initialY, initialX)
				initialY = newY + 1;
			}


			worksheet.columns.forEach((col, i) => {
				let maxLength = 0;

				if (col.header) maxLength = col.header.length;

				// eachCell is undefined if no cells are present in column
				if (col.eachCell) col.eachCell({ includeEmpty: true }, cell => {
					const cellValue = cell.value ? cell.value.toString() : '';
					maxLength = Math.max(maxLength, cellValue.length);
				});

				worksheet.getColumn(i + 1).width = maxLength + 2;
			});

			worksheet.getColumn(1).width = 10;
		}


		return workbook
	};



	// --- Translations

  	public async translateValue(value:string, localeIn:string, localeOut:string):Promise<string> {
    	const translation:string = await translate({ text: value, source: localeIn, target: localeOut });
    	return translation;
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



	/* ------------------------- */
	/* -------- WRITING -------- */
	/* ------------------------- */

	public findWords = (folderToRead:string, desiredExtensions:string[], excludeDir:string[], wordToFind:RegExp) => {
        const allWords:string[] = [];

        const files = fs.readdirSync(folderToRead, { encoding: 'utf-8', recursive: true });
        const filteredFiles = files.filter(file => desiredExtensions.some(x => file.includes(x)) && !excludeDir.some(x => file.includes(x)))

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


	public writeJson<T extends GenericObject = GenericObject>(outputCsv:string, data:T[]):void {
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


	public async writeCsv<T extends GenericObject = GenericObject>(outputCsv:string, data:T[], separator:string = this.separator):Promise<void> {
		const parsedCsv = this.parseObjectListToCsv(data, separator)
		fs.writeFile(outputCsv, parsedCsv, (err) => {
			if (err) console.error('Error:', err);
			else console.log('File saved in ' + outputCsv);
		});
	}


	public async translateCsv({csvFilepath, outFilepath, translatingCol, cultureFrom, cultureTo, separator = this.separator }:TranslateCsvConfig) {
		const objectListCsv = this.parseCsvToObjectList(csvFilepath, separator);
		const translatedObjectList = await this.translateObjectList(objectListCsv, { translatingCol, cultureFrom, cultureTo });

		this.writeCsv(outFilepath, translatedObjectList, separator);
	}


	public async writeWorkbook<T extends GenericObject = GenericObject>(output:string, worksheets:WfuWorksheet<T>[]):Promise<void> {
		const wb = await this.createWorkbook(worksheets);

		await wb.xlsx.writeFile(output + '.xls')
		console.log(`File saved in ${output}.xls`);
	}
}
