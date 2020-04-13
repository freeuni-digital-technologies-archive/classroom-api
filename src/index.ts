import { ClassroomApi } from './classroom-api'
import { Submission } from './submission'
import { getStudentById } from './students'

export * from './types'
export { ClassroomApi } from './classroom-api'
export { Submission } from './submission'
export * from './students'

export function getSubmissions(subject: string, homework: string): Promise<Submission[]> {
    return ClassroomApi.findClass(subject)
        .then(classroom => classroom.getSubmissions(homework))
        .then(submissions => submissions
            .filter(response => getStudentById(response.userId!))
            .map(s => Submission.fromResponse(s)))
}
