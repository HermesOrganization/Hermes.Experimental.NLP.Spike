FROM centos:7
MAINTAINER Chandresh Rajkumar Manonmani <chan@tqube.com>

ENV NPM_CONFIG_LOGLEVEL info
ENV NODE_VERSION 6.9.1

RUN yum update -y
RUN yum install -y curl wget git
RUN curl --silent --location https://rpm.nodesource.com/setup_6.x | bash -
RUN yum install -y nodejs
RUN yum install -y gcc-c++ make uuid-devel pkgconfig libtool


# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/

RUN npm install

# Bundle app source
COPY . /usr/src/app

# Expose
EXPOSE 80

CMD ["node", "-v"]
