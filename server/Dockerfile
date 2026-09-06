# better-sqlite3@13 requires Node >=22 and ships prebuilt binaries for linuxmusl-{x64,arm64},
# so alpine + Node 22 needs no compiler toolchain in the image.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

FROM deps AS build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build
COPY src/db/schema.sql ./dist/db/schema.sql
# Seed once here, at build time, using the faker devDependency — the resulting app.db is baked
# into the image as a template so faker never needs to exist in the production runtime stage.
RUN node dist/db/seed.js

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/data/app.db ./seed-template/app.db
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3001
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]
