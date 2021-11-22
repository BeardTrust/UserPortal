import { Table, Modal } from "react-bootstrap";
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
    const [errorCode, setErrorCode] = useState();
    const errorTitle = props.errorTitle;
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
    const sortArry = [props.headers.size]
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const { width } = useWindowDimensions();
    const [isMobile, setIsMobile] = useState(false)
    const titles = props.headers
    console.log('available objects start as: ', availableObjects)


    /**
    * This function determines resolution of the current window for the purposes of resizing tables
    * 
    * @author Nathanael Grier <nathanael.grier@smoothstack.com>
    */
    const checkMobile = useCallback(() =>{
        if (width < 1050) {
            console.log('is mobile')
            setIsMobile(true);
        }
        else {
            setIsMobile(false);
        }
    }, [width])

    function handlePageChange(event, value) {
        event.preventDefault();
        setObjectsDisplayed(false);
        if (searchCriteriaChanged) {
            setCurrentPage(1);
        } else {
            setCurrentPage(value);
        }

    }

    /**
    * This function resets all sort and search fields before sending a fresh request 
    * 
    * @author Nathanael Grier <nathanael.grier@smoothstack.com>
    */
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

    /**
    * This function is the primary data retrieval callback method. 
    * It uses state variables passed from the calling methods. 
    * It stores all necessary data in state and sets any error messages required.
    * 
    * @author Nathanael Grier <nathanael.grier@smoothstack.com>
    */
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
                if (e.response) {
                    console.log('error with response: ', e.response)
                    try {
                        setErrorCode(e.response.status)
                        setErrorPresent(true)
                    } catch (e) { console.log('exception: ', e) }
                    window.setTimeout(() => {
                        window.location.reload();
                    }, 5000)
                } else {
                    console.log('error: ', e)
                    setErrorCode('NETWORK')
                    setErrorPresent(true)
                }
            })
        console.log("default outbound url: ", url);
        console.log('available objects: ', availableObjects);
    },
        [availableObjects, searchCriteriaChanged, token, pageSize, currentPage, searchCriteria, sortBy, errorPresent, url, userId],
    )

    useEffect(() => {
        checkMobile();
        if (!objectsDisplayed) {
            getList();
        }
    }, [getList, availableObjects, objectsDisplayed, titles, url, pageSize, currentPage, checkMobile]);

    /**
    * This function adds sorting fields to the outbound parameters for the respective service to parse.
    * It accepts an event from the column header that triggers it, which contains the field to sort by.
    * There is no return value, as everything is being stored in the state.
    * 
    * @author Nathanael Grier <nathanael.grier@smoothstack.com>
    */
    function addToSort(event) {
        console.log('add to sort...')
        let sort = '';
        try {
            let title = titles[event.target.id];
            console.log('title object: ', title)
            title.sorting = true;
            titles[event.target.id].active = true;
            toggleDirection(title);
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
            default:
                setErrorPresent(true);
                setErrorCode('MODAL')
                console.log('modal error found: ', props)
        }
    }

    /**
    * This function determines the direction that a sorting field will be ordered by.
    * it accepts the field in question, determines the current direction, and swotches it to the opposite. 
    * The function returns the updated field.
    * 
    * @author Nathanael Grier <nathanael.grier@smoothstack.com>
    * 
    * @returns {props:field}
    */
    function toggleDirection(field) {
        if (field.direction === 'asc') {
            field.direction = 'desc';
        } else {
            field.direction = 'asc';
        }

        return field;
    }

    /**
    * This function determines which type of data it is presenting,
    * builds table headers out of the data,
    * and returns the JSX table headers for display.
    * This function requires no props, as it uses state variables from the containing body.
    * 
    * @author Nathanael Grier <nathanael.grier@smoothstack.com>
    */
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
        } title.push(<th style={Style} className={'align-middle text-center'}>Details</th>)
        outTitles.push(<tr>{title}</tr>)
        return outTitles
    }

    /**
    * This function determines which type of data it is presenting,
    * builds rows out of the data,
    * and returns JSX rows for display.
    * This function requires no props, as it uses state variables from the containing body.
    */
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
                                {titles[2].maxWidth < width && <td className={'align-middle text-center'}>{availableObjects.content[i].loanType.apr + '%'}</td>}
                                {titles[3].maxWidth < width && <td className={'align-middle text-center'}>{CurrencyValue.from(availableObjects.content[i].principal).toString()}</td>}
                                {titles[4].maxWidth < width && <td className={'align-middle text-center'}>{CurrencyValue.from(availableObjects.content[i].balance).toString()}</td>}
                                {titles[5].maxWidth < width && <td className={'align-middle text-center'}>{availableObjects.content[i].payment.nextDueDate.slice(8, 10) + '/' + availableObjects.content[i].payment.nextDueDate.slice(5, 7) + '/' + availableObjects.content[i].payment.nextDueDate.slice(0, 4)}</td>}
                                {titles[6].maxWidth < width && <td className={'align-middle text-center'}>{availableObjects.content[i].payment.hasPaid === true ? 'You\'ve paid!' : 'Yet to Pay.'}</td>}
                                {titles[7].maxWidth < width && <td className={'align-middle text-center'}>{CurrencyValue.from(availableObjects.content[i].payment.minDue).toString()}</td>}
                                {titles[8].maxWidth < width && <td className={'align-middle text-center'}>{CurrencyValue.from(availableObjects.content[i].payment.lateFee).toString()}</td>}
                                {titles[9].maxWidth < width && <td className={'align-middle text-center'}>{availableObjects.content[i].createDate.slice(8, 10) + '/' + availableObjects.content[i].createDate.slice(5, 7) + '/' + availableObjects.content[i].createDate.slice(0, 4)}</td>}
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
                                {titles[3].maxWidth < width && <td className={'align-middle text-center'}>{availableObjects.content[i].expireDate.slice(5, 7) + '/' + availableObjects.content[i].expireDate.slice(2, 4)}</td>}
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
                default:
                    setErrorPresent(true)
                    setErrorCode('ROWS')
            }
        } catch (e) {
            console.log('error: ', e);
            if (!errorPresent && e.response !== undefined) {
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
                {availableObjects.length === 0 && errorPresent === false &&
                    <div className="input-Group">
                        <label className="input-group-text" >Please wait while we retrieve your data...</label>
                    </div>
                }
                {errorPresent === true &&
                    <div className={'alert-danger mt-5'}>
                        <p>There was an error getting your data. There may be any number of reasons for this and it is likely not your fault. Please contact customer support for more information.
                        </p>
                        <p>[{errorCode} ERROR: {errorTitle}]
                        </p>
                        {errorCode === 503 &&
                            <p>A 503 error means service was unavailable. Either our servers are down or your connection was interrupted.</p>
                        }
                        {errorCode === (404 || 405) &&
                            <p>404 and 405 errors indicate routing issues. These are very rare, and mean we are likely working on updates.</p>
                        }
                        {errorCode === 403 &&
                            <p>A 403 error indicates a permissions issue. In all likelihood, you just need to re-login to re-authenticate yourself.</p>
                        }
                        {errorCode === 'NETWORK' &&
                            <p>A NETWORK error indicates the website couldn't get a response from the back-end in any way. Our servers are likely down.</p>
                        }
                        {errorCode === 'MODAL' &&
                            <p>A MODAL error indicates the front-end had issues displaying your data in the pop-up modal.</p>
                        }
                        {errorCode === 'ROWS' &&
                            <p>A ROWS error indicates the front-end couldn't determine what type of data you wanted displayed.</p>
                        }
                        <p>The page will continually refresh in an attempt to resolve the issue. If it persists, please contact BeardTrust customer service.</p>
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