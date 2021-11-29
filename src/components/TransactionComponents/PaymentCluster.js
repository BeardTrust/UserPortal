import { useState, useContext, useEffect, useRef, useCallback } from "react";
import { CurrencyValue } from "../../models/currencyvalue.model";
import { Dropdown } from "react-bootstrap";
import AuthContext from "../../store/auth-context";
import axios from "axios";
import { Button } from "react-bootstrap";
import { GiPayMoney } from "react-icons/gi"
import { LoanTransactionModel } from "../../models/loanTransactionModel";
import { CardTransactionModel } from "../../models/cardtransaction.model"

/**
 * This function is simply a few buttons used to make a payment.
 * It calls a list of all Accounts a user owns so they can select
 * one as a payment source. It receives props that can be used 
 * to properly make transactions and send payment requests
 *
 * @author Nathanael Grier <Nathanael.Grier@Smoothstack.com>
 * @param props.object an object to pay on (card or loan)
 * @param props.endpoint The endpoint to pay towards for the object being paid on
 *
 * @returns {JSX.Element} the page displaying the loan details
 */
function PaymentCluster(props) {
    console.log('payment cluster props: ', props)
    const [maxPayment, setMaxPayment] = useState(null);
    const [availableAccounts, setAvailableAccounts] = useState([]);
    const [paymentAccount, setPaymentAccount] = useState();
    const authContext = useContext(AuthContext);
    const [currentObject, setCurrentObject] = useState(props.object);
    const [typeTitle, setTitle] = useState("Select Payment Account");
    const [pay, setPay] = useState(false);
    const userId = authContext.userId;
    const token = authContext.token;
    const enteredValue = useRef();

    const getAccounts = useCallback( async () => {
        console.log('get accounts')
        if (!pay) {
            const list = await axios.get(`${process.env.REACT_APP_BASE_URL}${process.env.REACT_APP_ACCOUNT_SERVICE}/me`, {
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
            setPay(true);
        }
    }, [availableAccounts, pay, token, userId])

    useEffect(() => {
        getAccounts();
        setCurrentObject(props.object);
    }, [availableAccounts, pay, props.object, getAccounts])

    /**
     * This function processes transaction requests before allowing a payment request.
     * It returns the message from transactionservice which allows or blocks tthe payment.
     * 
     * @param type The transaction type 
     * @param amount The transaction amount
     * @returns 
     */
    async function processTransaction(type, amount) {
        if (props.transType === 'Loan') {
            console.log('loan transaction model being made...')
            const t = new LoanTransactionModel('', type, 'LOAN', amount, 'PENDING', paymentAccount.id, currentObject.id, Date.now(), "A transaction from account " + paymentAccount.nickname + " to your " + currentObject.loanType.typeName + " loan with an amount of " + amount)
            console.log('transaction made: ', t)
            const url = `${process.env.REACT_APP_BASE_URL}${process.env.REACT_APP_TRANSACTIONS_ENDPOINT}`
            const res = await axios.post((url),
                t,
                {
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json'
                    }
                }
            )
            console.log('transaction response: ', res.data.transactionStatus.statusName)
            return res.data.transactionStatus.statusName
        }
        if (props.transType === 'Card') {
            console.log('loan transaction model being made...')
            const t = new CardTransactionModel('', type, 'CARD', amount, 'PENDING', paymentAccount.id, currentObject.id, Date.now(), "A transaction from account " + paymentAccount.nickname + " to your " + currentObject.cardType.typeName + " card with an amount of " + amount)
            console.log('transaction made: ', t)
            const url = `${process.env.REACT_APP_BASE_URL}${process.env.REACT_APP_TRANSACTIONS_ENDPOINT}`
            const res = await axios.post((url),
                t,
                {
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json'
                    }
                }
            )
            console.log('transaction response: ', res.data.transactionStatus.statusName)
            return res.data.transactionStatus.statusName
        }
    }

    /**
     * This function processes and sends payment requests to the respective services.
     * It relies on processTransaction() to return a success message before it can execute.
     * 
     * @param event The event from the button calling the function 
     */
    async function makePayment(event) {
        event.preventDefault();

        const desiredValue = enteredValue.current.value
        setCurrentObject(props.object);
        let d = Math.abs(Math.trunc(parseFloat(desiredValue)))
        let c = Math.abs(Math.trunc(((parseFloat(desiredValue) * 100) % 100)))
        if (d < 0) { d *= -1 }
        if (c < 0) { c *= -1 }
        const cv = new CurrencyValue(true, d, c)
        const objectBalance = new CurrencyValue(currentObject.balance.negative, currentObject.balance.dollars, currentObject.balance.cents)
        let confirmPayment = false;
        let canPay = false;
        console.log('current max payment: ', maxPayment)
        if (paymentAccount.balance.negative) {
            canPay = false
            setMaxPayment(0);
            console.log('adjusted max payment: ', maxPayment)
        } else {
            canPay = true;
        }
        if (desiredValue > maxPayment) {
            confirmPayment = window.confirm('Attempted to pay with more than available in account!\nWIP: Overdraw?')
            cv.dollars = paymentAccount.balance.dollars;
            cv.cents = paymentAccount.balance.cents
        }
        cv.negative = false;
        if (!cv.toString().includes('NaN')) {
            confirmPayment = window.confirm("Are you sure you want to pay " + cv.toString() + " towards your object of " + objectBalance.toString() + '\nWIP: Confirm Credentials?')
        } else {
            window.alert("There was an error with the amount you entered, please ensure you are using numbers in your input")
        }
        cv.negative = true;
        var stat
        if (canPay && confirmPayment) {
            stat = await processTransaction('PAYMENT', cv);
        }
        if (stat === 'Posted') {
            console.log('canPay true')
            await axios.post((`${process.env.REACT_APP_BASE_URL}${process.env.REACT_APP_ACCOUNT_SERVICE}/` + userId + '/' + paymentAccount.id),
                cv,
                {
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json'
                    }
                }
            )
            await axios.post((`${process.env.REACT_APP_BASE_URL}` + props.endpoint),
                cv,
                {
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json'
                    }
                }
            )
        }
        window.location.reload();
    }

    /**
     * This function simply sets the current account to make a payment from.
     * Other related parameters are also set (such as the maximum payment allowed)
     * 
     * @param dropInput the account selected
     */
    function dropHandler(dropInput) {
        setMaxPayment((availableAccounts[dropInput].balance.dollars + (availableAccounts[dropInput].balance.cents / 100)))
        setPaymentAccount(availableAccounts[dropInput])
        console.log('drop handler accessed by: ', dropInput)
        setTitle(availableAccounts[dropInput].nickname + ': ' + CurrencyValue.from(availableAccounts[dropInput].balance).toString())
    }

    return (
        <div class="input-group mb-2">
            <label id="paySourceLabel" className="input-group-text mb-2">Source Account:</label>
            <Dropdown onSelect={function (evt) { dropHandler(evt) }} required>
                <Dropdown.Toggle variant="success" id="dropdown-basic" data-toggle="dropdown">
                    {typeTitle}
                </Dropdown.Toggle>
                <Dropdown.Menu required>
                    {availableAccounts.map((account, index) => (
                        <Dropdown.Item eventKey={index}>{account.nickname}: {CurrencyValue.from(account.balance).toString()}</Dropdown.Item>
                    ))}
                    <div role="separator" class="dropdown-divider"></div>
                    <Dropdown.Item disabled="true">Select an account to make a payment from</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
            {maxPayment !== null &&
                <div class="input-group mb-2">
                    <label id="paymentAmountDateLabel" className="input-group-text">Payment Amount:</label>
                    <label id="PayDollarSignLabel" className="input-group-text">$</label>
                    <input className="form-control" type="number" step="0.01" min="0" max={maxPayment} ref={enteredValue} ></input>
                </div>
            }
            {pay === true && paymentAccount &&
                <Button variant="primary" onClick={makePayment}>
                    Confirm Payment <GiPayMoney />
                </Button>
            }
        </div>
    )
}
export default PaymentCluster