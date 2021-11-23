import DefaultTable from '../../LayoutComponents/DefaultTable';

function LoansOnOffer() {
    const url = `${process.env.REACT_APP_BASE_URL}${process.env.REACT_APP_LOAN_SERVICE_TYPES}`;
    const headers = ['Type', 'Description', 'APR']
    const maxWidths = [0, 900, 0]
    const headerId = ['typeName', 'description',  'apr']
    const titles = []
    console.log('loans on offer reached')

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
            <DefaultTable headers={titles} title='The Loans of BeardTrust' url={url} errorTitle='LOANSERVICE'/>
        </>
    );
}

export default LoansOnOffer;