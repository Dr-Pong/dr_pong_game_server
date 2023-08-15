# Base image
FROM node:latest

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy source code
COPY . .

# Install dependencies
RUN npm install --force

RUN npm run build

# Expose the desired port
EXPOSE 4343

# Run the servers
CMD [ "npm", "run", "start:prod" ]
