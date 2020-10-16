var stripe = Stripe("pk_test_51GzwUxBKlxcCDnEB15dSzfFxy0p8suq8C9uij9qB3gDPFi1OhRFFp2CkxK5dlufiAHsR0WGP5xf8nWSm0ppX8Rhz00XUdnGn50");

function stripeElements() {  
    document.addEventListener("DOMContentLoaded", function(event) {
        var typePayment = document.querySelector("#button-text").textContent
        var customerId = document.querySelector("#customerId").value
        var priceId = document.querySelector("#priceId").value
        var subscriptionId = document.querySelector("#subscriptionId").value

        if(typePayment == "payment") {
            var paymentIntent = null;
            paymentIntentPackage(priceId).then(data => {
                paymentIntent = data
            })
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
        card = elements.create('card', { style: style, hidePostalCode: true })
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
                    postal_code: document.querySelector("#zipCode").value,
                    state: document.querySelector("#country").value
                }
            }

            const latestInvoicePaymentIntentStatus = localStorage.getItem('latestInvoicePaymentIntentStatus')
            if(latestInvoicePaymentIntentStatus == "requires_payment_method") {
                const invoiceId = localStorage.getItem('latestInvoiceId');
                const isPaymentRetry = true;
                createPaymentMethod(card, customerDetail, paymentIntent, customerId, priceId, subscriptionId, typePayment, invoiceId, isPaymentRetry)
            } else {
                createPaymentMethod(card, customerDetail, paymentIntent, customerId, priceId, subscriptionId, typePayment)
            }
        });
    })
}

async function createPaymentMethod(card, customerDetail, paymentIntent, customerId, priceId, subscriptionId, typePayment, invoiceId = null, isPaymentRetry = null) {
    let result = await stripe.createPaymentMethod({
        type: "card",
        card: card,
        billing_details: customerDetail
    })
    if(result.error) {  
        displayError(result)
    } else if(typePayment == "payment") {
        try {
            confirmCard(paymentIntent.clientSecret, result.paymentMethod.id)   
        } catch (error) {
            displayError(error)
        }
    } else if(typePayment == "subscription") {
        if(isPaymentRetry) {
            retryInvoice(customerId, result.paymentMethod.id, invoiceId)
        } else {
            createSubscription(result.paymentMethod.id, customerId, customerDetail, priceId, subscriptionId)
        }
    } else {
        console.log("Payment type is not valid")
    }
}

function paymentIntentPackage(priceId) {
    return fetch("/api/payment-intent", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            price_id: priceId,
        })
    }).then(result => {
        return result.json()
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
    .then(handleRequiresPaymentMethod)
    .then(onCompletePayment)
    .catch((error) => {
        displayError(error)
    })
}

function retryInvoice(customerId, paymentMethodId, invoiceId) {
    return fetch("/api/retry-invoice", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            customer_id: customerId,
            payment_method: paymentMethodId,
            invoice_id: invoiceId
        })
    }).then((result) => {
        return result.json();
    }).then((result) => {
        if (result.error) {
            throw result;
        }
        return {
            invoice: result.invoice,
            paymentMethodId: paymentMethodId,
            priceId: priceId,
            isRetry: true
        };
    })
    .then(handlePaymentThatRequiresCustomerAction)
    .then(onCompletePayment)
    .catch((error) => {
        displayError(error)
    })
}

async function handlePaymentThatRequiresCustomerAction({subscription, paymentMethodId, priceId, invoice, isRetry}) {
    if(subscription && subscription.status == "active") {
        loading(false);
        return { subscription, paymentMethodId, priceId }
    }

    let paymentIntent = invoice ? invoice.payment_intent : subscription.latest_invoice.payment_intent
    if(paymentIntent.status === "requires_action" || (isRetry === true && paymentIntent.status === "requires_payment_method")) {
        return confirmCard(paymentIntent.client_secret, paymentMethodId, subscription, priceId)
    } else {
        loading(false);
        return { subscription, paymentMethodId, priceId };
    }
}

function handleRequiresPaymentMethod({ subscription, paymentMethodId, priceId }) {
    if(subscription && subscription.status === "active") {
        return { subscription, paymentMethodId, priceId }
    } else if(subscription.latest_invoice.payment_intent.status === "requires_payment_method") {
        localStorage.setItem("latestInvoiceId", subscription.latest_invoice.id);
        localStorage.setItem("latestInvoicePaymentIntentStatus", subscription.latest_invoice.payment_intent.status)
        throw { error: { message: "Your card was declined." } };
    } else {
        return { subscription, paymentMethodId, priceId }
    }
}

async function confirmCard(clientSecret, paymentMethodId, subscription = null, priceId = null) {
    let result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodId
    })
    loading(false)
    if (result.error) {
        throw result
    } else {
        if(result.paymentIntent.status === "succeeded") {
            return subscription ? { subscription, paymentMethodId, priceId } : onCompletePayment()
        } 
    }
}

function displayError(event) {
    loading(false)
    let displayError = document.getElementById('card-error');
    if (event.error) {
        displayError.textContent = event.error.message || event.error.raw.message;
    } else {
        displayError.textContent = '';
    }
}

function onCompletePayment() {
    clearCache()
    var redirectUrl = document.querySelector("#redirectUrl").value
    window.location.href = "/success?redirect=" + redirectUrl
}

function loading(isLoading) {
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

function clearCache() {
    localStorage.clear()
}

stripeElements()