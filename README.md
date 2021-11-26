<div align="center">
	<br>
	<br>
	<a href="https://cvmcosta.github.io/ltijs"><img width="360" src="https://raw.githubusercontent.com/Cvmcosta/ltijs/master/docs/logo-300.svg"></img></a>
  <a href="https://site.imsglobal.org/certifications/coursekey/ltijs"​ target='_blank'><img width="80" src="https://www.imsglobal.org/sites/default/files/IMSconformancelogoREG.png" alt="IMS Global Certified" border="0"></img></a>
</div>

# Ltijs Demo Server

> Ltijs v5 demo server

### Set up MongoDB

```
docker pull mongo
docker run --name ltijs-demo-server-mongo -p 27017:27017 -d mongo:latest
```

Create `ltidb` database:

```
docker exec -it ltijs-demo-server-mongo bash
```

Inside the container:

```
mongosh
show dbs
use ltidb
db.widget.insertOne({name: 'Foo'})
show dbs
```

_mongosh documentation: https://www.mongodb.com/basics/create-database_

### Usage

- Download or clone the repo

- Setup `.env` file with the relevant variables

  ```
  DB_HOST=localhost
  DB_NAME=ltidb
  DB_USER=user
  DB_PASS=pass
  LTI_KEY=LTIKEY
  ```

  _DB_USER and DB_PASS are not required_

- Run `npm install`

- Run `npm start`

### React application

The code for the react application used with this project can be found [here](https://github.com/Cvmcosta/ltijs-demo-client).
