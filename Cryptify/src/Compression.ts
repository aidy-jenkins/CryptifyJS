module Compression {

    interface InputType {
        base64: string;
        string: string;
        text: string;
        binarystring: string;
        array: number[];
        uint8array: Uint8Array;
        arraybuffer: ArrayBuffer;
        blob: Blob;
        stream: NodeJS.ReadableStream;
    }

    interface OutputType {
        base64: string;
        string: string;
        text: string;
        binarystring: string;
        array: number[];
        uint8array: Uint8Array;
        arraybuffer: ArrayBuffer;
        blob: Blob;
        nodebuffer: Buffer;
    }

    export type DataType = InputType | OutputType;

    export interface Options extends JSZip.JSZipLoadOptions { }

    export const compress = async <TOutputType extends keyof OutputType>(data: InputType[keyof InputType], outputType: TOutputType, options?: Options) => {
        return await new JSZip().file("file.abc", data, options).generateAsync<TOutputType>({ type: outputType, compression: "DEFLATE", compressionOptions: { level: 9 } });
    }

    export const decompress = async <TOutputType extends keyof OutputType>(data: InputType[keyof InputType], outputType: TOutputType, options?: Options) => {
        let archive = await JSZip.loadAsync(data, options);
        return await archive.file("file.abc").async(outputType);
    }
}