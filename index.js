#!/usr/bin/env node
const fs = require('fs');
const prog = require("caporal");
const ftp = require("basic-ftp");
const cliSpinners = require('cli-spinners');



if (!fs. existsSync('./.deployconf')) {
    console.error('File .deployconf does not exist')
    return;
}

const settings = fs.readFileSync('./.deployconf');
settingsArray = settings.toString().split('\n');
let settingsObj = {};
settingsArray.forEach(line => {
    let obj = new Map([line.split('=')]);
    const valueToInsert = Object.fromEntries(obj);
    settingsObj = {...settingsObj, ...valueToInsert}
})

prog.version("1.0.0")
    .description("Deploy an application")
    .argument(
        "[folder]",
        "What folder to deploy",
        /./gu
    )
    .option(
        "--clear [value]",
        "Clear folder content [value]. Default is true ",
        /./gu
    )
    .action(function (args, options, logger) {
        Object.keys(args).forEach(key => {
            if(key === 'folder') {
                const files = fs.readdirSync(args[key]);
                logger.info(`Uploading files ${files}`);
                
                logger.info(options);
                uploadFiles(args[key], settingsObj, options.clear)
                
                    
                
            }
        })
    });

    async function uploadFiles(uploadDirectory, uploadSettings, clearOptions = true) {
        const client = new ftp.Client()
        client.ftp.verbose = false
        try {
            await client.access({
                host: uploadSettings.ftp,
                user: uploadSettings.username,
                password: uploadSettings.password,
                secure: false
            })
            //console.log(await client.list())
            await client.ensureDir("./")

            if (clearOptions) {
                await client.clearWorkingDir();
            }
            await client.uploadFromDir(uploadDirectory);
           

        }
        catch(err) {
            console.log(err)
        }
        client.close()
    }


prog.parse(process.argv);

