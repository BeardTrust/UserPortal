import axios from "axios";
import {useContext, useEffect, useState} from "react";
import AuthContext from "../../../store/auth-context";
import {useHistory, useParams} from "react-router-dom";
import Centerpiece from "../../LayoutComponents/Centerpiece/Centerpiece";
import TransactionsList from "../../TransactionComponents/TransactionsList";

/**
 * This function returns a page showing the details and status of a
 * single, specified card associated with the currently logged in user.
 *
 * @author Matthew Crowell <Matthew.Crowell@Smoothstack.com>
 *
 * @returns {JSX.Element} the page displaying the card details
 * @constructor
 */
function CardStatus(){
    const history = useHistory();
    const {cardId} = useParams();
    const authContext = useContext(AuthContext);
    const [errorMessage, setErrorMessage] = useState();
    const [cardStatus, setCardStatus] = useState();
    const [hasLoaded, setHasLoaded] = useState(false);
    const userId = authContext.userId;
    const token = authContext.token;
    const url = `${process.env.REACT_APP_BASE_URL}${process.env.REACT_APP_CARD_SERVICE}/${userId}/${cardId}`;

    useEffect(() => {
        if(!hasLoaded){
            /**
             * This function retrieves the card details and updates the state of the
             * card status page.
             *
             * @returns {Promise<void>}
             */
            async function fetchCardStatus(){
                if(!hasLoaded){
                    const results = await axios.get(url, {
                        headers: {
                            'Authorization': token,
                            'Content-Type': 'application/json'
                        }
                    });

                    if(results){
                        setCardStatus(results.data);
                        setHasLoaded(true);
                    }
                }
            }

            try {
                fetchCardStatus()
            } catch (e) {
                if (e.response) {
                    setErrorMessage(e.response.data.message);
                } else {
                    setErrorMessage('Something went wrong... please try again later');
                }
            }
        }

    }, [hasLoaded, url, token, cardStatus]);

    return (
        <section className={'container'}>
            {errorMessage && <div className={'alert-danger mt-5'}>{errorMessage}</div>}
            <Centerpiece content={
                {                                                                                                                                                                                                                                                                                                               
                    title: cardStatus?.nickname + '   ...' + cardStatus?.cardNumber?.slice(15,19),
                    lead: 'Current Balance: $' + cardStatus?.balance?.dollars + '.' + (cardStatus?.balance?.cents > 10 ?
                        cardStatus?.balance?.cents : '0' + cardStatus?.balance?.cents),
                    body: 'TODO: add transactions, minimum payment, due date, and write user\'s name and card number' +
                        ' on card image',
                    imageText: cardStatus?.nickname,
                    image: '/images/GenericCard.png',
                    alt: 'Generic credit card image',
                    buttonText: 'Make Payment',
                    buttonClasses: 'btn-secondary',
                    clickHandler: (event) => {
                        event.preventDefault();
                        if(authContext.userIsLoggedIn){
                            setErrorMessage("Payments not implemented yet...")
                        } else {
                            history.push('/auth');
                        }
                    }
                }
            }/>

            <TransactionsList assetId={cardId} />

        </section>
    );
}

export default CardStatus;
