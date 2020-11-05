import { getSubmissions } from './index'
import { log } from './utils'
import { Submission } from './submission'
import { Drive } from './types'
import { saveFile,createDrive } from './classroom-api'
import fs from 'fs'

import yargs from 'yargs' //for cli

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

export async function downloadAll(pathToStore:string, className:string, hw:string, createDirs:boolean, allowLates:boolean){
    const drive = await createDrive()
    console.log(pathToStore, className, hw)
    getSubmissions(className, hw)
        .then(s => log(s, `downloading ${s.filter(e => e.onTime()).length}`))
        .then(submissions => submissions.filter(s=>s.attachment!=undefined)
            .filter(s=>allowLates || s.onTime())
            .map((s, i) => downloadAtInterval(pathToStore, s, drive, i, createDirs)))
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
        }
    }).argv

    async function main(){
        let pathToStore = argv.path
        let className = argv.class
        let hw = argv.hw
        let createDirs = argv.subdirs || false
        let allowLates = argv.lates || false
        await downloadAll(pathToStore, className, hw, createDirs, allowLates)   
    }
    main()
}