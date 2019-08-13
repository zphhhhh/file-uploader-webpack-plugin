type FileUploaderOptions = {
    /** set test to filter files */
    test: RegExp | Function;
    /** set remote server address */
    receiver: string;
    /** set file upload path */
    to?: string;
    /** set extra parameters */
    data?: object;
    /** set parallel count(not multi-thread but multi-promise), default to 3 */
    parallel?: number | 3;
    /** set retry count when some file upload failed, default to 3 */
    retry?: number | 3;
}

declare class FileUploaderWebpackPlugin {
    constructor(options: FileUploaderOptions);
}

export = FileUploaderWebpackPlugin;