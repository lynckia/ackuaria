# Ackuaria

- Software requirements for Ackuaria:

	+ Licode
	+ Node.js
	+ npm
	+ Mongodb (Optional. You can disable this option in ackuaria_config.js)


## Installation

1. Ensure you have node.js and npm installed on your server
1. Install this repository -- the easiest install is having it on the same server as the Licode installation
1. Copy ```nuve/nuveClient/dist/nuve.js``` from your Licode installation, and place it in the root directory of the checkout.
1. Copy ```ackuaria_config.js.template``` to ```ackuaria_config.js``` in the same directory
1. Configure ```ackuaria_config.js``` appropriately *(minimally, you'll need to include the Nuve ```superserviceID``` and ```superserviceKey``` from the Licode installation you want to monitor)*
1. Run ```npm install``` in the root directory of the checkout
1. In ```licode_config.js``` of your Licode installation, enable the events you want Ackuaria to receive in the ```config.erizoController.report``` section
1. Open up the port set in ```config.ackuaria.port``` in your server's firewall
1. In the root directory of the checkout, run ```npm start``` or ```node ackuaria.js``` to start the server
1. Visit http://[host]:[port] in a web browser

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
