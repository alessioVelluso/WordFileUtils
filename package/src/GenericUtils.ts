import { CatchedResponse, GenericType } from "../types/generic.types";


export interface IGenericUtils {
    parseDate: (date?:string) => string
    catchRes: {
        <T = null>(isOk:false, error:string): CatchedResponse<T>
        (isOk:true): CatchedResponse<true>
        <T>(isOk:true, response:T): CatchedResponse<T>
    }

}



export default class GenericUtils implements IGenericUtils
{
    parseDate = (date?:string):string => {
        const dateObj = !date ? new Date() : new Date(date);
        return `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString()}`;
    };


    // catchRes = <T = null>(isOk:boolean, response:T | null, error?:string | null):CatchedResponse<T> => {
    //     return { isOk, response, error };
    // };
    catchRes = <T = null>(isOk: boolean, response?: T | null, error?: string | null): CatchedResponse<T> => {
        if (isOk)
        {
            if (response === undefined) return { isOk, response: true as T, error: null };
            else return { isOk, response, error: null };
        }
        else
        {
            if (error === undefined) throw new Error("Error must be specified when isOk is false");
            else return { isOk, response:null, error };
        }
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
}
