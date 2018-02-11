from flask import Flask, render_template, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from utils.helper import random_string
import os

app = Flask(__name__)
app.secret_key = 'fjodisjfOIJGifgisHGdG:'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(os.path.dirname(__file__),
                                                                    'sqlite.db')  # only for Win
# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////absolute/path/to/sqlite.db'  # Unix/Mac
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
db = SQLAlchemy(app)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    hash = db.Column(db.String(16), unique=True, nullable=False)

    def __init__(self):
        self.hash = random_string(16)

    def __repr__(self):
        return '<User %r>' % self.hash

    def as_dict(self):
        return {'hash': self.hash}


class CartProduct(db.Model):
    """
    Cart-Product relation model with extra-field 'count'
    """

    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), primary_key=True)
    cart_id = db.Column(db.Integer, db.ForeignKey('cart.id'), primary_key=True)
    count = db.Column(db.Integer, nullable=False, default=1)

    def __init__(self, product_id, cart_id, count=1):
        self.product_id = product_id
        self.cart_id = cart_id
        self.count = count


class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    hash = db.Column(db.String(16), unique=True, nullable=False)
    cost = db.Column(db.Numeric(10, 2))
    title = db.Column(db.String(100))
    img = db.Column(db.String(100))
    amount = db.Column(db.Integer)

    def __init__(self, cost, title, img, amount):
        self.hash = random_string(16)
        self.cost = cost
        self.title = title
        self.img = img
        self.amount = amount

    def as_dict(self):
        return {'hash': self.hash, 'cost': str(self.cost), 'title': self.title, 'img': self.img, 'amount': self.amount}


class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    hash = db.Column(db.String(16), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    cart_id = db.Column(db.Integer, db.ForeignKey('cart.id'), nullable=False)

    def __init__(self, user_id, cart_id):
        self.hash = random_string(16)
        self.user_id = user_id
        self.cart_id = cart_id

    def as_dict(self):
        cart = Cart.query.get(self.cart_id)
        return {'hash': self.hash, 'cart': cart.as_dict()}


class Cart(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    hash = db.Column(db.String(16), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    payment_system = db.Column(db.String(100), nullable=False, default='liqpay')
    sum = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    cart_products = db.relationship('CartProduct', lazy=False,
                                    backref=db.backref('orders', lazy=True))

    def __init__(self, user_id, payment_system=None, sum=None):
        self.hash = random_string(16)
        self.user_id = user_id
        self.payment_system = payment_system
        self.sum = sum

    def is_empty(self):
        return len(self.cart_products) < 1

    def as_dict(self):
        data = list()
        for cart_product in self.cart_products:
            product = Product.query.get(cart_product.product_id)
            product = product.as_dict()
            product['count'] = cart_product.count
            data.append(product)

        return {'hash': self.hash, 'payment_system': self.payment_system,
                'sum': str(self.sum), 'products': data}


@app.route('/api/v1/products/', methods=['GET'])
def list_products():
    page = int(request.args.get('page', 1))
    limit = 12
    start = limit * page - limit

    products = Product.query.all()
    data_products = products[start:(start + limit)]

    data = [product.as_dict() for product in data_products]

    return jsonify({'status': 'ok', 'data': data,
                    'paginator': {'count': len(products), 'page': page}})


@app.route('/api/v1/cart/', methods=['GET', 'POST', 'PUT', 'DELETE'])
def cart():
    user = User.query.filter_by(hash=session['id']).first()
    cart = Cart.query.filter_by(user_id=user.id).order_by(Cart.id.desc()).first()
    if not cart:
        cart = Cart(user.id)
        db.session.add(cart)
        db.session.commit()

    if request.method == 'GET':  # display cart page
        return jsonify({'status': 'ok', 'data': cart.as_dict()})
    if request.method == 'POST':  # create order with current cart
        if cart.is_empty():
            return jsonify({'status': 'err', 'msg': 'cart is empty'})
        else:
            json = request.get_json(force=True)
            if json:
                cart.payment_system = json.get('paymentSystem')

                new_cart = Cart(user.id)
                db.session.add(new_cart)

                order = Order(user.id, cart.id)
                db.session.add(order)
                db.session.commit()

                return jsonify({'status': 'ok', 'data': order.hash})
            return str(), 422
    if request.method == 'PUT':  # add new product to cart
        json = request.get_json(force=True)
        if json:
            product = Product.query.filter_by(hash=json.get('hash')).first()
            if product:
                count = json.get('count', None)
                if count is not None:
                    if not count:
                        count = 0
                    else:
                        count = int(count)
                    cart_product = CartProduct.query.filter_by(product_id=product.id, cart_id=cart.id).first()
                    old_count = cart_product.count
                    product.amount += old_count
                    old_sum = cart.sum - product.cost * old_count
                    if product.amount >= count:
                        product.amount -= count
                        cart_product.count = count
                        cart.sum = old_sum + product.cost * count
                        db.session.commit()

                        return jsonify({'status': 'ok', 'msg': 'Successfully updated'}), 200
                    else:
                        return jsonify({'status': 'err', 'msg': 'Not enough product'}), 200
                if product.amount > 0:
                    cart_product = CartProduct.query.filter_by(product_id=product.id, cart_id=cart.id).first()
                    product.amount -= 1
                    cart.sum += product.cost
                    if cart_product:
                        cart_product.count += 1
                    else:
                        cart_product = CartProduct(product.id, cart.id)
                        db.session.add(cart_product)
                    db.session.commit()

                    return jsonify({'status': 'ok', 'msg': 'Successfully added'}), 200
                else:
                    return jsonify({'status': 'err', 'msg': 'The product has been ended :('}), 200
            return str(), 404
        return str(), 422
    if request.method == 'DELETE':  # delete product from cart
        json = request.get_json(force=True)
        if json:
            product = Product.query.filter_by(hash=json.get('hash')).first()
            if product:
                cart_product = CartProduct.query.filter_by(product_id=product.id, cart_id=cart.id).first()
                product.amount += cart_product.count
                cart.sum -= product.cost * cart_product.count
                db.session.delete(cart_product)
                db.session.commit()

                return jsonify({'status': 'ok', 'msg': 'Successfully removed'}), 200
            return str(), 404
        return str(), 422


@app.route('/api/v1/payment/', methods=['GET'])
def payment():
    hash = request.args.get('hash', None)
    if session.get('id', None):
        user = User.query.filter_by(hash=session['id']).first()
        if hash:
            order = Order.query.filter_by(hash=hash, user_id=user.id).first()
            if order:
                return jsonify({'status': 'ok', 'data': order.as_dict()})
            return str(), 404
        return str(), 422
    return str(), 403


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def index(path):
    """
    All urls except 'api' - renders react template
    """

    if session.get('id', None):
        user = User.query.filter_by(hash=session['id']).first()
        if not user:
            user = User()
            db.session.add(user)
            db.session.commit()
            session['id'] = user.hash
    else:
        from utils.helper import random_string
        user = User()
        db.session.add(user)
        db.session.commit()
        session['id'] = user.hash

    return render_template('index.html')


if __name__ == '__main__':
    db.create_all()
    app.run(debug=True)
