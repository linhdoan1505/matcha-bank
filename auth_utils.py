import time

import jwt


def build_apple_client_secret(team_id, client_id, key_id, private_key):
    """Apple has no static client secret — it's a short-lived ES256 JWT
    signed with your Sign in with Apple private key (.p8), minted per request.
    """
    now = int(time.time())
    return jwt.encode(
        {
            "iss": team_id,
            "iat": now,
            "exp": now + 300,
            "aud": "https://appleid.apple.com",
            "sub": client_id,
        },
        private_key,
        algorithm="ES256",
        headers={"kid": key_id},
    )
