const express = require('express')
const app = express()


const users = [
    { id: 69,
      slug: 'han-davis',
      full_name: 'Han Davis',
      first_name: 'Hannah',
      last_name: 'Davis',
      http_url: 'https://egghead.io/instructors/hannah-davis',
      slack_id: 'FJ28DJ39J',
      email: 'h@gmail.com',
      gear_tracking_number: null,
    },
    { id: 69,
      slug: 'myk-b',
      full_name: 'Myk B',
      first_name: 'Myk',
      last_name: 'B',
      http_url: 'https://egghead.io/instructors/myk-b',
      slack_id: 'JFA8FD0AK',
      email: 'myk@gmail.com',
      gear_tracking_number: null,
    },
    { id: 69,
      slug: 'bonzo-p',
      full_name: 'Bonzo Prime',
      first_name: 'Bonzo',
      last_name: 'Prime',
      http_url: 'https://egghead.io/instructors/bonzo-prime',
      slack_id: 'HF83KS93',
      email: 'bonz@gmail.com',
      gear_tracking_number: null,
    },
];

const usersBySlug = slug => users.reduce(
    (acc, val) => {
        if (acc) return acc;
        if (val.slug === slug) {
            return val;
        }
    },
    null);

const usersByEmail = email => users.reduce(
    (acc, val) => {
        if (acc) return acc;
        if (val.email === email) {
            return val;
        }
    }, null);

const usersByName = name => users;


app.get('/instructors', function(req, res) {
    if (req.query.name) {
        res.json(usersByName(req.query.name));
    } else if (req.query.email) {
        res.json(usersByEmail(req.query.email));
    }
})

app.put('/instructors/:slug', function(req, res) {
    res.json(usersBySlug);
})

app.listen(4000, function() {
    console.log('mock api server listening on port 4000');
})
