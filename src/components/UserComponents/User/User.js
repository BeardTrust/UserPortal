import {  Table } from "react-bootstrap"

/**
 * This component returns an html element that displays a user's details
 * as a table.
 *
 * @param user the user object containing the user details
 * @returns {JSX.Element} the html element for the table and details
 * @constructor
 */
const User = ({ user }) => {
    console.log('User is receiving: ', user)

    return (
        <Table striped bordered hover>
            <thead>
                <tr>
                    <th>Username</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Phone Number</th>
                    <th>Date of Birth</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{user.username}</td>
                    <td>{user.firstName}</td>
                    <td>{user.lastName}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>{user.dateOfBirth}</td>
                </tr>
            </tbody>
        </Table>
    )
}
export default User