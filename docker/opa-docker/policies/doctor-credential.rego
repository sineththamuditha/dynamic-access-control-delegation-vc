package doctor

default allow = false

allow if {

    # check if it is a hospital employee
    input.credentialSubject.attributes.isHospitalEmployee == true

    # check if whether employee is a nurse
    input.credentialSubject.attributes.roleName == "Nurse"

    # check if the license number is present
    input.credentialSubject.attributes.license
}