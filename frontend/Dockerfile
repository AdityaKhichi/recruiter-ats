FROM node:22-alpine

WORKDIR /app

# Install dependencies first (expects package.json to be present in frontend/)
COPY package*.json ./
RUN npm ci --no-audit --prefer-offline

# Copy rest of frontend sources
COPY . /app

EXPOSE 5173

# Development server
CMD ["npm", "run", "dev", "--", "--host"]
