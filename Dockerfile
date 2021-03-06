FROM alpine:latest
FROM node:12.18-alpine

COPY . /srv/app
WORKDIR /srv/app
RUN mkdir -p /srv/app/public/uploads/

ENV PORT=4000
ENV HOST=0.0.0.0
ENV NODE_ENV=production
ENV MONGO_URI=
ENV DATABASE_NAME=strapi
ENV DATABASE_HOST=mongodb
ENV DATABASE_PORT=27017
ENV DATABASE_USERNAME=root
ENV DATABASE_PASSWORD=dbpwd
ENV S3_ACCESS_KEY=
ENV S3_SECRET_KEY=
ENV S3_REGION=
ENV S3_BUCKET=

RUN npm install
RUN npm run build

EXPOSE 4000

CMD [ "npm", "start" ]