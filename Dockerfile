# ---- Base Alpine with installed Node ----
FROM node:16-alpine3.14 AS base

# install node
RUN apk add --update \
  nghttp2

# ---- Install dependencies ----
FROM base AS build

WORKDIR /app
COPY . .

# install dependencies
RUN npm ci

# build to a production Javascript
RUN npm run build:prod

# ---- Serve ----
FROM base AS release

WORKDIR /app
COPY --from=build /app/dist ./dist
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY --from=build /app/package* ./
# install only production dependencies (defined in "dependencies")
RUN npm ci --only=production 
# copy OpenaAPI document
COPY openapi.yaml ./

EXPOSE 80
CMD ["npm", "run", "start:docker"]