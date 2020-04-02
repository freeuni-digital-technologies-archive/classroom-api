import ClassroomApi from './classroom-api'
import { Submission } from './submission'

function main() {
    ClassroomApi.findClass('შესავალი ციფრულ ტექნოლოგიებში')
        .then(classroom => classroom.getSubmissions('დავალება 1'))
        .then(submissions => submissions.map(s => Submission.fromResponse(s)))
        .then(e => console.log(e.slice(0, 20)))
}

main()