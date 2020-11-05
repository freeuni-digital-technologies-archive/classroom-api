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
    console.log('path:' + path)
    console.log('dir:' + dir)
    // try {
    //     fs.mkdirSync(dir)
    // } catch (w) {
    //     throw new Error('Couldn\'t create folder for zip')
    // }
    return fs.createReadStream(path)
        .pipe(unzipper.Extract({path: dir}))
        .promise()
        .then(() => {
            console.log('exctracted: ' + path)
            return dir
        })
}

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

function downloadAtInterval(pathToStore:string, submission: Submission, drive: Drive,  index: number, createDirs:boolean): Promise<string> {
    const attachment = submission.attachment!
    const fileName = attachment.title
    const emailId = submission.emailId
    const id = attachment.id
    var dir = ''
    if(createDirs){
        dir = `${pathToStore}/${emailId}`
        try {
            fs.mkdirSync(dir)
        } catch (whatever) { 
            throw new Error('Could not create directory. Check that provided folder exists')
        }
    }
    else {
        dir = `${pathToStore}`
    }
    // console.log(dir)
    const path = `${dir}/${fileName}`
    

    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`${emailId}: downloading`)
            saveFile(drive, id, path)
                .then(() => resolve(path))
        }, (index) * 200)
    })
}

// each promise eventually returns a name of downloaded file
export async function downloadAll(pathToStore:string, className:string, hw:string, createDirs:boolean, allowLates:boolean, autoExtract:boolean){
    const drive = await createDrive()
    console.log(pathToStore, className, hw)
    getSubmissions(className, hw)
        .then(s => log(s, `downloading ${s.filter(e => e.onTime()).length}`))
        .then(submissions => submissions.filter(s=>s.attachment!=undefined))
        .then(submissions => submissions.filter(s=>allowLates || s.onTime()))
        .then(submissions => submissions.map(
            (s, i) => downloadAtInterval(pathToStore, s, drive, i, createDirs)
                        .then(newPath => {
                            if(pathModule.extname(newPath)=='.zip' && autoExtract)
                                return unzipSubmission(s, newPath)
                            else 
                                return newPath
                        })
        ))
        .catch((e:Error)=>{
            console.log(e.message)
        })
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
            describe: 'automatically extract all files in a zip in the same folder.',
            type:'boolean'
        }
    }).argv

    async function main(){
        let pathToStore = argv.path
        let className = argv.class
        let hw = argv.hw
        let createDirs = argv.subdirs || false
        let allowLates = argv.lates || false
        let autoExtract = argv.autoextract || false
        await downloadAll(pathToStore, className, hw, createDirs, allowLates, autoExtract)
    }
    main()
}