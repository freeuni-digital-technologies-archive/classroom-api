import { ClassroomApi } from './classroom-api'
import { UserProfile } from './types'
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
]
export function downloadStudentList(className: string): Promise<UserProfile[]> {
    return getStudentList(className)
        .then(profiles => profiles.map(translitName))
}