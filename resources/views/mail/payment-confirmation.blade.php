<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Confirmation</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }

        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
        }

        .header {
            background-color: #1a202c;
            color: #ffffff;
            padding: 20px;
            text-align: center;
        }

        .header h1 {
            margin: 0;
            font-size: 24px;
        }

        .content {
            padding: 30px;
            color: #4a5568;
            line-height: 1.6;
        }

        .content h2 {
            color: #2d3748;
            font-size: 20px;
        }

        .details-table {
            width: 100%;
            margin: 20px 0;
            border-collapse: collapse;
        }

        .details-table td {
            padding: 10px;
            border-bottom: 1px solid #e2e8f0;
        }

        .details-table td:first-child {
            font-weight: bold;
            color: #2d3748;
        }

        .button-container {
            text-align: center;
            margin-top: 30px;
        }

        .button {
            display: inline-block;
            background-color: #2d3748;
            color: #ffffff;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
        }

        .footer {
            background-color: #f7fafc;
            color: #718096;
            padding: 20px;
            text-align: center;
            font-size: 12px;
        }
    </style>
</head>

<body>
    <table width="100%" border="0" cellspacing="0" cellpadding="20" style="background-color: #f4f4f4;">
        <tr>
            <td align="center">
                <div class="container">
                    <div class="header">
                        <h1>Olympia Garden Materials</h1>
                    </div>
                    <div class="content">
                        <h2>Thank You For Your Payment!</h2>
                        <p>Hello, {{ $name }}</p>
                        <p>We've received your payment and your order is being processed. Here are the details of your
                            purchase:</p>

                        <table class="details-table">
                            <tr>
                                <td>Order Number:</td>
                                <td>{{ $orderNumber }}</td>
                            </tr>
                            <tr>
                                <td>Amount Paid:</td>
                                <td>${{ number_format($amount / 100, 2) }}</td>
                            </tr>
                            <tr>
                                <td>Date:</td>
                                <td>{{ $date }}</td>
                            </tr>
                        </table>

                        <p>You can view your order details by clicking the button below.</p>

                        <div class="button-container">
                            {{-- You can replace '#' with a link to the user''s order page --}}
                            <a href="#" class="button">View Your Order</a>
                        </div>

                        <p>We appreciate your business!</p>
                        <p>Sincerely,<br>The Olympia Garden Materials Team</p>
                    </div>
                    <div class="footer">
                        &copy; {{ date('Y') }} Olympia Garden Materials. All rights reserved.<br>
                        123 Garden Lane, Olympia, WA 98501
                    </div>
                </div>
            </td>
        </tr>
    </table>
</body>

</html>
