import { Modal } from "react-bootstrap"
import { useState, useRef, useContext, useEffect } from "react";
import { Button, Dropdown } from "react-bootstrap";
import { CurrencyValue } from "../../models/currencyvalue.model";
import axios from "axios";
import AuthContext from "../../store/auth-context";
import { GiPayMoney } from "react-icons/gi"
import TransactionsList from "../TransactionComponents/TransactionsList";
import { LoanTransactionModel } from "../../models/loanTransactionModel";
import PaymentCluster from "../TransactionComponents/PaymentCluster";

function LoanModal(props) {
    const authContext = useContext(AuthContext);
    const token = authContext.token;
    const userId = authContext.userId;
    const enteredValue = useRef();
    const [maxPayment, setMaxPayment] = useState(null);
    const [availableAccounts, setAvailableAccounts] = useState([]);
    const [typeTitle, setTitle] = useState("Select Payment Account");
    const [pay, setPay] = useState(false);
    const [currentLoan, setCurrentLoan] = useState();
    const [paymentAccount, setPaymentAccount] = useState();
    const [transStatus, setTransStatus] = useState();
    const handleClosePayment = () => setPay(false);
    console.log('loan modal reached');

    useEffect(() => {
        setCurrentLoan(props.loan);
        if (availableAccounts.length === 0) {
            getAccounts();
        }

    }, [pay, availableAccounts, currentLoan, paymentAccount]);

    function handleShowPayment() {
        console.log('handle show pay')
        setPay(true);
        getAccounts();
    }

    async function getAccounts() {
        console.log('get accounts')
        const url = `${process.env.REACT_APP_BASE_URL}${process.env.REACT_APP_ACCOUNT_SERVICE}` + '/me'
        if (!pay) {
            const list = await axios.get(url, {
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

    async function processTransaction(type, amount) {
        // amount.dollars = 1000
        const t = new LoanTransactionModel('', type, 'LOAN', amount, 'PENDING', paymentAccount.id, currentLoan.id, Date.now(), "A transaction from account " + paymentAccount.nickname + " to your " + currentLoan.loanType.typeName + " loan with an amount of " + amount)
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
        setTransStatus(res.data.transactionStatus.statusName)
        return res.data.transactionStatus.statusName
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
        var stat
        if (canPay && confirmPayment) {
            stat = await processTransaction('PAYMENT', cv);
            console.log('transaction status: ', stat)
        }
        if (stat === 'Posted') {
            console.log('canPay true')
            const res = await axios.post((`${process.env.REACT_APP_BASE_URL}${process.env.REACT_APP_ACCOUNT_SERVICE}/` + userId + '/' + paymentAccount.id),
                cv,
                {
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json'
                    }
                }
            )
            const res2 = await axios.post((`${process.env.REACT_APP_BASE_URL}${process.env.REACT_APP_LOAN_SERVICE}/` + userId + '/' + currentLoan.id),
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
                    <div className="input-group mb-2">
                        <label id="typeLabel" className="input-group-text">Type:</label>
                        <input id="typeText" type="text" disabled={true} className="form-control" value={props.loan.loanType.typeName}></input>
                    </div>
                    <div className="input-group mb-2">
                        <span id="descriptionLabel" className="input-group-text">Description:</span>
                        <textarea value={props.loan.loanType.description} id="descriptionText" className="form-control" aria-label="Description" disabled={true}>
                            {props.loan.loanType.description}
                        </textarea>
                    </div>
                    <div className="input-group mb-2">
                        <label id="interestLabel" className="input-group-text">Interest:</label>
                        <input id="interestText" className="form-control" type="text" disabled={true} value={props.loan.loanType.apr + '%'}></input>
                    </div>
                    <div className="input-group mb-2">
                        <label id="amountLabel" className="input-group-text">Balance:</label>
                        <input id="amountText" className="form-control" type="text" disabled={true} value={CurrencyValue.from(props.loan.balance).toString()}></input>
                    </div>
                    <div className="input-group mb-2">
                        <label id="principalLabel" className="input-group-text">Principal:</label>
                        <input id="principalText" className="form-control" type="text" disabled={true} value={CurrencyValue.from(props.loan.principal).toString()}></input>
                    </div>
                    <div className="input-group mb-2">
                        <label id="principalLabel" className="input-group-text">Normal Minimum Payment:</label>
                        <input id="principalText" className="form-control" type="text" disabled={true} value={props.loan.payment.minMonthFee}></input>
                    </div>
                    <div className="input-group mb-2">
                        <label id="principalLabel" className="input-group-text">Current Minimum Owed:</label>
                        <input id="principalText" className="form-control" type="text" disabled={true} value={CurrencyValue.from(props.loan.payment.minDue).toString()}></input>
                    </div>
                    <div className="input-group mb-2">
                    </div>
                    <div className="input-group mb-2">
                        <label id="nextDueDateLabel" className="input-group-text">Next Payment Due Date:</label>
                        <input id="nextDueDateText" className="form-control" type="text" disabled={true} value={props.loan.payment.nextDueDate.slice(8, 10) + '/' + props.loan.payment.nextDueDate.slice(5, 7) + '/' + props.loan.payment.nextDueDate.slice(0, 4)}></input>
                    </div>
                    <div className="input-group mb-2">
                        <label id="createDateLabel" className="input-group-text">Date Created:</label>
                        <input id="createDateText" className="form-control" type="text" disabled={true} value={props.loan.createDate.slice(8, 10) + '/' + props.loan.createDate.slice(5, 7) + '/' + props.loan.createDate.slice(0, 4)}></input>
                    </div>
                    {pay === true &&
                        <div className="input-group mb-2">
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
                </div>
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
            </Modal.Body>
            <Modal.Footer>
                <TransactionsList assetId={props.loan.id} loan={props.loan} search={props.loan.id} />
            </Modal.Footer>
        </section>)
}
export default LoanModal