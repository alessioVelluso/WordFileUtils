import { CatchedResponse, GenericType, LoggerConstructor } from "../types/generic.types";
import Logger from "./Logger";


export interface IGenericUtils {
    parseDate: (date?:string) => string
    catchRes: <T>(isOk:false, response:T | null, error?:string | null) => CatchedResponse<T>
    isAxiosOk: (res:{ status:number, [Key:string]: GenericType} /* pass an AxiosResponse */) => boolean;
    isStringValid: (str?:string) => boolean
}



export default class GenericUtils extends Logger implements IGenericUtils
{
    constructor(data?:LoggerConstructor) {
        super(data);
    }
    parseDate = (date?:string):string => {
        const dateObj = !date ? new Date() : new Date(date);
        return `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString()}`;
    };


    catchRes = <T = null>(isOk: boolean, response: T | null, error: string | null = null): CatchedResponse<T> => {
        return { isOk, response, error }
    };


    isAxiosOk = (res:{ status:number, [Key:string]: GenericType}):boolean => {
        if (res.status !== 200 && res.status !== 201 && res.status !== 204) return false;
        else return true;
    };


    isStringValid = (str?:string):boolean => {
        if (str === undefined || str === null) return false;

        if (str.trim() === "") return false;
        else return true;
    }

    catchResError = (err:any):CatchedResponse<any> => {
        err = this.logError(err)
        return { isOk: false, response:null, error:err }
    }
}
