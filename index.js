const express = require("express");
const passport = require("passport");
const session = require("express-session");
const fs = require("fs");
const dotenv = require("dotenv");
const DiscordStrategy = require("passport-discord").Strategy;
const bodyParser = require("body-parser");
const axios = require("axios");
const CustomStrategy = require('passport-custom').Strategy;
const admin = require('firebase-admin');
const chalk = require('chalk');
const path = require('path');

dotenv.config();
const app = express();

admin.initializeApp({
  credential: admin.credential.cert(require('./fb-service.json')),
});

// Middleware
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "BingChillingBingeBit",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());

// User serialization
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Inlogstrategieën
passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: "/auth/discord/callback",
      scope: ["identify", "email"],
    },
    (accessToken, refreshToken, profile, done) => done(null, profile)
  )
);

passport.use('firebase', new CustomStrategy(async (req, done) => {
  const idToken = req.query.token; // Haal token op uit de querystring
  if (!idToken) {
    return done(null, false, { message: 'No token provided' });
  }

  try {
    // Verifieer het Firebase ID-token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return done(null, decodedToken);
  } catch (error) {
    return done(null, false, { message: 'Invalid token' });
  }
}));

// Routes
app.get("/", (req, res) => {
  if (!req.isAuthenticated()) return res.render("login");

  let userEmail;

  // Controleer of de gebruiker van Discord komt en haal e-mail op
    if (req.user.provider === "discord" && req.user.email) {
    userEmail = req.user.email;
  } else if (req.user.provider === "firebase" && req.user.email) {
    userEmail = req.user.email;
    } else {
console.log(chalk.blue('ERROR >> ') + chalk.green(`Didn't find email in request`));
        return res.redirect("/logout");
  }

  // Controleer of de gebruiker actief is in users.json
  const users = JSON.parse(fs.readFileSync("users.json"));
  const currentUser = users.find((user) => user.email === userEmail);

  if (!currentUser || !currentUser.active) {
    return res.redirect("https://plans.bingebit.online");
  }

  // Toon de lijst met films
  const movies = JSON.parse(fs.readFileSync("movies.json"));
    console.log(chalk.blue('INFO >> ') + chalk.green(`User logged into portal: ${userEmail}`));
  res.render("index", { user: req.user, movies });
});

// Login pagina
app.get("/auth/discord", passport.authenticate("discord", { scope: ["identify", "email"] }));

// Callback-routes
app.get(
  "/auth/discord/callback",
  passport.authenticate("discord", { failureRedirect: "/" }),
  (req, res) => res.redirect("/")
);

app.get(
  '/auth/firebase',
  passport.authenticate('firebase', { session: false }),
  (req, res) => {
    res.json({ message: 'Authenticated with Firebase!', user: req.user });
  }
);

// Callback route
app.get(
  '/auth/firebase/callback',
  passport.authenticate('firebase', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/'); // Verwijzing na succesvolle login
  }
);

// Overlay
app.get("/movie/:id", (req, res) => {
  if (!req.isAuthenticated()) return res.render("login");
    
  let userEmail;

  // Controleer of de gebruiker van Discord komt en haal e-mail op
    if (req.user.provider === "discord" && req.user.email) {
    userEmail = req.user.email;
  } else if (req.user.provider === "firebase" && req.user.email) {
    userEmail = req.user.email;
    } else {
console.log(chalk.blue('ERROR >> ') + chalk.green(`Didn't find email in request`));
        return res.redirect("/logout");
  }

  // Controleer of de gebruiker actief is in users.json
  const users = JSON.parse(fs.readFileSync("users.json"));
  const currentUser = users.find((user) => user.email === userEmail);

  if (!currentUser || !currentUser.active) {
    return res.redirect("https://plans.bingebit.online");
  }
    
  const movies = JSON.parse(fs.readFileSync("movies.json"));
  const movie = movies.find((m) => m.id === req.params.id);
  if (!movie) return res.status(404).send("Movie not found");
  res.render("overlay", { movie });
});

// Logout
app.get("/logout", (req, res) => {
    console.log(chalk.blue('INFO >> ') + chalk.green(`User logged out.`));
  req.logout(() => res.redirect("https://bingebit.online"));
});

