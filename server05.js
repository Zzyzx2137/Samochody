var express = require("express");
var app = express();
var path = require("path");
var PORT = process.env.PORT || 5000
var hbs = require("express-handlebars");
app.use(express.static("static"));

const Datastore = require("nedb");

const coll1 = new Datastore({
    filename: "kolekcja.db",
    autoload: true,
});

app.set("views", path.join(__dirname, "static/views")); // ustalamy katalog views
app.engine(
    "hbs",
    hbs({
        defaultLayout: "main.hbs",
        extname: ".hbs",
        partialsDir: "views/partials",
    })
);
app.set("view engine", "hbs");

app.get("/", function (req, res) {
    coll1.update({}, { $set: { upd: false } }, { multi: true }, function (err, numUpdated) {
        console.log(numUpdated)
        // console.log(i)
    });

    coll1.find({}, function (err, docs) {

        console.log(docs)
        res.render("index.hbs", { docs: docs });
    });
});
app.get("/handleForm", function (req, res) {
    doc = { a: "Nie", b: "Nie", c: "Nie", d: "Nie" };
    console.log(doc);
    if (req.query.c1 == "on") {
        doc.a = "Tak";
    }
    if (req.query.c2 == "on") {
        doc.b = "Tak";
    }
    if (req.query.c3 == "on") {
        doc.c = "Tak";
    }
    if (req.query.c4 == "on") {
        doc.d = "Tak";
    }

    coll1.insert(doc, function (err, newDoc) {
        console.log("dodano dokument (obiekt):");
        console.log(newDoc);
        console.log("losowe id dokumentu: " + newDoc._id);
    });

    res.redirect("/");
});

app.get("/delete", function (req, res) {
    coll1.remove({ _id: req.query.id }, function (err, removeNum) {
        console.log(removeNum);
    });
    coll1.find({}, function (err, docs) {
        console.log(docs);
        res.render("index.hbs", { docs: docs });
    });
});

app.get("/edit", function (req, res) {
    coll1.find({ _id: req.query.id }, function (err, docs) {
        console.log(docs[0].a)
        coll1.update({ _id: req.query.id }, { $set: { a: docs[0].a, b: docs[0].b, c: docs[0].c, d: docs[0].d, _id: docs[0]._id, upd: "yes" } }, {}, function (err, numUpdated) {
            console.log("zaktualizowano " + numUpdated)
        });
        coll1.find({}, function (err, docsx) {
            res.render("index.hbs", { docs: docsx });
        });
        coll1.update({ _id: req.query.id }, { $set: { upd: false } }, { multi: true }, function (err, numUpdated) {
            console.log("zaktualizowano " + numUpdated)
        });
    });
})

app.get("/modify", function (req, res) {
    coll1.find({ _id: req.query.id }, function (err, docs) {
        coll1.update({ _id: req.query.id }, { $set: { a: req.query.sl1, b: req.query.sl2, c: req.query.sl3, d: req.query.sl4, upd: false } }, {}, function (err, numUpdated) {
            coll1.find({}, function (err, docsx) {
                res.render("index.hbs", { docs: docsx });
            });
        })
    })
})

app.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT);
});