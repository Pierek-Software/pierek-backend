FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder ./app/dist ./dist
COPY package.json .
RUN npm install --production
ENV NODE_ENV production
EXPOSE 3000
RUN apk --no-cache add curl
HEALTHCHECK CMD curl --fail http://localhost:3000/ping || exit 1
CMD [ "node", "dist/server.js" ]