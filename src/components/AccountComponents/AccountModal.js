import { Modal, Button } from "react-bootstrap"
import { CurrencyValue } from "../../models/currencyvalue.model"
import TransactionsList from "../TransactionComponents/TransactionsList"
import AuthContext from "../../store/auth-context"
import axios from "axios"
import { useState, useContext, useRef, useEffect, useCallback } from "react"
import { GiPayMoney, GiReceiveMoney } from "react-icons/gi"
import { AccountTransactionModel } from "../../models/accounttransaction.model"

/**
 * This is simply a modal fo the user to review an indivodual account
 *
 * @author Nathanael Grier <Nathanael.Grier@Smoothstack.com>
 * @param props.account an account object, containing everything for the modal to display
 *
 * @returns {JSX.Element} the page displaying the loan details
 */
function AccountModal(props) {
    console.log('account modal rcvd: ', props)
    const [errorMessage, setErrorMessage] = useState();
    const [successMessage, setSuccessMessage] = useState();
    const authContext = useContext(AuthContext);
    const token = authContext.token;
    const currentAccount = props.account;
    const [depositing, setDepositing] = useState(false);
    const [withdrawing, setWithdrawing] = useState(false);
    const enteredValue = useRef();
    const [amount, setAmount] = useState();
    const maxWithdraw = currentAccount.balance.negative ? 0 : (currentAccount.balance.dollars + currentAccount.balance.cents / 100);
    console.log('max withdraw set: ', maxWithdraw)

    /**
     * This function sends the payment amount the the back-end.
     * 
     * @author Nathanael Grier <nathanael.grier@smoothstack.com>
     * 
     */
    const makePayment = useCallback( async () => {
        console.log('making payment...', amount)
        await axios.put((`${process.env.REACT_APP_BASE_URL}${process.env.REACT_APP_ACCOUNT_SERVICE}/` + currentAccount.id),
                amount,
                {
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json'
                    }
                }
            ).then ((res) => {
                var type = amount.negative ? 'Withdraw' : 'Deposit'
                console.log('makepayment response: ', res)
                setSuccessMessage('Successfully posted ' + type + '!!!')
            console.log(res);
            })
            .catch((e) =>  {
                console.log('error: ', e.response)
                setErrorMessage("Error making Payments: " + e.response.status + ' ' + e.response.statusText)
            });
            window.location.reload();
    }, [amount, currentAccount, token])

    function handleAmount(props) {
        console.log('props received: ', props)
        const c = CurrencyValue.valueOf(enteredValue.current.value)
        c.negative = props
        console.log('value made: ', c.toString())
        setAmount(c);
    }

    /**
     * This function processes the transaction purely actin on one account.
     * It is unique in thst the source and target must be set by the back end, 
     * rather than by the front. If it receives a posted transaction, it will run
     * the payment function.  
     * 
     * @author Nathanael Grier <nathanael.grier@smoothstack.com>
     * 
     */
     const processTransaction = useCallback( async  () => {
        console.log('handle payment call')
        var type = amount.negative ? 'WITHDRAWAL' : 'DEPOSIT'
        var targetId = amount.negative ? "Withdrawal" : currentAccount.id;
        var sourceId = amount.negative ? currentAccount.id : "Deposit";
        console.log('payment amount: ', amount)
        console.log('account transaction model being made...')
        const t = new AccountTransactionModel('', type, 'ACCOUNT', amount, 'PENDING', sourceId, targetId, Date.now(), "A " + type.toLowerCase() + " for your " + currentAccount.type.name + " account with an amount of " + amount)
        console.log('transaction made: ', t)
        const url = `${process.env.REACT_APP_BASE_URL}${process.env.REACT_APP_TRANSACTIONS_ENDPOINT}`
        await axios.post((url),
            t,
            {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            }
        ).then((res) => {
        console.log('transaction response: ', res)
        if (res.data.transactionStatus.statusName === 'Posted') {
            console.log('transaction posted...')
            makePayment()
        }
        if (res.data.transactionStatus.statusName === 'Declined') {
            console.log('transaction declined...')
            setErrorMessage('Error creating Transaction: amount was declined')
        }
    })
    .catch((e) =>  {
        console.log('error: ', e)
        setErrorMessage("Error making Transaction")
    });
    }, [amount, currentAccount, token, makePayment])

    useEffect(() => {
        console.log('use effect called, amount: ', amount)
        if (amount !== undefined) {
            console.log('use effect calling payment')
            processTransaction()
        }
    }, [amount, processTransaction])


    return (
        <section>
            <Modal.Body>
                {errorMessage && <div className={'alert-danger mt-5'}>{errorMessage}</div>}
                {successMessage && <div className={'alert-success mt-5'}>{successMessage}</div>}
                <div className="form-group">
                    <div className="input-group mb-2">
                        <label id="typeLabel" className="input-group-text">Type:</label>
                        <input id="typeText" type="text" disabled={true} className="form-control" value={currentAccount.type.name}></input>
                    </div>
                    <div className="input-group mb-2">
                        <label id="typeLabel" className="input-group-text">Nickname:</label>
                        <input id="typeText" type="text" disabled={true} className="form-control" value={currentAccount.nickname}></input>
                    </div>
                    <div className="input-group mb-2">
                        <label id="descriptionLabel" className="input-group-text">Description:</label>
                        <textarea value={currentAccount.type.description} id="descriptionText" className="form-control" readOnly="readonly">
                            {currentAccount.type.description}
                        </textarea>
                    </div>
                    <div className="input-group mb-2">
                        <label id="interestLabel" className="input-group-text">Interest:</label>
                        <input id="interestText" className="form-control" type="text" disabled={true} value={currentAccount.interest + '%'}></input>
                    </div>
                    <div className="input-group mb-2">
                        <label id="amountLabel" className="input-group-text">Amount:</label>
                        <input id="amountText" className="form-control" type="text" disabled={true} value={CurrencyValue.from(currentAccount.balance).toString()}></input>
                    </div>
                    <div className="input-group mb-2">
                        <label id="createDateLabel" className="input-group-text">Date Created:</label>
                        <input id="createDateText" className="form-control" type="text" disabled={true} value={currentAccount.createDate.slice(8, 10) + '/' + currentAccount.createDate.slice(5, 7) + '/' + currentAccount.createDate.slice(0, 4)}></input>
                    </div>
                    <div className="input-group mb-2">
                        {!depositing &&
                            <Button
                                variant="primary"
                                onClick={(event) => {
                                    event.preventDefault();
                                    setDepositing(true)
                                }}>
                                Deposit
                            </Button>
                        }
                        {depositing &&
                            <div className="input-group mb-2">
                                <label id="paymentAmountDateLabel" className="input-group-text">Deposit Amount:</label>
                                <label id="PayDollarSignLabel" className="input-group-text">$</label>
                                <input className="form-control" type="number" step="0.01" max="999999999999999999999" min="0" ref={enteredValue} ></input>
                                <Button variant="primary" onClick={() => {
                                    setDepositing(false)
                                    handleAmount(false);
                                }}>
                                    Confirm Deposit <GiPayMoney />
                                </Button>
                            </div>
                        }
                    </div>
                    <div className="input-group mb-2">
                        {!withdrawing &&
                            <Button
                                variant="danger"
                                onClick={(event) => {
                                    event.preventDefault();
                                    if (maxWithdraw === 0) {
                                        setErrorMessage("Cannot withdraw from an account with a balance of 0 or below")
                                    } else {
                                        setWithdrawing(true);
                                    }
                                }}>
                                Withdraw
                            </Button>
                        }
                    </div>
                        {withdrawing &&
                            <div className="input-group mb-2">
                                <label id="paymentAmountDateLabel" className="input-group-text">Withdraw Amount:</label>
                                <label id="PayDollarSignLabel" className="input-group-text">$</label>
                                <input className="form-control" type="number" step="0.01" max={maxWithdraw} min="0" ref={enteredValue} ></input>
                                <Button variant="primary" onClick={() => {
                                    setWithdrawing(false);
                                    handleAmount(true);
                                }}>
                                    Confirm Withdrawl <GiReceiveMoney />
                                </Button>
                            </div>
                        }
                </div>
            </Modal.Body>
            <Modal.Footer>
                <TransactionsList assetId={currentAccount.id} />
            </Modal.Footer>
        </section>)
}
export default AccountModal