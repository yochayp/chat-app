import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Chat from './components/Chat';
import Authentication from './components/Authentication';


export default class App extends Component {
    render() {
        return (
            <BrowserRouter>
            
                <main>
                    <Switch>
                        <Route path="/" exact component={Authentication} />
                        <Route path="/chat" component={Chat} />
                    </Switch>
                </main>
            </BrowserRouter>
        );
    }
}
