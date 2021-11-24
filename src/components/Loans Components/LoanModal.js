import { Modal } from "react-bootstrap"
import { useContext } from "react";
import { CurrencyValue } from "../../models/currencyvalue.model";
import AuthContext from "../../store/auth-context";
import TransactionsList from "../TransactionComponents/TransactionsList";
import PaymentCluster from "../TransactionComponents/PaymentCluster";
/**
 * This is simply a modal fo the user to review and pay on an individual loan
 *
 * @author Nathanael Grier <Nathanael.Grier@Smoothstack.com>
 * @param props.loan a loan object, containing everything for the modal to display
 *
 * @returns {JSX.Element} the page displaying the loan details
 */
function LoanModal(props) {
    console.log('loan modal props rcvd: ', props)
    const authContext = useContext(AuthContext);
    const userId = authContext.userId;
    const currentLoan = props.loan;

    return (
        <section>
            <Modal.Body>
                <div className="form-group">
                    <div className="input-group mb-2">
                        <label id="typeLabel" className="input-group-text">Type:</label>
                        <input id="typeText" type="text" disabled={true} className="form-control" value={currentLoan.loanType.typeName}></input>
                    </div>
                    <div className="input-group mb-2">
                        <span id="descriptionLabel" className="input-group-text">Description:</span>
                        <textarea value={currentLoan.loanType.description} id="descriptionText" className="form-control" aria-label="Description" disabled={true}>
                            {currentLoan.loanType.description}
                        </textarea>
                    </div>
                    <div className="input-group mb-2">
                        <label id="interestLabel" className="input-group-text">Interest:</label>
                        <input id="interestText" className="form-control" type="text" disabled={true} value={currentLoan.loanType.apr + '%'}></input>
                    </div>
                    <div className="input-group mb-2">
                        <label id="amountLabel" className="input-group-text">Balance:</label>
                        <input id="amountText" className="form-control" type="text" disabled={true} value={CurrencyValue.from(currentLoan.balance).toString()}></input>
                    </div>
                    <div className="input-group mb-2">
                        <label id="principalLabel" className="input-group-text">Principal:</label>
                        <input id="principalText" className="form-control" type="text" disabled={true} value={CurrencyValue.from(currentLoan.principal).toString()}></input>
                    </div>
                    <div className="input-group mb-2">
                        <label id="principalLabel" className="input-group-text">Normal Minimum Payment:</label>
                        <input id="principalText" className="form-control" type="text" disabled={true} value={currentLoan.payment.minMonthFee}></input>
                    </div>
                    <div className="input-group mb-2">
                        <label id="principalLabel" className="input-group-text">Current Minimum Owed:</label>
                        <input id="principalText" className="form-control" type="text" disabled={true} value={CurrencyValue.from(currentLoan.payment.minDue).toString()}></input>
                    </div>
                    <div className="input-group mb-2">
                        <label id="principalLabel" className="input-group-text">Late Fee Owed:</label>
                        <input id="principalText" className="form-control" type="text" disabled={true} value={CurrencyValue.from(currentLoan.payment.lateFee).toString()}></input>
                    </div>
                    <div className="input-group mb-2">
                    </div>
                    <div className="input-group mb-2">
                        <label id="nextDueDateLabel" className="input-group-text">Next Payment Due Date:</label>
                        <input id="nextDueDateText" className="form-control" type="text" disabled={true} value={currentLoan.payment.nextDueDate.slice(8, 10) + '/' + currentLoan.payment.nextDueDate.slice(5, 7) + '/' + currentLoan.payment.nextDueDate.slice(0, 4)}></input>
                    </div>
                    <div className="input-group mb-2">
                        <label id="createDateLabel" className="input-group-text">Date Created:</label>
                        <input id="createDateText" className="form-control" type="text" disabled={true} value={currentLoan.createDate.slice(8, 10) + '/' + currentLoan.createDate.slice(5, 7) + '/' + currentLoan.createDate.slice(0, 4)}></input>
                    </div>
                        <div className="input-group mb-2">
                            <PaymentCluster object={currentLoan} transType='Loan' endpoint={process.env.REACT_APP_LOAN_SERVICE + '/' + userId + '/' + currentLoan.id} />
                        </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <TransactionsList assetId={currentLoan.id} loan={currentLoan} search={currentLoan.id} />
            </Modal.Footer>
        </section>)
}
export default LoanModal