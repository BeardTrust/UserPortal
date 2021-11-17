import DefaultTable from '../../LayoutComponents/DefaultTable';

function ViewLoanStatus() {
    const url = 'http://localhost:9001/loans/me';
    const headers = ['Loan Type', 'Description', 'APR', 'Principal', 'Balance', 'Next Payment Due\n(DD/MM/YYYY)', 'Paid Status', 'Minimum Due', 'Late Fee', 'Date Created\n(DD/MM/YYYY)']
    const maxWidths = [0, 1050, 750, 350, 0, 900, 1000, 850, 800, 950]
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