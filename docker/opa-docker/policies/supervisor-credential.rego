package supervisor

default allow = false

allow if {

    # check if it is a university student 
    input.credentialSubject.attributes.isUniversityStudent == true

    input.credentialSubject.attributes.isFromColomboUniversity == false

    # check if student id is present
    input.credentialSubject.attributes.studentId

    # check if university is present
    input.credentialSubject.attributes.university
}

allow if {

    # check if it is a university student 
    input.credentialSubject.attributes.isUniversityStudent == true

    # check if student id is present
    input.credentialSubject.attributes.isFromColomboUniversity == true
}