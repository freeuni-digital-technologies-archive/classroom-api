# Classroom api

wrapper for classroom in google library. modified from [this example](https://developers.google.com/classroom/quickstart/nodejs) 

## instructions
Get `credentials.json` from google console or file from the example url (**select web app**). Save it in the project root directory.

For the first run, you'll need to follow the link and authorize the app.

## Usage
primary function of the api is to get all the submissions. 

in javascript

```javascript
// uncomment the suitable of the 4 imports 
// import { getSubmissions } from 'classroom-api' // typescript
// import { getSubmissions } from './src/index' // ts if running from project root
// const { getSubmissions } = require('classroom-api') // javascript
const { getSubmissions } = require('./lib/index.js') // js if running in the project root


getSubmissions('className', 'assignmentName')
    .then(submissions => console.log(submissions))

// returns a list of Submissions (src/submissions.ts)
// after that you can use submission.download() on individual submission

```

### drive download
When downloading multiple files, it's necessary to throttle the requests on your side, otherwise request limit error will be thrown.


### student list
In order to save amount of requests for each individual student (email, etc.), the library expects `students.json` file in the root directory. You can generate it using `yarn getlist`:

example:
```bash 
yarn getlist -c "შესავალი ციფრულ ტექნოლოგიებში 2020 შემოდგომა"
```

full list of aguments:
```bash
  -p, --path     directory to store students.json       [string] [default: "./"]
  -c, --class    class name                                  [string] [required]
```

## API
You can also run the functions from `src/classroom-api.ts` individually. Easiest way is to edit the `test/classroom-api.test.ts` file and run it with `yarn test`
```javascript
const ClassroomApi = require('./lib/classroom-api') // 
// or if using typescript
import { ClassroomApi } from './src/classroom-api'

ClassroomApi
            .findClass('შესავალი ციფრულ ტექნოლოგიებში')
            .then(classroom => classroom.listCourseWork())
            .then(submissions => console.log(submissions))
```

### Mailer 
You are also free to use mailer.ts exported functions `sendEmails` and `sendEmail`
