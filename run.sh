/Users/sineththamuditha/Documents/dynamic-access-control-delegation-vc/hyperldger/von-network/manage start

./hyperldger/aries-cloudagent-python/scripts/run_docker start \
    --inbound-transport http 0.0.0.0 8000 \
    --outbound-transport http \
    --genesis-url http://host.docker.internal:9000/genesis \
    --endpoint http://localhost:8020 \
    --admin-insecure-mode \
    --admin 0.0.0.0 9021 

/Users/sineththamuditha/Documents/dynamic-access-control-delegation-vc/hyperldger/von-network/manage stop