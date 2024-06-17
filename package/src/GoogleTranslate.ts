import { GoogleTranslateLocales } from "./types/translate.types"

export default class GoogleTranslateApi {

    private readonly firstUrl = "https://translate.google.com/translate_a/single?client=at&dt=t&dt=ld&dt=qca&dt=rm&dt=bd&dj=1&hl="
    private readonly secondUrl = "&ie=UTF-8&oe=UTF-8&inputm=2&otf=2&iid=1dd3b944-fa62-4b55-b330-74909a99969e"
    private readonly headers = {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        'User-Agent': 'AndroidTranslate/5.3.0.RC02.130475354-53000263 5.1 phone TRANSLATE_OPM5_TEST_1',
    }

    protected async translate(data:{from:GoogleTranslateLocales, to:GoogleTranslateLocales, text:string}):Promise<string> {
        try
        {
            const finalUrl:string = `${this.firstUrl}${data.to}${this.secondUrl}`
            const formUrlencodedData:{[Key:string]:string} = { sl: data.from, tl: data.to, q: data.text }
            const body = Object.keys(formUrlencodedData)
                .map(x => `${encodeURIComponent(x)}=${encodeURIComponent(formUrlencodedData[x])}`)
                .join("&");


            const fetching = await fetch(finalUrl, { method: 'POST', headers: this.headers, body })
            const res = await fetching.json();

            const translation:string = res?.sentences?.at(0)?.trans ?? null!
            if (translation !== null) return translation;
            else return "xxx-ERROR-xxx"
        }
        catch(err)
        {
            console.error(err);
            return "xxx-ERROR-xxx";
        }
    }
}
