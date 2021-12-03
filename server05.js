var express = require("express");
var app = express();
var path = require("path");
var PORT = process.env.PORT || 5000
var hbs = require("express-handlebars");
app.use(express.static("static"));
var page = "Tabela";

const Datastore = require("nedb");
const internal = require("stream");

const coll1 = new Datastore({
    filename: "kolekcja.db",
    autoload: true,
});

app.set("views", path.join(__dirname, "views")); // ustalamy katalog views
app.engine(
    "hbs",
    hbs({
        defaultLayout: "main.hbs",
        extname: ".hbs",
        partialsDir: "views/partials",
    })
); // domyślny layout, potem można go zmienić
app.set("view engine", "hbs");

app.get("/", function (req, res) {
    // res.render('index.hbs');   // nie podajemy ścieżki tylko nazwę pliku

    // coll1.find({}, function (err, docs) {
    //     coll1.count({}, function (err, count) {
    //         console.log("dokumentów jest: ", count)
    //         for (var i = 0; i < count; i++) {
    coll1.update({}, { $set: { upd: false } }, { multi: true }, function (err, numUpdated) {
        console.log(numUpdated)
        // console.log(i)
    });

    //         }
    //     });
    // })

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

    coll1.find({}, function (err, docs) {
        console.log(docs[1]);
        coll1.count({}, function (err, count) {
            page = "";
            for (i = 0; i < count; i++) {
                tab = [];
                if (docs[i].a == "on") {
                    tab[0] = "Tak";
                } else {
                    tab[0] = "Nie";
                }
                if (docs[i].b == "on") {
                    tab[1] = "Tak";
                } else {
                    tab[1] = "Nie";
                }
                if (docs[i].c == "on") {
                    tab[2] = "Tak";
                } else {
                    tab[2] = "Nie";
                }
                if (docs[i].d == "on") {
                    tab[3] = "Tak";
                } else {
                    tab[3] = "Nie";
                }
                console.log(tab);

                if (i == 0) {
                    page = `<tr><td>${tab[0]}</td><td>${tab[1]}</td><td>${tab[2]}</td><td>${tab[3]}</td></tr>`;
                } else {
                    page += `<tr><td>${tab[0]}</td><td>${tab[1]}</td><td>${tab[2]}</td><td>${tab[3]}</td></tr>`;
                }
                tab = [];
            }
        });
    });
    console.log(page);

    // res.render("/index")
    coll1.find();
    res.redirect("/");
    page = "";
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