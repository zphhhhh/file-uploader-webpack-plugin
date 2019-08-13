# file-uploader-webpack-plugin

🖐Upload files with webpack

### Install

``` shell
npm i -D file-uploader-webpack-plugin
```

> webpack >= 4.x is supported

### Use

``` javascript
// import
const FileUploaderWebpackPlugin = require("FileUploaderWebpackPlugin")

// Webpack plugin config
new FileUploaderWebpackPlugin({
    test: /\.js$/,
    receiver: "http://127.0.0.1:3000",
    to: "/home/zphhhhh/AwesomeProject",
    data: {
        key1: "value1",
        key2: "value2",
    },
    parallel: 3,
    retry: 3
})
```

### API

``` typescript
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
```

