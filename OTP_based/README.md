# OTP based Email Validation

Users are sent a one-time password (OTP) via email during the signup process, which they must enter on the website or app to verify their identity.

## Implementation Steps

1. User Signup:

- When a user signs up, prompt them to enter the OTP received in their email.

2. OTP Generation:

- Generate a random 6-digit OTP for the user.

3. Email OTP:

- Send the OTP to the user's registered email address.

4. Verification:

- Match the OTP entered by the user with the OTP stored in the database.

5. Validation Completed:

- If the OTPs match, mark the user as verified by setting the `verified` field to `true`.

Sounds easy right!

## Working

The challenge arises when multiple users are signing up, entering OTPs with potential delays. Here's how to address this:

- It seems pretty simple to just check `generated_OTP == entered_OTP`. If true, verify the user; otherwise, do not.
- But think again: at a point of time, hundreds of users might be signing up, and they might enter the OTP with potential delays. So, on the server, how would we validate a user with the OTP generated for them only, as there are multiple users and multiple OTPs

Here's the solution:

1. OTP Storage:

- Store each user's OTP in the database upon signup, associating it with their account.

2. Matching OTPs:

- Upon verification attempt, fetch the OTP from the database and compare it with the user-entered OTP.

## Security Concerns

Till now, we've sent the OTP and verified it by matching the user's entered OTP with the server-generated OTP. But there are some security concerns:

1. There is no limit on the number of times a user can attempt to validate their account. A user could try a million times!
2. A user could generate thousands of OTPs, wasting resources. There is no limit on the number of OTPs a user can generate!
3. The OTP has no expiry. Once the OTP is generated, it can be used anytime in the future for verification!

### Let's fix them one by one:

1. Validation Attempts Limit:

- Create an `incorrect_attempts` field for each user in the database to track the number of incorrect OTP attempts.
- If the number of incorrect attempts exceeds a threshold of 10, permanently ban the user's account.

2. OTP Generation Limit and Expiry:

Instead of storing OTP directly, we'll encrypt them with JWT, which has multiple benefits:

- Increased security in case of data breaches.
- Expiration time can be set (e.g., 5 minutes).
- Store an object in JWT containing OTP and attempts `{OTP: <generated_otp>, attempts: <no_of_times_otp_generated>}`.
- On user validation, decrypt the OTP and compare it with the user-entered OTP.
- When generating a new OTP, check if the number of attempts exceeds 20. If it does, we'll ban the account.

3. Account Banning:

- Check if a user is banned before allowing any OTP validation or generation requests.
