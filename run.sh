/Users/sineththamuditha/Documents/dynamic-access-control-delegation-vc/hyperledger/von-network/manage start

./hyperledger/acapy/scripts/run_docker start \
    --inbound-transport http 0.0.0.0 8000 \
    --outbound-transport http \
    --genesis-url http://host.docker.internal:9000/genesis \
    --endpoint http://localhost:8020 \
    --admin-insecure-mode \
    --admin 0.0.0.0 9021 \
    --wallet-name local_net_trustee_wallet \
    --wallet-key EX8r5H1Vpot2i6bJSrXA/CO87TwT2Y1pL5H8tjluPbTCEbRUEgOF4K2NqbyayXHw \
    --auto-provision \
    --log-level info

/Users/sineththamuditha/Documents/dynamic-access-control-delegation-vc/hyperledger/von-network/manage stop