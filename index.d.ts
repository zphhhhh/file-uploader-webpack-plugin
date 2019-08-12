declare namespace FileUploaderWebpackPlugin {
    type FileUploaderObject = {
        test: RegExp | Function;
        receiver: string;
        to?: string;
        data?: object;
        parallel?: number | 3;
        retry?: number | 3;
    }
}