FROM ubuntu:14.04

MAINTAINER Lynckia

WORKDIR /opt

# Download latest version of the code and install dependencies
RUN  apt-get update && apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash - && sudo apt-get install -y nodejs

COPY . /opt/ackuaria

# Clone and install licode
WORKDIR /opt/ackuaria

RUN npm install

WORKDIR /opt

ENTRYPOINT ["./ackuaria/extras/docker/initDockerAckuaria.sh"]
