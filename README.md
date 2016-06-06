# service-device-registry
Authentication and authorization by device as a service.

## Routes

### POST /device

__REQ__
```json
{
  "title": "optional title of device",
  "fingerprint": "unique fingerprint of device",
  "user": "a user name",
  "password": "the password of the user"
}
```

__RES__
```json
{
  "token": "an encrypted JWT with device and user profile as payload"
}
```

- if the user does not exist it will be created
- if a device with the same fingerprint exists the response will be an error
