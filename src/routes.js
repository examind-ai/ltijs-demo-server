const router = require('express').Router()
const path = require('path')

// Requiring Ltijs
const lti = require('ltijs').Provider

// Grading route
router.post('/grade', async (req, res) => {
  try {
    const idtoken = res.locals.token // IdToken
    const score = req.body.grade // User numeric score sent in the body
    // Creating Grade object
    const gradeObj = {
      userId: idtoken.user,
      scoreGiven: score,
      scoreMaximum: 100,
      activityProgress: 'Completed',
      gradingProgress: 'FullyGraded'
    }

    // Selecting linetItem ID
    let lineItemId = idtoken.platformContext.endpoint.lineitem // Attempting to retrieve it from idtoken, there will only be a idtoken.platformContext.endpoint.lineitem if there is one and only one line item created for the activity
    if (!lineItemId) {
      const response = await lti.Grade.getLineItems(idtoken, { resourceLinkId: true }) // resourceLinkId: true filter based on current activity
      const lineItems = response.lineItems
      if (lineItems.length === 0) {
        // Creating line item if there is none
        console.log('Creating new line item')
        const newLineItem = {
          scoreMaximum: 100,
          label: 'Grade',
          tag: 'grade',
          resourceLinkId: idtoken.platformContext.resource.id // binding new line item with the current activity
        }
        const lineItem = await lti.Grade.createLineItem(idtoken, newLineItem) // send line item
        lineItemId = lineItem.id
      } else lineItemId = lineItems[0].id
    }

    // Sending Grade
    const responseGrade = await lti.Grade.submitScore(idtoken, lineItemId, gradeObj)
    return res.send(responseGrade)
  } catch (err) {
    console.log(err.message)
    return res.status(500).send({ err: err.message })
  }
})

// Names and Roles route
router.get('/members', async (req, res) => {
  try {
    const result = await lti.NamesAndRoles.getMembers(res.locals.token)
    if (result) return res.send(result.members)
    return res.sendStatus(500)
  } catch (err) {
    console.log(err.message)
    return res.status(500).send(err.message)
  }
})

// Deep linking route
router.post('/deeplink', async (req, res) => {
  try {
    const resource = req.body

    const items = {
      type: 'ltiResourceLink',
      title: resource.value,
      url: 'http://localhost:3000/?resource=1&hash=hash', // Recommend using query param and not custom data, as some LMS (e.g. Canvas) doesn't support custom data
      custom: {
        name: resource.name,
        value: resource.value
      }
    }

    const form = await lti.DeepLinking.createDeepLinkingForm(res.locals.token, items, { message: 'Successfully Registered' })
    if (form) return res.send(form)
    return res.sendStatus(500)
  } catch (err) {
    console.log(err.message)
    return res.status(500).send(err.message)
  }
})

// Return available deep linking resources
router.get('/resources', async (req, res) => {
  const resources = [
    {
      name: 'EXAMIND Assessment 1',
      value: 'Quiz 1'
    },
    {
      name: 'EXAMIND Assessment 2',
      value: 'Quiz 2'
    },
    {
      name: 'EXAMIND Assessment 3',
      value: 'Quiz 3'
    }
  ]
  return res.send(resources)
})

// Get user and context information
router.get('/info', async (req, res) => {
  const token = res.locals.token
  const context = res.locals.context

  const info = { }
  if (token.userInfo) {
    if (token.userInfo.name) info.name = token.userInfo.name
    if (token.userInfo.email) info.email = token.userInfo.email
  }

  if (context.roles) info.roles = context.roles
  if (context.context) info.context = context.context

  return res.send(info)
})

// Wildcard route to deal with redirecting to React routes
router.get('*', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')))

module.exports = router
