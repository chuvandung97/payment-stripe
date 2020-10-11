var stripe = Stripe("pk_test_51GzwUxBKlxcCDnEB15dSzfFxy0p8suq8C9uij9qB3gDPFi1OhRFFp2CkxK5dlufiAHsR0WGP5xf8nWSm0ppX8Rhz00XUdnGn50");

function stripeElements() {  
    document.addEventListener("DOMContentLoaded", function(event) {
        let elements = stripe.elements();

        // Card Element styles
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
        };

        card = elements.create('card', { style: style });
        
        card.mount('#card-element');

        card.on("change", function (event) {
            // Disable the Pay button if there are no card details in the Element
            document.querySelector("button").disabled = event.empty;
            document.querySelector("#card-error").textContent = event.error ? event.error.message : "";
        });
    
        var form = document.getElementById("payment-form");
        form.addEventListener("submit", function(event) {
            event.preventDefault();
            fetch("/api/subscription", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    customer_id: 'cus_IAFGQypqDqRURv',
                    subscription_id: '',
                    price_id: 'price_1H2TnPBKlxcCDnEBquUtxiLB',
                    email: 'talavodichthegioi@gmail.com',
                })
            }).then(() => {
                console.log(1);
            })
        });
    })
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