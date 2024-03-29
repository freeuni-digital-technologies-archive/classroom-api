import fs from 'fs'
import yargs from 'yargs'
import { downloadStudentList } from './profile'
const argv = yargs.options({
    p: {
        alias:'path',
        describe: 'directory to store students.json',
        type:'string', 
        default: './', 
    },
    c: {
        alias:'class',
        describe: 'class name',
        type:'string', 
        demandOption: true
    }
}).argv


function main(){
    let path = argv.p
    let className = argv.c
    // path = 'wow'
    if(path[path.length - 1]!='/')
        path += '/'
    path += 'students.json'
    console.log(path)
    console.log(className)
    downloadStudentList(className).then(profiles => fs.writeFileSync(path, JSON.stringify(profiles, null, '\t'))) 
}

main()

