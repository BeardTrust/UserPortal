import { useContext } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import AuthContext from './store/auth-context';
import RegistrationForm from "./components/AuthComponents/RegistrationForm/RegistrationForm";
import LoginForm from "./components/AuthComponents/LoginForm/LoginForm";
import ViewUserForm from './components/UserComponents/ViewUserForm/ViewUserForm';
import AccountRegistration from './components/AccountComponents/RegisterAccount/AccountRegistry';
import ViewAccount from './components/AccountComponents/AccountListBuilder';
import AccountDeactivator from './components/AccountComponents/AccountDeactivation/AccountDeactivator'
import Layout from './components/LayoutComponents/PageLayout/Layout';
import CardSignUp from './components/CardComponents/CardSignUp/CardSignUp'
import CardListBuilder from './components/CardComponents/CardListBuilder';
import CardStatus from "./components/CardComponents/CardStatus/CardStatus";
import CardTypes from "./components/CardComponents/CardTypes/CardTypes";
import HomePage from "./components/Pages/HomePage/HomePage";
import LoanRegistration from "./components/Loans Components/LoanSignUp/LoanRegistration"
import LoansOnOffer from "./components/Loans Components/LoanViews/LoansOnOffer"
import ViewLoanStatus from './components/Loans Components/LoanViews/LoanListBuilder';
const url = `${process.env.REACT_APP_BASE_URL}${process.env.REACT_APP_USER_SERVICE}`

function App() {
    const authContext = useContext(AuthContext);
    return (
        <div className="App">
            <Switch>
                <Route path={'/'} exact={true}>
                    <HomePage />
                </Route>
                <Route path={'/users'}>
                    <Layout>
                        {!authContext.userIsLoggedIn && <RegistrationForm url={url}/>}
                    </Layout>
                </Route>
                <Route path={'/me'}>
                    <Layout>
                        {authContext.userIsLoggedIn && <ViewUserForm />}
                    </Layout>
                </Route>
                <Route path={'/accounts/deactivate'}>
                    <Layout>
                        {authContext.userIsLoggedIn && <AccountDeactivator />}
                    </Layout>
                </Route>
                <Route path={'/accounts/me'}>
                    <Layout>
                        {authContext.userIsLoggedIn && <ViewAccount/>}
                    </Layout>
                </Route>
                <Route path={'/accounts'}>
                    <Layout>
                        {authContext.userIsLoggedIn && <AccountRegistration/>}
                    </Layout>
                </Route>
                <Route path={'/loansignup'}>
                    <Layout>
                        {authContext.userIsLoggedIn && <LoanRegistration/>}
                    </Layout>
                </Route>
                <Route path={'/loanoffers'}>
                    <Layout>
                        {authContext.userIsLoggedIn && <LoansOnOffer />}
                    </Layout>
                </Route>
                <Route path={'/myloans'}>
                    <Layout>
                        {authContext.userIsLoggedIn && <ViewLoanStatus />}
                    </Layout>
                </Route>
                <Route path={'/auth'}>
                    <Layout>
                        {!authContext.userIsLoggedIn && <LoginForm />}
                        {authContext.userIsLoggedIn && <Redirect to={'/'} />}
                    </Layout>
                </Route>
                <Route path={'/cardoffers'}>
                    <Layout>
                        <CardTypes />
                    </Layout>
                </Route>

                <Route path={'/cardsignup'}>
                    <Layout>
                        <CardSignUp />
                    </Layout>
                </Route>
                <Route path={'/cards/:cardId'}>
                    <Layout>
                        <CardStatus />
                    </Layout>
                </Route>
                <Route path={'/cards'}>
                    <Layout>
                        <CardListBuilder />
                    </Layout>
                </Route>
            </Switch>
        </div>
    );
}

export default App;
