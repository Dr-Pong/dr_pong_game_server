# Base image
FROM node:latest

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose the desired port
EXPOSE 4343

# Run the servers
CMD [ "npm", "run", "start" ]
