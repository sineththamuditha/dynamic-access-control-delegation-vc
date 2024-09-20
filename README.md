

# dynamic-access-control-delegation-vc

## Setting up the environment

#### 1. Create a Hyperledger Blockchain Locally (Only if you want to run a local blockchain)

First clone the von network from the git repository

```bash
cd hyperledger

git clone https://github.com/bcgov/von-network

cd von-network
```

You can run the indy network after building the docker image,

```bash
./manage build

./manage start --logs
```

To stop the the network run,

```bash
./manage stop
```

#### 2. Build and Deploy Aries Cloud Agent (ACA)

First clone ACA python from the git repository,

```bash
cd ..

git clone https://github.com/hyperledger/aries-cloudagent-python.git

cd aries-cloudagent-python
```

Then build and run the docker image using following command,

```bash
scripts/run_docker start <args>
```

You need to adjust the arguments according to your need.