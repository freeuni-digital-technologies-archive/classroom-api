import fs from 'fs'
import { UserProfile } from './types'
const path = process.env.STUDENTS_DATA_PATH || 'students.json'
// TODO: create file if doesn't exist
const students: UserProfile[] = JSON.parse(fs.readFileSync(path, 'utf-8'))

export function getStudentByEmail(emailId: string) {
    return students.find(e => e.emailId == emailId)
}
 
export function getStudentById(id: string): UserProfile {
    return students.find(e => e.id == id)!
}

export function getStudents() {
    return students
}