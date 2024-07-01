import { GoogleTranslateLocales } from "./translate.types"



// --- Word File Utils
export interface TranslationConfig { translatingCol:string, cultureFrom:GoogleTranslateLocales, cultureTo:GoogleTranslateLocales }

export interface TranslateCsvConfig extends TranslationConfig { csvFilepath:string, outFilepath:string, separator?:string }

export interface TranslationMakerConstructor {  separator?:string, errorTranslationValue?:string, translationColumnName?:string }
