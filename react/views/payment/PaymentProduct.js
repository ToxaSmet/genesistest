import React from 'react';

class PaymentProduct extends React.Component {
    render() {
        return <div className="card">
            <img data-src={this.props.img} alt="100%x280"
                 style={{height: '280px', width: '100%', display: 'block'}}
                 src={this.props.img} data-holder-rendered=" true"/>
            <p className="text-center card-text">{this.props.title} x{this.props.count}</p>
            <p className="text-center card-text">{this.props.cost * this.props.count}$</p>
        </div>
    }
}

export default PaymentProduct;