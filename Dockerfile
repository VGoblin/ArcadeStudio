FROM node:14

RUN apt update
RUN apt install nano
RUN npm install -g nodemon

WORKDIR /arcadestudio

COPY package.json ./
RUN npm install && npm cache clean --force

ENV NODE_ENV development

COPY .env /arcadestudio/.env
COPY . /arcadestudio

CMD ["npm", "run", "start:dev"]

EXPOSE 3001
