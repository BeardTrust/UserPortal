import { Modal, Button } from "react-bootstrap"
import { CurrencyValue } from "../../models/currencyvalue.model"
import TransactionsList from "../TransactionComponents/TransactionsList"
import AuthContext from "../../store/auth-context"
import { useState, useContext } from "react"
import { useHistory } from "react-router-dom"

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
    const authContext = useContext(AuthContext);
    const currentAccount = props.account;
    const history = useHistory();


    return (
        <section>
            <Modal.Body>
                {errorMessage && <div className={'alert-danger mt-5'}>{errorMessage}</div>}
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
                </div>
                <TransactionsList assetId={currentAccount.id} />
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="primary"
                    onClick={(event) => {
                        event.preventDefault();
                        if (authContext.userIsLoggedIn) {
                            setErrorMessage("Payments not implemented yet...")
                        } else {
                            history.push('/auth');
                        }
                    }}>
                    Payment Features Here
                </Button>
            </Modal.Footer>
        </section>)
}
export default AccountModal