# syntax = docker/dockerfile:1

ARG NODE_VERSION=23.7.0
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="NodeJS"

WORKDIR /app

ENV NODE_ENV=production

FROM base as build
RUN apt-get update -qq && apt-get install -y python-is-python3 pkg-config build-essential

COPY code/bustrack-api/package.json code/bustrack-api/package-lock.json ./bustrack-api/
RUN npm install --prefix bustrack-api

COPY code/bustrack-api/. ./bustrack-api

COPY code/bus-tracker/package.json code/bus-tracker/package-lock.json ./bus-tracker/
RUN npm install --prefix bus-tracker

COPY code/bus-tracker/. ./bus-tracker

RUN npm run build --prefix bus-tracker

FROM base

COPY --from=build /app /app

WORKDIR /app/bustrack-api

EXPOSE 3000

CMD ["npm", "start"]