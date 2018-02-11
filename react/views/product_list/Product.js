import React from 'react';

class Product extends React.Component {
    addToCartHandler() {
        let hash = this.props.data.hash;
        fetch(`/api/v1/cart/`, {
            credentials: "same-origin",
            method: 'put',
            body: JSON.stringify({hash: hash})
        }).then(response => {
            if (response.status >= 200 && response.status < 300) {
                return Promise.resolve(response)
            } else {
                return Promise.reject(new Error(response.statusText))
            }
        }).then(response => {
            return response.json()
        }).then(data => {
            if (data.status === 'ok') {
                this.setState({preloader: false, products: data.data});
                this.props.changeAlert('success', 'block', data.msg);
            } else if (data.status === 'err') {
                this.props.changeAlert('danger', 'block', data.msg);
            }
        }).catch(function (error) {
            console.log('Request failed', error);
        });
    }

    render() {
        return <div className="card">
            <img data-src={this.props.data.img} alt="100%x280"
                 style={{height: '280px', width: '100%', display: 'block'}}
                 src={this.props.data.img} data-holder-rendered=" true"/>
            <p className="card-text text-center">{this.props.data.title}</p>
            <p className="card-text text-center">{this.props.data.cost}$</p>
            <button className="btn btn-primary" onClick={this.addToCartHandler.bind(this)}>add to cart</button>
        </div>;
    }
}

export default Product;