import DefaultTable from "../LayoutComponents/DefaultTable";
import { useContext } from "react";
import AuthContext from "../../store/auth-context";
/**
 * This function contains all the props necessary to build 
 * a table that properly displays BeardTrust Cards.
 * It sends the props to the Default Table and returns that.
 * 
 * @author Nathanael Grier <nathanael.grier@smoothstack.com>
 * 
 * @returns {JSX.Element}
 */
function ViewCardStatus() {
    const authContext = useContext(AuthContext);
    const userId = authContext.userId;
    const url = `${process.env.REACT_APP_BASE_URL}${process.env.REACT_APP_CARD_SERVICE}/` + userId + "/all";
    const headers = ['Nickname', 'Balance', 'Interest Rate', 'Expires', 'Type']
    const maxWidths = [0, 0, 1050, 900, 400]
    const headerId = ['nickname', '', 'balance', 'interest', 'expireDate', 'cardType_typeName']
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
            <DefaultTable headers={titles} title='Your Cards' url={url} errorTitle='CARDSERVICE' />
        </>
    );
}

export default ViewCardStatus;