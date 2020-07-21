FROM node:12.18-alpine

COPY . /srv/app
WORKDIR /srv/app

RUN npm install
RUN npm run build

ENV PORT=4000
ENV HOST=0.0.0.0
ENV NODE_ENV=production
ENV DATABASE_CLIENT=mongo
ENV DATABASE_NAME=strapi
ENV DATABASE_HOST=mongodb
ENV DATABASE_PORT=27017
ENV DATABASE_USERNAME=root
ENV DATABASE_PASSWORD=dbpwd

VOLUME [ "/srv/app" ]
EXPOSE 4000

CMD [ "npm", "start" ]