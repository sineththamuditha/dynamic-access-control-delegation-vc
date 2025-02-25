package company

default allow = false

allow if {

    # check if the role level is "Assistant Employee"
    input.credentialSubject.attributes.position != "Manager"

    # check whether the employee is a senior employee
    input.credentialSubject.attributes.isSeniorEmployee == true

    # check if employee id is present
    input.credentialSubject.attributes.employeeId
}

allow if {
    # check if the role level is "Manager"
    input.credentialSubject.attributes.position == "Manager"

    # check if employee id is present
    input.credentialSubject.attributes.employeeId
}