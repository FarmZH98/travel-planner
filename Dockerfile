# Build Angular
FROM node:22 AS ngbuild

WORKDIR /frontend

# Install angular 
RUN npm i -g @angular/cli@17.3.8

COPY frontend/angular.json .
COPY frontend/package*.json .
COPY frontend/tsconfig*.json .
COPY frontend/ngsw-config.json .
COPY frontend/src src

# Build the Angular app with environment variables
ARG openWeatherApiKey
ENV openWeatherApiKey=$openWeatherApiKey

# Create environment.ts file using the environment variable
RUN echo "export const environment = { openWeatherApiKey: '$openWeatherApiKey' };" > src/environments/environment.ts

# Install modules
RUN npm ci 
RUN ng build

# Build Spring Boot
FROM openjdk:21 AS javabuild

WORKDIR /backend

COPY backend/mvnw .
COPY backend/pom.xml .
COPY backend/.mvn .mvn
COPY backend/src src

# copy angular files to spring boot
COPY --from=ngbuild /frontend/dist/frontend/browser/ src/main/resources/static

# produce target/backend-0.0.1-SNAPSHOT.jar
RUN chmod a+x mvnw
RUN ./mvnw package -Dmaven.test.skip=true

# Run container
FROM openjdk:21 

WORKDIR /app

COPY --from=javabuild /backend/target/backend-0.0.1-SNAPSHOT.jar app.jar

ENV PORT=8080 

EXPOSE ${PORT}

ENTRYPOINT SERVER_PORT=${PORT} java -jar app.jar