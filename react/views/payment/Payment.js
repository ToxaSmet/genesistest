import React from 'react';
import PaymentProduct from './PaymentProduct'


class Payment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {products: [], payment_system: '', sum: 0, preloader: true,
        alert: {display: 'none', type: 'success', text: ''}};
    }

    componentDidMount() {
        fetch(`/api/v1/payment/?hash=${this.props.match.params.hash}`, {
            credentials: "same-origin",
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
                this.setState({
                    preloader: false, products: data.data.cart.products,
                    payment_system: data.data.cart.payment_system, sum: data.data.cart.sum
                });
            } else if (data.status === 'err') {
                this.changeAlertHandler('danger', 'block', data.msg);
            }
        }).catch(function (error) {
            console.log('Request failed', error);
        });
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

        let products = this.state.products.map((product, id) => {
            return (
                <PaymentProduct key={id} {...product}/>
            )
        });

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
                    <div className="row justify-content-center align-items-center"><h1>Via {this.state.payment_system}</h1>
                    </div>
                </div>
            </div>
        </div>
    }
}

export default Payment;