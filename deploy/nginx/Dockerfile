FROM node:22-alpine AS builder

WORKDIR /workspace
ENV NX_DAEMON=false

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npx nx build shell --configuration=production --skip-nx-cache

FROM nginx:1.27-alpine

COPY deploy/nginx/default.conf /etc/nginx/templates/default.conf.template
COPY deploy/nginx/app-config.js /usr/share/nginx/html/app-config.js
COPY --from=builder /workspace/dist/apps/shell/ /usr/share/nginx/html/
COPY --from=builder /workspace/dist/apps/identity-access/ /usr/share/nginx/html/identity-access/

EXPOSE 80 443