// Endpoints
// 1. Nieuwe gebruiker aanmaken
app.post("/api/new-subscription", (req, res) => {
    const { email, token } = req.body;
  
    if (!token == "hZ7W6R%o^IkDy0aQ2aUyCWiY.2_3Cpe$VIhWb.*!7qDlN:gBgK") {
      return res.status(403).json({ error: "Geen toegang tot endpoint, error: Invalid token" });
    }
    
    if (!email) {
      return res.status(400).json({ error: "Email is vereist" });
    }
  
    const users = JSON.parse(fs.readFileSync("users.json"));
    const existingUser = users.find((user) => user.email === email);
  
    if (existingUser) {
      return res.status(400).json({ error: "Gebruiker bestaat al" });
    }
  
    const newUser = { email, active: true };
    users.push(newUser);
    fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
  console.log(chalk.blue('API >> ') + chalk.green(`New subscription made: ${email}`));
    res.status(201).json({ message: "Nieuwe gebruiker aangemaakt", user: newUser });
  });
  
  // 2. Abonnement beëindigen
  app.post("/api/end-subscription", (req, res) => {
    const { email, token } = req.body;
  
    if (!token == "hZ7W6R%o^IkDy0aQ2aUyCWiY.2_3Cpe$VIhWb.*!7qDlN:gBgK") {
      return res.status(403).json({ error: "Geen toegang tot endpoint, error: Invalid token" });
    }
      
    if (!email) {
      return res.status(400).json({ error: "Email is vereist" });
    }
  
    const users = JSON.parse(fs.readFileSync("users.json"));
    const user = users.find((user) => user.email === email);
  
    if (!user) {
      return res.status(404).json({ error: "Gebruiker niet gevonden" });
    }
  
    user.active = false;
    fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
    console.log(chalk.blue('API >> ') + chalk.green(`New subscription deleted: ${email}`));
    res.status(200).json({ message: "Abonnement beëindigd", user });
  });
  
  // 3. Alle films ophalen
  app.get("/api/movies", (req, res) => {
    const movies = JSON.parse(fs.readFileSync("movies.json"));
    res.status(200).json(movies);
  });

app.get('/watch', (req, res) => {
    if (!req.isAuthenticated()) return res.render("login");

    const videoId = req.query.id;
    if (!videoId) {
        return res.status(400).send("Video ID is required");
    }
    
  let userEmail;

  // Controleer of de gebruiker van Discord komt en haal e-mail op
    if (req.user.provider === "discord" && req.user.email) {
    userEmail = req.user.email;
  } else if (req.user.provider === "firebase" && req.user.email) {
    userEmail = req.user.email;
    } else {
console.log(chalk.blue('ERROR >> ') + chalk.green(`Didn't find email in request`));
        return res.redirect("/logout");
  }

  // Controleer of de gebruiker actief is in users.json
  const users = JSON.parse(fs.readFileSync("users.json"));
  const currentUser = users.find((user) => user.email === userEmail);

  if (!currentUser || !currentUser.active) {
    return res.redirect("https://plans.bingebit.online");
  }
    
  console.log(chalk.blue('WATCH >> ') + chalk.green(`/watch accessed: movie id ${videoId}`));

    res.render('video', { id: videoId }); // Gebruik een template-engine zoals EJS
});

// Admin panel
app.get("/admin", (req, res) => {
  if (!req.isAuthenticated()) return res.render("login");

  let userEmail;

  // Controleer of de gebruiker van Discord komt en haal e-mail op
  if (req.user.provider === "discord" && req.user.email) {
    userEmail = req.user.email;
  } else {
    console.error("E-mailadres niet gevonden in gebruikersprofiel.");
    return res.redirect("/logout");
  }

  // Controleer of het e-mailadres behoort tot een van de toegestane e-mails
  const allowedEmails = ["admin1@gmail.com", "admin2@proton.me"];
  if (!allowedEmails.includes(userEmail)) {
    console.log(chalk.blue("ADMIN >> ") + chalk.green(`${userEmail} has tried to access the admin panel, but did not have access.`));
    return res.redirect("/");
  }

  console.log(chalk.blue("ADMIN >> ") + chalk.green(`${userEmail} has accessed the admin panel`));
  res.render("admin");
});


// Start server
const PORT = process.env.PORT || 80;
app.listen(PORT,'0.0.0.0',()=>{
      console.clear()
      console.log(chalk.blue('SERVER >> ') + chalk.green(`Listening on port ${PORT}`));
})