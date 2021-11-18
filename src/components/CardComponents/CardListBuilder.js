import DefaultTable from "../LayoutComponents/DefaultTable";
import { useContext } from "react";
import AuthContext from "../../store/auth-context";

function ViewCardStatus() {
    const authContext = useContext(AuthContext);
    const userId = authContext.userId;
    const token = authContext.token;
    const url = 'http://localhost:9001/cards/' + userId + "/all";
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