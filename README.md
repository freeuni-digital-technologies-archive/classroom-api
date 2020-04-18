# Classroom api

wrapper for classroom in google library. modified from [this example](https://developers.google.com/classroom/quickstart/nodejs) 

## instructions
Get `credentials.json` from google console or file from the example url (select web app). Save it in the project root directory.

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
```

### student list
In order to save amount of requests for each individual student (email, etc.), the library expects `students.json` file in the root directory. For now you need to generate it manually. Create a file `script.js` in the root directory of project and paste the contents

```javascript
const className = '' // fill this
const { downloadStudentList } = require('./lib/downloadStudentList')
const fs = require('fs')
downloadStudentList(className).then(profiles => fs.writeFileSync('students.json', JSON.stringify(profiles, null, '\t')))

```

Then, run

```sh
yarn build && node script.js
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