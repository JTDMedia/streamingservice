# StreamingService 2025 OpenSource  

StreamingService 2025 OpenSource is a simple streaming service that was originally developed as **BingeBit**. It is now open source and available for the community to use, customize, and improve.  

---

## Features  
- **Simple Login System** using Discord (Login with email and password via Firebase is not working).  
- **Movie Display**: a basic way to show movies.  
- **User Activity Check**: checks if a user is active.  
- **Subscription API**: a simple API for managing subscriptions.  

---

## Technology Stack  
This project is built with:  
- **Node.js**  
- **JSON**  
- **EJS (Embedded JavaScript Templates)**  

---

## Installation and Usage  
Follow these steps to run the project locally:  

1. **Install Dependencies**  
```
npm install
```

2. **Set Environment Variables**  
- Copy the example environment variables file:  
```
cp .env.example .env
```
- Fill in all required fields in the `.env` file.  
- Complete the necessary information in `fb-service.json`.  
- Adjust settings in `index.js` if needed.  

3. **Start the Application**  
```
node index.js
```

---

## Known Issues  
- **Watch functionality is not working.**  
- **Admin panel is not functioning properly.**  
- **Firebase integration is not working.**  
- Login with email and password via Firebase is not functional.  
- Certain features may not work correctly or require adjustments.  

---

## Contributing  
I am **not actively working** on this project at the moment. **However**, if there is enough interest from the community, I might continue development.  

You are more than welcome to **open Pull Requests** – in fact, they are highly encouraged! Let's improve this streaming service together.  

---

## License  
This project is open source and licensed under the MIT License.  

---

## Note  
This project was originally developed as **BingeBit**, but it has now been transitioned to an open source version under the name **StreamingService 2025 OpenSource**.  
Some parts need to be manually adjusted to work correctly.  

Feel free to make modifications, add new features, or fix issues. Let's take this project to the next level together! 