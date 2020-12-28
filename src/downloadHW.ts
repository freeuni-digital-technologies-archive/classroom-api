import { getSubmissions } from './index'
import { log } from './utils'
import { Submission } from './submission'
import { Drive } from './types'
import { saveFile,createDrive } from './classroom-api'
import fs from 'fs'

import unzipper from 'unzipper'
import pathModule from 'path'
import yargs from 'yargs' //for cli

function unzipSubmission(submission: Submission, path: string): Promise<string> {
    const dir = pathModule.dirname(path)
    // console.log('path:' + path)
    // console.log('dir:' + dir)
    return fs.createReadStream(path)
        .pipe(unzipper.Extract({path: dir}))
        .promise()
        .then(() => {
            console.log('Extracted: ' + path)
            return dir
        })
}

// may be useful someday 
// function findRootFile(dir: string): string {
//     let p = dir
//     let files = fs.readdirSync(p)
//     let tries = 0
//     while (!files.includes('index.html')) {
//         if (tries > 3) {
//             throw "homework files not found"
//         }
//         try {
//             p = `${p}/${files[0]}`
//             files = fs.readdirSync(p)
//         } catch (e) {
//             throw "file with unsupported format: " + files[0]
//         }

//         tries++

//     }
//     return p
// }


function downloadAtInterval(pathToStore:string, 
                                submission: Submission, 
                                drive: Drive,  
                                index: number, 
                                createDirs:boolean, 
                                skipExisting:boolean): Promise<string> {
    const attachment = submission.attachment!
    const fileName = attachment.title
    const emailId = submission.emailId
    const id = attachment.id
    var dir = ''
    if(createDirs)
        dir = `${pathToStore}/${emailId}`
    else 
        dir = `${pathToStore}`
    const path = `${dir}/${fileName}`
    
    if(skipExisting && fs.existsSync(path)){
        console.log('file already exists not downloading again ...')
        return Promise.resolve(path)
    }

    if(createDirs && !fs.existsSync(dir)){
        try {
            fs.mkdirSync(dir)
        } catch (whatever) {
            console.log("student folder couldn't be created.")
            return Promise.reject("student folder couldn't be created.")
        }         
    }

    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`${emailId}: downloading`)
            saveFile(drive, id, path)
                .then(() => resolve(path))
        }, (index) * 200)
    })
}

export async function downloadAll(pathToStore:string, 
                                    className:string, 
                                    hw:string, 
                                    createDirs:boolean, 
                                    allowLates:boolean, 
                                    autoExtract:boolean, 
                                    skipExisting:boolean): Promise<string[]>{
    const drive = await createDrive()
    console.log(pathToStore, className, hw)
    if (!fs.existsSync(pathToStore)) {
        console.log('Provided folder does not exists')
        process.exit(1)
    }


    return getSubmissions(className, hw)
        .then(submissions => log(submissions, `downloading ${submissions.filter(s => s.onTime()).length}`))
        .then(submissions => submissions.filter(s=>s.attachment!=undefined)) 
        .then(submissions => submissions.filter(s=>allowLates || s.onTime()))
        .then(submissions => submissions.map(
            (s, i) => downloadAtInterval(pathToStore, s, drive, i, createDirs, skipExisting)
                        .then(newPath => {
                            if(pathModule.extname(newPath)=='.zip' && autoExtract)
                                return unzipSubmission(s, newPath)
                            else 
                                return newPath
                        }, ()=>{return undefined})
        ))
        .then(pathPromises => Promise.all(pathPromises))
        .then(downloadedFilePaths => downloadedFilePaths.filter((p):p is string =>(p !== undefined)))
}


//check if called from cli
if (require.main === module) {
    const argv = yargs.options({
        class: {
            alias:'c',
            describe: 'class name',
            type:'string', 
            demandOption: true
        },
        hw: {
            alias:'h',
            describe: 'name of homework on the classroom',
            type:'string', 
            demandOption: true
        },
        path: {
            alias:'p',
            describe: 'directory to store homework',
            type:'string', 
            demandOption: true
        },
        subdirs: {
            alias:'d',
            describe: 'Create separate subdirectories for each student',
            type:'boolean'
        },
        lates: {
            alias:'l',
            describe: 'download late submissions as well',
            type:'boolean'
        },
        autoextract: {
            alias:'ae',
            describe: 'automatically extract all files in a zip in the same folder',
            type:'boolean'
        },
        skipExisting: {
            alias:'s',
            describe: 'skip downloading files that already exist',
            type:'boolean'
        },
    }).argv

    async function main(){
        let pathToStore = argv.path
        let className = argv.class
        let hw = argv.hw
        let createDirs = argv.subdirs || false
        let allowLates = argv.lates || false
        let autoExtract = argv.autoextract || false
        let skipExisting = argv.skipExisting || false
        
        await downloadAll(pathToStore, className, hw, createDirs, allowLates, autoExtract, skipExisting)
    }
    main()
}