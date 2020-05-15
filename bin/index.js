#!/usr/bin/env node

// !/usr/bin/node是告诉操作系统执行这个脚本的时候，调用/usr/bin下的node解释器；
// !/usr/bin/env node这种用法是为了防止操作系统用户没有将node装在默认的/usr/bin路径里。当系统看到这一行的时候，首先会到env设置里查找node的安装路径，再调用对应路径下的解释器程序完成操作。
// !/usr/bin/node相当于写死了node路径;
// !/usr/bin/env node会去环境设置寻找node目录,推荐这种写法
'use strict';
// //它提供了用户命令行输入和参数解析的强大功能，可以帮助我们简化命令行开发。 https://aotu.io/notes/2016/08/09/command-line-development/index.html
const commander = require('commander');
// // 包的作用是修改控制台中字符串的样式 https://segmentfault.com/a/1190000011808938
const chalk = require('chalk'); // green
const packageJson = require('../package.json');
// 跟命令进行交互
const inquirer = require('inquirer');
const path = require('path');
// 用于比对node版本
const semver = require('semver');
// 因为无法使用async 和 await 而且不想写过多回调嵌套
// var asyncTask = require('run-series');
// 复制模板文件
const copy = require('copy-template-dir');
// console.log文字
const Alphabet = require('alphabetjs');
const admZip = require('adm-zip');
const fs = require('fs');
// 删文件
const rimraf = require('rimraf');
const stat = fs.stat;
nodeVersionCheck(); // 检查node版本兼容性
// 生成模板列表
const templates = packageJson.templates.map((template) => {
    return {
        name: template,
        value: template,
    };
});
const program = new commander.Command(chalk.green(packageJson.name))
    .version(packageJson.version)
    .usage(
        `${chalk.green('init')} ${chalk.gray('or')} ${chalk.green('reactor init')} ${chalk.blue(
            '[template-type]'
        )} ${chalk.cyan('[package name]')}`
    );

// must be before .parse() since
// node's emit() is immediate
/**
 * Help.
 */

program.on('--help', () => {
    console.log();
    console.log();
    console.log('  Init ways:');
    console.log();
    console.log(chalk.gray('    # create a new project with an official template'));
    console.log('    $ reactor init react-saga my-project');
    console.log();
    console.log(chalk.gray('    # or this way'));
    console.log('    $ reactor init');
    console.log(chalk.gray('    # Then choose your personal configuration'));
    console.log();
});
function help() {
    // 如果用户没有输入参数，那么给他显示help
    program.parse(process.argv);
    if (program.args.length < 1) return program.help();
}
help();

program.command(`init [type] [package_name]`).action((type = '', package_name = '') => {
    //字体打印
    const str = Alphabet('REACTOR', 'stereo'); // stereo planar
    console.log(str);
    console.log('');
    console.log(chalk.green('<------------------------ Start Init ------------------------->'));
    console.log('');
    console.log(chalk.blue(`You can use default values in 'Enter!'`));
    let questions = askQuestions();
    if (!type) {
        questions.unshift();
    }
    if (!package_name) {
        questions.unshift();
    } else {
        if (fs.existsSync(targetDir)) {
            console.log(chalk.red(`${targetDir} already exists`));
            process.exit();
        }
    }

    inquirer.prompt(questions).then(function(params) {
        console.log(chalk.green('<------------------------ Start Generate --------------------->'));
        var templateDir = path.join(__dirname, `../templates/${params.template_type}`); // 模板目录
        var zipDir = path.join(__dirname, `../zips/${params.template_type}.zip`); // 压缩模板目录
        var targetDir = path.resolve(package_name || params.package_name); // 目标目录
        var data = {
            // key对应生成的{{key}}
            author: params.author,
            name: package_name || params.package_name,
            reactorVersion: packageJson.version,
            version: params.version,
            description: params.description,
            git: params.git,
            license: params.license,
        };
        let options = {
            zipDir: zipDir,
            templateDir: templateDir,
            targetDir: targetDir,
            data: data,
            callback: () => {
                console.log(chalk.green('<------------------------ Generate Success ------------------->'));
                console.log();
                console.log('have a good time!');
            },
        };
        unZipTemplate(options);
    });
});
program.parse(process.argv);

