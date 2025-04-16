from enum import Enum

_ED25519_ = 'ed25519'
_SECP256K1_ = 'secp256k1'
_P256_ = 'p256'

_ISSUER_ = 'issuer'
_DELEGATOR_ = 'delegator'
_DELEGATEE_ = 'delegatee'

_PUBLIC_KEY_ = 'public_key'
_PRIVATE_KEY_ = 'private_key'
_DID_KEY_ = 'did_key'

_BASE_VC_ = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "type": ["VerifiableCredential"]
}

_BASE_VP_ = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "type": ["VerifiablePresentation"]
}

_BASE_URL_ = "http://127.0.0.1:5000"
_OPA_URL_ = "http://localhost:8181/v1"

class Algorithm(Enum):
    ED25519 = 1
    SECP256K1 = 2
    P256 = 3
