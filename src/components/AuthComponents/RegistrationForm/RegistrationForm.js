import {useRef, useState} from "react";
import {useHistory} from 'react-router-dom';
import axios from "axios"
import validator from "validator";
import { ButtonGroup } from "react-bootstrap";
import './RegistrationForm.css';

/**
 * This method returns an html element containing a user registration form.
 *
 * @author Matthew Crowell <Matthew.Crowell@Smoothstack.com>
 *
 * @param props the properties passed into the form
 * @returns {JSX.Element} the form to be rendered
 * @constructor
 */
function RegistrationForm(props) {
    const [errorMessage, setErrorMessage] = useState();
    const [emailError, setEmailError] = useState(false);
    const [firstNameError, setFirstNameError] = useState(false);
    const [lastNameError, setLastNameError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [phoneError, setPhoneError] = useState(false);
    const [usernameError, setUsernameError] = useState(false);
    const [dateOfBirthError, setDateOfBirthError]= useState(false);

    const emailRef = useRef();
    const firstNameRef = useRef();
    const lastNameRef = useRef();
    const passwordRef = useRef();
    const phoneRef = useRef();
    const usernameRef = useRef();
    const dateOfBirthRef = useRef();
    const url = props.url;
    const history = useHistory();

    /**
     * This function receives a form object and tests the form data to see
     * if the data is present and meets the validation requirements.
     * @param form the form object
     * @returns {boolean} whether or not the form data is valid
     */
    function formIsValid(form){
        let isValid = true;

        if(!validator.isEmail(form.email)){
            setEmailError(true);
            isValid = false;
        } else {
            setEmailError(false);
        }

        if(!validator.isMobilePhone(form.phone)){
            setPhoneError(true);
            isValid = false;
        } else {
            setPhoneError(false);
        }

        if(!validator.isStrongPassword(form.password)) {
            setPasswordError(true);
            isValid = false;
        } else {
            setPasswordError(false);
        }

        if(!validator.isAlpha(form.firstName) || validator.isEmpty(form.firstName)) {
            setFirstNameError(true);
            isValid = false;
        } else {
            setFirstNameError(false);
        }

        if(!validator.isAlpha(form.lastName)) {
            setLastNameError(true);
            isValid = false;
        }

        if(!validator.isAscii(form.username)) {
            setUsernameError(true);
            isValid = false;
        } else {
            setLastNameError(false);
        }

        if(!validator.isDate(form.dateOfBirth)) {
            setDateOfBirthError(true);
            isValid = false;
        } else {
            setDateOfBirthError(false);
        }

        return isValid;
    }
    /**
     * This method cancels the registration and returns the guest to the home page.
     *
     * @param event the click event
     */
    function cancelHandler(event) {
        event.preventDefault();
        history.replace('/')
    }

    /**
     * This method submits the user registration data to the server to be registered and returns the user id.
     *
     * @param event the click event for the register button
     * @returns {Promise<void>} the response from the server containing the user id
     */
    async function submitHandler(event) {
        event.preventDefault();

        const enteredEmail = emailRef.current.value.toLowerCase();
        const enteredFirstName = firstNameRef.current.value.toLowerCase();
        const enteredLastName = lastNameRef.current.value.toLowerCase();
        const enteredPassword = passwordRef.current.value;
        const enteredPhone = phoneRef.current.value;
        const enteredUsername = usernameRef.current.value.toLowerCase();
        const enteredDateOfBirth = dateOfBirthRef.current.value;

        const registrationData = {
            email: enteredEmail,
            firstName: enteredFirstName,
            lastName: enteredLastName,
            password: enteredPassword,
            phone: enteredPhone,
            role: 'user',
            username: enteredUsername,
            dateOfBirth: enteredDateOfBirth
        }

        if(!formIsValid(registrationData)) return;

        try {
            const response = await axios.post(url, registrationData);
            localStorage.setItem('userId', response.data.userId);

            history.replace('/');
        } catch (e) {
            if(e.response){
                setErrorMessage(e.response.data.message);
            } else {
                setErrorMessage("Something went wrong... please try again later");
            }

        }
    }

    return (
        <section className={'container h-60 smooth-scroll'}>
            { errorMessage && <h2 className={'alert-danger my-3'}>{errorMessage}</h2> }
            <form className="row g-3 vertical-center registration-form">
                <div className="col-sm-12 col-md-6">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input type="text" className="form-control" id="username" ref={usernameRef}/>
                    {usernameError && <p className={'alert-danger mb-3'}>Usernames can contain only numbers and letters</p>}
                </div>
                <div className="col-sm-12 col-md-6">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input type="password" className="form-control" id="password" ref={passwordRef}/>
                    {passwordError && <p className={'alert-danger mb-3'}>Password should contain numbers, special characters, and both cases</p>}
                </div>
                <div className="col-sm-12 col-md-6">
                    <label htmlFor="firstName" className="form-label">First Name</label>
                    <input type="text" className="form-control" id="firstName" ref={firstNameRef}/>
                    {firstNameError && <p className={'alert-danger mb-3'}>Name fields can only contain letters of the alphabet</p>}
                </div>
                <div className="col-sm-12 col-md-6">
                    <label htmlFor="lastName" className="form-label">Last Name</label>
                    <input type="text" className="form-control" id="lastName" ref={lastNameRef}/>
                    {lastNameError && <p className={'alert-danger mb-3'}>Name fields can only contain letters of the alphabe</p>}
                </div>
                <div className="col-sm-12 col-md-4">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input type="email" className="form-control" id="email" ref={emailRef}/>
                    {emailError && <p className={'alert-danger mb-3'}>Please enter a valid email address</p>}
                </div>
                <div className="col-sm-12 col-lg-4">
                    <label htmlFor="phone" className="form-label">Phone</label>
                    <input type="text" className="form-control" id="phone" placeholder="(xxx) 867-5309" ref={phoneRef}/>
                    {phoneError && <p className={'alert-danger mb-3'}>Please enter a valid phone number</p>}
                </div>
                <div className="col-sm-12 col-lg-4">
                    <label htmlFor="dateOfBirth" className="form-label">Date of Birth</label>
                    <input type="date" className="form-control" id="dateOfBirth" ref={dateOfBirthRef}/>
                    {dateOfBirthError && <p className={'alert-danger mb-1'}>Please enter valid birthdate</p>}
                </div>
                <ButtonGroup>
                    <div className={'col-lg-10'}>
                        <span></span>
                    </div>
                    <div className="col-sm-3 col-md-2 col-lg-1">
                        <button type={'button'} className="btn btn-secondary mr-2" onClick={cancelHandler}>Cancel</button>
                    </div>
                    <div className="col-sm-3 col-md-2 col-lg-1">
                        <button type={'button'} className="btn btn-primary" onClick={submitHandler}>Register</button>
                    </div>
                </ButtonGroup>
            </form>
        </section>

    )
}

export default RegistrationForm;