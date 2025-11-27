# Meteor 3.x compatible Dockerfile
FROM node:22

WORKDIR /app
COPY . .

RUN npm install -g meteor@3 && meteor npm install

EXPOSE 3000
CMD ["meteor", "run", "--port", "3000"]
