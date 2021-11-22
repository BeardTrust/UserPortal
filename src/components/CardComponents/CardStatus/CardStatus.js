import { useContext  } from "react";
import AuthContext from "../../../store/auth-context";
import PaymentCluster from "../../TransactionComponents/PaymentCluster";
import TransactionsList from "../../TransactionComponents/TransactionsList";
import { Modal } from "react-bootstrap";
import { CurrencyValue } from "../../../models/currencyvalue.model";
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
    console.log('card modal props rcvd: ', props)
    const cardId = props.card.id;
    const authContext = useContext(AuthContext);
    const userId = authContext.userId;
    const currentCard = props.card;

    return (
        <section className={'container'}>
            <Modal.Body >
                <div className="form-group">
                    <div className="input-group mb-2">
                        <label id="typeLabel" className="input-group-text">Card Number</label>
                        <input id="typeText" type="text" disabled={true} className="form-control" value={currentCard.cardNumber}></input>
                    </div>
                    <div className="input-group mb-2">
                        <label id="typeLabel" className="input-group-text">Nickname:</label>
                        <input id="typeText" type="text" disabled={true} className="form-control" value={currentCard.nickname}></input>
                    </div>
                    <div className="input-group mb-2">
                        <label id="descriptionLabel" className="input-group-text">Description:</label>
                        <textarea value={currentCard.cardType.description} id="descriptionText" className="form-control" readOnly="readonly">
                            {currentCard.cardType.description}
                        </textarea>
                    </div>
                    <div className="input-group mb-2">
                        <label id="interestLabel" className="input-group-text">Interest:</label>
                        <input id="interestText" className="form-control" type="text" disabled={true} value={currentCard.interestRate + '%'}></input>
                    </div>
                    <div className="input-group mb-2">
                        <label id="amountLabel" className="input-group-text">Amount:</label>
                        <input id="amountText" className="form-control" type="text" disabled={true} value={CurrencyValue.from(currentCard.balance).toString()}></input>
                    </div>
                    <div className="input-group mb-2">
                        <label id="createDateLabel" className="input-group-text">Date Created:</label>
                        <input id="createDateText" className="form-control" type="text" disabled={true} value={currentCard.createDate.slice(8, 10) + '/' + currentCard.createDate.slice(5, 7) + '/' + currentCard.createDate.slice(0, 4)}></input>
                    </div>
                </div>
                <div className="input-group mb-2">
                    <PaymentCluster object={currentCard} transType='Card' endpoint={process.env.REACT_APP_CARD_SERVICE + '/' + userId + '/' + cardId} />
                </div>

            </Modal.Body>
            <Modal.Footer>
                <TransactionsList object={currentCard.id} assetId={currentCard.id} />
            </Modal.Footer>

        </section>
    );
}

export default CardStatus;
