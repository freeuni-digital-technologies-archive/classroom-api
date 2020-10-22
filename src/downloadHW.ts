import { getSubmissions } from './index'
import { log } from './utils'
import { Submission } from './submission'
import { Drive } from './types'
import { saveFile,createDrive } from './classroom-api'
import fs from 'fs'

import yargs from 'yargs' //for cli

function downloadAtInterval(pathToStore:string, submission: Submission, drive: Drive,  index: number): Promise<string> {
    const attachment = submission.attachment!
    const fileName = attachment.title
    const emailId = submission.emailId
    const id = attachment.id
    const dir = `${pathToStore}/${emailId}`
    const path = `${dir}/${fileName}`
    // console.log(dir)
    try {
        fs.mkdirSync(dir)
    } catch (whatever) { 
        console.log('Could not create dir, probably already exists')
    }
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`${emailId}: downloading`)
            saveFile(drive, id, path)
                .then(() => resolve(path))
        }, (index) * 200)
    })
}

export async function downloadAll(pathToStore:string, className:string, hw:string){
    const drive = await createDrive()
    console.log(pathToStore, className, hw)
    getSubmissions(className, hw)
        .then(s => log(s, `downloading ${s.filter(e => e.onTime()).length}`))
        .then(submissions => submissions.filter(s=>s.attachment!=undefined)
        .map((s, i) => downloadAtInterval(pathToStore, s, drive, i)))
}


//check if called from cli
if (require.main === module) {
    const argv = yargs.options({
        c: {
            alias:'class',
            describe: 'class name',
            type:'string', 
            demandOption: true
        },
        h: {
            alias:'hw',
            describe: 'name of homework on the classroom',
            type:'string', 
            demandOption: true
        },
        p: {
            alias:'path',
            describe: 'directory to store homework',
            type:'string', 
            demandOption: true
        },
    }).argv

    async function main(){
        let pathToStore = argv.p
        let className = argv.c
        let hw = argv.h
        await downloadAll(pathToStore, className, hw)   
    }
    main()
}