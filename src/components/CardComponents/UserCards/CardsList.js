import { Table, Button } from "react-bootstrap"
import { Link } from "react-router-dom"

/**
 * This function returns a table for displaying a list of cards associated with
 * the currently logged in user.
 *
 * @author Matthew Crowell <Matthew.Crowell@Smoothstack.com>
 *
 * @param props
 * @returns {JSX.Element|null} the table containing the card data
 * @constructor
 */
function CardsList(props){
    const cards = props.cards ?? [];
    if (cards.length ===0){
        return null;
    } else {
        return (
            <>
                <Table striped bordered hover style={{marginRight: 5 + 'px'}}>
                    <thead>
                    <tr>
                        <th className={'align-middle text-center'}>Nickname</th>
                        <th className={'align-middle text-center'}>Balance</th>
                        <th className={'align-middle text-center'}>Interest Rate</th>
                        <th className={'align-middle text-center'}>Expires</th>
                        <th className={'align-middle text-center'}>Type</th>
                        <th className={'align-middle text-center'}>Details</th>
                    </tr>
                    </thead>
                    <tbody>
                    {(cards ?? []).map((card, index) => (
                        <tr key={index}>
                            <td className={'align-middle text-center'}>{card.nickname}</td>
                            <td className={'align-middle text-center'}>${card.balance.dollars + '.' + (card.balance.cents > 10 ? card.balance.cents : '0' + card.balance.cents)}</td>
                            <td className={'align-middle text-center'}>{card.interestRate.toFixed(1)}%</td>
                            <td className={'align-middle text-center'}>{card.expireDate.slice(5, 7) + '/' + card.expireDate.slice(2, 4)}</td>
                            <td className={'align-middle text-center'}>{card.cardType.typeName}</td>
                            <td className={'align-middle text-center'}>
                                <Link to={'/cards/' + card.id}>
                                    <Button
                                        className={'btn-sm'}
                                        variant={'success'}
                                        type={'submit'}
                                        id={'Review'}
                                    >View</Button>
                                </Link>
                            </td>

                        </tr>
                    ))}
                    </tbody>
                </Table>
            </>
        )
    }
}
export default CardsList;
