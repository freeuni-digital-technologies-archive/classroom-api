import { google, classroom_v1 } from 'googleapis'
import auth from './auth'

function listCourses(classroom: classroom_v1.Classroom)
    : Promise<classroom_v1.Schema$Course[]> {
    return new Promise((resolve, reject) => {
        classroom.courses.list({
            pageSize: 10,
        }, (err, res) => {
            if (err) reject('The API returned an error: ' + err);
            const courses = res!.data.courses;
            if (courses && courses.length) {
                resolve(courses)
            } else {
                reject('No courses found.');
            }
        })
    })
}

export class ClassroomApi {
    static async findClass(name: string) {
        const classroom = await auth()
            .then(auth => google.classroom({ version: 'v1', auth }))
        return listCourses(classroom)
            .then(courses => {
                const filtered = courses.filter(c => c.name == name)
                if (filtered && filtered.length)
                    return filtered[0].id!
                else
                    throw "no such course found"
            })
            .then((id) => new ClassroomApi(id, classroom))
    }
    constructor(
        private id: string,
        private classroom: classroom_v1.Classroom,
    ) {

    }

    listCourseWork(): Promise<classroom_v1.Schema$CourseWork[]> {
        return new Promise((resolve, reject) => {
            this.classroom.courses.courseWork.list({
                courseId: this.id
            }, (err, res) => {
                if (err) reject('The API returned an error: ' + err);
                resolve(res!.data.courseWork)
            })
        })
    }

    findAssignment = (name: string): Promise<string> =>
        this.listCourseWork()
            .then(courseWork => {
                const filtered = courseWork.filter(c => c.title!.includes(name))
                if (filtered && filtered.length)
                    return filtered[0].id!
                else
                    throw name + ": no such assignment found"
            })

    getSubmissions = (name: string): Promise<classroom_v1.Schema$StudentSubmission[]> =>
        this.findAssignment(name)
            .then(assignmentId =>
                new Promise((resolve, reject) => {
                    this.classroom.courses.courseWork.studentSubmissions.list({
                        courseWorkId: assignmentId,
                        courseId: this.id,
                    }, (err, res) => {
                        if (err) reject(err)
                        resolve(res!.data.studentSubmissions)
                    })
                })
            )
    getStudentProfile(id: string): Promise<classroom_v1.Schema$UserProfile> {
        return new Promise((resolve, reject) => {
            this.classroom.userProfiles.get({ userId: id }, (err, res) => {
                if (err) reject(err)
                resolve(res!.data)
            })
        })
    }
    getSubmissionStudents = (name: string): Promise<classroom_v1.Schema$UserProfile[]> =>
        this.getSubmissions(name)
            .then(submissions => submissions.map(s => s.userId!))
            .then(submissions => submissions.map(s => this.getStudentProfile(s)))
            .then(userIdPromises => Promise.all(userIdPromises))

    getUserProfiles = () =>
        this.listCourseWork()
            .then(coursework => coursework[0].title!)
            .then(this.getSubmissionStudents)
}