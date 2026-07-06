FROM node:22-bookworm-slim AS build

WORKDIR /app

RUN apt-get update \
    && apt-get install --no-install-recommends -y \
        build-essential \
        libcairo2-dev \
        libgif-dev \
        libjpeg62-turbo-dev \
        libpango1.0-dev \
        librsvg2-dev \
        pkg-config \
        python3 \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-bookworm-slim

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000

RUN apt-get update \
    && apt-get install --no-install-recommends -y \
        fonts-noto-cjk \
        libcairo2 \
        libgif7 \
        libjpeg62-turbo \
        libpango-1.0-0 \
        librsvg2-2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json package-lock.json ./
RUN npm prune --omit=dev \
    && npm cache clean --force

USER node
EXPOSE 3000

CMD ["node", "dist/server.js"]
