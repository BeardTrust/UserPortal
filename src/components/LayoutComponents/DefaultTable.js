import { Table, Modal, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import Pagination from '@material-ui/lab/Pagination';
import { useState, useEffect, useCallback, useContext } from "react";
import AuthContext from "../../store/auth-context";
import axios from "axios";
import { CurrencyValue } from "../../models/currencyvalue.model";
import AccountModal from "../AccountComponents/AccountModal";
import LoanModal from "../Loans Components/LoanModal";
import LoanOfferModal from "../Loans Components/LoanOfferModal";
import { FcAlphabeticalSortingAz, FcAlphabeticalSortingZa, FcRefresh, FcSearch, FcMoneyTransfer, FcCurrencyExchange, FcSimCardChip } from "react-icons/fc"
import { GiMoneyStack } from "react-icons/gi"
import Style from './style.css'
import CardStatus from "../CardComponents/CardStatus/CardStatus";
import useWindowDimensions from "./useWindowSize";


const DefaultTable = (props) => {
    const authContext = useContext(AuthContext);
    const token = authContext.token;
    const userId = authContext.userId;
    const url = props.url
    const pageTitle = props.title
    const [errorPresent, setErrorPresent] = useState(false);
    const [errorTitle, setErrorTitle] = useState(props.errorTitle);
    const [availableObjects, setAvailableObjects] = useState([]);
    const [currentObject, setCurrentObject] = useState();
    const [numberOfPages, setNumberOfPages] = useState(5);
    const pageSizes = [1, 5, 10, 15, 20, 25, 50, 100];
    const [pageSize, setPageSize] = useState(5);
    const [searchCriteria, setSearchCriteria] = useState("");
    const [sortBy, setSortBy] = useState("id,asc");
    const [searchCriteriaChanged, setSearchCriteriaChanged] = useState(false);
    const [objectsDisplayed, setObjectsDisplayed] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const rows = []
    const sortArry = [props.headers.size]
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const { width } = useWindowDimensions();
    const [isMobile, setIsMobile] = useState(false)
    const [titles, setTitles] = useState(props.headers)

    function checkMobile() {
        if (width < 1050) {
            console.log('is mobile')
            setIsMobile(true);
        }
        else {
            setIsMobile(false);
        }
    }

    function handlePageChange(event, value) {
        event.preventDefault();
        setObjectsDisplayed(false);
        if (searchCriteriaChanged) {
            setCurrentPage(1);
        } else {
            setCurrentPage(value);
        }

    }

    function resetSearch() {
        for (let i of titles) {
            i.active = false;
            i.sorting = false;
        }
        setSearchCriteria("");
        setSortBy('id,asc');
        setObjectsDisplayed(false);
    }

    function handleSearchCriteriaChange(event) {
        setSearchCriteriaChanged(true);
        setSearchCriteria(event.target.value);
    }

    function handlePageSizeChange(event) {
        setObjectsDisplayed(false);
        setPageSize(event.target.value);
        setCurrentPage(1);
    }

    const getList = useCallback(async () => {
        if (searchCriteria === "") {
            setSearchCriteria('');
        }
        console.log("search: ", searchCriteria);
        let params = null;
        if (searchCriteria !== '') {
            params = {
                page: currentPage === 0 ? 0 : currentPage - 1,
                size: pageSize,
                sortBy: sortBy,
                search: searchCriteria,
                userId: userId
            };
        } else {
            params = { page: currentPage === 0 ? 0 : currentPage - 1, size: pageSize, sortBy: sortBy, userId: userId };
        }

        console.log('params: ', params);
        console.log('outbound url: ', url)
        const list = '';
        await axios.get(url, {
            params: params,
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        })
            .then(res => {
                console.log('response: ', res)
                if (res.data.content !== availableObjects) {
                    console.log('list data found: ', res.data);
                    if (searchCriteriaChanged) {
                        setCurrentPage(1);
                        setSearchCriteriaChanged(false);
                    }
                    setAvailableObjects(res.data);
                    setObjectsDisplayed(true);
                    setNumberOfPages(res.data.totalPages);
                    setCurrentObject(availableObjects[0]);
                }
                if (errorPresent) {
                    setErrorPresent(false)
                }
            })
            .catch((e) => {
                console.log('error: ', e.response)
                if (e.response !== undefined && e.response.status === 503) {
                    window.setTimeout(() => {
                        window.alert('[503 ERROR: ' + errorTitle + '] \nEither our servers are down or your connection was interrupted. The page will refresh until connection is established.')
                        window.location.reload();
                    }, 5000)
                }
            })
        console.log("default outbound url: ", url);
        console.log('available objects: ', availableObjects);
    },
        [availableObjects, searchCriteriaChanged, token, pageSize, currentPage, searchCriteria, sortBy, rows],
    )

    useEffect(() => {
        checkMobile();
        if (!objectsDisplayed) {
            getList();
        }
    }, [getList, availableObjects, objectsDisplayed, titles, url, rows, pageSize, currentPage]);

    function addToSort(event) {
        console.log('add to sort...')
        let sort = '';
        let field = {};
        try {
            let title = titles[event.target.id];
            console.log('title object: ', title)
            title.sorting = true;
            titles[event.target.id].active = true;
            field = toggleDirection(title);
            let sortingCount = 0
            let commas = 0;
            for (let j = 0; j < titles.length; j++) {
               if (titles[j].sorting) {
                   sortingCount++;
               }                
            }
            console.log('sorting count: ', sortingCount)
            for (let i = 0; i < titles.length; i++) {
                if (titles[i].sorting) {
                    sort += titles[i].id + ',' + titles[i].direction;
                    if (commas < sortingCount - 1) {
                        commas++;
                        sort += ',';
                    }
                }

            }
            sortArry[title.sequence] = sort;
            setObjectsDisplayed(false)
            setSortBy(sort)
        } catch (e) {
            window.alert('There was an error sorting your data.')
        }
    }

    function openModal(props) {
        console.log('openmodal found: ', props)
        switch (pageTitle) {
            case 'Your Accounts':
                console.log('account found')
                setCurrentObject(props);
                setShow(true)
                break;
            case 'Your Loans':
                console.log('loan found')
                setCurrentObject(props);
                setShow(true)
                break;
            case 'The Loans of BeardTrust':
                console.log('loan type found')
                setCurrentObject(props);
                setShow(true)
                break;
            case 'Your Cards':
                console.log('card found')
                setCurrentObject(props);
                setShow(true)
                break;
        }
    }

    function toggleDirection(field) {
        if (field.direction === 'asc') {
            field.direction = 'desc';
        } else {
            field.direction = 'asc';
        }

        return field;
    }

    function titleBuilder() {
        const outTitles = []
        const title = [] 
        for (let i = 0; i < titles.length; i++) {
            if (titles[i].maxWidth < width) {
                title.push(
                    <th style={Style} className={'align-middle text-center'} data-sortable={'true'}
                                    scope={'col'} onClick={addToSort} name={title.id}
                                    id={titles[i].sequence}>{titles[i].title}<br></br>{titles[i].active === true && (titles[i].direction === 'asc' ? <FcAlphabeticalSortingAz /> : <FcAlphabeticalSortingZa />)}</th>
                )
            }
        }title.push(<th style={Style} className={'align-middle text-center'}>Details</th>)
        outTitles.push(<tr>{title}</tr>)
        return outTitles
    }

    function typeSelector() {
        const rows = []
        const row = []
        try {
            switch (pageTitle) {
                case 'Your Accounts':
                    for (let i = 0; i < availableObjects.content.length; i++) {
                            row.push(
                                <tr>
                                    {titles[0].maxWidth < width && <td className={'align-middle text-center'} >{availableObjects.content[i].type.name}</td>}
                                    {titles[1].maxWidth < width && <td className={'align-middle text-center'} >{availableObjects.content[i].nickname}</td>}
                                    {titles[2].maxWidth < width && <td className={'align-middle text-center'} >{availableObjects.content[i].interest}%</td>}
                                    {titles[3].maxWidth < width && <td className={'align-middle text-center'} >{CurrencyValue.from(availableObjects.content[i].balance).toString()}</td>}
                                    {titles[4].maxWidth < width && <td className={'align-middle text-center'} >{availableObjects.content[i].type.description}</td>}
                                    {titles[5].maxWidth < width && <td className={'align-middle text-center'} >{availableObjects.content[i].createDate.slice(8, 10) + '/' + availableObjects.content[i].createDate.slice(5, 7) + '/' + availableObjects.content[i].createDate.slice(0, 4)}</td>}
                                    <td className={'align-middle text-center'}>
                                        <button className={'btn btn-primary btn mx-3'}
                                            onClick={() => openModal(availableObjects.content[i])}
                                            id={'reviewBtn'}><GiMoneyStack />
                                            Review
                                        </button>
                                    </td>
                                </tr>)
                    }
                    rows.push(<tbody>{row}</tbody>)
                    return rows;
                case 'Your Loans':
                    for (let i = 0; i < availableObjects.content.length; i++) {
                            row.push(
                                <tr>
                                    {titles[0].maxWidth < width && <td className={'align-middle text-center'}>{availableObjects.content[i].loanType.typeName}</td>}
                                    {titles[1].maxWidth < width && <td className={'align-middle'}>{availableObjects.content[i].loanType.description}</td>}
                                    {titles[2].maxWidth < width &&  <td className={'align-middle text-center'}>{availableObjects.content[i].loanType.apr + '%'}</td>}
                                    {titles[3].maxWidth < width && <td className={'align-middle text-center'}>{CurrencyValue.from(availableObjects.content[i].principal).toString()}</td>}
                                    {titles[4].maxWidth < width && <td className={'align-middle text-center'}>{CurrencyValue.from(availableObjects.content[i].balance).toString()}</td>}
                                    {titles[5].maxWidth < width &&  <td className={'align-middle text-center'}>{availableObjects.content[i].payment.nextDueDate.slice(8, 10) + '/' + availableObjects.content[i].payment.nextDueDate.slice(5, 7) + '/' + availableObjects.content[i].payment.nextDueDate.slice(0, 4)}</td>}
                                    {titles[6].maxWidth < width &&  <td className={'align-middle text-center'}>{availableObjects.content[i].payment.hasPaid === true ? 'You\'ve paid!' : 'Yet to Pay.'}</td>}
                                    {titles[7].maxWidth < width && <td className={'align-middle text-center'}>{CurrencyValue.from(availableObjects.content[i].payment.minDue).toString()}</td>}
                                    {titles[8].maxWidth < width &&  <td className={'align-middle text-center'}>{CurrencyValue.from(availableObjects.content[i].payment.lateFee).toString()}</td>}
                                    {titles[9].maxWidth < width &&  <td className={'align-middle text-center'}>{availableObjects.content[i].createDate.slice(8, 10) + '/' + availableObjects.content[i].createDate.slice(5, 7) + '/' + availableObjects.content[i].createDate.slice(0, 4)}</td>}
                                    <td className={'align-middle text-center'}>
                                        <button className={'btn btn-primary btn mx-3'}
                                            onClick={() => openModal(availableObjects.content[i])}
                                            id={'reviewBtn'}><FcMoneyTransfer />
                                            Review
                                        </button>
                                    </td>
                                </tr>)
                    }
                    rows.push(<tbody>{row}</tbody>)
                    return rows;
                case 'Your Cards':
                    for (let i = 0; i < availableObjects.content.length; i++) {
                            row.push(
                                <tr>
                                    {titles[0].maxWidth < width && <td className={'align-middle text-center'}>{availableObjects.content[i].nickname}</td>}
                                    {titles[1].maxWidth < width && <td className={'align-middle'}>{availableObjects.content[i].balance.dollars}</td>}
                                    {titles[2].maxWidth < width && <td className={'align-middle text-center'}>{availableObjects.content[i].interestRate.toFixed(1) + '%'}</td>}
                                    {titles[3].maxWidth < width &&  <td className={'align-middle text-center'}>{availableObjects.content[i].expireDate.slice(5, 7) + '/' + availableObjects.content[i].expireDate.slice(2, 4)}</td>}
                                    {titles[4].maxWidth < width && <td className={'align-middle text-center'}>{availableObjects.content[i].cardType.typeName}</td>}
                                    <td className={'align-middle text-center'}>
                                        <button className={'btn btn-primary btn mx-3'}
                                            onClick={() => openModal(availableObjects.content[i])}
                                            id={'reviewBtn'}><FcSimCardChip /> <br />
                                            View
                                        </button>
                                    </td>
                                </tr>)
                    }
                    rows.push(<tbody>{row}</tbody>)
                    return rows;
                case 'The Loans of BeardTrust':
                    for (let i = 0; i < availableObjects.content.length; i++) {
                        row.push(
                            <tr>
                                <td className={'align-middle text-center'}>{availableObjects.content[i].typeName}</td>
                                {width > 900 && <td className={'align-middle'}>{availableObjects.content[i].description}</td>}
                                <td className={'align-middle text-center'}>{availableObjects.content[i].apr + '%'}</td>
                                <td className={'align-middle text-center'}>
                                    <button className={'btn btn-primary btn mx-3'} onClick={() => openModal(availableObjects.content[i])}
                                        id={availableObjects.content[i].id}><FcCurrencyExchange />Apply
                                    </button>
                                </td>
                            </tr>)
                    }
                    rows.push(<tbody>{row}</tbody>)
                    return rows;
            }
        } catch (e) {
            console.log('error: ', e);
            if (!errorPresent) {
                setErrorPresent(true);
            }
        }

    }

    return (
        <section style={Style} className={'container'}>
            <h1 className={'text-center mt-5'}>{pageTitle}</h1>
            <div className={'input-group mb-3'}>
                <div className={'me-5 col-xs-12 col-lg-2'}>
                    <span className={'align-middle'}>
                        {'Items per Page: '}
                    </span>
                    <select style={Style} data-testid={'pageSizeSelector'} className={'text-center align-middle'} onChange={handlePageSizeChange}
                        value={pageSize}>
                        {pageSizes.map((size) => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>
                {isMobile === false && <>
                    <span className={'text-center col-sm-0 col-md-4 col-lg-6'} />
                    <button className={'btn btn-outline-secondary'} type="submit" id="reset" title="Reset Sort" onClick={resetSearch}><FcRefresh /></button>
                    <input type={'text'} className={'form-control'} placeholder={'Search'} value={searchCriteria}
                        onChange={handleSearchCriteriaChange} title="Search" />
                    <button className={'btn btn-outline-secondary'} type={'button'} onClick={getList}
                        id={'searchBar'}><FcSearch />Search
                    </button></>}
            </div>
            {isMobile === true &&
                <div className='input-group'>
                    <span className={'text-center col-sm-0 col-md-4 col-lg-6'} />
                    <button className={'btn btn-outline-secondary'} type="submit" id="reset" title="Reset Sort" onClick={resetSearch}><FcRefresh /></button>
                    <input type={'text'} className={'form-control'} placeholder={'Search'} value={searchCriteria}
                        onChange={handleSearchCriteriaChange} title="Search" />
                    <button className={'btn btn-outline-secondary'} type={'button'} onClick={getList}
                        id={'searchBar'}><FcSearch />Search
                    </button>
                </div>}
            <div className={'mt-5'}>
                <Table striped bordered hover className={'me-3 table-responsive'} data-sortable={'true'}
                    data-toggle={'table'} id={'table'}>
                    <thead>
                        {
                            titleBuilder()
                        }
                    </thead>
                    {
                        typeSelector()
                    }

                    {show === true && pageTitle === 'Your Loans' &&
                        <>
                            <Modal show={show} onHide={handleClose} contentClassName="modal-style">
                                <Modal.Header closeButton>
                                    <Modal.Title>
                                        Your {currentObject.loanType.typeName} Loan:
                                    </Modal.Title>
                                </Modal.Header>
                                <LoanModal loan={currentObject} />
                            </Modal>
                        </>}
                    {show === true && pageTitle === 'Your Cards' &&
                        <>
                            <Modal style={Style} show={show} onHide={handleClose} contentClassName="modal-style">
                                <Modal.Header closeButton>
                                    <Modal.Title>
                                        Your {currentObject.typeName} Card:
                                    </Modal.Title>
                                </Modal.Header>
                                <CardStatus card={currentObject} />
                            </Modal>
                        </>}
                    {show === true && pageTitle === 'Your Accounts' &&
                        <>
                            <Modal show={true} onHide={handleClose}>
                                <Modal.Header closeButton>
                                    <Modal.Title>
                                        Your {currentObject.type.name} Account:
                                    </Modal.Title>
                                </Modal.Header>
                                <AccountModal account={currentObject} /></Modal>
                        </>}
                    {show === true && pageTitle === 'The Loans of BeardTrust' &&
                        <>
                            <Modal show={show} onHide={handleClose}>
                                <Modal.Header closeButton>
                                    <Modal.Title>
                                        Loan Information:
                                    </Modal.Title>
                                </Modal.Header>
                                <LoanOfferModal history={props.history} applyLoan={currentObject} /></Modal>
                        </>}
                </Table>
                {errorPresent === true &&
                    <div className={'alert-danger mt-5'}>
                        <p>There was an error getting your data. There may be any number of reasons for this and it is likely not your fault. Please contact customer support for more information.</p>
                    </div>
                }
                <Pagination className={'my-3'} count={numberOfPages} page={currentPage} siblingCount={1}
                    boundaryCount={1} onChange={handlePageChange} />
            </div>
            <script>$('#table').DataTable()</script>
        </section>
    )
}
export default DefaultTable