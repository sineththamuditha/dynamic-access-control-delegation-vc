package doctor

default allow = false

allow if {

    # check if it is a university student 
    input.credentialSubject.attributes.isHospitalEmployee == true

    # check if student id is present
    input.credentialSubject.attributes.roleName == "Nurse"

    # check if university is present
    input.credentialSubject.attributes.license
}