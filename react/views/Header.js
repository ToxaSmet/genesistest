import React from 'react';
import {Link} from 'react-router-dom'

const Header = () => (
    <div className="navbar navbar-inverse bg-inverse">
        <div className="container d-flex justify-content-between">
            <Link className="navbar-brand" to="/">Shop</Link>
            <Link className="navbar-toggler" to="/cart">Go to cart</Link>
        </div>
    </div>
);

export default Header;