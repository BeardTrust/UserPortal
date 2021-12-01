// noinspection JSUnresolvedVariable

import AuthContext from "../../store/auth-context";
import {useCallback, useContext, useEffect, useState} from "react";
import {Table} from "react-bootstrap";
import {CurrencyValue} from "../../models/currencyvalue.model";
import Pagination from '@material-ui/lab/Pagination';
import {FcRefresh, FcSearch} from "react-icons/fc";
import axios from "axios";

/**
 * This function returns a sortable table listing the transactions involved with the inbound asset
 *
 * @param props.assetId The asset to get transactions of
 *
 * @returns {JSX.Element} The table containing the list of transactions
 */
function TransactionsList(props) {
    const authContext = useContext(AuthContext);
    const url = `${process.env.REACT_APP_BASE_URL}${process.env.REACT_APP_TRANSACTIONS_ENDPOINT}/${props.assetId}`;
    const [errorMessage, setErrorMessage] = useState();
    const pageSizes = [5, 10, 15, 20, 25, 50];
    const [transactions, setTransactions] = useState();
    const [pageSize, setPageSize] = useState(5);
    const [sortBy, setSortBy] = useState('statusTime,asc');
    const [searchCriteria, setSearchCriteria] = useState("");
    const [numberOfPages, setNumberOfPages] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortByDate, setSortByDate] = useState({active: false, name: 'statusTime', direction: 'asc'});
    const [sortByDescription, setSortByDescription] = useState({active: false, name: 'notes', direction: 'asc'});
    const [sortByAmount, setSortByAmount] = useState({active: false, name: 'transactionAmount', direction: 'asc'});
    const [sortByStatus, setSortByStatus] = useState({active: false, name: 'transactionStatus', direction: 'asc'});

    const getTransactions = useCallback(async () => {
        try {
            const content = await axios.get(url, {
                params: {
                    page: currentPage === 0 ? 0 : currentPage - 1,
                    size: pageSize,
                    sort: sortBy,
                    search: searchCriteria
                },
                headers: {
                    "Authorization": authContext.token
                }
            });

            setTransactions(content.data.content);
            setNumberOfPages(content.data.totalPages);
        } catch (exception) {
            setErrorMessage("Error getting Transactions: " + exception.response.status +
                ' ' + exception.response.statusText);
        }
    }, [authContext.token, currentPage, pageSize, searchCriteria, sortBy, url]);

    useEffect(() => {
        getTransactions();
    }, [setNumberOfPages, url, currentPage, pageSize, sortBy, searchCriteria, authContext.token, getTransactions]);

    function colorStyle(props) {
        return ({
            color: props
        })
    }

    function processColor(props) {
        let color;

        if (props.negative !== undefined) {
            if (props.negative) {
                color = 'red';
            }
            if (!props.negative) {
                color = 'green'
            }
        }
        if (props.statusName !== undefined) {
            if (props.statusName === "Pending") {
                color = 'blue';
            } else if (props.statusName === "Posted") {
                color = 'green';
            } else if (props.statusName === "Declined") {
                color = 'red';
            }
        }

        return colorStyle(color);
    }

    function resetSearch() {
        setCurrentPage(1);
        deactivateSortParams();
        setSortBy('statusTime,asc');
        setSearchCriteria("");
    }

    function handlePageSizeChange(event) {
        setPageSize(event.target.value);
        setCurrentPage(1);
    }

    function handleSearchCriteriaChange(event) {
        const criteria = event.target.value;

        if (criteria.length > 0) {
            setSearchCriteria(criteria);
        } else {
            setSearchCriteria("");
        }
    }

    function handlePageChange(event, value) {
        setCurrentPage(value);
    }

    function deactivateSortParams() {
        setSortByDate({active: false, name: 'statusTime', direction: sortByDate.direction});
        setSortByDescription({active: false, name: 'notes', direction: sortByDescription.direction});
        setSortByAmount({active: false, name: 'transactionAmount', direction: sortByAmount.direction});
        setSortByStatus({active: false, name: 'transactionStatus', direction: sortByStatus.direction});
    }

    function onSortChanged(event) {
        let sort = '';

        deactivateSortParams();

        if (event.target.id === 'statusTime') {
            if (sortByDate.active === true) {
                if (sortByDate.direction === 'asc') {
                    setSortByDate({active: true, name: 'statusTime', direction: 'desc'});
                } else {
                    setSortByDate({active: true, name: 'statusTime', direction: 'asc'});
                }
            } else {
                setSortByDate({active: true, name: 'statusTime', direction: 'desc'});
            }

            sort = sortByDate.name + ',' + sortByDate.direction;
        }

        if (event.target.id === 'notes') {
            if (sortByDescription.active === true) {
                if (sortByDescription.direction === 'asc') {
                    setSortByDescription({active: true, name: 'notes', direction: 'desc'});
                } else {
                    setSortByDescription({active: true, name: 'notes', direction: 'asc'});
                }
            } else {
                setSortByDescription({active: true, name: 'notes', direction: 'desc'});
            }

            sort = sortByDescription.name + ',' + sortByDescription.direction;
        }

        if (event.target.id === 'transactionAmount') {
            if (sortByAmount.active === true) {
                if (sortByAmount.direction === 'asc') {
                    setSortByAmount({active: true, name: 'transactionAmount', direction: 'desc'});
                } else {
                    setSortByAmount({active: true, name: 'transactionAmount', direction: 'asc'});
                }
            } else {
                setSortByAmount({active: true, name: 'transactionAmount', direction: 'desc'});
            }

            sort = sortByAmount.name + '.dollars,' + sortByAmount.direction;
        }

        if (event.target.id === 'transactionStatus') {
            if (sortByStatus.active === true) {
                if (sortByStatus.direction === 'asc') {
                    setSortByStatus({active: true, name: 'transactionStatus', direction: 'desc'});
                } else {
                    setSortByStatus({active: true, name: 'transactionStatus', direction: 'asc'});
                }
            } else {
                setSortByStatus({active: true, name: 'transactionStatus', direction: 'desc'});
                sort = sortByStatus.name + ',' + sortByStatus.direction;
            }

            sort = sortByStatus.name + ',' + sortByStatus.direction;
        }

        setSortBy(sort);
    }

    function handleSearchClicked() {
    }

    return (
        <div className={'mt-0'}>
            <div>
                <div className={'mt-5'}>
                    <div>
                        <div className={'input-group mb-3'}>
                            <label className={'input-group-text'}>
                                {'Items per Page: '}
                            </label>
                            <select data-testid={'pageSizeSelector'} className={'text-center align-middle'}
                                    onChange={handlePageSizeChange}
                                    value={pageSize}>
                                {pageSizes.map((size) => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                            <button className={'btn btn-outline-secondary'} type="submit" id="reset"
                                    title="Reset Sort" onClick={resetSearch}><FcRefresh/></button>
                            <input type={'text'} className={'form-control'} placeholder={'Search'}
                                   value={searchCriteria}
                                   onChange={handleSearchCriteriaChange} title="Search"/>
                            <button className={'btn btn-outline-secondary'} type={'button'}
                                    onClick={handleSearchClicked}
                                    id={'searchBar'}><FcSearch/>Search
                            </button>
                        </div>
                    </div>
                </div>
                <div>
                    {errorMessage && <div className={'alert-danger mt-5'}>{errorMessage}</div>}
                    <Table striped bordered hover className={'me-3 table-responsive'} data-sortable={'true'}
                           data-toggle={'table'} id={'table'}>
                        <thead>
                        <tr>
                            <th colSpan={5} className={'text-center'}>Transactions</th>
                        </tr>
                        <tr>
                            <th className={'align-middle text-center'} data-sortable={'true'}
                                scope={'col'}
                                id={'statusTime'}
                                onClick={onSortChanged}>Date
                                {(sortByDate.active === true && sortByDate.direction === 'desc') && ' ↑'}
                                {(sortByDate.active === true && sortByDate.direction === 'asc') && ' ↓'}
                            </th>
                            <th data-sortable={'true'} scope={'col'} id={'notes'} colSpan={1}
                                onClick={onSortChanged}>Description
                                {(sortByDescription.active === true && sortByDescription.direction === 'desc') && ' ↑'}
                                {(sortByDescription.active === true && sortByDescription.direction === 'asc') && ' ↓'}
                            </th>
                            <th className={'align-middle text-center'} data-sortable={'true'} scope={'col'}
                                id={'transactionAmount'} onClick={onSortChanged}>Amount
                                {(sortByAmount.active === true && sortByAmount.direction === 'desc') && ' ↑'}
                                {(sortByAmount.active === true && sortByAmount.direction === 'asc') && ' ↓'}
                            </th>
                            <th className={'align-middle text-center'}
                                id={'transactionStatus'} onClick={onSortChanged}>Status
                                {(sortByStatus.active === true && sortByStatus.direction === 'desc') && ' ↑'}
                                {(sortByStatus.active === true && sortByStatus.direction === 'asc') && ' ↓'}
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {transactions && transactions.map(transaction => (
                            <tr key={transaction.id}>
                                <td className={'align-middle text-center'}>{transaction.statusTime.slice(0, 10)}
                                </td>
                                <td className={'align-middle'} colSpan={1}>{transaction.notes}</td>
                                <td style={processColor(transaction.transactionAmount)}
                                    className={'align-middle text-center'}>{CurrencyValue.from(transaction.transactionAmount).toString()}</td>
                                <td style={processColor(transaction.transactionStatus)}
                                    className={'align-middle text-center'}>{transaction.transactionStatus.statusName}</td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                    {transactions === undefined && !errorMessage &&
                        <div className="input-Group">
                            <label className="input-group-text">Transactions loading...</label>
                        </div>
                    }
                </div>
                <Pagination className={'my-3'} count={numberOfPages} page={currentPage} siblingCount={1}
                            boundaryCount={1} onChange={handlePageChange}/>
            </div>
        </div>
    )
}

export default TransactionsList;
