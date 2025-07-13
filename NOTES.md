# Notes

```js
fetch('/api/v1/login', {
  method: 'POST',
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "X-CSRF-TOKEN": "",
  },
  body: JSON.stringify({
    email: "admin@example.com",
    password: "password",
    type: "spa",
    // remember: true
  }),
}).then((response) => {
  if (!response?.ok) {
    console.log('Response was not OK');
  }
  return response.json();
})
.then((res) => console.log('res:', res))
.catch((err) => console.log('err:', err));
```

```js
fetch('/api/v1/users', {
  method: 'POST',
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    "name": "User 1",
    "email": "user@email.com",
    "username": "user1",
    "password": "123456",
    "password_confirmation": "1234567"
  }),
}).then((response) => {
  if (!response?.ok) {
    console.log('Response was not OK');
  }
  return response.json();
})
.then((res) => console.log('res:', res))
.catch((err) => console.log('err:', err));
```

