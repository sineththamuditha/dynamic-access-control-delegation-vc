from didkit import generate_ed25519_key, key_to_did
import base64
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ed25519, ec
from cryptography.hazmat.backends import default_backend
from .constants import Algorithm


def generate_ed25519_keys():
    private_key = ed25519.Ed25519PrivateKey.generate()
    public_key = private_key.public_key()
    return private_key, public_key


def generate_secp256k1_keys():
    private_key = ec.generate_private_key(
        ec.SECP256K1(), backend=default_backend())
    public_key = private_key.public_key()
    return private_key, public_key


def generate_p256_keys():
    private_key = ec.generate_private_key(
        ec.SECP256R1(), backend=default_backend())
    public_key = private_key.public_key()
    return private_key, public_key


def did_from_key(public_key_bytes: bytes) -> str:
    return f"did:key:{base64.urlsafe_b64encode(public_key_bytes).decode().rstrip('=')}"


def get_did_from_public_key(public_key, algorithm: Algorithm):
    if algorithm == Algorithm.ED25519:
        return did_from_key(
            public_key.public_bytes(
                encoding=serialization.Encoding.Raw,
                format= serialization.PublicFormat.Raw
            ))
    if algorithm == Algorithm.SECP256K1 or algorithm == Algorithm.P256:
        return did_from_key(
            public_key.public_bytes(
                encoding=serialization.Encoding.X962,
                format= serialization.PublicFormat.UncompressedPoint
            ))
