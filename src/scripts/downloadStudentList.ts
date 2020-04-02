import ClassroomApi from '../classroom-api'
import fs from 'fs'
import { UserProfile } from '../types'
const translit = require('translitit-latin-to-mkhedruli-georgian')

let changed = false

async function getStudentList(): Promise<UserProfile[]> {
    try {
        const contents = fs.readFileSync('students.json', 'utf-8')
        const profiles = JSON.parse(contents)
        return new Promise(r => r(profiles))
    } catch (err) {
        changed = true
        return ClassroomApi
            .findClass('შესავალი ციფრულ ტექნოლოგიებში')
            .then(classroom => classroom.getUserProfiles())
            .then(profiles => profiles
                .map((p): UserProfile => {
                    delete p.permissions
                    delete p.photoUrl
                    return p
                })
                .map(p => {
                    p.emailId = p.emailAddress?.match(/(.*)@/)![1]
                    return p
                })
            )
    }
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
]
export default function main() {
    getStudentList()
        .then(profiles => {
            console.log(profiles.length)
            return profiles
        })
        .then(profiles => profiles.map(p => {
            if (p.georgianName) {
                return p
            }
            changed = true
            const transed = translit(p.name?.givenName)
            const matches = replace.find(e => transed.includes(e[0]))
            const res = (matches) ?
                transed.replace(matches[0], matches[1])
                : transed
            p.georgianName = res
        }))
        .then(profiles => JSON.stringify(profiles))
        .then(contents => changed ? fs.writeFileSync('students.json', contents) : console.log('no changes'))

}

main()