const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));

const db = new sqlite3.Database("database.db");

db.serialize(()=>{

db.run(`
CREATE TABLE IF NOT EXISTS users(
id INTEGER PRIMARY KEY AUTOINCREMENT,
nome TEXT,
email TEXT,
senha TEXT,
descricao TEXT,
foto TEXT
)
`);

db.run(`
CREATE TABLE IF NOT EXISTS frases(
id INTEGER PRIMARY KEY AUTOINCREMENT,
texto TEXT,
autor_id INTEGER
)
`);

});

app.post("/api/register",(req,res)=>{

const {nome,email,senha} = req.body;

if(senha.length < 8){
return res.json({erro:"senha precisa ter 8 caracteres"});
}

db.run(
"INSERT INTO users(nome,email,senha) VALUES(?,?,?)",
[nome,email,senha],
function(err){

if(err) return res.json({erro:"erro cadastro"});

res.json({ok:true,id:this.lastID});

});

});

app.post("/api/updateProfile",(req,res)=>{

const {id,foto,descricao} = req.body

db.run(
"UPDATE users SET foto=?, descricao=? WHERE id=?",
[foto,descricao,id],
()=> res.json({ok:true})
)

})

app.post("/api/frases",(req,res)=>{

const {texto,autor} = req.body;

db.run(
"INSERT INTO frases(texto,autor_id) VALUES(?,?)",
[texto,autor],
()=> res.json({ok:true})
);

});


app.get("/api/frases",(req,res)=>{

db.all(`
SELECT frases.texto, users.nome, users.id
FROM frases
JOIN users ON frases.autor_id = users.id
`,(err,rows)=>{

res.json(rows);

});

});


app.get("/api/user/:id",(req,res)=>{

db.get("SELECT * FROM users WHERE id=?",
[req.params.id],
(err,row)=>{

res.json(row);

});

});


app.listen(4000,()=>{

console.log("Servidor rodando em http://localhost:4000");

});