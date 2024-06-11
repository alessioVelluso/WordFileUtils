import { Column } from "exceljs"

export interface GenericObject { [Key:string]: string | number | boolean }

export type TranslationConfig = { translatingCol:string, cultureFrom:string, cultureTo:string }

export type TranslateCsvConfig = TranslationConfig & { csvFilepath:string, outFilepath:string, separator?:string }

export type TranslationMakerConstructor = {  separator?:string, errorTranslationValue?:string, translationColumnName?:string }

export interface WfuExcelColumn extends Partial<Column> { name:string, parse?: 'date' };

export type WfuWorksheet<T extends GenericObject = GenericObject> = { name: string, data:T[], /* cols:WfuExcelColumn[] */ }
