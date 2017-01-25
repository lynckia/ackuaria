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
