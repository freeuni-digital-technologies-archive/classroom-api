import { UserProfile, Attachment, StudentSubmission, StateHistory } from "./types";
import { getStudentById } from "./students";
import { sortByDate } from "./utils";

export class Submission {
    static turnedIn(s: StudentSubmission | StateHistory) {
        return s.state == 'TURNED_IN'
    }
    static fromResponse(
        response: StudentSubmission
    ) {
        const submission = new Submission(
            response.id!,
            getStudentById(response.userId!).emailId!,
            response.state!,
            response.late
        )
        if (submission.onTime()) {
            const attachments = response.assignmentSubmission?.attachments
            const attachment = new Attachment(attachments![0].driveFile!)
            const timeStamp = Submission.getTimeStamp(response)
            submission.setAttachment(attachment, timeStamp)
        }
        return submission

    }
    static getTimeStamp(response: StudentSubmission): Date {
        const timeStamp = response.submissionHistory!
            .filter(e => e.stateHistory)
            .map(e => e.stateHistory!)
            .filter(Submission.turnedIn)
            .map(e => e.stateTimestamp!)
            .map(t => new Date(t))
            .sort(sortByDate)[0]
        return new Date(timeStamp)
    }
    public attachment?: Attachment
    public timeStamp?: Date
    constructor(
        public id: string,
        public emailId: string,
        public state: string,
        public late?: boolean
    ) {

    }

    public turnedIn() {
        return Submission.turnedIn(this)
    }
    public onTime() {
        return this.turnedIn() && !this.late
    }
    public setAttachment(a: Attachment, timeStamp: Date) {
        this.attachment = a
        this.timeStamp = timeStamp
    }

}