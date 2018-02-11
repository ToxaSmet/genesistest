from flask import json
import GenesisTest
import unittest
from GenesisTest import app, db


class GenesisTestCase(unittest.TestCase):
    def __create_db(self):
        from GenesisTest import Product
        product1 = Product(10, 'Product1', '/static/3e9e8b359d3bba761f2f68972a044326.jpg', 2)
        product2 = Product(11, 'Product2', '/static/4a3fdb_dfa6eece081240eb82ac971098a391a0~mv2.jpg_256.jpg', 3)
        product3 = Product(8, 'Product3', '/static/33_usilitel-moschnosti-jbl-mpx-600.png', 3)
        product4 = Product(9, 'Product4', '/static/41.jpg', 5)
        product5 = Product(15, 'Product5', '/static/1057dcaba289876.jpg', 5)
        product6 = Product(14, 'Product6', '/static/314433.jpg', 5)
        product7 = Product(14, 'Product7', '/static/e711d3db.jpg', 5)
        product8 = Product(12, 'Product8', '/static/Gym_Drawstring_Cargo_Shorts_Jungle_Green_3-128x128.jpg', 5)
        product9 = Product(11, 'Product9', '/static/index.jpg', 5)
        product10 = Product(12, 'Product10', '/static/thumbnail-20141126122041-3535.jpg', 2)
        product11 = Product(10, 'Product11', '/static/thumbnail-20150409120656-7103.jpg', 2)
        product12 = Product(10, 'Product12', '/static/thumbnail-20170301120800-5236.jpg', 10)
        product13 = Product(10, 'Product13', '/static/w128h1281387223718candyorange.png', 10)
        db.session.add_all([product1, product2, product3, product4, product5, product6, product7, product8, product9,
                            product10, product11, product12, product13])
        db.session.commit()

    def setUp(self):
        app.config[
            'SQLALCHEMY_DATABASE_URI'] = 'sqlite:///D:\\Documents\\Projects\\GenesisTest\\test.db'  # only for Win
        app.testing = True
        self.app = app.test_client()
        db.drop_all()
        db.create_all()
        self.__create_db()

    def tearDown(self):
        db.session.remove()

    def test_react_render(self):
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)

    def test_user(self):
        pre_count = len(GenesisTest.User.query.all())
        self.app.get('/')
        post_count = len(GenesisTest.User.query.all())
        self.assertEqual(pre_count + 1, post_count)

    def test_get_cart(self):
        self.app.get('/')
        response = self.app.get('/api/v1/cart/', follow_redirects=True)
        json_data = json.loads(response.data)
        self.assertEqual(json_data['status'], 'ok')
        self.assertEqual(json_data['data']['products'], list())

    def test_add_to_cart(self):
        self.app.get('/')
        product = GenesisTest.Product.query.first()
        response = self.app.put('/api/v1/cart/', data=json.dumps({'hash': product.hash}), follow_redirects=True)
        json_data = json.loads(response.data)
        self.assertEqual(json_data['status'], 'ok')
        self.assertEqual(json_data['msg'], 'Successfully added')
        cart = GenesisTest.Cart.query.first()
        product = GenesisTest.Product.query.first()
        cart_product = GenesisTest.CartProduct.query.filter_by(cart_id=cart.id, product_id=product.id).first()
        self.assertIsNotNone(cart_product)
        self.assertEqual(cart.sum, product.cost)
        self.assertEqual(cart_product.count, 1)

        # another one
        product = GenesisTest.Product.query.first()
        response = self.app.put('/api/v1/cart/', data=json.dumps({'hash': product.hash}), follow_redirects=True)
        json_data = json.loads(response.data)
        cart = GenesisTest.Cart.query.first()
        product = GenesisTest.Product.query.first()
        cart_product = GenesisTest.CartProduct.query.filter_by(cart_id=cart.id, product_id=product.id).first()
        self.assertEqual(json_data['status'], 'ok')
        self.assertEqual(json_data['msg'], 'Successfully added')
        self.assertEqual(cart_product.count, 2)
        self.assertEqual(cart.sum, product.cost * 2)

    def test_update_cart(self):
        self.app.get('/')
        product = GenesisTest.Product.query.first()
        self.app.put('/api/v1/cart/', data=json.dumps({'hash': product.hash}),
                     follow_redirects=True)
        product = GenesisTest.Product.query.first()
        self.app.put('/api/v1/cart/', data=json.dumps({'hash': product.hash}),
                     follow_redirects=True)
        product = GenesisTest.Product.query.first()
        response = self.app.put('/api/v1/cart/', data=json.dumps({'hash': product.hash, 'count': 1}),
                                follow_redirects=True)
        json_data = json.loads(response.data)
        self.assertEqual(json_data['status'], 'ok')
        self.assertEqual(json_data['msg'], 'Successfully updated')
        cart = GenesisTest.Cart.query.first()
        product = GenesisTest.Product.query.first()
        cart_product = GenesisTest.CartProduct.query.filter_by(cart_id=cart.id, product_id=product.id).first()
        self.assertIsNotNone(cart_product)
        self.assertEqual(cart.sum, product.cost)
        self.assertEqual(cart_product.count, 1)

    def test_remove_from_cart(self):
        self.app.get('/')
        product = GenesisTest.Product.query.first()
        self.app.put('/api/v1/cart/', data=json.dumps({'hash': product.hash}),
                     follow_redirects=True)
        product = GenesisTest.Product.query.order_by(GenesisTest.Product.id.desc()).first()
        self.app.put('/api/v1/cart/', data=json.dumps({'hash': product.hash}),
                     follow_redirects=True)
        product = GenesisTest.Product.query.order_by(GenesisTest.Product.id.desc()).first()
        response = self.app.delete('/api/v1/cart/', data=json.dumps({'hash': product.hash}), follow_redirects=True)
        json_data = json.loads(response.data)
        self.assertEqual(json_data['status'], 'ok')
        self.assertEqual(json_data['msg'], 'Successfully removed')
        cart = GenesisTest.Cart.query.first()
        product = GenesisTest.Product.query.first()
        cart_product = GenesisTest.CartProduct.query.filter_by(cart_id=cart.id, product_id=product.id).first()
        self.assertIsNotNone(cart_product)
        self.assertEqual(cart.sum, product.cost)
        self.assertEqual(cart_product.count, 1)

        product = GenesisTest.Product.query.order_by(GenesisTest.Product.id.desc()).first()
        cart_product = GenesisTest.CartProduct.query.filter_by(cart_id=cart.id, product_id=product.id).first()
        self.assertIsNone(cart_product)


if __name__ == '__main__':
    unittest.main()
