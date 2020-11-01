# OpenSurvey
Survey system for real-time surveying and information gathering

## Configuration

### Environment Variables

Note: environment variables may be presented in a `.env` file in the `/backend` directory.

Example configuration:

```
PG_HOST="127.0.0.1"
PG_PORT="5432"
PG_DB="opensurveydev"
PG_USER="opensurveydev"
PG_PASS="password"
AUTH_SECRET="jkfhgklfhgklfjdhgd"
```

#### Database:

1. `PG_HOST`: Hostname of the postgresql server
2. `PG_PORT`: Port the postgresql server is listening on
3. `PG_DB`: Database name
4. `PG_USER`: Username to access the database
5. `PG_PASS`: Password to access the database

#### Authentication:

1. `AUTH_SECRET`: Secret to be used to sign sessions (please use a random string)
  - Default: `test secret`
  - Will be stored in the configuration table of the auxiliary database as `auth.secret`.

### Database-Stored Configuration

#### Data Database

The data database can use a separate database. It is recommended to use a separate, as you can be stricter regarding access to the data database (or make it public). A different database technology can also be instead used, such as _Timescale DB_, which may be more efficient for data processing.

The configuration options for the data database are stored in the main postgresql database. The values are:

1. `datadb.host`: hostname of the postgres server
2. `datadb.port`: port the postgres server is listening on
3. `datadb.name`: name of the postgres database
4. `datadb.writeableuser`: name of the connecting user with writeable privileges
5. `datadb.writeableuser.password`: password of the user with writeable privileges

#### Authentication

1. `auth.secret`: the secret used to sign session data. please use a random string. `test secret` is the default secret and will result in an insecure implementation.
