var stripe = Stripe("pk_test_51GzwUxBKlxcCDnEB15dSzfFxy0p8suq8C9uij9qB3gDPFi1OhRFFp2CkxK5dlufiAHsR0WGP5xf8nWSm0ppX8Rhz00XUdnGn50");

function stripeElements() {  
    document.addEventListener("DOMContentLoaded", function(event) {
        const param = new URLSearchParams(document.location.search)
        const typePayment = param.get('type')
        const customerId = param.get('customerId')
        const priceId = param.get('priceId')
        const subscriptionId = param.get('subscriptionId')

        document.querySelector("#button-text").innerHTML = "Pay"
        if(typePayment == "subscription") {
            document.querySelector("#button-text").innerHTML = "Subscribe"
        } 

        // Card Element
        let elements = stripe.elements()
        let style = {
            base: {
            fontSize: '16px',
            color: '#32325d',
            fontFamily:
                '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
            fontSmoothing: 'antialiased',
                '::placeholder': {
                    color: '#a0aec0',
                },
            },
        }
        card = elements.create('card', { style: style })
        card.mount('#card-element')
        card.on("change", function (event) {
            document.querySelector("button").disabled = event.empty;
            document.querySelector("#card-error").textContent = event.error ? event.error.message : "";
        });
        //
    
        var form = document.getElementById("payment-form")
        form.addEventListener("submit", function(event) {
            event.preventDefault();
            loading(true);
            let customerDetail = {
                email: document.querySelector("#email").value,
                name: document.querySelector("#name").value,
                address: {
                    line1: document.querySelector("#company").value,
                    line2: document.querySelector("#address").value,
                    postal_code: document.querySelector("#zip_code").value,
                    state: document.querySelector("#country").value
                }
            }
            stripe.createPaymentMethod({
                type: "card",
                card: card,
                billing_details: customerDetail
            }).then((result) => {
                if(result.error) {  
                    displayError(result)
                } else if(typePayment == "payment") {
                    payPackage(result.paymentMethod.id, customerId, customerDetail, priceId)
                } else if(typePayment == "subscription") {
                    createSubscription(result.paymentMethod.id, customerId, customerDetail, priceId, subscriptionId)
                } else {
                    console.log("Payment type is not valid")
                }
            })
        });
    })
}

function payPackage(paymentMethodId, customerId, customerDetail, priceId) {
    return fetch("/api/payment-intent", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            customer_id: customerId,
            payment_method: paymentMethodId,
            price_id: priceId,
            customer_detail: customerDetail
        })
    }).then((result) => {
        return result.json();
    }).then((data) => {
        confirmCard(data.clientSecret, paymentMethodId)
    })
}

function createSubscription(paymentMethodId, customerId, customerDetail, priceId, subscriptionId) {
    return fetch("/api/subscription", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            customer_id: customerId,
            payment_method: paymentMethodId,
            subscription_id: subscriptionId,
            price_id: priceId,
            customer_detail: customerDetail
        })
    }).then((result) => {
        return result.json();
    }).then((result) => {
        if (result.error) {
            throw result;
        }
        return {
            subscription: result.subscription,
            paymentMethodId: paymentMethodId,
            priceId: priceId,
        };
    })
    .then(handlePaymentThatRequiresCustomerAction)
    .catch((error) => {
        displayError(error)
    })
}

function handlePaymentThatRequiresCustomerAction({subscription, paymentMethodId, priceId}) {
    if(subscription && subscription.status == "active") {
        loading(false);
        return { subscription, priceId, paymentMethodId }
    }

    let paymentIntent = subscription.latest_invoice.payment_intent
    if(paymentIntent.status == "requires_action") {
        confirmCard(paymentIntent.client_secret, paymentMethodId)
    } else {
        loading(false);
        return { subscription, priceId, paymentMethodId };
    }
}

function confirmCard(clientSecret, paymentMethodId) {
    stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodId
    })
    .then(function(result) {
        loading(false);
        if (result.error) {
            displayError(result);
        } else {
            alert(result.paymentIntent.id)
            //orderComplete(result.paymentIntent.id);
        }
    });
}

function displayError(event) {
    console.log(event);
    let displayError = document.getElementById('card-element-errors');
    if (event.error) {
        displayError.textContent = event.error.message;
    } else {
        displayError.textContent = '';
    }
}

var loading = function(isLoading) {
    if (isLoading) {
      // Disable the button and show a spinner
        document.querySelector("button").disabled = true;
        document.querySelector("#spinner").classList.remove("hidden");
        document.querySelector("#button-text").classList.add("hidden");
    } else {
        document.querySelector("button").disabled = false;
        document.querySelector("#spinner").classList.add("hidden");
        document.querySelector("#button-text").classList.remove("hidden");
    }
};

stripeElements()