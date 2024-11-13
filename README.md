# Arcade Studio
> Cloud based WebGL editor.

### Installation
- Rename .env.example file to .env and add environmental values .. e.g POSTGRES_URI
- Install the dependencies and devDependencies and start the server with the following.
```sh
npm i
npm run build
npm start # or nodemon
```
### Software tools & frameworks :
- PostgreSQL Database
- NodeJS & ExpressJS
- pug template engine


# SETUP ARCADE STUDIO ON LOCAL ENVIRONMENT

- Install docker on the system
- Pull the latest postgres image from docker hub (https://www.docker.com/blog/how-to-use-the-postgres-docker-official-image/)
- After the image has been added to docker, go to docker application and click on start
- Navigate to optional settings add folder for data named pgdata and add the path
- add a variable named 'POSTGRES_PASSWORD' and add a suitable password
- Start a new container with that image on port 5432
- Download pg4Admin or any other postgres GUI tool compatible with the OS
- Connect the DB with appropriate username, password
- Execute the attached script to create the arcade db in your local environment.
- The DB setup is now complete
- Open the arcade studio project in VS Code
- Replace the db connection config to: (add your specific config in case its different)
- POSTGRES_URI=postgres://postgres:1234@host.docker.internal:5432/postgres
- PG_DATABASE=postgres
- PG_USERNAME=postgres
- PG_PASSWORD=1234
- PG_HOST="host.docker.internal"
- PG_PORT=5432
- Where the details are: postgres://<username>:<password>@<host>:<port>/<database_name>
- Use the command “docker build -t <image-name> .” to build the project image
- After the image is built run the project with the desired port 3001
- The application will be available on http://localhost
- Run "docker ps" to get list of running containers & copy the container id
- Run "docker exec -it copied-container-id /bin/sh"
- Once inside the container cmd line, Run "npm run watch"