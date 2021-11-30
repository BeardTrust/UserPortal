import axios from "axios"
import User from "../User/User"
import { useState, useEffect, useRef } from "react"
import AuthContext from "../../../store/auth-context"
import { useContext } from "react"
import { Button, Modal, FormLabel, FormControl } from "react-bootstrap"

/**
 * This function gets the current logged in user and displays their information on screen.
 * There are also update features built in for the user to update their personal information
 * 
 * @returns {JSX.Element}
 */
function ViewUserForm() {

    const authContext = useContext(AuthContext);
    const [show, setShow] = useState(false);
    const handleShow = () => setShow(true);
    const handleClose = () => setShow(false);
    const [errorMessage, setErrorMessage] = useState();
    const [isDisplayed, setIsDisplayed] = useState(false);

    const [user, setUser] = useState({})
    const token = authContext.token;
    const userId = authContext.userId;
    const emailRef = useRef();
    const firstNameRef = useRef();
    const lastNameRef = useRef();
    const passwordRef = useRef();
    const phoneRef = useRef();
    const usernameRef = useRef();
    const dateOfBirthRef = useRef();

    const url = `${process.env.REACT_APP_BASE_URL}${process.env.REACT_APP_USER_SERVICE}/` + userId

    useEffect(() => {
        if (!isDisplayed) {
        axios.get(
            url,
            {
                method: 'GET',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            })
            .then((res) => {
                if (res.statusText === "OK") {
                    console.log('VIEW SUCCESSFUL');
                    setIsDisplayed(true);
                    setUser(res.data)
                } else {
                    throw new Error('VIEW UNSUCCESSFUL');
                }
            }, [])
            .catch((e) => {
                if (e.response === 403) {
                    console.log('VIEW FAILURE: Code 403 (Forbidden). Your login may be expired or your URL may be incorrect.')
                }
                console.log('Error message: ', e.message);
            }
            )
        }
        }, [user, isDisplayed, token, url])

        /**
         * This function reads any updated info and sends it to the service in order to save the update.
         * 
         * @param event the event calling the function 
         * 
         * @returns {JSX.Element}
         */
    function submitUpdate(event) {
        if (!event === null) {
            event.preventDefault();
        }

        let enteredEmail
        let enteredUsername
        let enteredPassword
        let enteredFirstName
        let enteredLastName
        let enteredPhone
        let enteredDateOfBirth
        if (emailRef.current.value !== null) { enteredEmail = emailRef.current.value }
        if (firstNameRef.current.value !== null) { enteredFirstName = firstNameRef.current.value; }
        if (lastNameRef.current.value !== null) { enteredLastName = lastNameRef.current.value; }
        if (passwordRef.current.value !== null) { enteredPassword = passwordRef.current.value; }
        if (phoneRef.current.value !== null) { enteredPhone = phoneRef.current.value; }
        if (usernameRef.current.value !== null) { enteredUsername = usernameRef.current.value; }
        if (dateOfBirthRef.current.value !== null) { enteredDateOfBirth = dateOfBirthRef.current.value; }


        if (emailRef.current.value === '') {
            enteredEmail = user.email
        } if (firstNameRef.current.value === '') {
            enteredFirstName = user.firstName;
        } if (lastNameRef.current.value === '') {
            enteredLastName = user.lastName;
        } if (passwordRef.current.value === '') {
            enteredPassword = user.password;
        } if (phoneRef.current.value === '') {
            enteredPhone = user.phone
        } if (usernameRef.current.value === '') {
            enteredUsername = user.username
        } if (dateOfBirthRef.current.value === '') {
            enteredDateOfBirth = user.dateOfBirth
        }
        const registrationData = {
            email: enteredEmail,
            firstName: enteredFirstName,
            lastName: enteredLastName,
            password: enteredPassword,
            phone: enteredPhone,
            username: enteredUsername,
            dateOfBirth: enteredDateOfBirth
        }
        axios(url, {
            method: 'PUT',
            data: JSON.stringify(registrationData),
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            return response.data;
        }).then((data) => {
            console.log('UPDATE SUCCESSFUL');
            console.log(data);
        }).catch((e) => {
            setErrorMessage(e);
            console.log('UPDATE ERROR')
            console.log(token)
            if (e.response.status === 409) {
                console.log('Error 409 (Bad Request) detected. This is likely a duplicate user.')//need an error page responding with duplicae warning
            }
            if (e.response.status === 503) {
                console.log('Error 503 (Service Unavailablet) detected. The server is likely down.')//need an error page responding with duplicae warning
            }
            else {
                console.log('Unexpected error: ', errorMessage + ' please contact an admin.')
            }
        });
        window.location.reload();
    }

    return (
        <section className={'container'}>
            <div className={'mt-5'}>
                <h1 className={'text-center mt-5'}>Your Details:</h1>
                <div className={'btn mt-5'}>
                    <Button variant='secondary' className={'btn-center btn-primary mt-3'} onClick={handleShow}>Update Info</Button>
                </div>
                <User user={user} />
            </div>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Enter your desired changes here:
                    </Modal.Title>
                </Modal.Header>
                <div className="form-group">
                    <Modal.Body>
                        <FormLabel htmlFor={'username'} className={'col-form-label'}>Update Username</FormLabel>
                        <FormControl type={'text'} id={'username'} ref={usernameRef} />
                        <FormLabel htmlFor={'password'}>Update Password</FormLabel>
                        <FormControl type={'password'} id={'password'} ref={passwordRef} />
                        <FormLabel htmlFor={'firstName'}>Update First Name</FormLabel>
                        <FormControl type={'text'} id={'firstName'} ref={firstNameRef} />
                        <FormLabel htmlFor={'lastName'}>Update Last Name</FormLabel>
                        <FormControl type={'text'} id={'lastName'} ref={lastNameRef} />
                        <FormLabel htmlFor={'email'}>Update Email Address</FormLabel>
                        <FormControl type={'email'} id={'email'} ref={emailRef} email={'true'} />
                        <FormLabel htmlFor={'phone'}>Update Phone Number</FormLabel>
                        <FormControl type={'text'} id={'phone'} ref={phoneRef} />
                        <FormLabel htmlFor={'dateOfBirth'}>Update Date of Birth</FormLabel>
                        <FormControl type={'text'} id={'dateOfbirth'} ref={dateOfBirthRef} />
                    </Modal.Body>
                </div>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={submitUpdate}>
                        Submit your Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </section>
    )

}
export default ViewUserForm