import { WriteStream, createWriteStream } from "fs";
import { LogColors, LoggerConstructor } from "../types/generic.types";

export interface ILogger {
    log: (message:any, color?:LogColors) => void;
    logFile: (message:string, type?:"log" | "error", isClosing?:boolean) => void;
    logError: (err:any) => string | any;
}


export default class Logger implements ILogger
{
    constructor(data?:LoggerConstructor) {
        if (data?.logFilePath) this.fileStream = createWriteStream(data.logFilePath, { flags: 'a' });
        if (data?.debug) this.isDebug = data.debug;
    }

    private readonly isDebug:boolean = true;
    private readonly dateObj = new Date();
    private readonly fileStream:WriteStream = null!;
    protected readonly colors = {
        red: "\x1b[31m%s\x1b[0m",
        green: "\x1b[32m%s\x1b[0m",
        yellow: "\x1b[33m%s\x1b[0m",
        blue: "\x1b[34m%s\x1b[0m",
        magenta: "\x1b[35m%s\x1b[0m",
        cyan: "\x1b[36m%s\x1b[0m",
        gray: "\x1b[90m%s\x1b[0m"
    }



    log(message:any, color:LogColors = null) {
        if (!this.isDebug) return;

        if (!color) console.log(`[${this.dateObj.toLocaleDateString()} ${this.dateObj.toLocaleTimeString()}]   `, message);
        else {
            if (typeof message === "string") console.log(this.colors[color], `[${this.dateObj.toLocaleDateString()} ${this.dateObj.toLocaleTimeString()}]   ${message}`);
            else console.log(this.colors[color], `[${this.dateObj.toLocaleDateString()} ${this.dateObj.toLocaleTimeString()}]   `, message);
        }
    }

    logError(err:any):string | any {
        if (!this.isDebug) return err;

        let errorMessage:string = null!;
        let stackTrace:string = null!;

        if (err.message) errorMessage = err.message;
        if (err.stack) stackTrace = err.stack.split("\n")[1];

        if (!errorMessage) {
            this.log(err, "red");
            return err;
        }
        else {
            this.log(errorMessage, "red")
            if (stackTrace) console.log(this.colors["gray"], stackTrace)

            return errorMessage;
        }
    }

    logFile(message:string, type:"log" | "error" = "log", isClosing:boolean = true) {
        if (!this.fileStream) return this.log("LOGFILE: Specify filepath destination in class constructor or function parameter", "red");

        const date = `[${this.dateObj.toLocaleDateString()} ${this.dateObj.toLocaleTimeString()}]`
        const logType = type === "log" ? "LOG  " : "ERROR"
        this.fileStream.write(`${date}   ${logType}  ${message}\n`);
        if (isClosing) this.fileStream.close();
    }
}
