import axios from "axios";
import { useContext, useEffect, useState, useRef } from "react";
import AuthContext from "../../../store/auth-context";
import { useHistory, useParams } from "react-router-dom";
import Centerpiece from "../../LayoutComponents/Centerpiece/Centerpiece";
import PaymentCluster from "../../TransactionComponents/PaymentCluster";
import TransactionsList from "../../TransactionComponents/TransactionsList";
import { Modal, Button, Dropdown } from "react-bootstrap";
import { CurrencyValue } from "../../../models/currencyvalue.model";
import { GiPayMoney } from "react-icons/gi"

/**
 * This function returns a page showing the details and status of a
 * single, specified card associated with the currently logged in user.
 *
 * @author Matthew Crowell <Matthew.Crowell@Smoothstack.com>
 *
 * @returns {JSX.Element} the page displaying the card details
 * @constructor
 */
function CardStatus(props) {
    console.log('props rcvd: ', props)
    const [cardId, setCardId] = useState(props.card.id);
    const authContext = useContext(AuthContext);
    const [errorMessage, setErrorMessage] = useState();
    const [cardStatus, setCardStatus] = useState();
    const [hasLoaded, setHasLoaded] = useState(false);
    const userId = authContext.userId;
    const token = authContext.token;
    const [pay, setPay] = useState(false);
    const [maxPayment, setMaxPayment] = useState(null);
    const [availableAccounts, setAvailableAccounts] = useState([]);
    const [typeTitle, setTitle] = useState("Select Payment Account");
    const enteredValue = useRef();
    const [paymentAccount, setPaymentAccount] = useState();
    const handleClosePayment = () => setPay(false);
    const [currentCard, setCurrentCard] = useState();
    const url = 'http://localhost:9001/cards/' + userId + '/' + cardId;

    async function getAccounts() {
        setCurrentCard(props.card);
        console.log('get accounts')
        if (!pay) {
            const list = await axios.get("http://localhost:9001/accounts/me", {
                params: { userId: userId },
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });
            setAvailableAccounts(list.data);
            if (list.data !== availableAccounts) {
                const objects = list.data
                setAvailableAccounts(objects);
                console.log('list found: ', list)
                console.log('objects: ', objects)
                setAvailableAccounts(objects);
                console.log('accounts set: ', availableAccounts)
            }
        }
    }

    async function makePayment(event) {
        event.preventDefault();

        const desiredValue = enteredValue.current.value
        console.log('desired value: ', desiredValue)
        console.log('current card: ', currentCard)
        let d = Math.abs(Math.trunc(parseFloat(desiredValue)))
        let c = Math.abs(Math.trunc(((parseFloat(desiredValue) * 100) % 100)))
        if (d < 0) { d *= -1 }
        if (c < 0) { c *= -1 }
        const cv = new CurrencyValue(true, d, c)
        const cardBalance = new CurrencyValue(currentCard.balance.negative, currentCard.balance.dollars, currentCard.balance.cents)
        console.log('entered value dollars: ', Math.abs(Math.trunc(parseFloat(desiredValue))))
        console.log('entered value cents: ', Math.abs(Math.trunc(((parseFloat(desiredValue) * 100) % 100))))
        var a = currentCard.balance.dollars.toString() + '.' + (currentCard.balance.cents / 100).toString()
        console.log('current card: ', cardBalance.toString())
        console.log('new cv: ', cv.toString())

        let confirmPayment = false;
        let canPay = false;
        console.log('current max payment: ', maxPayment)
        if (paymentAccount.balance.negative) {
            console.log('account negative')
            canPay = false
            setMaxPayment(0);
            console.log('adjusted max payment: ', maxPayment)
        } else {
            console.log('allowing payment...')
            canPay = true;
        }
        if (desiredValue > maxPayment) {
            console.log('cv compare to maxpayment equals -1')
            confirmPayment = window.confirm('Attempted to pay with more than available in account!\nWIP: Overdraw?')
            cv.dollars = paymentAccount.balance.dollars;
            cv.cents = paymentAccount.balance.cents
        }
        cv.negative = false;
        if (!cv.toString().includes('NaN')) {
            confirmPayment = window.confirm("Are you sure you want to pay " + cv.toString() + " towards your card of " + cardBalance.toString() + '\nWIP: Confirm Credentials?')
        } else {
            window.alert("There was an error with the amount you entered, please ensure you are using numbers in your input")
        }
        cv.negative = true;
        console.log('currency value body: ', cv.toString())
        console.log('payment card set to: ', currentCard)
        console.log('confirm payment: ', confirmPayment)
        console.log('canPay: ', canPay)
        if (canPay && confirmPayment) {
            console.log('canPay true')
            const res = await axios.post(('http://localhost:9001/accounts/' + userId + '/' + paymentAccount.id),
                cv,
                {
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json'
                    }
                }
            )
            const res2 = await axios.post(('http://localhost:9001/cards/' + userId + '/' + currentCard.id),
                cv,
                {
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json'
                    }
                }
            )
            console.log('account payment response: ', res)
            console.log('card payment response: ', res2)
        }
        window.location.reload();
    }

    useEffect(() => {
        setCardId(props.card.id)
        if (!hasLoaded) {
            /**
             * This function retrieves the card details and updates the state of the
             * card status page.
             *
             * @returns {Promise<void>}
             */
            async function fetchCardStatus() {
                if (!hasLoaded) {
                    const results = await axios.get(url, {
                        headers: {
                            'Authorization': token,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (results) {
                        setCardStatus(results.data);
                        setHasLoaded(true);
                    }
                }


            }

            try {
                fetchCardStatus()
            } catch (e) {
                if (e.response) {
                    setErrorMessage(e.response.data.message);
                } else {
                    setErrorMessage('Something went wrong... please try again later');
                }
            }
        }

    }, [hasLoaded, url, token, cardStatus]);

    function handleShowPayment() {
        console.log('handle show pay')
        setPay(true);
        getAccounts();
    }

    function dropHandler(dropInput) {
        setMaxPayment((availableAccounts[dropInput].balance.dollars + (availableAccounts[dropInput].balance.cents / 100)))
        setPaymentAccount(availableAccounts[dropInput])
        console.log('drop handler accessed by: ', dropInput)
        setTitle(availableAccounts[dropInput].nickname + ': ' + CurrencyValue.from(availableAccounts[dropInput].balance).toString())
        console.log('payment account set to: ', paymentAccount)
        console.log('max payment set: ', maxPayment)
    }

    return (
        <section className={'container'}>
            <Modal.Body >
                {errorMessage && <div className={'alert-danger mt-5'}>{errorMessage}</div>}
                <div className="form-group">
                    <div className="input-group mb-2">
                        <label id="typeLabel" className="input-group-text">Card Number</label>
                        <input id="typeText" type="text" disabled={true} className="form-control" value={props.card.cardNumber}></input>
                    </div>
                    <div className="input-group mb-2">
                        <label id="typeLabel" className="input-group-text">Nickname:</label>
                        <input id="typeText" type="text" disabled={true} className="form-control" value={props.card.nickname}></input>
                    </div>
                    <div className="input-group mb-2">
                        <label id="descriptionLabel" className="input-group-text">Description:</label>
                        <textarea value={props.card.cardType.description} id="descriptionText" className="form-control" readOnly="readonly">
                            {props.card.cardType.description}
                        </textarea>
                    </div>
                    <div className="input-group mb-2">
                        <label id="interestLabel" className="input-group-text">Interest:</label>
                        <input id="interestText" className="form-control" type="text" disabled={true} value={props.card.interestRate + '%'}></input>
                    </div>
                    <div className="input-group mb-2">
                        <label id="amountLabel" className="input-group-text">Amount:</label>
                        <input id="amountText" className="form-control" type="text" disabled={true} value={CurrencyValue.from(props.card.balance).toString()}></input>
                    </div>
                    <div className="input-group mb-2">
                        <label id="createDateLabel" className="input-group-text">Date Created:</label>
                        <input id="createDateText" className="form-control" type="text" disabled={true} value={props.card.createDate.slice(8, 10) + '/' + props.card.createDate.slice(5, 7) + '/' + props.card.createDate.slice(0, 4)}></input>
                    </div>
                </div>
                {pay === true &&
                // <PaymentCluster object={props.card} endpoint={'/cards/' + userId + '/' + props.card.id}/>
                        <div classNam="input-group mb-2">
                            <label id="paySourceLabel" className="input-group-text mb-2">Source Account:</label>
                            <Dropdown onSelect={function (evt) { dropHandler(evt) }} required>
                                <Dropdown.Toggle variant="success" id="dropdown-basic" data-toggle="dropdown">
                                    {typeTitle}
                                </Dropdown.Toggle>
                                <Dropdown.Menu required>
                                    {availableAccounts.map((account, index) => (
                                        <Dropdown.Item eventKey={index}>{account.nickname}: {CurrencyValue.from(account.balance).toString()}</Dropdown.Item>
                                    ))}
                                    <div role="separator" className="dropdown-divider"></div>
                                    <Dropdown.Item disabled="true">Select an account to make a payment from</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                            {maxPayment !== null &&
                                <div className="input-group mb-2">
                                    <label id="paymentAmountDateLabel" className="input-group-text">Payment Amount:</label>
                                    <label id="PayDollarSignLabel" className="input-group-text">$</label>
                                    <input className="form-control" type="number" step="0.01" min="0" max={maxPayment} ref={enteredValue} ></input>
                                </div>
                            }
                        </div>
                    }
                    <div className="input-Group">
                    <label className="input-group-text" >Transactions related to this Card</label>
                </div>
                        <TransactionsList url={'http://localhost:9001/transactions/cards'} object={props.card.id} search={props.card.id} />
            </Modal.Body>
            <Modal.Footer>
            {pay === true &&
                    <Button variant="secondary" onClick={handleClosePayment}>
                        Cancel
                    </Button>
                }
                {pay === false &&
                    <Button variant="primary" onClick={handleShowPayment}>
                        Make a Payment
                    </Button>
                } {pay === true && paymentAccount &&
                    <Button variant="primary" onClick={makePayment}>
                        Confirm Payment <GiPayMoney />
                    </Button>
                }
            </Modal.Footer>
        </section>

    );
}

export default CardStatus;
