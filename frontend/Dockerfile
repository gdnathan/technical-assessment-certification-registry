FROM node:25-alpine
WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# RUN apt update && apt install 
ENV NODE_ENV=production
ENV PORT=5173

CMD ["npm", "run", "dev"]

