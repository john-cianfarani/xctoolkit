# XC Toolkit

XC Toolkit provides with a variety of functions to help you on your journey with F5's Distributed Cloud Platform.

This toolkit provides options to enhance your visibility of  deployed Load Balancers across multiple tenants and
namespaces.

Additional tools are available to help with extracting data and managing configuration.

XC Toolkit itself is a standalone Node.js application that is designed to be run either locally or within a docker container.

Please note that XC Toolkit is provided "AS-IS" without warranties of any kind, either expressed or implied.


# Features

Current features of the toolkit are as follows:

v1.0 
 - Multi-Tenant Overview - View multiple tenant and namespaces, as well as enabled features in a single pane of glass dashboard.
 - Per Path Latency Breakdown - Visualize various latency metrics on a per endpoint basis.
 - Export Access and Security Logs - Export extended amount of log files.
 - Export API Endpoints
 - Copy WAF Exclusion Rules
 - Editor for IP Prefix / BGP ASN Sets
 - Backup


## Installation

Two methods of running the application exist.

 - Direct NodeJS
 - Docker

### Direct NodeJS

```sh
git clone https://github.com/john-cianfarani/xctoolkit.git

cd xctoolkit

npm install

npm start
```
The web ui should now be accessible on http://127.0.0.1:3080 or https://127.0.0.1:3443

### Docker

This assumes you have docker installed and running on the host.
```sh
    git clone https://github.com/john-cianfarani/xctoolkit.git
    
    cd xctoolkit

    docker build -f docker/Dockerfile . -t xctoolkit:latest
```    

Once completed the docker container should be added to your list of docker images.
```sh
    docker image list

   
    REPOSITORY   TAG       IMAGE ID       CREATED        SIZE
    xctoolkit    latest    b1e6c0593347   24 hours ago   1.04GB
```    

After confirmation the docker container can be started with the following command.

```sh
    docker run -p 3080:3080 3443:3443 -d xctoolkit
```    


## Screenshots

