FROM node:20-alpine
WORKDIR /app

# Copy package.json (and package-lock.json if it exists)
COPY package*.json ./

# Use npm install instead of npm ci
RUN npm install --omit=dev

COPY . .
RUN mkdir -p uploads

EXPOSE 3000
ENV NODE_ENV=production

CMD ["node", "server.js"]
