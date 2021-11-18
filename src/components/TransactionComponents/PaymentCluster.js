import { useState, useContext, useEffect, useRef } from "react";
import { CurrencyValue } from "../../models/currencyvalue.model";
import { Dropdown, Modal } from "react-bootstrap";
import AuthContext from "../../store/auth-context";
import axios from "axios";
import { Button } from "react-bootstrap";
import { GiPayMoney } from "react-icons/gi"

function PaymentCluster(props) {

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

    async function getAccounts() {
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
            setPay(true);
        }
    }

    useEffect(() => {
        getAccounts();
        setCurrentObject(props.object);
    }, [availableAccounts, pay])

    async function makePayment(event) {
        event.preventDefault();

        const desiredValue = enteredValue.current.value
        console.log('desired value: ', desiredValue)
        console.log('current object: ', props.object)
        setCurrentObject(props.object);
        let d = Math.abs(Math.trunc(parseFloat(desiredValue)))
        let c = Math.abs(Math.trunc(((parseFloat(desiredValue) * 100) % 100)))
        if (d < 0) { d *= -1 }
        if (c < 0) { c *= -1 }
        const cv = new CurrencyValue(true, d, c)
        const objectBalance = new CurrencyValue(currentObject.balance.negative, currentObject.balance.dollars, currentObject.balance.cents)
        console.log('entered value dollars: ', Math.abs(Math.trunc(parseFloat(desiredValue))))
        console.log('entered value cents: ', Math.abs(Math.trunc(((parseFloat(desiredValue) * 100) % 100))))
        var a = currentObject.balance.dollars.toString() + '.' + (currentObject.balance.cents / 100).toString()
        console.log('current object: ', objectBalance.toString())
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
            confirmPayment = window.confirm("Are you sure you want to pay " + cv.toString() + " towards your object of " + objectBalance.toString() + '\nWIP: Confirm Credentials?')
        } else {
            window.alert("There was an error with the amount you entered, please ensure you are using numbers in your input")
        }
        cv.negative = true;
        console.log('currency value body: ', cv.toString())
        console.log('payment object set to: ', currentObject)
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
            const res2 = await axios.post(('http://localhost:9001' + props.endpoint),
                cv,
                {
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json'
                    }
                }
            )
            console.log('account payment response: ', res)
            console.log('object payment response: ', res2)
        }
        window.location.reload();
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