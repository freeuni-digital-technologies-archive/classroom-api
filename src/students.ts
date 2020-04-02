import fs from 'fs'
import { UserProfile } from './types'

const students: UserProfile[] = JSON.parse(fs.readFileSync('students.json', 'utf-8'))

export function getStudentByEmail(emailId: string) {
    return students.find(e => e.emailId == emailId)
}
 
export function getStudentById(id: string): UserProfile {
    return students.find(e => e.id == id)!
}

export function getStudents() {
    return students
}