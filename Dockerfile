  FROM node:boron
  
  WORKDIR /app
  ADD package.json /app/
  RUN npm install -g bower
  RUN npm install
  RUN echo '{ "allow_root": true }' > /root/.bowerrc
  ADD . /app
  RUN bower install 
  
  CMD []
  ENTRYPOINT ["npm", "start"]