import React from 'react';
import CartProduct from './CartProduct'


class Cart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            products: [], payment_system: '', sum: 0, preloader: true,
            alert: {display: 'none', type: 'success', text: ''}
        };
    }

    componentDidMount() {
        fetch('/api/v1/cart/', {credentials: "same-origin"})
            .then(response => {
                if (response.status >= 200 && response.status < 300) {
                    return Promise.resolve(response)
                } else {
                    return Promise.reject(new Error(response.statusText))
                }
            })
            .then(response => {
                return response.json()
            })
            .then(data => {
                if (data.status === 'ok') {
                    this.setState({
                        preloader: false, products: data.data.products,
                        payment_system: data.data.payment_system, sum: data.data.sum
                    });
                } else if (data.status === 'err') {
                    this.changeAlertHandler('danger', 'block', data.err);
                }
            })
            .catch(function (error) {
                console.log('Request failed', error);
            });
    }

    changeProductCount(e, id) {
        let products = this.state.products;
        let product = products[id];
        let value = e.target.value;

        let sum = 0;
        for (let i = 0; i < products.length; i++) {
            if (id === i) {
                sum += parseInt(products[i]['cost']) * value;
            } else {
                sum += parseInt(products[i]['cost']) * products[i].count;
            }
        }

        fetch(`/api/v1/cart/`, {
            credentials: "same-origin",
            method: 'put',
            body: JSON.stringify({hash: product.hash, count: value})
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
                Object.assign(product, {count: value});
                this.setState({products: products, sum: sum});
                this.changeAlertHandler('success', 'block', data.msg);
            } else if (data.status === 'err') {
                this.changeAlertHandler('danger', 'block', data.msg);
            }
        }).catch(function (error) {
            console.log('Request failed', error);
        });
    }

    removeProduct(id) {
        let products = this.state.products;
        let product = products[id];

        let sum = 0;
        let newProducts = [];
        for (let i = 0; i < products.length; i++) {
            if (products[i] !== products[id]) {
                sum += parseInt(products[i]['cost']) * products[i].count;
                newProducts.push(products[i]);
            }

        }

        fetch(`/api/v1/cart/`, {
            credentials: "same-origin",
            method: 'delete',
            body: JSON.stringify({hash: product.hash})
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
                this.setState({products: newProducts, sum: sum});
            } else if (data.status === 'err') {
                this.changeAlertHandler('danger', 'block', data.err);
            }
        }).catch(function (error) {
            console.log('Request failed', error);
        });
    }

    confirmHandler() {
        fetch(`/api/v1/cart/`, {
            credentials: "same-origin",
            method: 'post',
            body: JSON.stringify({paymentSystem: this.state.payment_system})
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
                window.location.replace(`/payment/${data.data}`);
            } else if (data.status === 'err') {
                this.changeAlertHandler('danger', 'block', data.err);
            }
        }).catch(function (error) {
            console.log('Request failed', error);
        });
    }

    radioChangeHandler(e) {
        this.setState({
            payment_system: e.target.value
        })
    }

    changeAlertHandler(type, display, text) {
        this.setState({alert: {display: display, type: type, text: text}});
        setTimeout(this.dismissAlert.bind(this), 5000);
    }

    dismissAlert() {
        this.setState({alert: {display: 'none'}})
    }

    displayAlert() {
        return <div style={{display: this.state.alert.display}}
                    className={`alert alert-center alert-${this.state.alert.type}`}
                    role="alert">{this.state.alert.text}</div>
    }

    render() {
        if (this.state.preloader) {
            return <div className="loader"></div>
        }
        if (this.state.products.length < 1) {
            return <div className="album text-muted">
                <div className="container">
                    <div className="row justify-content-center align-items-center"><h1>Cart is empty</h1></div>
                </div>
            </div>
        }

        let products = this.state.products.map((product, id) => {
            return (
                <CartProduct key={id} changeCount={(e) => this.changeProductCount(e, id)}
                             removeProduct={() => this.removeProduct(id)} {...product}/>
            )
        });

        let paymentRadio = <div>
            <label className="custom-control custom-radio">
                <input id="liqpay" name="payment" type="radio" value="liqpay" className="custom-control-input"
                       checked={this.state.payment_system === 'liqpay'}
                       onChange={this.radioChangeHandler.bind(this)}/>
                <span className="custom-control-indicator"></span>
                <span className="custom-control-description">LiqPay</span>
            </label>
            <label className="custom-control custom-radio">
                <input id="privat" name="payment" type="radio" value="privat" className="custom-control-input"
                       checked={this.state.payment_system === 'privat'}
                       onChange={this.radioChangeHandler.bind(this)}/>
                <span className="custom-control-indicator"></span>
                <span className="custom-control-description">Privat24</span>
            </label>
            <label className="custom-control custom-radio">
                <input id="paypal" name="payment" type="radio" value="paypal" className="custom-control-input"
                       checked={this.state.payment_system === 'paypal'}
                       onChange={this.radioChangeHandler.bind(this)}/>
                <span className="custom-control-indicator"></span>
                <span className="custom-control-description">PayPal</span>
            </label>
        </div>;

        return <div>
            {this.displayAlert()}
            <div className="album text-muted">
                <div className="container">
                    <div className="row justify-content-center align-items-center">{products}</div>
                </div>
                <div className="container">
                    <div className="row justify-content-center align-items-center"><h1>Total: {this.state.sum}$</h1></div>
                </div>
                <div className="container">
                    <div className="row justify-content-center align-items-center">{paymentRadio}</div>
                </div>
                <div className="container">
                    <div className="row justify-content-center align-items-center">
                        <button className="btn btn-primary" onClick={this.confirmHandler.bind(this)}>Confirm</button>
                    </div>
                </div>
            </div>
        </div>
    }
}

export default Cart;