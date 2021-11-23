import { Modal } from "react-bootstrap"
import { useState, useRef, useContext, useEffect } from "react";
import { Button, Dropdown } from "react-bootstrap";
import { CurrencyValue } from "../../models/currencyvalue.model";
import axios from "axios";
import AuthContext from "../../store/auth-context";
import { GiPayMoney } from "react-icons/gi"
import TransactionsList from "../TransactionComponents/TransactionsList";

function LoanModal(props) {
    const authContext = useContext(AuthContext);
    const token = authContext.token;
    const userId = authContext.userId;
    const enteredValue = useRef();
    const [maxPayment, setMaxPayment] = useState(1000);
    const [availableAccounts, setAvailableAccounts] = useState([]);
    const [typeTitle, setTitle] = useState("Select Payment Account");
    const [pay, setPay] = useState(false);
    const [currentLoan, setCurrentLoan] = useState();
    const [paymentAccount, setPaymentAccount] = useState();
    const handleClosePayment = () => setPay(false);
    console.log('loan modal reached with: ', props.loan);

    useEffect(() => {
        if (availableAccounts.length === 0) {
            getAccounts();
            setCurrentLoan(props.loan);
        }

    }, [pay, availableAccounts, currentLoan, paymentAccount]);

    function handleShowPayment() {
        console.log('handle show pay')
        setPay(true);
        getAccounts();
    }

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
        }
    }

    function dropHandler(dropInput) {
        setMaxPayment((availableAccounts[dropInput].balance.dollars + (availableAccounts[dropInput].balance.cents / 100)))
        setPaymentAccount(availableAccounts[dropInput])
        console.log('drop handler accessed by: ', dropInput)
        setTitle(availableAccounts[dropInput].nickname + ': ' + CurrencyValue.from(availableAccounts[dropInput].balance).toString())
        console.log('payment account set to: ', paymentAccount)
        console.log('max payment set: ', maxPayment)
    }

    async function makePayment(event) {
        event.preventDefault();

        const desiredValue = enteredValue.current.value
        console.log('desired value: ', desiredValue)
        console.log('current loan: ', currentLoan)
        let d = Math.abs(Math.trunc(parseFloat(desiredValue)))
        let c = Math.abs(Math.trunc(((parseFloat(desiredValue) * 100) % 100)))
        if (d < 0) { d *= -1 }
        if (c < 0) { c *= -1 }
        const cv = new CurrencyValue(true, d, c)
        const loanBalance = new CurrencyValue(currentLoan.balance.negative, currentLoan.balance.dollars, currentLoan.balance.cents)
        console.log('entered value dollars: ', Math.abs(Math.trunc(parseFloat(desiredValue))))
        console.log('entered value cents: ', Math.abs(Math.trunc(((parseFloat(desiredValue) * 100) % 100))))
        var a = currentLoan.balance.dollars.toString() + '.' + (currentLoan.balance.cents / 100).toString()
        console.log('current loan: ', loanBalance.toString())
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
            confirmPayment = window.confirm("Are you sure you want to pay " + cv.toString() + " towards your loan of " + loanBalance.toString() + '\nWIP: Confirm Credentials?')
        } else {
            window.alert("There was an error with the amount you entered, please ensure you are using numbers in your input")
        }
        cv.negative = true;
        console.log('currency value body: ', cv.toString())
        console.log('payment loan set to: ', currentLoan)
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
            const res2 = await axios.post(('http://localhost:9001/loans/' + userId + '/' + currentLoan.id),
                cv,
                {
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json'
                    }
                }
            )
            console.log('account payment response: ', res)
            console.log('loan payment response: ', res2)
        }
        window.location.reload();
    }

    return (
        <section>
            <Modal.Body>
                <div className="form-group">
                    <div className="mb-2">
                        <label id="typeLabel" className="form-label">Type:</label>
                        <input id="typeText" type="text" disabled={true} className="form-control" value={props.loan.loanType.typeName}></input>
                    </div>
                    <div className="mb-2">
                        <label id="descriptionLabel" className="form-label">Description:</label>
                        <p id="descriptionText" className="form-body">
                            {props.loan.loanType.description}
                        </p>
                    </div>
                    <div className="mb-2">
                        <label id="interestLabel" className="form-label">Interest:</label>
                        <input id="interestText" className="form-control" type="text" disabled={true} value={props.loan.loanType.apr + '%'}></input>
                    </div>
                    <div className="mb-2">
                        <label id="amountLabel" className="form-label">Balance:</label>
                        <input id="amountText" className="form-control" type="text" disabled={true} value={CurrencyValue.from(props.loan.balance).toString()}></input>
                    </div>
                    <div className="mb-2">
                        <label id="principalLabel" className="form-label">Principal:</label>
                        <input id="principalText" className="form-control" type="text" disabled={true} value={CurrencyValue.from(props.loan.principal).toString()}></input>
                    </div>
                    <div className="mb-2">
                        <label id="principalLabel" className="form-label">Normal Minimum Payment:</label>
                        <input id="principalText" className="form-control" type="text" disabled={true} value={props.loan.minMonthFee}></input>
                    </div>
                    <div className="mb-2">
                        <label id="principalLabel" className="form-label">Current Minimum Owed:</label>
                        <input id="principalText" className="form-control" type="text" disabled={true} value={CurrencyValue.from(props.loan.minDue).toString()}></input>
                    </div>
                    <div className="mb-2">
                    </div>
                    <div className="mb-2">
                        <label id="nextDueDateLabel" className="form-label">Next Payment Due Date:</label>
                        <input id="nextDueDateText" className="form-control" type="text" disabled={true} value={props.loan.nextDueDate}></input>
                    </div>
                    <div className="mb-2">
                        <label id="createDateLabel" className="form-label">Date Created:</label>
                        <input id="createDateText" className="form-control" type="text" disabled={true} value={props.loan.createDate}></input>
                    </div>
                    {pay === true &&
                        <div>
                            <label id="createDateLabel" className="form-label">Source Account:</label>
                            <Dropdown onSelect={function (evt) { dropHandler(evt) }} required>
                                <Dropdown.Toggle variant="success" id="dropdown-basic" data-toggle="dropdown">
                                    {typeTitle}
                                </Dropdown.Toggle>
                                <Dropdown.Menu required>
                                    {availableAccounts.map((account, index) => (
                                        <Dropdown.Item eventKey={index}>{account.nickname}: {CurrencyValue.from(account.balance).toString()}</Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                            {maxPayment !== null &&
                                <div>
                                    <label id="createDateLabel" className="form-label">Payment Amount:</label><br></br>
                                    $<input type="number" step="0.01" min="0" max={maxPayment} ref={enteredValue} ></input>
                                </div>
                            }
                        </div>}
                    <TransactionsList assetId={props.loan.id}/>
                </div>
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
                        Confirm Payment <GiPayMoney/>
                    </Button>
                }
            </Modal.Footer>
        </section>)
}
export default LoanModal
