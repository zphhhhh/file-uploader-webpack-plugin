/*!
 * file-uploader-webpack-plugin
 * (c) 2019-2019 zphhhhh
 * Released under the MIT License.
 */
const path = require('path');
const axios = require('axios');
const chalk = require('chalk')
const FormData = require('form-data');

class FileUploaderWebpackPlugin {
    /**
     * generete options
     * @param {FileUploaderOptions} options
     */
    constructor(options) {
        this.options = Object.assign({
            parallel: 3,
            retry: 3
        }, options);
    }

    apply(compiler) {
        const { receiver, to, data, parallel, retry } = this.options;

        compiler.hooks.emit.tapPromise('FileUploaderWebpackPlugin', compilation => {
            return new Promise(async resolve => {
                const retryTimes = {};
                const logBanner = chalk.green.bold(' - ') + chalk.grey('[Record]');
                const startTime = new Date().getTime();

                console.log('\n--------  👉  FileUploaderWebpackPlugin  👈  --------');

                // process the {key:value} assets to [array] assets
                const assets = Object.entries(compilation.assets).filter(item => this.shouldProcess(item[0]));
                const logFiles = assets.length;

                for (let i = 0; i < assets.length; i += parallel) {
                    // in each loop, process the `parallel` count of assets
                    const promises = assets.slice(i, i + parallel).map(([filename, file]) => this.genPostPromise({
                        compiler,
                        compilation,
                        filename,
                        file,
                        receiver,
                        to,
                        data
                    }));

                    await Promise.all(promises).then(results => {
                        results.forEach((item, index) => {
                            if (item instanceof Error) {
                                // push the error asset to re-process, and record retry time
                                const errorAsset = assets[i + index];
                                const errorFilename = errorAsset[0];

                                retryTimes[errorFilename] = retryTimes[errorFilename]
                                    ? retryTimes[errorFilename] + 1
                                    : 1;

                                if (retryTimes[errorFilename] <= retry) {
                                    const logInfo = `Upload error, will retry(${retryTimes[errorFilename]}) file: ${errorFilename}`;
                                    console.warn(`${logBanner} ${chalk.yellow.bold(logInfo)}`);
                                    assets.push(errorAsset);
                                }
                            }
                        })
                    });
                }

                const errorAssets = Object.entries(retryTimes).filter(item => item[1] > retry);

                if (errorAssets.length > 0) {
                    let maxLength = errorAssets.reduce((length, [filename]) => Math.max(length, filename.length), -1);

                    console.warn(`${logBanner} ${chalk.red.bold('Failed list:')}`);
                    errorAssets.forEach(([filename]) => {
                        console.error('\t\t\t' + chalk.red.bold(filename.padStart(maxLength, ' ')));
                    });
                }

                const endTime = new Date().getTime();

                const logTime = endTime - startTime;

                console.log(`${logBanner} Time: ${chalk.bold(logTime)}ms\tFiles: ${chalk.bold(logFiles)}`);
                console.log('--------  🍺  FileUploaderWebpackPlugin  🍺  --------');

                resolve();
            });
        });
    }

    /**
     * return True if the file should process
     * @param {string} filename
     * @returns {boolean} return True if the file should process
     */
    shouldProcess(filename) {
        const test = this.options.test;

        if (typeof test === 'function') {
            return test(filename);
        } else if (Object.prototype.toString.call(test) === '[object RegExp]') {
            return test.test(filename);
        }

        return false;
    }

    /**
     * return a POST request promise
     * @param {any} param
     * @returns {Promise} POST request promise
     */
    genPostPromise({ compiler, compilation, filename, file, receiver, to, data }) {
        const form = new FormData();
        const formFile = Buffer.from(file.source());
        const formTo = path.join(to, filename);

        form.append('file', formFile, filename);
        form.append('to', formTo);

        if (typeof data === 'object') {
            Object.entries(data).forEach(([key, val]) => {
                form.append(key, val);
            });
        }

        // wrap the POST request to a promise to return resolve always
        return new Promise(resolve => {
            axios.post(receiver, form, {
                headers: form.getHeaders()
            }).then(result => {
                const currentTime = this.getCurrentTime();
                const filepath = compiler.outputFileSystem.join(compilation.getPath(compiler.outputPath), filename);

                console.log(
                    chalk.green.bold(' - ')
                    + chalk.grey(currentTime) + ' '
                    + this.getCutText(filepath.split('?')[0])
                    + chalk.yellow.bold(' >> ')
                    + this.getCutText(formTo.split('?')[0])
                );

                resolve(result);
            }).catch(error => {
                resolve(new Error(error));
            });
        });
    }

    /**
     * return current time as `HH:MM:SS`
     * @returns {string} the current time string
     */
    getCurrentTime() {
        const date = new Date();

        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        return `${hours}:${minutes}:${seconds}`;
    }

    /**
     * get the cut string with max length
     * @param {string} text source string
     * @param {number} limit max length of the string
     * @returns {string} the cut string, replaced by `...`
     */
    getCutText(text, limit = 60) {
        if (limit < 5 || limit > text.length) {
            return text;
        }

        return text.slice(0, limit / 4) + '...' + text.slice(- limit / 4 * 3 + 3);
    }
}

module.exports = FileUploaderWebpackPlugin;
