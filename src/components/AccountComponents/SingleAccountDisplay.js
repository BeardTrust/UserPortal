import { Button, Table, Modal, Alert } from "react-bootstrap"
import { useContext, useRef, useState } from "react"
import AuthContext from "../../store/auth-context"
import Deactivator from "./AccountDeactivation/AccountDeactivator";
import { useHistory } from "react-router-dom";
import { useEffect } from "react";
import {CurrencyValue} from "../../models/currencyvalue.model";
import axios from "axios";

const SingleAccount = ({ accounts }) => {
    console.log('incoming accounts: ', accounts)
    const [account, setAccount] = useState({});
    const [isRecovery, setRecovery] = useState(false);
    const [deactivateText, setDeactText] = useState()
    const [amount, setAmount] = useState(new CurrencyValue(false, 0, 0));
    const [show, setShow] = useState(false);
    const [erdisp, setErDisp] = useState(false);
    const history = useHistory();
    useEffect(() => {
        setAccount(accounts)
        console.log('type: ', account.type)
        if ((account.type && account.type.name === 'Recovery') || isRecovery) {
            setRecovery(true)
            setDeactText('Recovery Account');
        }
        else {
            setRecovery(false);
        setDeactText('Deactivate');
        }
    }, [accounts, account.type, isRecovery])

    console.log('recovery status: ', isRecovery)

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const authContext = useContext(AuthContext);
    const token = authContext.token;
    const withAmt = useRef();
    const depAmt = useRef();
    const TransferEntity = { amount };

    function deactivateHandler() {
        setErDisp(Deactivator({ account }, { history }));
        handleClose();
    }

    if (erdisp) {
        window.setTimeout(() => {
            setErDisp(false)
        }, 10000)
    }

    if (accounts === null) {
        return null
    } else {
        return (
            <div className={'mb-0'}>
                <Alert variant="danger" onClose={() => setErDisp(false)} show={erdisp} dismissible>
                    <Alert.Heading>Warning! This account still has a Balance!</Alert.Heading>
                    <p>
                        You cannot close an account with a balance. Instead, it will be placed in Recovery until
                        the balance reaches zero. Recovery accounts will always have a 0% interest,
                        meaning no dividends will be accrued from them. Beardtrust reccomends transferring
                        money to another account or withdrawing everything.
                    </p>
                </Alert>

                <Table striped bordered hover className={'mb-0'}>
                    <thead>
                        <tr>
                            <th>Nickname</th>
                            <th>Balance</th>
                            <th>Interest</th>
                            <th>Date Created</th>
                            <th>Type</th>
                            <th>Withdraw</th>
                            <th>Deposit</th>
                            <th>Deactivate This Account?</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{account ? account.nickname : null}</td>
                            <td>{account.balance ? CurrencyValue.from(account?.balance).toString() : '$0.00'}</td>
                            <td>{account ? account.interest : null}%</td>
                            <td>
                                {account.createDate ? account.createDate.slice(8, 10) + '/' +
                                account.createDate.slice(5, 7) + '/' +
                                account.createDate.slice(0, 4) : null}
                            </td>
                            <td>{account && account.type ? account.type.name : null}</td>
                            <td>$<input
                                className={'col-md-6'}
                                type="text"
                                id="withdrawInput"
                                ref={withAmt} />
                                <Button
                                    className={'col-md-4'}
                                    variant="success"
                                    type={'submit'}
                                    onClick={submitWithdraw}
                                    title='withdrawButton'
                                >Withdraw</Button></td>
                            <td>$<input
                                className={'col-md-6'}
                                type="int"
                                id="depositInput"
                                ref={depAmt} />
                                <Button className={'col-md-4'}
                                    variant="success"
                                    type={'submit'}
                                    onClick={submitDeposit}
                                    title='depositButton'
                                >Deposit</Button></td>
                            <td><Button className={'col-md-8'}
                                onClick={handleShow}
                                disabled={isRecovery}
                                variant="danger"
                                type={'submit'}
                                title='deactivate'>
                                {deactivateText}</Button>

                                <Modal show={show} onHide={handleClose}>
                                    <Modal.Header closeButton>
                                        <Modal.Title>Are You Sure?</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>Once deactivated, you will no longer be able to use this account: {account ? account.nickname : null}</Modal.Body>
                                    <Modal.Footer>
                                        <Button variant="secondary" onClick={handleClose}>
                                            Cancel
                                        </Button>
                                        <Button variant="primary" onClick={() => deactivateHandler()}>
                                            Deactivate Account
                                        </Button>
                                    </Modal.Footer>
                                </Modal></td>
                        </tr>
                    </tbody>
                </Table>
            </div>
        )
    }

    function submitWithdraw(event) {
        alert("The ability to submit transactions has not been implemented yet.")
        if (!event === null) {
            event.preventDefault();
        }
        console.log('withdrw value:', withAmt.current.value);
        let amount = parseInt(withAmt.current.value, 10);
        setAmount(parseInt(amount, 10))
        if (amount === parseInt(amount, 10)) {
            if (amount > 0) {
                amount *= -1
            }
            changeMoney(amount)
        } else {
            console.log('amount not an integer')
        }

    }

    function submitDeposit(event) {
        alert("The ability to submit transactions has not been implemented yet.")
        if (!event === null) {
            event.preventDefault();
        }
        console.log('dpst value:', depAmt.current.value);
        let amount = parseInt(depAmt.current.value, 10);
        setAmount(parseInt(amount, 10))
        if (amount === parseInt(amount, 10)) {
            if (amount < 0) {
                amount *= -1
            }
            changeMoney(amount);
        } else {
            console.log('amount not an integer')
        }

    }

    async function changeMoney(amount) {
        alert("The ability to submit transactions has not been implemented yet.")
        TransferEntity.amount = amount
        const url = `${process.env.REACT_APP_BASE_URL}${process.env.REACT_APP_ACCOUNT_SERVICE}/` + account.accountId
        const headers = {
            'Authorization': token,
            'Content-Type': 'application/json'
        };
        
        try {
            const response = await axios.put(url, TransferEntity, headers);
            console.log(response.data)
            setAccount(response.data)
            window.location.reload();
        } catch (e) {
            console.log(e)
        }
    }
}

export default SingleAccount
