import { ClassroomApi } from './classroom-api'
import { UserProfile } from './types'
import yargs from 'yargs'
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
import fs from 'fs'
const translit = require('translitit-latin-to-mkhedruli-georgian')

async function getStudentList(className: string): Promise<UserProfile[]> {

    return ClassroomApi
        .findClass(className)
        .then(classroom => classroom.getUserProfiles())
        .then(profiles => profiles
            .map((p: UserProfile) => {
                delete p.permissions
                delete p.photoUrl
                return p
            })
            .map((p: UserProfile) => {
                p.emailId = p.emailAddress?.match(/(.*)@/)![1]
                return p
            })
        )
}

function translitName(p: UserProfile): UserProfile {
    const transed = translit(p.name?.givenName)
    const matches = replace.find(e => transed.includes(e[0]))
    const res = (matches) ?
        transed.replace(matches[0], matches[1])
        : transed
    p.georgianName = res
    return p
}
const replace = [
    ['ტამარ', 'თამარ'],
    ['ტაკ', 'თაკ'],
    ['დატო', 'დათო'],
    ['დავიტ', 'დავით'],
    ['ტეიმურაზ', 'თეიმურაზ'],
    ['გვანწა', 'გვანცა'],
    ['ოტარ', 'ოთარ'],
    ['ლეკს', 'ლექს'],
    ['ტორნიკე', 'თორნიკე'],
    ['კეტ', 'ქეთ'],
    ['ტეკლ', 'თეკლ'],
    ['სოპ', 'სოფ'],
    ['ტატია', 'თათია'],
    ['ნუწ', 'ნუც'],
    ['წოტნ', 'ცოტნ'],
    ['ტინატინ', 'თინათინ'],
    ['ტინა', 'თინა'],
    ['ნინწა', 'ნინცა'],
    ['ტეო', 'თეო'],
    ['ტეა', 'თეა'],
    ['ავტ', 'ავთ'],
    ['ტამაზ', 'თამაზ'],
    ['ნატია', 'ნათია'],
    ['დაჭი', 'დაჩი'],
    ['არჭილ', 'არჩილ'],
    ['ტენგიზი', 'თენგიზ'],
    ['ბეკა', 'ბექა'],
    ['ტაზო', 'თაზო'],
    ['მატე', 'მათე'],
]
export function downloadStudentList(className: string): Promise<UserProfile[]> {
    return getStudentList(className)
        .then(profiles => profiles.map(translitName))
}


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

