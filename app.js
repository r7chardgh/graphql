const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Event = require('./models/event'); //event modal defined at ./models folder
const User = require('./models/user');

const app = express();

app.use(bodyParser.json());

// query for fetching data
// mutation for fetching data
//[] list
//[String!] , do not accept null on the list
//[]! do not accept null 
//not only mutation . query can also be added arg list


app.use('/graphql', graphqlHTTP({
    schema: buildSchema(`
        type Event{
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
            creator: User!
        }

        type User{
            _id:ID!
            email:String!
            password: String
            createdEvents: [Event!]
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }
        
        input UserInput{
            email:String!
            password:String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput):User
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: () => {
            return Event.find().populate('creator').then(events => {
                return events.map(event => {
                    return { ...event._doc, _id: event.id, creator: { ...event._doc.creator._doc, _id: event._doc.creator.id } }
                })
            }).catch(err => {
                throw err;
            });
        },
        createEvent: (args) => {
            // const event = {
            //     _id: Math.random().toString(),
            //     title: args.eventInput.title,
            //     description: args.eventInput.description,
            //     price: +args.eventInput.price,
            //     date: args.eventInput.date
            // }
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: new Date(args.eventInput.date),
                creator: "643fb218f7230a7aaa78984e"
            });
            let createdEvent;
            return event.save().then(res => {
                createdEvent = {
                    ...res._doc, _id: res._doc._id.toString()
                }
                return User.findById("643fb218f7230a7aaa78984e")
            }).then(user => {
                if (!user) {
                    throw new Error('User not found.')
                }
                user.createdEvents.push(event)
                return user.save();
            }).then(res => {
                return createdEvent;
            }).catch(err => {
                console.log(err);
                throw err;
            });
        },
        createUser: (args) => {
            return User.findOne({ email: args.userInput.email }).then(user => {
                if (user) {
                    throw new Error('User exists already.')
                }
                return bcrypt.hash(args.userInput.password, 12)
            }).then(hashedPassword => {
                const user = new User({
                    email: args.userInput.email,
                    password: hashedPassword
                })
                return user.save();
            }).then(res => {
                console.log(res);
                return { ...res._doc, password: null, _id: res.id }
            }).catch(err => { throw err })
        }

    },
    graphiql: true
}))

app.get('/', (req, res, next) => {
    res.send('Hello Woasdrld!')
})

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.fkhgya4.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`).then(() => {
    app.listen(3000, () => {
        console.log('server started on port 3000');
    });
}).catch(err => {
    console.log(err);
})