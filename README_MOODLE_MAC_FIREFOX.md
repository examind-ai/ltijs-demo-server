## 2024-05-30:

The strangest observation on macOS with Firefox on Moodle. Using LTIJS Demo Server, if I set up a deep link with Firefox on macOS, the `aud` value in `id_token` that Moodle sends on LTI Launch is the username instead of the Client ID, e.g.

```json
{
  "nonce": "yuqb2al1qfolsm6sod88z7jb3",
  "iat": 1717090717,
  "exp": 1717090777,
  "iss": "https://moodle.ngrok-free.dev",
  "aud": "lou.teacher",
  ...
}
```

It should look like this:

```json
{
  "nonce": "yuqb2al1qfolsm6sod88z7jb3",
  "iat": 1717090717,
  "exp": 1717090777,
  "iss": "https://moodle.ngrok-free.dev",
  "aud": "vCvFD0auXYnU4VW",
  ...
}
```

As a result, the platform can't be found by LTIJS and it results in this error:

```json
{
  "status": 401,
  "error": "Unauthorized",
  "details": {
    "description": "Error validating ltik or IdToken",
    "message": "UNREGISTERED_PLATFORM"
  }
}
```

Once Firefox corrupts the deep link like that, no other browser can fix it until the activity is deleted in Moodle and a new one created using Chrome or Safari. This seems to be unique to macOS + Firefox + Moodle, as I couldn't reproduce this in Windows.

This behaviour is observed with cookie-based Login and localStorage-based Login.
