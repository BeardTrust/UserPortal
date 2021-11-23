import { useContext, useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Nav, Navbar, NavDropdown, Container, Offcanvas, Dropdown } from "react-bootstrap";
import AuthContext from '../../../store/auth-context';
import "../PageLayout/Layout.css"
import useWindowDimensions from '../useWindowSize';

/**
 * This function returns the html element for the main navigation bar/header
 * for the application.
 *
 * @param props
 * @returns {JSX.Element} the html element containing the navbar/header
 * @constructor
 */
function MainNavigation(props) {
    const authContext = useContext(AuthContext);
    const [show, setShow] = useState(false)
    const { width } = useWindowDimensions();
    const [currentWidth, setWidth]  = useState(window.innerWidth)
    const [isMobile, setIsMobile] = useState(false)

    const checkMobile = useCallback(() =>  {
        setWidth(window.innerWidth)
        if (window.innerWidth < 1050) {
            setIsMobile(true);
        }
        else {
            setIsMobile(false);
        }
    }, [])

    useEffect(() => {
        checkMobile()
    }, [width, currentWidth, checkMobile])

    const logout = () => {
        setShow(false);
        localStorage.removeItem('token');
        localStorage.removeItem('userId');

        authContext.logout();
    }

    return (
        <section>
            {isMobile && 
            <Navbar bg="light" expand={false}>
                <Container fluid>
                    <Navbar.Brand href="#">BeardTrust</Navbar.Brand>
                    <Navbar.Toggle onClick={() => setShow(true)} aria-controls="offcanvasNavbar" />
                    <Offcanvas
                        id="offcanvasNavbar"
                        aria-labelledby="offcanvasNavbarLabel"
                        placement="end"
                        show={show}
                    >
                        <Offcanvas.Header closeButton onClick={() => setShow(false)}>
                            <Offcanvas.Title id="offcanvasNavbarLabel">Navigation</Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <Nav className="justify-content-end flex-grow-1 pe-3">
                                <a className="nav-link" href="/">Home</a>
                                {!authContext.userIsLoggedIn && <Link onClick={() => setShow(false)} className={'nav-link'} to={'/users'}>Register</Link>}
                                {authContext.userIsLoggedIn && <Link onClick={() => setShow(false)} className={'nav-link'} to={'/me'}>Profile</Link>}
                                {authContext.userIsLoggedIn &&
                                    <NavDropdown title="Accounts">
                                        <Link onClick={() => setShow(false)} className={'nav-link dropdown-item'} to="/accounts">Apply for Account</Link>
                                        <Link onClick={() => setShow(false)} className={'nav-link dropdown-item'} to="/accounts/me">My Accounts</Link>
                                    </NavDropdown>}
                                {authContext.userIsLoggedIn &&
                                    <NavDropdown title="Cards">
                                        <Link onClick={() => setShow(false)} className={'nav-link dropdown-item'} to="/cardoffers">Apply for Card</Link>
                                        <Link onClick={() => setShow(false)} className={'nav-link dropdown-item'} to="/cards">My Cards</Link>
                                    </NavDropdown>}
                                {authContext.userIsLoggedIn &&
                                    <NavDropdown title="Loans">
                                        <Link onClick={() => setShow(false)} className={'nav-link dropdown-item'} to="/loanoffers">Apply for Loan</Link>
                                        <Link onClick={() => setShow(false)} className={'nav-link dropdown-item'} to="/myloans">My Loans</Link>
                                    </NavDropdown>}
                                {!authContext.userIsLoggedIn && <Link onClick={() => setShow(false)} className={'nav-link'} to={'/auth'}>Log In</Link>}
                                {authContext.userIsLoggedIn && <Link  className={'nav-link'} onClick={logout} to={'/'}>Logout</Link>}
                            </Nav>
                        </Offcanvas.Body>
                    </Offcanvas>
                </Container>
            </Navbar>
}
{!isMobile &&
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <a className="navbar-brand" href="/">BeardTrust</a>
                <div className="navbar" id="navbar">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item active">
                            <a className="nav-link" href="/">Home</a>
                        </li>
                        <li className="nav-item">
                            {!authContext.userIsLoggedIn && <Link className={'nav-link'} to={'/users'}>Register</Link>}
                            {authContext.userIsLoggedIn && <Link className={'nav-link'} to={'/'}>Profile</Link>}
                        </li>
                        <li className="nav-item">
                            {authContext.userIsLoggedIn && <Link className={'nav-link'} to={'/me'}>My Details</Link>}
                        </li>
                        {authContext.userIsLoggedIn &&
                            <Dropdown>
                                <Dropdown.Toggle variant="link" className={'undecorated'} id="accounts-dropdown">
                                    Accounts
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Link className={'nav-link dropdown-item'} to="/accounts">Apply for Account</Link>
                                    <Link className={'nav-link dropdown-item'} to="/accounts/me">My Accounts</Link>
                                </Dropdown.Menu>
                            </Dropdown>}
                        {authContext.userIsLoggedIn &&
                            <Dropdown>
                                <Dropdown.Toggle variant="link" className={'undecorated'} id="cards-dropdown">
                                    Cards
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Link className={'nav-link dropdown-item'} to="/cardoffers">Apply for Card</Link>
                                    <Link className={'nav-link dropdown-item'} to="/cards">My Cards</Link>
                                </Dropdown.Menu>
                            </Dropdown>}
                        {authContext.userIsLoggedIn &&
                            <Dropdown>
                                <Dropdown.Toggle variant="link" className={'undecorated'} id="loans-dropdown">
                                    Loans
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Link className={'nav-link dropdown-item'} to="/loanoffers">Apply for Loan</Link>
                                    <Link className={'nav-link dropdown-item'} to="/myloans">My Loans</Link>
                                </Dropdown.Menu>
                            </Dropdown>}
                        <li className="nav-item">
                            {!authContext.userIsLoggedIn && <Link className={'nav-link'} to={'/auth'}>Log In</Link>}
                            {authContext.userIsLoggedIn && <Link className={'nav-link'} onClick={logout} to={'/'}>Logout</Link>}
                        </li>
                    </ul>
                </div>
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"
                    integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM"
                    crossOrigin="anonymous" />
            </div>
        </nav>
}
        </section>
    )
}

export default MainNavigation;
