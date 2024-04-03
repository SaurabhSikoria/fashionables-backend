const braintree = require("braintree");
const Order = require("../models/order");

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

exports.braintreeGatewayToken = (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        return res.status(500).send(err);
      } else {
        return res.status(200).send(response);
      }
    });
  } catch (error) {
    console.log(`catch: ${error}`);
  }
};

exports.braintreePaymentGateway = (req, res) => {
  const { cart, nonce } = req.body;
  let total = 0;
  cart.map((product) => (total += product.price));

  gateway.transaction
    .sale({
      amount: total,
      paymentMethodNonce: nonce,
      options: {
        submitForSettlement: true,
      },
    })
    .then((result) => {
      if (result.success) {
        const order = new Order({
          products: cart,
          amount: total,
          transaction_id: result.transaction.id,
          user: req.profile._id,
        }).save();
        res.json({ ok: true });
      } else {
        res.status(500).send(result.message);
      }
    })
    .catch((err) => console.error(err));
};
