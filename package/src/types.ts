export type GenericObject = { [Key:string]: string }

export type TranslationConfig = { translatingCol:string, cultureFrom:string, cultureTo:string }

export type TranslateCsvConfig = TranslationConfig & { csvFilepath:string, outFilepath:string, separator?:string }

export type TranslationMakerConstructor = {  separator?:string, errorTranslationValue?:string, translationColumnName?:string }
