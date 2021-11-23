import React, {useCallback, useContext, useEffect, useState} from 'react';
import Pagination from '@material-ui/lab/Pagination';
import axios from "axios";
import {useHistory} from "react-router-dom";
import ActionContext from "../../../store/action-context";
import AuthContext from "../../../store/auth-context";
import {Table} from "react-bootstrap"

/**
 * This function returns a page that lists the cards currently available from
 * BeardTrust.
 *
 * @author Matthew Crowell <Matthew.Crowell@Smoothstack.com>
 *
 * @param props
 * @returns {JSX.Element} the page displaying all available cards
 * @constructor
 */
function CardTypes(props) {
    const history = useHistory();
    const actionContext = useContext(ActionContext);
    const authContext = useContext(AuthContext);
    const token = authContext.token;
    const [availableCards, setAvailableCards] = useState();
    const [cardsDisplayed, setCardsDisplayed] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchCriteria, setSearchCriteria] = useState('');
    const [sortBy, setSortBy] = useState("id,asc");
    const [searchCriteriaChanged, setSearchCriteriaChanged] = useState(false);
    const [sortByTypeName, setSortByTypeName] = useState({active: false, name: 'typeName', direction: 'asc'});
    const [sortByDescription, setSortByDescription] = useState({active: false, name: 'description', direction: 'asc'});
    const [sortByInterest, setSortByInterest] = useState({active: false, name: 'baseInterestRate', direction: 'asc'});
    const url = `${process.env.REACT_APP_BASE_URL}${process.env.REACT_APP_CARD_SERVICE}/available`
    const [numberOfPages, setNumberOfPages] = useState(10);
    const pageSizes = [5, 10, 15, 20, 25, 50, 100]

    const getList = useCallback(async () => {
        let params = null;
        if (searchCriteria !== '') {
            params = {
                search: searchCriteria,
                page: currentPage === 0 ? 0 : currentPage - 1,
                size: pageSize,
                sortBy: sortBy
            };
        } else {
            params = {page: currentPage === 0 ? 0 : currentPage - 1, size: pageSize, sortBy: sortBy};
        }


        const list = await axios.get(url, {
            params: params,
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });

        if (list.data.content !== availableCards) {
            if (searchCriteriaChanged) {
                setCurrentPage(1);
                setSearchCriteriaChanged(false);
            }

            setCardsDisplayed(true);
            setAvailableCards(list.data.content);
            setNumberOfPages(list.data.totalPages);
        }
    }, [availableCards, searchCriteriaChanged, token, pageSize, currentPage, searchCriteria, sortBy, url]);

    useEffect(() => {
        if (!cardsDisplayed) {
            getList();
        }

    }, [getList, availableCards, cardsDisplayed, token, url]);

    /**
     * This function handles a click on the sign up button.
     *
     * @param event the click event
     */
    function handleSignUp(event) {
        event.preventDefault();
        onSignUp(event);
    }

    /**
     * This function is called whenever the page number is changed and adjusts
     * the state of the component to send the appropriate request and render
     * the page correctly given the updated page number.
     *
     * @param event the event fired by changing the page number
     * @param value the value selected for the new current page
     */
    function handlePageChange(event, value) {
        setCardsDisplayed(false);
        if (searchCriteriaChanged) {
            setCurrentPage(1);
        } else {
            setCurrentPage(value);
        }

    }

    /**
     * This function is called whenever the search criteria is changed and adjusts
     * the state of the component to send the appropriate request and render the
     * component correctly given the updated search criteria.
     *
     * @param event the event fired by changing the search criteria
     * @param value the value entered for the new search criteria
     */
    function handleSearchCriteriaChange(event) {
        setSearchCriteriaChanged(true);
        setSearchCriteria(event.target.value);
    }

    /**
     * This function is called whenever the page size is changed.
     *
     * @param event the event fired by selecting a new page size
     */
    function handlePageSizeChange(event) {
        setCardsDisplayed(false);
        setPageSize(event.target.value);
        setCurrentPage(1);
    }

    /**
     * This function sets the targetId in the action context and moves the user to
     * the sign up page for the selected card.
     *
     * @param event the click event
     */
    function onSignUp(event) {
        actionContext.action(event.currentTarget.id);
        history.push('/cardsignup');
    }

    /**
     * This function receives a click event on the table header of the column to add to the sort list and
     * then formulates a new sort list using the existing sort list and the clicked-on header and its
     * current direction for sorting (ascending or descending order).
     *
     * @param event the click event fired by clicking on the header of the column to sort bys
     */
    function addToSort(event) {
        let sort = '';
        let field = {};

        if (event.target.id === 'typeName') {
            if (sortByTypeName.active === true) {
                field = toggleDirection(sortByTypeName);
                sort = field.name + ',' + field.direction;
            } else {
                setSortByTypeName({active: true, name: 'typeName', direction: 'asc'});
                sort = sortByTypeName.name + ',' + sortByTypeName.direction;
            }

            if (sortByDescription.active === true) {
                sort += ',' + sortByDescription.name + ',' + sortByDescription.direction;
            }

            if (sortByInterest.active === true) {
                sort += +',' + sortByInterest.name + ',' + sortByInterest.direction;
            }
        }

        if (event.target.id === 'description') {
            if (sortByDescription.active === true) {

                field = toggleDirection(sortByDescription);
                sort = field.name + ',' + field.direction;
            } else {
                setSortByDescription({active: true, name: 'description', direction: 'asc'});
                sort = sortByDescription.name + ',' + sortByDescription.direction;
            }

            if (setSortByTypeName.active === true) {
                sort += +',' + setSortByTypeName.name + ',' + setSortByTypeName.direction;
            }

            if (sortByTypeName.active === true) {
                sort += ',' + sortByTypeName.name + ',' + sortByTypeName.direction;
            }
        }

        if (event.target.id === 'baseInterestRate') {
            if (sortByInterest.active === true) {

                field = toggleDirection(sortByInterest);
                sort = field.name + ',' + field.direction;
            } else {
                setSortByInterest({active: true, name: 'baseInterestRate', direction: 'asc'});
                sort = sortByInterest.name + ',' + sortByInterest.direction;
            }

            if (sortByTypeName.active === true) {
                sort += ',' + sortByTypeName.name + ',' + sortByTypeName.direction;
            }

            if (sortByDescription.active === true) {
                sort += ',' + sortByDescription.name + ',' + sortByDescription.direction;
            }
        }

        setCardsDisplayed(false);
        setSortBy(sort);
    }

    /**
     * This function receives a query parameter, field, and toggles its direction for
     * the purpose of sorting.
     *
     * @param field the query parameter to change
     * @returns {*} the desired new value of the query parameter passed to the function
     */
    function toggleDirection(field) {
        if (field.direction === 'asc') {
            field.direction = 'desc';
        } else {
            field.direction = 'asc';
        }

        return field;
    }

    return (
        <section className={'container'}>
            <h1 className={'text-center mt-5'}>The Cards of BeardTrust</h1>
            <div className={'mt-5'}>
                <div>
                    <div className={'input-group mb-3'}>
                        <div className={'me-5 col-xs-12 col-lg-2'}>
                            <span className={'align-middle'}>
                                {'Items per Page: '}
                            </span>
                            <select data-testid={'pageSizeSelector'} className={'text-center align-middle'} onChange={handlePageSizeChange}
                                    value={pageSize}>
                                {pageSizes.map((size) => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                        </div>
                        <span className={'text-center col-sm-0 col-md-4 col-lg-6'}/>
                        <input type={'text'} className={'form-control'} placeholder={'Search'} value={searchCriteria}
                               onChange={handleSearchCriteriaChange}/>
                        <button className={'btn btn-outline-secondary'} type={'button'} onClick={getList}
                                id={'searchBar'}>Search
                        </button>
                    </div>
                </div>
                <Table striped bordered hover className={'me-3 table-responsive'} data-sortable={'true'}
                       data-toggle={'table'} id={'table'}>
                    <thead>
                    <tr>
                        <th></th>
                        <th className={'align-middle text-center'} data-sortable={'true'}
                            scope={'col'} onClick={addToSort}
                            id={'typeName'}>Card
                            {sortByTypeName.active === true && (sortByTypeName.direction === 'asc' ? '  ↑' : '  ↓')}
                        </th>
                        <th data-sortable={'true'} scope={'col'} id={'description'} onClick={addToSort}>Description
                            {sortByDescription.active === true && (sortByDescription.direction === 'asc' ? '  ↑' : '  ↓')}
                        </th>
                        <th className={'align-middle text-center'} data-sortable={'true'} scope={'col'}
                            id={'baseInterestRate'} onClick={addToSort}>Interest Rate
                            {sortByInterest.active === true && (sortByInterest.direction === 'asc' ? '  ↑' : '  ↓')}
                        </th>
                        <th className={'align-middle text-center'}>Sign Up</th>
                    </tr>
                    </thead>
                    <tbody>
                    {availableCards && availableCards.map(card => (
                        <tr key={card.id}>
                            <td className={'align-middle text-center'}><img src={card.previewURL}
                                                                            alt={'Preview of credit card with the id ' + card.id}/>
                            </td>
                            <td className={'align-middle text-center'}>{card.typeName}</td>
                            <td className={'align-middle'}>{card.description}</td>
                            <td className={'align-middle text-center'}>{card.baseInterestRate.toFixed(1) + '%'}</td>
                            <td className={'align-middle text-center'}>
                                <button className={'btn btn-primary btn mx-3'} onClick={handleSignUp}
                                        id={card.id}>Apply
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
                <Pagination className={'my-3'} count={numberOfPages} page={currentPage} siblingCount={1}
                            boundaryCount={1} onChange={handlePageChange}/>
            </div>
            <script>$('#table').DataTable()</script>
        </section>
    );
}

export default CardTypes;