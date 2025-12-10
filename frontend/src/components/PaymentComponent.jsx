import React from "react";

function PaymentComponent({ amount }) {
  const handlePayment = async () => {
    try {
      // ✅ Call backend to create Razorpay order
      const res = await fetch("https://coolgrid-ev-1.onrender.com/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }) // send amount in rupees
      });

      const order = await res.json();

      // ✅ Configure Razorpay options
      const options = {
        key: "YOUR_RAZORPAY_KEY_ID", // replace with your key
        amount: order.amount,
        currency: order.currency,
        name: "Coolgrid EV Charging",
        description: "EV Charging Payment",
        order_id: order.id,
        handler: function (response) {
          alert(
            "Payment Successful!\nPayment ID: " + response.razorpay_payment_id
          );
          // TODO: send response.razorpay_payment_id to backend for verification
        },
        prefill: {
          name: "Customer Name",
          email: "customer@example.com",
          contact: "9876543210"
        },
        theme: {
          color: "#3399cc"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  return (
    <div className="text-center mt-3">
      <button className="btn btn-success" onClick={handlePayment}>
        Pay ₹{amount}
      </button>
    </div>
  );
}

export default PaymentComponent;
