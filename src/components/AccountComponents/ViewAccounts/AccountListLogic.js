import axios from "axios"
import { useState, useEffect } from "react"
import AuthContext from "../../../store/auth-context"
import { useContext } from "react"
import AccountList from "../AccountListDisplay"

function ViewAccount() {
    const authContext = useContext(AuthContext);

    var [actAry, setAccount] = useState({})
    const userId = authContext.userId;

    const url = `${process.env.REACT_APP_BASE_URL}${process.env.REACT_APP_ACCOUNT_SERVICE}`

        useEffect(() =>
            axios.get(
            url,
            {
                method: 'GET',
                params: { id: userId },
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then((res) => {
                if (res.statusText === "OK") {
                    console.log('LIST VIEW SUCCESSFUL');
                    const actAry = Array.prototype.slice.call(res.data)
                    console.log(actAry)

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
            }), [userId])

        return (
            <section className="container">
                <div className="mt-5">
                    <AccountList accounts={actAry}/>
                </div>
            </section>
        )
}
export default ViewAccount
