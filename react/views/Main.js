import React from 'react';
import {Switch, Route} from 'react-router-dom'
import List from './product_list/List'
import Cart from './cart/Cart'
import Payment from './payment/Payment'
import NotFound from './NotFound'
import Header from './Header'

const Main = () => (
    <main>
        <Header/>
        <Switch>
            <Route exact path='/' component={List}/>
            <Route path='/cart' component={Cart}/>
            <Route path='/payment/:hash' component={Payment}/>
            <Route path='*' component={NotFound}/>
        </Switch>
    </main>
);

export default Main;