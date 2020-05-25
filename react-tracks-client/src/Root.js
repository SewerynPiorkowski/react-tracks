import React, { createContext } from "react";
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import withRoot from "./withRoot";
import { Query } from 'react-apollo'
import { gql } from 'apollo-boost'
import App from './pages/App'
import Profile from './pages/Profile'
import Header from './components/Shared/Header'
import Loading from './components/Shared/Loading'
import Error from './components/Shared/Error'

export const UserContext = createContext()

const Root = () => (
    <Query query={ME_QUERY} fetchPolicy='cache-and-network'>
        {({ data, loading, error }) => {
            if (loading) return <Loading />
            if (error) return <Error error={error} />
            const currentUser = data.me

            return (
                <Router>
                    <UserContext.Provider value={currentUser}>
                        <Header currentUser={currentUser} />
                        <Switch>
                            <Route exact component={App} path='/' />
                            <Route component={Profile} path='/profile/:id' />
                        </Switch>
                    </UserContext.Provider>
                </Router>
            )
        }}
    </Query>
)

export const ME_QUERY = gql`
    query {
        me {
            id
            username
            email
            likeSet {
                track {
                    id
                }
            }
        }
    }
`

// const GET_TRACKS_QUERY = gql`
//     query {
//         tracks {
//             id
//             title
//             description
//             url
//         }
//     }
// `

export default withRoot(Root);
