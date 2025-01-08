FROM node:18.19.1-alpine3.19 AS builder

# #set the working directory
WORKDIR /app

# # install app dependencies
COPY package.json ./

# #clean install dependecies
RUN npm install
# RUN npm install --omit=dev

# COPY workspace configs
COPY ./tsconfig.base.json ./
COPY ./nx.json ./

# COPY REQUIRED LIBS AND CONCERNED APP
COPY /libs/theme ./libs/theme
COPY ./apps/customer-web ./apps/customer-web

# # build Landing app
RUN npx nx run customer-web:build:production

# #DELETE SOURCE CODE FROM CONTAINER
# RUN rm -r ./apps
# RUN rm -r ./libs
# RUN rm nx.json
# RUN rm package.json
# RUN rm package-lock.json
# RUN rm tsconfig.base.json

# # expose port 3000 to outer environment
EXPOSE 3000

# # run app
WORKDIR /app/dist/apps/customer-web
# RUN npm run build

CMD ["npm", "start"]
