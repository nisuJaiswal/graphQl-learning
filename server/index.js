const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const schema = require('./schema/schema')
const { graphqlHTTP } = require('express-graphql');
const connectDb = require('./config/config');
require('dotenv').config();
const cors = require('cors')

// CONNECTION TO DATABASE
connectDb();
app.use(cors());

app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: process.env.DEVELOPMENT_ENV === 'dev'
}))

app.listen(PORT, console.log(`App is runnning on Port: ${PORT}`));