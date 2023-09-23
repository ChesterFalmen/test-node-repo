const express = require('express');
const cors = require('cors')
const { MongoClient, ObjectId } = require("mongodb")
const config = require("./config")


const app = express()
app.use(cors({
    origin: '*'
}))

app.use(express.json())

const client = new MongoClient(config.MYAPIKEY)
const usersDB = client.db('testBase-db').collection('users-DB')
client.connect()
async function run() {
    try {
        await client.connect();
        console.log("You  connected to MongoDB!");
    } catch (error) {
        console.error("Помилка підключення MongoDB:", error);
    }
}
run()

app.get('/api/users', async (req, res)=>{
    const data = await usersDB.find().toArray()
    res.send(data)
})

app.get('/api/users/:id', async (req, res)=>{
    const data = await usersDB.findOne({_id: new ObjectId(req.params.id)})
    res.send(data)
})

app.post('/api/users', async (req, res)=>{
    console.log(req.body.username);
    const isUserBase = await usersDB.findOne({username: req.body.username});
    if(isUserBase){
        res.send({
            status:400,
            info:"Bad Request"
        })
    }else{
        const data = req.body;
        const tokenRandom = JSON.stringify(Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000);
        const user = {...data, token:tokenRandom}
        const {insertedId} = await usersDB.insertOne(user);
        res.send({
            status:'ok',
            id:insertedId
        })
    }
})

app.post('/api/login', async (req, res)=>{
    const isUserBase = await usersDB.findOne({username: req.body.username});
    const isUserBasePassword = await usersDB.findOne({password: req.body.password});
    if(!isUserBase){
        res.send({
            status:400,
            info:"Incorrect password or email"
        })
    } else if(isUserBase && !isUserBasePassword ){
        res.send({
            status:400,
            info:"Incorrect password "
        })
    } else if(isUserBase && isUserBasePassword ){
        res.send({
            status:200,
            token: isUserBase.token

        })
    }
})





app.put('/api/users/:id', async (req, res)=>{
    const data = req.body
    await usersDB.updateOne({ _id: new ObjectId(req.params.id) }, { $set: data });
    res.send({status:200})
})

app.delete('/api/users/:id', async (req, res)=>{
    const data = req.body
    await usersDB.deleteOne({ _id: new ObjectId(req.params.id)});
    res.send({status:200})
})

module.exports = app;


// app.listen(3000, () => {
//     console.log("Сервер запущен на порту 3000");
// });