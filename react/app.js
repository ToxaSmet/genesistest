import Main from './views/Main';
import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';

ReactDOM.render((
    <BrowserRouter>
        <Main/>
    </BrowserRouter>
), document.getElementById('reactEntry'));