function nodeVersionCheck() {
    if (!semver.satisfies(process.version, '>=8.0.0')) {
        console.log(
            chalk.red(`
            your node version ${process.version} \n
            Reactor suggest version >= 8.0.0 \n
            Reactor recommends that you use more than 8.0.0 version of Node.\n 
            Please upgrade your node version first. Thank you!\n\n
            `)
        );
        process.exit();
    }
}
function unZipTemplate(options) {
    // 判断模板zip
    if (!fs.existsSync(options.zipDir)) {
        console.log(`${chalk.red('Can not find this template zip package')}`);
        process.exit();
    }
    // 判断目标是否存在targetDir文件;
    if (fs.existsSync(options.targetDir)) {
        console.log(chalk.red(`${targetDir} already exists`));
        process.exit();
    }
    if (fs.existsSync(options.templateDir)) {
        // 有则直接复制
        rimraf(options.templateDir, () => {
            unZip(options);
        });
    } else {
        // 没有模板则解压模板
        unZip(options);
    }
}
function unZip(options) {
    try {
        var unzip = new admZip(options.zipDir);
        unzip.extractAllTo(options.templateDir, /*overwrite*/ true); // 解压至模板文件
        console.log(chalk.green('<------------------------ Start Unzip ------------------------>'));
        copyTemplate(options);
    } catch (error) {
        console.error(error);
    }
}
function copyTemplate(options) {
    copy(options.templateDir, options.targetDir, options.data, (err, files) => {
        if (err) {
            console.log('copy error', err);
        }
        files.sort().forEach((createdFile) => {
            var relativePath = path.relative(options.targetDir, createdFile);
            console.log(`${chalk.green('create')} ${relativePath}`);
        });
        // 将图片重新复制一遍
        // copyRepair(`${options.templateDir}\\src\\assets\\images`, `${options.targetDir}\\src\\assets\\images`);
        copyRepair(`${options.templateDir}/src/assets/images`, `${options.targetDir}/src/assets/images`);
        options.callback();
    });
}
// 兼容copy-template-dir这个插件导致image复制不了的bug
function copyRepair(src, dst) {
    // 读取目录中的所有文件/目录
    fs.readdir(src, function(err, paths) {
        if (err) {
            throw err;
        }

        paths.forEach(function(path) {
            var _src = src + '/' + path,
                _dst = dst + '/' + path,
                readable,
                writable;

            stat(_src, function(err, st) {
                if (err) {
                    throw err;
                }
                // 判断是否为文件
                if (st.isFile()) {
                    // 创建读取流
                    readable = fs.createReadStream(_src);
                    // 创建写入流
                    writable = fs.createWriteStream(_dst);
                    // 通过管道来传输流
                    readable.pipe(writable);
                }
                // 如果是目录则递归调用自身
                else if (st.isDirectory()) {
                    exists(_src, _dst, copyRepair);
                }
            });
        });
    });
}
// 在复制目录前需要判断该目录是否存在，不存在需要先创建目录
function exists(src, dst, callback) {
    fs.exists(dst, function(exists) {
        // 已存在
        if (exists) {
            callback(src, dst);
        }
        // 不存在
        else {
            fs.mkdir(dst, function() {
                callback(src, dst);
            });
        }
    });
}
/**
 * 提问操作
 * @returns {Array} questions
 */
function askQuestions() {
    var questions = [
        {
            type: 'input',
            name: 'package_name',
            message: `package name: (my-reactor)`,
            default: 'my-reactor',
            validate: function(input) {
                if (!input) {
                    return 'The package name can not be empty!';
                }
                var targetDir = path.resolve(input); // 目标目录
                if (fs.existsSync(targetDir)) {
                    return 'Folder already exists!';
                }
                return true;
            },
        },
        {
            type: 'list',
            name: 'template_type',
            message: 'Please select a template type：',
            pageSize: 2,
            choices: templates,
        },
        {
            type: 'input',
            name: 'version',
            message: `version: (1.0.0)`,
            default: '1.0.0',
            validate: function(input) {
                if (!semver.valid(input)) {
                    return 'version error';
                }
                return true;
            },
        },
        {
            type: 'input',
            name: 'description',
            message: `description:`,
        },
        {
            type: 'input',
            name: 'git',
            message: `git repository:`,
        },
        {
            type: 'input',
            name: 'license',
            message: `license: (ISC):`,
            default: 'ISC',
        },
        {
            type: 'input',
            name: 'author',
            message: `author:`,
        },
    ];
    return questions;
}
