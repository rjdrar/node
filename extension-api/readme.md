first generate CSR and KEY:
```
openssl req -new -newkey rsa:4096 -nodes -keyout snakeoil.key -out snakeoil.csr
```
then generate PEM and self-sign with KEY:
```

openssl x509 -req -sha256 -days 365 -in snakeoil.csr -signkey snakeoil.key -out snakeoil.pem
```

https://javascript.plainenglish.io/serving-hello-world-with-http2-and-express-js-4dd0ffe76860