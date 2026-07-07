FROM node:22-bookworm-slim AS build

WORKDIR /app

RUN apt-get update \
    && apt-get install --no-install-recommends -y \
        build-essential \
        fonts-noto-cjk \
        libcairo2-dev \
        libgif-dev \
        libjpeg62-turbo-dev \
        libpango1.0-dev \
        librsvg2-dev \
        pkg-config \
        python3 \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund \
    && npm cache clean --force

COPY tsconfig.json tsconfig.test.json ./
COPY src ./src
COPY test ./test

RUN npm run build:test

FROM node:22-bookworm-slim

ENV NODE_ENV=test

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

COPY package.json package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist-test ./dist-test

USER node

CMD ["npm", "test"]
