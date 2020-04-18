import { expect } from 'chai'
import { ClassroomApi} from "../src";

describe('test case', () => {
    it('',  () => {
        ClassroomApi
            .findClass('შესავალი ციფრულ ტექნოლოგიებში')
            .then(classroom => classroom.listCourseWork())
            .then(courseWork => console.log(courseWork))
    })
})