declare module 'node-google-translate-skidz' {
    export default function translate(data:{ text: string, source: string, target: string }): Promise<string>;
}
