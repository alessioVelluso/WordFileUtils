import { Column } from "exceljs"

export interface GenericObject { [Key:string]: string | number | boolean | Date }

export interface TranslationConfig { translatingCol:string, cultureFrom:string, cultureTo:string }

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
