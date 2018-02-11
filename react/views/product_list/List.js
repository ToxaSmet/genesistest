import React from 'react';
import Product from './Product'
import {Link} from 'react-router-dom'

class List extends React.Component {
    constructor(props) {
        super(props);
        this.state = {products: [], paginator: {}, preloader: true,
            alert: {display: 'none', type: 'success', text: ''}};
    }

    getProducts(page = '?page=1') {
        fetch(`/api/v1/products/${page}`, {credentials: "same-origin"})
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
                    this.setState({preloader: false, products: data.data, paginator: data.paginator});
                } else if (data.status === 'err') {
                    this.setState({alert: {type: 'danger', display: 'block', text: data.msg}})
                }
            })
            .catch(function (error) {
                console.log('Request failed', error);
            });
    }

    componentDidMount() {
        this.getProducts(this.props.location.search);
    }

    componentWillReceiveProps(nextProps) {
        if (JSON.stringify(this.props.location.search) !== JSON.stringify(nextProps.location.search)) {
            this.setState({products: [], paginator: {}, preloader: true});
            this.getProducts(nextProps.location.search);
        }
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
                <Product changeAlert={this.changeAlertHandler.bind(this)} key={id} data={product}/>
            )
        });

        let pagesCount = this.state.paginator.count / 10;
        let paginator = [];
        for (let i = 0; i < pagesCount; i++) {
            let active = this.state.paginator.page === i + 1 ? ' active' : '';
            paginator.push(<li key={i + 1} className={`page-item${active}`}>
                <Link className="page-link" to={`/?page=${i + 1}`}>{i + 1}</Link>
            </li>);
        }

        return <div>
            {this.displayAlert()}
            <div className="album text-muted">
                <div className="container">
                    <div className="row justify-content-center align-items-center">{products}</div>
                </div>
                <div className="container">
                    <div className="row justify-content-center align-items-center">
                        <ul className="pagination pagination-lg">{paginator}</ul>
                    </div>
                </div>
            </div>
        </div>
    }
}

export default List;