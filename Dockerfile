# ---- Base Alpine with installed Node ----
FROM alpine:3.14.3 AS base

# install node
RUN apk add --update \
  nodejs=14.18.1-r0 \
  npm=7.17.0-r0 \
  nghttp2

# ---- Install dependencies ----
FROM base AS build

WORKDIR /app
COPY . .

# install dependencies
# switch to the `npm ci` when https://github.com/asyncapi/.github/issues/123 issue will be resolved
RUN npm install

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
CMD ["npm", "run", "start:prod"]
