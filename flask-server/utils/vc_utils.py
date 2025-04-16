import uuid
import json
import base64
from datetime import datetime
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ed25519, ec
from cryptography.exceptions import InvalidSignature
from .constants import _BASE_VC_, Algorithm, _BASE_VP_, _BASE_URL_
import copy

def format_vc(issuer_did: str, subject_did: str, algorithm: str):
    vc = copy.deepcopy(_BASE_VC_)
    vc["issuer"] = issuer_did
    vc["credentialSubject"] = {
        "id": subject_did,
        "keyType": algorithm
    }
    vc["issuanceDate"] = datetime.now().isoformat()
    vc["id"] = uuid.uuid4().__str__()

    return vc

def format_adc(issuer_did: str, subject_did: str, credentialId: str, algorithm: str):
    vc = copy.deepcopy(_BASE_VC_)
    vc["issuer"] = issuer_did
    vc["credentialSubject"] = {
        "id": subject_did,
        "credentialId": credentialId,
        "attributes": {
            "keyType": algorithm
        },
        "service": {
            "type": "http",
            "serviceEndpoint": f"{_BASE_URL_}/retrive/{algorithm}"
        }
    }
    vc["issuanceDate"] = datetime.now().isoformat()
    vc["id"] = uuid.uuid4().__str__()
    vc["type"] = ["VerifiableCredential", "AccessDelegationCredential"]

    return vc

def format_vp(holder_did: str, vcs: list):
    vp = copy.deepcopy(_BASE_VP_)
    vp["holder"] = holder_did
    vp["verifiableCredential"] = vcs

    return vp

def sign_message(private_key, message: bytes, algorithm: Algorithm):
    if algorithm == Algorithm.ED25519:
        return private_key.sign(message)
    if algorithm == Algorithm.P256 or algorithm == Algorithm.SECP256K1:
        return private_key.sign(message, ec.ECDSA(hashes.SHA256()))

def get_signed_vc(vc: dict, private_key, algorithm: Algorithm):
    unsigned_vc = json.dumps(vc, separators=(',', ':')).encode()
    signature = sign_message(private_key, unsigned_vc, algorithm)
    vc["proof"] = {
        "type": f"{algorithm.name}Signature2020",
        "proofPurpose": "assertionMethod",
        "jws": base64.urlsafe_b64encode(signature).decode().rstrip('=')
    }
    return vc

def verify_signature(public_key, signature: bytes, message: bytes, algorithm: Algorithm):
    if algorithm == Algorithm.ED25519:
        public_key.verify(signature, message)
    if algorithm == Algorithm.P256 or algorithm == Algorithm.SECP256K1:
        public_key.verify(signature, message, ec.ECDSA(hashes.SHA256()))

def verify_vc(vc: dict, public_key, algorithm: Algorithm) -> bool:
    # vc_copy = copy.deepcopy(vc)
    proof = vc.pop("proof")
    jws = base64.urlsafe_b64decode(proof["jws"] + "==")
    vc_canonical = json.dumps(vc, separators=(',', ':')).encode()
    try:
        verify_signature(public_key, jws, vc_canonical, algorithm)
    except InvalidSignature:
        return False
    
    return True