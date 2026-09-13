FROM node:20-alpine

WORKDIR /app

# Копируем package.json и ставим зависимости
COPY package*.json ./
RUN npm install --omit=dev

# Копируем исходный код
COPY src/ ./src/

ENV PORT=3001
EXPOSE 3001

CMD ["node", "src/index.js"]
