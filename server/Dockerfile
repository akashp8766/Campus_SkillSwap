# 1. Start with a super lightweight version of Linux that has Node 20 pre-installed
FROM node:20-alpine

# 2. Create a folder inside the container to hold our app
WORKDIR /usr/src/app

# 3. Copy ONLY package.json and package-lock.json first
COPY package*.json ./

# 4. Install production dependencies inside the container
RUN npm install --production

# 5. Copy all your other backend files into the container
COPY . .

# 6. Tell Docker that this container will listen on port 5000
EXPOSE 5000

# 7. The command to start your backend
CMD ["node", "index.js"]
