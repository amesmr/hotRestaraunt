// Dependencies
// =============================================================
var express = require("express");
var bodyParser = require("body-parser");
var path = require("path");
var fs = require("fs");

// Sets up the Express App
// =============================================================
var app = express();
var PORT = 3000;

// Sets up the Express app to handle data parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.text());
app.use(bodyParser.json({
    type: "application/vnd.api+json"
}));

reservations = [];
waitList = [];


// Routes
// =============================================================

// Basic route that sends the user first to the AJAX Page
app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "home.html"));
});

app.get("/tables", function (req, res) {
    res.sendFile(path.join(__dirname, "tables.html"));
});

app.get("/reserve", function (req, res) {
    res.sendFile(path.join(__dirname, "reservation.html"));
});

// Create New reservation takes JSON input
app.post("/api/tables", function (req, res) {
    var newReservation = req.body;
    if (reservations.length < 5) {

        console.log("In tables POST - object is:");
        console.log(newReservation);
        // add it to the reservations array
        reservations.push(newReservation);
        fs.writeFile("reservations.txt", JSON.stringify(reservations), function (err) {
            if (err) throw err;
            console.log("reservations saved");
        });
        res.json(newReservation);
        // res.data = true;
    } else {
        // no more room at the Inn.  Put them in the waitlist
        //  add them into the waitList array
        waitList.push(newReservation);
        fs.writeFile("waitlist.txt", JSON.stringify(waitList), function (err) {
            if (err) throw err;
            console.log("waitlist saved");
            // res.data = false;
            res.json(false);
        });
    }
});

app.get("/api/tables", function (req, res) {
    res.json(reservations);
});

// Not sure that we need this, but it's here if we do
app.post("/api/waitlist", function (req, res) {
    var newWaitList = req.body;
    console.log("In waitlist POST - object is:");
    console.log(newWaitList);
    waitList.push(newWaitList);
    fs.writeFile("waitlist.txt", JSON.stringify(waitList), function (err) {
        if (err) throw err;
        console.log("waitlist saved");
        res.json(newWaitList);
    });
});

app.get("/api/waitlist", function (req, res) {
    res.json(waitList);
});

app.post("/api/clear", function (req, res) {
    console.log("Clearing all table arrays.");
    reservations = [];
    waitList = [];
    console.log("Deleting data files.");
    fs.unlink("reservations.txt", function (err) {
        if (err) throw err;
        fs.unlink("waitlist.txt", function (err) {
            if (err) throw err;
        });
    });
});



// Starts the server to begin listening
// =============================================================
app.listen(PORT, function () {
    console.log("App listening on PORT " + PORT);
    fileExists("reservations.txt", function (err, isFile) {
        if (isFile) {
            fs.readFile("reservations.txt", "utf8", function (err, data) {
                var obj = JSON.parse(data);
                for (i = 0; i < obj.length; i++) {
                    reservations.push(obj[i]);
                    console.log("Adding " + i + " reservation.")
                }
            });
        }
    });
    fileExists("waitlist.txt", function (err, isFile) {
        if (isFile) {
            fs.readFile("waitlist.txt", "utf8", function (err, data) {
                var obj = JSON.parse(data);
                for (i = 0; i < obj.length; i++) {
                    waitList.push(obj[i]);
                    console.log("Adding " + i + " waitList.")
                }
            });
        }
    });
});

function fileExists(file, cb) {
    fs.stat(file, function fsStat(err, stats) {
        if (err) {
            if (err.code === 'ENOENT') {
                return cb(null, false);
            } else {
                return cb(err);
            }
        }
        return cb(null, stats.isFile());
    });
}