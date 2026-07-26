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
      <style>{`
        .glass-pay-btn {
          border: none;
          background: linear-gradient(180deg, rgba(74,222,128,0.92), rgba(34,197,94,0.85));
          color: #06210f;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: 0.3px;
          border-radius: 999px;
          padding: 13px 34px;
          box-shadow: 0 8px 24px rgba(52,211,153,0.35), inset 0 1px 0 rgba(255,255,255,0.45);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
        }
        .glass-pay-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(52,211,153,0.45), inset 0 1px 0 rgba(255,255,255,0.55);
        }
        .glass-pay-btn:active {
          transform: translateY(0) scale(0.98);
        }
      `}</style>
      <button className="glass-pay-btn" onClick={handlePayment}>
        Pay ₹{amount}
      </button>
    </div>
  );
}

export default PaymentComponent;