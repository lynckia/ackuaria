# Ackuaria

- Software requirements for Ackuaria:

	+ Licode
	+ Node.js
	+ npm
	+ Mongodb (Optional. You can disable this option in ackuaria_config.js)


## Installation

To install locally see [INSTALL.md](INSTALL.md)

#### Docker
You can also use [Docker](https://www.docker.com/).
You can build your own image using the Dockerfile we provide and then run the container from it or you can run the container directly from the image we provide in Docker Hub.

To get the image form docker hub run `docker pull lynckia/ackuaria`. You can configure the container by mounting a volume in `/opt/assets` including both the configuration file (`ackuaria_config.js`) and the nuve client for your current licode version. The entry point script will automatically copy both files and run ackuaria.

`[sudo] docker run -p 8888:8888 -v [PATH_TO_YOUR_ASSETS_DIR]:/opt/assets`

Make sure ackuaria can communicate with the Rabbitmq server from your Licode installation


## License

The MIT License

Copyright (C) 2012 Universidad Politecnica de Madrid.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
