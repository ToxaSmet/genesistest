import React from 'react';

class CartProduct extends React.Component {
    render() {
        return <div className="card">
            <img data-src={this.props.img} alt="100%x280"
                 style={{height: '280px', width: '100%', display: 'block'}}
                 src={this.props.img} data-holder-rendered=" true"/>
            <p className="text-center card-text">{this.props.title}</p>
            <p className="text-center card-text">
                {this.props.cost}$ x{this.props.count} = {this.props.cost * this.props.count}$
            </p>
            <input className="form-control" type='number' min="1" onChange={this.props.changeCount}
                   value={this.props.count}/>
            <button className="btn btn-primary" onClick={this.props.removeProduct}>Remove</button>
        </div>
    }
}

export default CartProduct;