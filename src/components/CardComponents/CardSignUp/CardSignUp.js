import {useContext, useRef, useState} from "react";
import {useHistory} from "react-router-dom";
import ActionContext from "../../../store/action-context";
import {ButtonGroup} from "react-bootstrap";
import validator from "validator";
import AuthContext from "../../../store/auth-context";
import axios from "axios";
import './CardSignUp.css';

/**
 * This function returns a card sign up page.
 *
 * @author Matthew Crowell <Matthew.Crowell@Smoothstack.com>
 *
 * @param props
 * @returns {JSX.Element} the card sign up page
 * @constructor
 */
function CardSignUp(props) {
    const actionContext = useContext(ActionContext);
    const authContext = useContext(AuthContext);

    const cardId = actionContext.targetId;
    const userId = authContext.userId;
    const [errorMessage, setErrorMessage] = useState();
    const [firstNameError, setFirstNameError] = useState(false);
    const [lastNameError, setLastNameError] = useState(false);
    const [phoneError, setPhoneError] = useState(false);
    const [dateOfBirthError, setDateOfBirthError] = useState(false);
    const [nicknameError, setNicknameError] = useState(false);

    const nicknameRef = useRef();

    const url = `${process.env.REACT_APP_BASE_URL}${process.env.REACT_APP_CARD_SERVICE}`
    const history = useHistory();

    /**
     * This function checks that the form data has been filled in and that the
     * data is valid.
     *
     * @param form the form to validate
     * @returns {boolean} whether the form is valid or not
     */
    function formIsValid(form) {
        let isValid = true;

        if (form.phone && !validator.isMobilePhone(form.phone)) {
            setPhoneError(true);
            isValid = false;
        } else {
            setPhoneError(false);
        }

        if (form.firstName && !validator.isAlpha(form.firstName)) {
            setFirstNameError(true);
            isValid = false;
        } else {
            setFirstNameError(false);
        }

        if (form.lastName && !validator.isAlpha(form.lastName)) {
            setLastNameError(true);
            isValid = false;
        }

        if (form.dateOfBirth && !validator.isDate(form.dateOfBirth)) {
            setDateOfBirthError(true);
            isValid = false;
        } else {
            setDateOfBirthError(false);
        }

        if (form.nickname && !validator.isAlphanumeric(form.nickname)) {
            setNicknameError(true);
            isValid = false;
        } else {
            setNicknameError(false);
        }

        return isValid;
    }

    /**
     * This function handles a click on the cancel button, returning the use to
     * the user portal's home page.
     *
     * @param event the click event
     */
    function cancelHandler(event) {
        event.preventDefault();
        history.replace('/')
    }

    /**
     * This function handles a click on the submit button by processing the user
     * details form, which can be filled out to update the user's information
     * at the time of signing up for a card, and submits the card sign up request
     * to the card service.
     *
     * @param event the click event
     * @returns {Promise<void>}
     */
    async function submitHandler(event) {
        event.preventDefault();

        const enteredNickname = nicknameRef.current.value;

        const applicationData = {
            role: 'user',
            cardType: cardId,
            nickname: enteredNickname
        }

        if (!formIsValid(applicationData)) return;

        try {
            const response = await axios.post(url + userId, applicationData, {
                headers: {
                    "Authorization": authContext.token
                }
            });
        } catch (e) {
            if (e.response) {
                setErrorMessage(e.response.data.message);
            } else {
                setErrorMessage("Something went wrong... please try again later")
            }
        }

        history.push('/');
    }

    return (
        <section className={'container h-60 smooth-scroll'}>
            {errorMessage && <h2 className={'alert-danger my-3'}>{errorMessage}</h2>}
            <form className="row g-3 vertical-center registration-form">
                <div className="col-12">
                    <label htmlFor="nickname" className="form-label">Card Nickname</label>
                    <input type="text" className="form-control" id="nickname" ref={nicknameRef}/>
                    {nicknameError &&
                    <p className={'alert-danger mb-3'}>Nicknames must be alphanumeric</p>}
                </div>
                <ButtonGroup>
                    <div className={'col-lg-10'}>
                        <span></span>
                    </div>
                    <div className="col-sm-3 col-md-2 col-lg-1">
                        <button type={'button'} className="btn btn-secondary mr-2" onClick={cancelHandler}>Cancel
                        </button>
                    </div>
                    <div className="col-sm-3 col-md-2 col-lg-1">
                        <button type={'button'} className="btn btn-primary" onClick={submitHandler}>Apply</button>
                    </div>
                </ButtonGroup>
                <input id={'userId'} type={'hidden'} value={userId}/>
                <input id={'cardType'} type={'hidden'} value={cardId}/>
            </form>
        </section>
    );
}

export default CardSignUp;
