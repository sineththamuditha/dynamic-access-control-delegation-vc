package performance

default allow = false

allow if {

    # check if algorithm is present
    input.credentialSubject.attributes.keyType

    # check if algorithm is credentialId
    input.credentialSubject.credentialId
}