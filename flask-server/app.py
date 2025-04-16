from flask import Flask, jsonify, request
from flask_cors import CORS
from utils.did_generation_utils import *
from utils.vc_utils import *
from utils.constants import _ED25519_, _SECP256K1_, _P256_, _ISSUER_, _DELEGATEE_, _DELEGATOR_, _PUBLIC_KEY_, _PRIVATE_KEY_, _DID_KEY_, _OPA_URL_
import os
import psutil
import time
import tracemalloc
import requests
import gc

DIDS = {}
CREDENTIALS = {}

app = Flask(__name__)
CORS(app)


@app.route('/verify/<algorithm>', methods=['POST'])
def get_hello(algorithm: str):
    keys = DIDS[algorithm]
    algo_enum = ''
    if algorithm == _ED25519_:
        algo_enum = Algorithm.ED25519
    if algorithm == _SECP256K1_:
        algo_enum = Algorithm.SECP256K1
    if algorithm == _P256_:
        algo_enum = Algorithm.P256

    adc = request.json["adc"]

    print(verify_vc(adc, keys[_DELEGATOR_][_PUBLIC_KEY_], algo_enum))

    return jsonify({"message": "Initialised successfully"})


@app.route('/initialise/<algorithm>')
def initialize_dids(algorithm: str):
    func = ''
    algo_enum = ''
    if algorithm == _ED25519_:
        func = generate_ed25519_keys
        algo_enum = Algorithm.ED25519
    if algorithm == _SECP256K1_:
        func = generate_secp256k1_keys
        algo_enum = Algorithm.SECP256K1
    if algorithm == _P256_:
        func = generate_p256_keys
        algo_enum = Algorithm.P256

    DIDS[algorithm] = {}

    for x in [_ISSUER_, _DELEGATOR_, _DELEGATEE_]:
        pr_key, pb_key = func()
        did = get_did_from_public_key(
            pb_key, algo_enum)
        DIDS[algorithm][x] = {
            _PRIVATE_KEY_: pr_key,
            _PUBLIC_KEY_: pb_key,
            _DID_KEY_: did

        }

    return jsonify({"message": "Initialised successfully"})


@app.route('/issue/<algorithm>')
def issue_credentials(algorithm: str):
    keys = DIDS[algorithm]
    algo_enum = ''
    if algorithm == _ED25519_:
        algo_enum = Algorithm.ED25519
    if algorithm == _SECP256K1_:
        algo_enum = Algorithm.SECP256K1
    if algorithm == _P256_:
        algo_enum = Algorithm.P256

    delegatee_signed_credential = get_signed_vc(format_vc(
        keys[_ISSUER_][_DID_KEY_], keys[_DELEGATEE_][_DID_KEY_], algo_enum.name), keys[_ISSUER_][_PRIVATE_KEY_], algo_enum)

    delegator_signed_credential = get_signed_vc(format_vc(
        keys[_ISSUER_][_DID_KEY_], keys[_DELEGATOR_][_DID_KEY_], algo_enum.name), keys[_ISSUER_][_PRIVATE_KEY_], algo_enum)

    CREDENTIALS[algorithm] = delegator_signed_credential

    return jsonify({
        "delegateeCredential": delegatee_signed_credential,
        "delegatorCredential": delegator_signed_credential
    })


