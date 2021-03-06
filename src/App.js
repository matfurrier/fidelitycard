import React, {
    Suspense,
    useEffect,
    useState
} from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
    AuthCheck,
    useAuth,
    useDatabase,
} from 'reactfire';
import Login from './pages/Login/Login.component';
import CardManagement from './pages/CardManagement';
import Generate from './pages/Generation';
import {
    Redirect,
    BrowserRouter,
    Switch,
    Route,
    Link,
} from 'react-router-dom';
import {
    Container,
    Navbar,
    Nav,
    Spinner,
    Alert
} from 'react-bootstrap';
import {t, addLocale, useLocale} from 'ttag';
import NewCard from './pages/NewCard';
import ManageDb from './pages/ManageDb';
import SmsConfiguration from './pages/SmsConfiguration';

import translation from './i18n/it.json';
import {appConfig} from './config/config';

addLocale('it', translation);
useLocale('it');

export const AppConfiguration = React.createContext({});


function MainNavbar () {
    const auth = useAuth();
    const db = useDatabase();
    const [isConnected, setIsConnected] = useState(true);

    useEffect(() => {
        let ref = db.ref(".info/connected");
        ref.on("value", function(snap) {
            if (snap.val() === true) {
                setIsConnected(true);
            } else {
                setIsConnected(false);
            }
        })
    })


    return <>
        {!isConnected ? <Alert variant="danger">
            {t`You are disconnected`}
        </Alert> : null}
        <Navbar bg="light" expand="lg">
            <Navbar.Brand>{appConfig.appName || t`Fidelity Cards`} (v3.0)</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav"/>
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                    <Nav.Link as={Link} to={{pathname: '/app'}}>{t`Home`}</Nav.Link>
                    <Nav.Link as={Link} to={{pathname: '/new-card'}}>{t`New Card`}</Nav.Link>
                    <Nav.Link as={Link} to={{pathname: '/manage-db'}}>{t`All Cards`}</Nav.Link>
                    <Nav.Link as={Link} to={{pathname: '/generate'}}>{t`Generate Barcodes`}</Nav.Link>
                    <Nav.Link as={Link} to={{pathname: '/sms-config'}}>{t`Manage SMS`}</Nav.Link>
                    <Nav.Link onClick={() => auth.signOut()}>{t`Logout`}</Nav.Link>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
        </>;
}

function App ()??{
    const db = useDatabase();
    const [config, setConfig] = useState({smsText: 'Loading...'});

    useEffect(() => {
        db.ref(`/config`)
        .once('value')
        .then((snapshot) => {
            setConfig(snapshot.val());
        });
    }, []);

    return <AppConfiguration.Provider value={{config, setConfig}}>
        <BrowserRouter basename='/cards/'>
            <MainNavbar/>
            <Switch>
                <Route path="/login">
                    <Login></Login>
                </Route>
                <Route path="/app">
                    <CardManagement/>
                </Route>
                <Route path="/new-card">
                    <NewCard/>
                </Route>
                <Route path="/manage-db">
                    <ManageDb/>
                </Route>
                <Route path="/generate">
                    <Generate/>
                </Route>
                <Route path="/sms-config">
                    <SmsConfiguration/>
                </Route>
                <Route exact path="/">
                    <Redirect to="/app" />
                </Route>
            </Switch>
        </BrowserRouter>
    </AppConfiguration.Provider>
}

function AppOrLogin () {

    return (
        <Suspense fallback={<Container className="pageContainer loaderContainer"><Spinner  variant="primary" animation="border"/></Container>}>
            <AuthCheck fallback={<Login/>}>
                <App></App>
            </AuthCheck>
        </Suspense>
    );
}

export default AppOrLogin;
