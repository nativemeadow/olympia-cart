<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Login Code</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f4;
            color: #4a5568;
        }

        .container {
            max-width: 570px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
            color: #2d3748;
        }

        .code-box {
            background-color: #edf2f7;
            border: 1px solid #e2e8f0;
            padding: 15px;
            text-align: center;
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 5px;
            border-radius: 5px;
            margin: 25px 0;
            color: #2d3748;
        }

        .footer {
            text-align: center;
            font-size: 12px;
            color: #718096;
            margin-top: 30px;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h2>Your One-Time Login Code</h2>
        </div>
        <p>Hello,</p>
        <p>Please use the following code to complete your login. This code is valid for 10 minutes.</p>
        <div class="code-box">
            {{ $code }}
        </div>
        <p>If you did not request this code, you can safely ignore this email.</p>
        <p>Thanks,<br>The Olympia Garden Materials Team</p>
        <div class="footer">
            &copy; {{ date('Y') }} Olympia Garden Materials. All rights reserved.
        </div>
    </div>
</body>

</html>
