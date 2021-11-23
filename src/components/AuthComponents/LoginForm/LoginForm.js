import axios from "axios";
import {useContext, useRef, useState} from "react";
import {useHistory} from 'react-router-dom';
import AuthContext from '../../../store/auth-context';
import Form from 'react-bootstrap/Form';
import './LoginForm.css';

const url = `${process.env.REACT_APP_BASE_URL}${process.env.REACT_APP_USER_SERVICE}${process.env.REACT_APP_LOGIN_ENDPOINT}`;

/**
 * The login form component.
 *
 * @author Matthew Crowell <Matthew.Crowell@Smoothstack.com>
 *
 * @param props the properties passed into the component
 * @returns {JSX.Element} the login form page to be rendered
 * @constructor
 */
function LoginForm(props) {
    const history = useHistory();

    const authContext = useContext(AuthContext)
    const [errorMessage, setErrorMessage] = useState();

    const email = useRef();
    const password = useRef();

    /**
     * This method submits the login information to the server and returns the server's response code
     * and, if applicable, headers containing the authorization token and the user id.
     *
     * @param event the click event for the log in button
     * @returns {Promise<void>} the response from the server
     */
    async function submitHandler(event) {
        event.preventDefault();

        if (errorMessage) {
            setErrorMessage('');
        }

        const enteredEmail = email.current.value.toLowerCase();
        const enteredPassword = password.current.value;

        const loginData = {
            email: enteredEmail,
            password: enteredPassword
        }


        try {
            const response = await axios.post(
                url,
                loginData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'LR-Type': 'user',
                    }
                }
            );

            if (response.status === 200) {
                const token = response.headers['authorization'];
                const userId = response.headers['btuid'];
                authContext.login(token, userId);
                history.replace('/');
            } else if (response.status === 403) {
                setErrorMessage(response.statusText);
            }
        } catch (e) {
            setErrorMessage(e.message);

            if (e.message === "Request failed with status code 403") {
                setErrorMessage("Authentication failed");
            } else if (e.message === "Request failed with status code 503") {
                setErrorMessage("Authentication server error.  Please try again.");
            } else {
                setErrorMessage("Something went wrong... Please try again later.");
            }
        }
    }

    return (
        <section id="login" className={"container col-12 h-75 w-100 vertical-center"}>
            <div className="offset-2 col-5 vertical-center">
                <Form>
                    {errorMessage && <div className={'alert-danger mb-3'}>{errorMessage}</div>}
                    <div className="form-group">
                        <label htmlFor={"email"}>Email</label>
                        <input type="email" className="form-control" id="email" aria-describedby="emailHelp"
                               ref={email}/>
                        <small id="emailHelp" className="form-text text-muted">We'll never share your email with anyone
                            else.</small>
                    </div>
                    <div className="form-group mt-2">
                        <label htmlFor={"password"}>Password</label>
                        <input type="password" className="form-control" id="password" ref={password}/>
                    </div>
                    <button type="submit" className="btn btn-primary mt-2" onClick={submitHandler}>Log In</button>
                </Form>
            </div>
        </section>
    );
}

export default LoginForm
