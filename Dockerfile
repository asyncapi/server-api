# ---- Base Alpine with installed Node ----
FROM alpine:3.14.3 AS base

# install node
RUN apk add --update nodejs npm nghttp2

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
# where available (npm@5+)
COPY package* ./
# copy OpenaAPI document
COPY openapi.yaml ./
# install only production dependencies (defined in "dependencies")
RUN npm ci --only=production

EXPOSE 5000
CMD ["npm", "run", "start:prod"]
