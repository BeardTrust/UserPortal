import DefaultTable from '../../LayoutComponents/DefaultTable';

/**
 * This function contains all the props necessary to build 
 * a table that properly displays BeardTrust Loans.
 * It sends the props to the Default Table and returns that.
 * 
 * @author Nathanael Grier <nathanael.grier@smoothstack.com>
 * 
 * @returns {JSX.Element}
 */
function ViewLoanStatus() {
    const url = `${process.env.REACT_APP_BASE_URL}${process.env.REACT_APP_LOAN_SERVICE}/me`;
    const headers = ['Loan Type', 'Description', 'APR', 'Principal', 'Balance', 'Next Payment Due\n(DD/MM/YYYY)', 'Paid Status', 'Minimum Due', 'Late Fee', 'Date Created\n(DD/MM/YYYY)']
    const maxWidths = [0, 1150, 900, 415, 300, 900, 1150, 850, 800, 1000]
    const headerId = ['loanType_typeName', 'loanType_description', 'loanType_apr', 'principal_dollars', 'balance_dollars', 'payment_nextDueDate', 'payment_hasPaid', 'payment_minDue_dollars', 'payment_lateFee_dollars', 'createDate']
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
            <DefaultTable headers={titles} title='Your Loans' url={url} errorTitle='LOANSERVICE'/>
        </>
    );
}

export default ViewLoanStatus;