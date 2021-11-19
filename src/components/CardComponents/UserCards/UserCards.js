import {useContext, useEffect, useState} from "react";
import axios from "axios";
import AuthContext from "../../../store/auth-context";
import CardsList from "./CardsList";
import Pagination from '@material-ui/lab/Pagination';

/**
 * This function returns a page that retrieves and displays a list of all
 * cards associated with the currently logged in user.
 *
 * @author Matthew Crowell <Matthew.Crowell@Smoothstack.com>
 *
 * @returns {JSX.Element} the page that displays the retrieved table
 * @constructor
 */
function UserCards(){
    const authContext = useContext(AuthContext);
    const userId = authContext.userId;
    const token = authContext.token;
    const url = `${process.env.REACT_APP_BASE_URL}${process.env.REACT_APP_CARD_SERVICE}/` + userId + "/all";
    const [cardsList, setCardsList] = useState();
    const [cardsDisplayed, setCardsDisplayed] = useState(false);
    const pageSizes = [5, 10, 15, 20, 25, 50, 100];

    useEffect(() => {
        /**
         * This function retrieves the list of cards and updates the page's state.
         *
         * @returns {Promise<void>}
         */
        async function getList(){
            const list = await axios.get(url, {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });

            if(list.data !== cardsList){
                setCardsList(list.data.content);
                setCardsDisplayed(true);
            }
        }

        if(!cardsDisplayed){
            getList();
        }

    }, [cardsList, cardsDisplayed, token, url]);

    return(
        <section className={'container'}>
            <div className={'mt-5'}>
                <h2 className={'my-3 text-center'}>Your Cards</h2>
                <div>
                    <div className={'input-group mb-3'}>
                        <div className={'me-5 col-xs-12 col-lg-2'}>
                            <span className={'align-middle'}>
                                {'Items per Page: '}
                            </span>
                            <select data-testid={'pageSizeSelector'} className={'text-center align-middle'}>
                                {pageSizes.map((size) => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                        </div>
                        <span className={'text-center col-sm-0 col-md-4 col-lg-6'}/>
                        <input type={'text'} className={'form-control'} placeholder={'Search'} />
                        <button className={'btn btn-outline-secondary'} type={'button'}
                                id={'searchBar'}>Search
                        </button>
                    </div>
                    <CardsList className={'my-3'} cards={cardsList}/>
                    <Pagination className={'my-3'} siblingCount={1}
                                boundaryCount={1} />
                </div>
            </div>
        </section>
    );
}

export default UserCards;
