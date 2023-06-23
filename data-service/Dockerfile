# Add the base image for the Node.js app
FROM node:18-alpine3.15 

# Create a working folder for running the application inside the Docker container 
WORKDIR /src/app

RUN npm install -g pnpm

# Copy dependencies to the above working folder

COPY package.json .

# Copy dependencies loom file to the working folder
COPY pnpm-lock.yaml .

# Install the dependencies based on the above json files
RUN pnpm install

# Copy every code to the Docker working directory
COPY ./ ./

# Tell Docker the container will listen on port 4000
EXPOSE 4000

# Run the the Node.js application
CMD ["node", "app.js"]