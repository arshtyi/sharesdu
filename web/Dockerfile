FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx vue-cli-service build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.http.conf /etc/nginx/conf.d/default.http.conf
COPY nginx.conf /etc/nginx/conf.d/default.https.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

EXPOSE 80 443

ENTRYPOINT ["/docker-entrypoint.sh"]
