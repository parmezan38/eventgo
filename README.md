# EVENTGO
EVENTGO is and event creation and subscription app with notification support. It creates simple events with event name and start time, just by typing a very short text. When subscribed to event, notification alerts appear even when the app is closed (the browser still needs to be running for it to work).

## Getting Started

- Install dependencies:

  ```npm install```

- Create a database in PostgreSQL

- Copy ```.env.example``` and rename it to ```.env``` 

- Configure the ```.env``` file with your information to run the app

- Run ```npm run generate-keys``` and copy the keys in the ```.env``` file 

- Start the servers:

  ```npm run dev:server```

  ```npm run dev:client```
