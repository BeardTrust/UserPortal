import { Modal, Button } from "react-bootstrap"
import { CurrencyValue } from "../../models/currencyvalue.model"
import TransactionsList from "../TransactionComponents/TransactionsList";


function AccountModal(props) {
    console.log('account modal rcvd: ', props)
    return (
        <section>
                <Modal.Body>
                    <div className="form-group">
                        <div className="mb-2">
                            <label id="typeLabel" className="form-label">Type:</label>
                            <input id="typeText" type="text" disabled={true} className="form-control" value={props.account.type.name}></input>
                        </div>
                        <div className="mb-2">
                            <label id="typeLabel" className="form-label">Nickname:</label>
                            <input id="typeText" type="text" disabled={true} className="form-control" value={props.account.nickname}></input>
                        </div>
                        <div className="mb-2">
                            <label id="descriptionLabel" className="form-label">Description:</label>
                            <p id="descriptionText" className="form-body">
                                {props.account.type.description}
                            </p>
                        </div>
                        <div className="mb-2">
                            <label id="interestLabel" className="form-label">Interest:</label>
                            <input id="interestText" className="form-control" type="text" disabled={true} value={props.account.interest + '%'}></input>
                        </div>
                        <div className="mb-2">
                            <label id="amountLabel" className="form-label">Amount:</label>
                            <input id="amountText" className="form-control" type="text" disabled={true} value={CurrencyValue.from(props.account.balance).toString()}></input>
                        </div>
                        <div className="mb-2">
                            <label id="createDateLabel" className="form-label">Date Created:</label>
                            <input id="createDateText" className="form-control" type="text" disabled={true} value={props.account.createDate}></input>
                        </div>
                        <TransactionsList assetId={props.account.id}/>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary">
                        Payment Features Here
                    </Button>
                </Modal.Footer>
        </section>)
}
export default AccountModal
