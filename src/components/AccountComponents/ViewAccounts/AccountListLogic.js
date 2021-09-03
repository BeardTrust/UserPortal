import axios from "axios"
import { useState, useEffect } from "react"
import AuthContext from "../../../store/auth-context"
import { useContext } from "react"
import AccountList from "../AccountListDisplay"

function ViewAccount() {

    const authContext = useContext(AuthContext);

    var [actAry, setAccount] = useState({})
    const token = authContext.token;
    const userId = authContext.userId;

    const url = "http://localhost:9001/accounts" 

        useEffect(() =>
            axios.get(
            url,
            {
                method: 'GET',
                params: { id: userId },
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            })
            .then((res) => {
                if (res.statusText === "OK") {
                    console.log('LIST VIEW SUCCESSFUL');
                    const actAry = Array.prototype.slice.call(res.data)
                    setAccount(Array.prototype.slice.call(actAry))
                } else {
                    console.log('response: ', res)
                }
            }, [])
            .catch((e) => {
                if (e.response === 403) {
                    console.log('VIEW FAILURE: Code 403 (Forbidden). Your login may be expired or your URL may be incorrect.')
                }
                console.log('Error message: ', e.message + ', code: ' + e.response);
            }), [token, userId])

        return (
            <section>
                <ul>
                    <h3 style={{ display: "flex" }}>Your Accounts:</h3> 
                    <AccountList accounts={actAry}/>
                </ul>
            </section>
        )
}
export default ViewAccount