export const RequiredValidation = (value,name) => {
    return (
        value ? undefined : (name + ' is required')
    )
}

export const EmailValidation = value => {
    return (
        value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,5}$/i.test(value) ? 'Invalid email address' : undefined
    )
}

export const PasswordValidation = (value, name) => {
    return (
        (value.length < 6) ? (name + ' does not reach minimum character count') : undefined
    )
}

export const ConfirmPassword = (value, confirmValue,name,) => {
    return (
        (value != confirmValue) ? (name + ' does not match the password') : undefined
    )
}