@app.route('/delegate/<algorithm>', methods=["POST"])
def delegateUsingADC(algorithm: str):
    gc.collect()
    time.sleep(0.01)
    keys = DIDS[algorithm]
    algo_enum = ''
    if algorithm == _ED25519_:
        algo_enum = Algorithm.ED25519
    if algorithm == _SECP256K1_:
        algo_enum = Algorithm.SECP256K1
    if algorithm == _P256_:
        algo_enum = Algorithm.P256

    vcs = request.json["verifiableCredentials"]
    signed_vp = get_signed_vc(format_vp(
        keys[_DELEGATEE_][_DID_KEY_], vcs), keys[_DELEGATEE_][_PRIVATE_KEY_], algo_enum)

    process = psutil.Process(os.getpid())

    tracemalloc.start()
    mem_before = process.memory_info().rss
    cpu_before = process.cpu_times().user
    t0 = time.perf_counter()

    if (verify_vc(signed_vp, keys[_DELEGATEE_][_PUBLIC_KEY_], algo_enum)):

        signed_adc = get_signed_vc(format_adc(
            keys[_DELEGATOR_][_DID_KEY_], keys[_DELEGATEE_][_DID_KEY_], CREDENTIALS[algorithm]["id"], algorithm), keys[_DELEGATOR_][_PRIVATE_KEY_], algo_enum)
        
        CREDENTIALS["adc"] = signed_adc

        t1 = time.perf_counter()
        mem_after = process.memory_info().rss
        cpu_after = process.cpu_times().user
        current, peak = tracemalloc.get_traced_memory()
        tracemalloc.stop()

        return jsonify({
            "accessDelegationCredential": signed_adc,
            "delegation": {
                "adcSize": len(json.dumps(signed_adc).encode()),
                "timeTaken": (t1 - t0) * 1000,
                "memoryUsage": (mem_after - mem_before) / 1024,
                "cpuUsage": cpu_after - cpu_before
            }
        })
    else:
        return jsonify({"error": "Invalid verifiable presentation"})


@app.route('/present/<algorithm>', methods=["POST"])
def present(algorithm: str):
    gc.collect()
    time.sleep(0.01)
    keys = DIDS[algorithm]
    algo_enum = ''
    if algorithm == _ED25519_:
        algo_enum = Algorithm.ED25519
    if algorithm == _SECP256K1_:
        algo_enum = Algorithm.SECP256K1
    if algorithm == _P256_:
        algo_enum = Algorithm.P256

    vcs = request.json["verifiableCredentials"]
    signed_vp = get_signed_vc(format_vp(
        keys[_DELEGATEE_][_DID_KEY_], vcs), keys[_DELEGATEE_][_PRIVATE_KEY_], algo_enum)

    process = psutil.Process(os.getpid())

    tracemalloc.start()
    mem_before = process.memory_info().rss
    cpu_before = process.cpu_times().user
    t0 = time.perf_counter()

    if (verify_vc(signed_vp, keys[_DELEGATEE_][_PUBLIC_KEY_], algo_enum)):

        t1 = time.perf_counter()
        mem_after = process.memory_info().rss
        cpu_after = process.cpu_times().user
        current, peak = tracemalloc.get_traced_memory()
        tracemalloc.stop()

        verification = {
            "timeTaken": (t1 - t0) * 1000,
            "memoryUsage": (mem_after - mem_before) / 1024,
            "cpuUsage": cpu_after - cpu_before
        }

        tracemalloc.start()
        mem_before = process.memory_info().rss
        cpu_before = process.cpu_times().user
        t0 = time.perf_counter()

        if ((not verify_vc(CREDENTIALS["adc"], keys[_DELEGATOR_][_PUBLIC_KEY_], algo_enum))):
            return jsonify({"error": "Invalid access delegation credential"})

        response = requests.post(f"{_OPA_URL_}/data/performance", json={"input": CREDENTIALS["adc"]})

        response_json = response.json()

        if (response_json["result"]["allow"]):

            t1 = time.perf_counter()
            mem_after = process.memory_info().rss
            cpu_after = process.cpu_times().user
            current, peak = tracemalloc.get_traced_memory()
            tracemalloc.stop() 

            return jsonify({
                "verification": verification,
                "retrieval": {
                    "timeTaken": (t1 - t0) * 1000,
                    "memoryUsage": (mem_after - mem_before) / 1024,
                    "cpuUsage": cpu_after - cpu_before
                }
            })
        else:
            return jsonify({"error": "Insufficient access or access has been revoked"})

    else:
        return jsonify({"error": "Invalid verifiable presentation"})


if __name__ == '__main__':
    app.run(debug=True)
