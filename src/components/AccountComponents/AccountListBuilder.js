import DefaultTable from '../LayoutComponents/DefaultTable';

/**
 * This function contains all the props necessary to build 
 * a table that properly displays BeardTrust Accounts.
 * It sends the props to the Default Table and returns that.
 * 
 * @author Nathanael Grier <nathanael.grier@smoothstack.com>
 * 
 * @returns {JSX.Element}
 */
const AccountList = () => {
const url = `${process.env.REACT_APP_BASE_URL}${process.env.REACT_APP_ACCOUNT_SERVICE}`
const headers = ['Account Type', 'Nickname', 'Interest Rate', 'Balance', 'Description', 'Date Created\n(DD/MM/YYYY)']
const maxWidths = [400, 0, 900, 300, 1050, 1000]
const headerId = ['type_name', 'nickname', 'interest', 'balance_dollars', 'type_description', 'createDate']
const titles = []

for (var i = 0; i < headers.length; i++) {
    var title = {
        title: headers[i],
        direction: 'desc',
        active: false,
        sorting: false,
        id: headerId[i],
        maxWidth: maxWidths[i],
        sequence: i
    }
    titles.push(title);
}

return (
    <>
    <DefaultTable headers={titles} title='Your Accounts' url={url} errorTitle='ACCOUNTSERVICE'/>
    </>
);
}

export default AccountList
