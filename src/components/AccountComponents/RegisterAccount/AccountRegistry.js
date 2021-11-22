import { useRef, useState, useContext, useEffect } from "react";
import AuthContext from "../../../store/auth-context"
import axios from "axios"
import { Button, ButtonGroup, Form, FormControl, FormGroup, FormLabel, Dropdown } from "react-bootstrap";
import { Alert } from "react-bootstrap";
import {CurrencyValue} from "../../../models/currencyvalue.model";
import {AccountType} from "../../../models/accounttype.model";
import { useHistory } from "react-router-dom";

function AccountRegistration() {

    const authContext = useContext(AuthContext);
    const history = useHistory();
    const [typeTitle, setTitle] = useState();
    const [show, setShow] = useState(false);
    const [showWarn, setShowWarn] = useState(false);

    const nickname = useRef();
    const balance = useRef();
    let actType = 'Recovery';
    const url = `${process.env.REACT_APP_BASE_URL}${process.env.REACT_APP_ACCOUNT_SERVICE}`;
    useEffect(() => {
        setTitle('Select Account Type')
    }, [actType])

    function dropHandler(dropInput) {
        switch (dropInput) {
            case "1":
                actType = 'SuperSaver Savings'
                break;
            case "2":
                actType = 'CoolCash Checking'
                break;
            default:
                actType = 'SuperSaver Savings'
        }
        setTitle(actType);
    }

    async function submitHandler(event) {
        event.preventDefault();
        if (typeTitle === 'Select Account Type') {
            setTitle('Recovery')
        }

        const enteredNickname = nickname.current.value;
        const enteredDeposit = balance.current.value;
        let cdate = new Date();

        if(balance.current.value === null){
            balance.current.value = 0.0;
        }

        const registrationData = {
            nickname: enteredNickname,
            balance: CurrencyValue.valueOf(parseFloat(enteredDeposit)),
            userId: authContext.userId,
            activeStatus: true,
            interest: 1,
            create_date: cdate,
            type_id: '123456',
            type: AccountType.byName(typeTitle)
        }

        try {
            if (enteredDeposit === 0 && enteredNickname === "Account") {
                setShowWarn(true)
            }
            else {
                console.log('dep: ', enteredDeposit)
                const res = await axios.post(url, registrationData);
                console.log(res);
                setShow(true)
                window.setTimeout(() => {
                    setShow(false);
                    history.push("/accounts/me");
                }, 1000)
            }
        } catch (e) {
            console.log(e);
        }


    }

    if (show) {
        window.setTimeout(() => {
            setShow(false)
        }, 3000)
    }

    if (showWarn) {
        window.setTimeout(() => {
            setShowWarn(false)
        }, 5000)
    }

    return (
        <section>
            <div>
                <Alert variant="success" show={show} >
                    Success
                </Alert>
                <Alert variant="warning" show={showWarn} >
                    No info given!
                </Alert>
                <Form className={'offset-4 col-3'}>
                <h1 className={'text-center mt-5'}>Set up a new BeardTrust Account today!</h1>
                    <FormGroup>
                        <FormLabel htmlFor={'username'} className={'col-form-label'}>Give this account a nickname:</FormLabel>
                        <FormControl type={'text'} id={'username'} ref={nickname} required />
                    </FormGroup>
                    <FormGroup>
                        <FormLabel htmlFor={'username'} className={'col-form-label'}>Input your initial deposit:</FormLabel>
                        <FormControl type={'text'} id={'username'} ref={balance} required />
                    </FormGroup>
                    <Dropdown className='mt-3' onSelect={function (evt) { dropHandler(evt) }} required>
                        <Dropdown.Toggle variant="success" id="dropdown-basic" data-toggle="dropdown">
                            {typeTitle}
                        </Dropdown.Toggle>
                        <Dropdown.Menu required>
                            <Dropdown.Item eventKey="1">SuperSaver Savings</Dropdown.Item>
                            <Dropdown.Item eventKey="2">CoolCash Checking</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    <ButtonGroup>
                        <Button title='registerButton' type={'submit'} className={'btn btn-primary mt-3'} onClick={submitHandler}>Register</Button>
                    </ButtonGroup>
                </Form>
            </div>
        </section>
    )
}

export default AccountRegistration;
