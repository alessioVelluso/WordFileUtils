import { Column } from "exceljs"
import { GoogleTranslateLocales } from "./translate.types"



// --- Generic Utils
export interface GenericObject { [Key:string]: string | number | boolean | Date | GenericObject }

export type GenericType = string | number | boolean | Date | GenericObject

export interface CatchedResponse<T> { isOk:boolean, response: T | null, error?:string | null }

export interface PaginatedParams<T = null>{ currentPage:number, quantity:number, filter?:T }
export interface PaginatedResponse<T>{ totalPages:number, data:T }



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



// --- Logger
export type LogColors = "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | null

export interface LoggerConstructor { logFilePath?:string, debug?:boolean }
